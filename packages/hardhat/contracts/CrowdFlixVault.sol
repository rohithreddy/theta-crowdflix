// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Import IERC721
import "./LaunchPad.sol"; // Import LaunchPad contract

contract CrowdFlixVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TICKET_MANAGER_ROLE = keccak256("TICKET_MANAGER_ROLE"); 
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); 

    struct ProjectVault {
        uint256 totalFunds; // Track total funds for the project
        bool isOpen; 
    }

    mapping(uint256 => ProjectVault) public projectVaults;
    mapping(uint256 => mapping(address => uint256)) public investorShares; // Track shares for each project and investor
    mapping(uint256 => mapping(address => uint256)) public withdrawnShares; // Track withdrawn shares for each project and investor

    // Track total shares for each project
    mapping(uint256 => uint256) public totalShares;

    LaunchPad public launchPad; // Add LaunchPad instance

    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event VaultClosed(uint256 indexed projectId);

    constructor(address _initialManager, address _initialPauser, address _launchPadAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TICKET_MANAGER_ROLE, _initialManager);
        _grantRole(PAUSER_ROLE, _initialPauser);
        launchPad = LaunchPad(payable(_launchPadAddress)); // Initialize LaunchPad instance
    }

    // --- Core Vault Functionality ---

    function depositFunds(uint256 _projectId) 
        external 
        payable 
        onlyRole(TICKET_MANAGER_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        vault.totalFunds += msg.value; // Update total funds

        emit FundsDeposited(_projectId, msg.value);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant whenNotPaused {
    ProjectVault storage vault = projectVaults[_projectId];
    require(vault.isOpen, "Vault is closed for this project");

    uint256 userShares = investorShares[_projectId][msg.sender];
    require(userShares > 0, "No shares to withdraw");

    console.log("userShares");  
    console.log(userShares);

    // Calculate withdrawn shares
    uint256 withdrawn = withdrawnShares[_projectId][msg.sender];

    // Ensure user has not withdrawn more than their invested shares
    require(userShares - withdrawn > 0, "You have already withdrawn all your shares");

    // Get the ticket collection address
    address ticketCollection = launchPad.getTicketCollectionAddress(_projectId);
    console.log("Ticket Collection"); 
    console.log(ticketCollection);

    // Get tickets sold from NFT supply
    uint256 ticketsSold = IERC721(ticketCollection).totalSupply();

    console.log("ticketsSold");
    console.log(ticketsSold);

    // **Calculate unlocked shares based on the ratio of user shares to total shares**
    uint256 unlockedShares = (userShares * ticketsSold) / totalShares[_projectId];
    
    console.log("unlockedShares");
    console.log(unlockedShares);

    // Calculate withdrawal amount based on unlocked shares and project's total funds
    uint256 withdrawalAmount = (unlockedShares * vault.totalFunds) / totalShares[_projectId]; 

    console.log("WithDrawal Amount");
    console.log(withdrawalAmount);

    // Ensure sufficient funds
    require(withdrawalAmount <= vault.totalFunds, "Insufficient funds in the vault");

    // Update total funds in the vault
    vault.totalFunds -= withdrawalAmount; 

    // Transfer funds to the user using the `transfer` function
    payable(msg.sender).transfer(withdrawalAmount);

    // Update withdrawn shares
    withdrawnShares[_projectId][msg.sender] += unlockedShares;

    emit FundsWithdrawn(_projectId, msg.sender, withdrawalAmount);
}


    function createProjectVault(uint256 _projectId) external onlyRole(TICKET_MANAGER_ROLE) {
        console.log("Project Vault Inside createProjectVault"); 
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
        return projectVaults[_projectId].totalFunds;
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

        // Update shares
        investorShares[_projectId][_contributor] += contributorShares;

        // Update total shares for the project
        totalShares[_projectId] += contributorShares;

        // Update total funds in the project vault
        projectVaults[_projectId].totalFunds += _amount;

        emit FundsDeposited(_projectId, _amount);
    }

}
