// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Import IERC721
import "./LaunchPad.sol"; // Import LaunchPad contract
import "./ITicketManager.sol"; // Import ITicketManager interface

contract CrowdFlixVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TICKET_MANAGER_ROLE = keccak256("TICKET_MANAGER_ROLE"); 
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); 

    struct ProjectVault {
        uint256 raisedFunds;
        uint256 ticketSales; // Track total funds for the project
        bool isOpen; 
    }

    mapping(uint256 => ProjectVault) public projectVaults;
    mapping(uint256 => mapping(address => uint256)) public investorShares; // Track shares for each project and investor
    mapping(uint256 => mapping(address => uint256)) public withdrawnShares; // Track withdrawn shares for each project and investor

    // Track total shares for each project
    mapping(uint256 => uint256) public totalShares;

    LaunchPad public launchPad; // Add LaunchPad instance
    ITicketManager public ticketManager; // Add ITicketManager instance

    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event VaultClosed(uint256 indexed projectId);

    constructor(address _initialManager, address _initialPauser, address _launchPadAddress, address _ticketManagerAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TICKET_MANAGER_ROLE, _initialManager);
        _grantRole(PAUSER_ROLE, _initialPauser);
        launchPad = LaunchPad(payable(_launchPadAddress)); // Initialize LaunchPad instance
        ticketManager = ITicketManager(_ticketManagerAddress); // Initialize ITicketManager instance
    }

    // --- Core Vault Functionality ---

    function depositSaleFunds(uint256 _projectId) 
        external 
        payable 
        onlyRole(TICKET_MANAGER_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        vault.ticketSales += msg.value; // Update total funds

        emit FundsDeposited(_projectId, msg.value);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant whenNotPaused {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        uint256 userShares = investorShares[_projectId][msg.sender];
        console.log("userShares @ withdraw");
        console.log(userShares);
        require(userShares > 0, "No shares to withdraw");

        // Calculate withdrawn shares
        uint256 withdrawn = withdrawnShares[_projectId][msg.sender];

        // Ensure user has not withdrawn more than their invested shares
        require(userShares - withdrawn > 0, "You have already withdrawn all your shares");

        // Get tickets sold from NFT supply
        uint256 ticketsSold = ticketManager.getTicketsSold(_projectId);

        console.log("ticketsSold");
        console.log(ticketsSold);

        // **Calculate unlocked shares based on the ratio of user shares to total shares**
        uint256 unlockedShares = (userShares * ticketsSold * 1e18) / totalShares[_projectId];
        
        console.log("unlockedShares");
        console.log(unlockedShares);

        unlockedShares /= 1e18;
        console.log("userShares", userShares);
        console.log("ticketsSold", ticketsSold);
        console.log("unlockedShares", unlockedShares);
        console.log("vault.ticketSales", vault.ticketSales);
        console.log("totalShares", totalShares[_projectId]);

        require(totalShares[_projectId] > 0, "Total shares must be greater than zero");

        uint256 withdrawalAmount = (unlockedShares * vault.ticketSales * 1e20) / totalShares[_projectId]; 
        console.log("withdrawalAmount before division", withdrawalAmount);
        withdrawalAmount /= 1e18; // Adjust the scale
        console.log("withdrawalAmount after division", withdrawalAmount);

        // Ensure sufficient funds
        require(withdrawalAmount <= vault.ticketSales, "Insufficient funds in the vault");

        // Update total funds in the vault
        

        // Transfer funds to the user using the `transfer` function
        payable(msg.sender).transfer(withdrawalAmount);

        vault.ticketSales -= withdrawalAmount; 
        
        // Update withdrawn shares
        withdrawnShares[_projectId][msg.sender] += unlockedShares;

        emit FundsWithdrawn(_projectId, msg.sender, withdrawalAmount);
    }


    function createProjectVault(uint256 _projectId) external onlyRole(TICKET_MANAGER_ROLE) {
        require(!projectVaults[_projectId].isOpen, "Vault already exists for this project"); // Check if vault is open
        projectVaults[_projectId].isOpen = true; 
    }

    function closeVault(uint256 _projectId) external onlyRole(TICKET_MANAGER_ROLE) {
        projectVaults[_projectId].isOpen = false;
        emit VaultClosed(_projectId);
    }

    // --- Pausable Functionality ---

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // --- Additional Functions ---

    // Function to get the total funds in a project vault
    function getTotalFunds(uint256 _projectId) public view returns (uint256) {
        return projectVaults[_projectId].raisedFunds;
    }

    // Function to check if a project vault is open
    function isVaultOpen(uint256 _projectId) public view returns (bool) {
        return projectVaults[_projectId].isOpen;
    }
    
    // In CrowdFlixVault.sol
    function contributeAndUpdateShares(uint256 _projectId, address _contributor, uint256 _amount, uint256 profitSharePercentage) external {
        require(msg.sender == address(launchPad), "Only LaunchPad can update shares");

        // Get the profit share percentage for the project

        // Calculate the shares for the contributor based on the profit share percentage
        uint256 contributorShares = (_amount * profitSharePercentage) / 100;

        uint256 creatorShares = _amount - contributorShares;

        // Update shares
        investorShares[_projectId][_contributor] += contributorShares;

        // Update total shares for the project
        totalShares[_projectId] += contributorShares + creatorShares;

        // Update total funds in the project vault
        projectVaults[_projectId].raisedFunds += _amount;

        emit FundsDeposited(_projectId, _amount);
    }

}
