// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Import IERC721
// import "./ITicketManager.sol"; // Import ITicketManager interface
import "@openzeppelin/contracts/utils/math/Math.sol"; // Import Math from OpenZeppelin

import "hardhat/console.sol";

contract CrowdFlixVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TICKET_MANAGER_ROLE = keccak256("TICKET_MANAGER_ROLE"); 
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); 

    struct ProjectVault {
        uint256 raisedFunds;
        uint256 ticketSales; // Track total funds for the project
        bool isOpen; 
        uint256 profitSharePercentage;
        address creator;
        address[] investors;
    }
    uint256[] public launchedProjects;
    mapping(uint256 => ProjectVault) public projectVaults;
    mapping(uint256 => mapping(address => uint256)) public investorAmounts; // Track shares for each project and investor
    mapping(uint256 => mapping(address => uint256)) public withdrawnShares; // Track withdrawn shares for each project and investor
    mapping(uint256 => mapping(address => uint256)) public withdrawableEth; // Track withdrawable ETH for each project and investor

    // Track total shares for each project
    // mapping(uint256 => uint256) public totalInvestments;

    // ITicketManager public ticketManager; // Add ITicketManager instance

    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event VaultClosed(uint256 indexed projectId);

    constructor(address _initialManager, address _initialPauser) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TICKET_MANAGER_ROLE, _initialManager);
        _grantRole(PAUSER_ROLE, _initialPauser);
        // ticketManager = ITicketManager(_ticketManagerAddress); // Initialize ITicketManager instance
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

        // Calculate the creator's share based on the total deposited amount
        uint256 creatorShare = (msg.value * (100 - vault.profitSharePercentage)) / 100;
        console.log("Creator Share");
        console.log(creatorShare);

        // Update withdrawable ETH for the creator
        withdrawableEth[_projectId][vault.creator] += creatorShare;

        // Update withdrawable ETH for each contributor
        // Loop over investorAmounts instead of ticketManager.getContributors
        for (uint256 i=0; i < vault.investors.length ; i++ ) {
            address investor = vault.investors[i];
            console.log(investor);
            console.log("Investor");
            uint256 amount = investorAmounts[_projectId][investor];
            console.log("amount");
            console.log(amount);
            if (amount > 0) {
                uint256 allocatedEth = Math.mulDiv(msg.value, (amount * vault.profitSharePercentage ) / 100, vault.raisedFunds);
                console.log("allocatedEth");
                console.log(allocatedEth);
                withdrawableEth[_projectId][investor] += allocatedEth;
            }
        }
        emit FundsDeposited(_projectId, msg.value);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant whenNotPaused {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        // Get the withdrawable ETH for the user
        uint256 withdrawableAmount = withdrawableEth[_projectId][msg.sender];
        require(withdrawableAmount > 0, "No withdrawable ETH for this user");

        // Transfer the withdrawable ETH to the user
        withdrawableEth[_projectId][msg.sender] = 0; // Update before transfer to prevent reentrancy
        (bool success, ) = msg.sender.call{value: withdrawableAmount}("");
        require(success, "Transfer failed");

        // Update withdrawn shares
        withdrawnShares[_projectId][msg.sender] += withdrawableAmount;

        emit FundsWithdrawn(_projectId, msg.sender, withdrawableAmount);
    }

    function createProjectVault(uint256 _projectId , address[] memory _investors, uint256[] memory _investmentAmounts, uint256 _fundingGoal, uint256 _profitSharePercentage, address _creator) external onlyRole(TICKET_MANAGER_ROLE) {
        require(!projectVaults[_projectId].isOpen, "Vault already exists for this project"); // Check if vault is open
        projectVaults[_projectId].isOpen = true; 
        projectVaults[_projectId].profitSharePercentage = _profitSharePercentage;
        projectVaults[_projectId].creator = _creator;
        projectVaults[_projectId].raisedFunds = _fundingGoal;
        launchedProjects.push(_projectId);
        
        // Update shares for each investor
        for (uint256 i = 0; i < _investors.length; i++) {
            address investor = _investors[i];
            uint256 amount = _investmentAmounts[i];
            investorAmounts[_projectId][investor] += amount;
            projectVaults[_projectId].investors.push(investor);
        }
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
    
    function getTotalWithdrawableEth(address _address) public view returns (uint256) {
        uint256 totalWithdrawable = 0;
        for (uint256 i = 0; i < launchedProjects.length; i++) {
            totalWithdrawable += withdrawableEth[i][_address];
        }
        return totalWithdrawable;
    }

    function getWithdrawableEthBreakdown(address _address) public view returns (uint256[] memory projectIds, uint256[] memory amounts) {
        uint256 projectCount = launchedProjects.length;
        uint256 count = 0;

        // First, count how many projects have withdrawable ETH for the address
        for (uint256 i = 0; i < projectCount; i++) {
            uint256 projectId = launchedProjects[i];
            if (withdrawableEth[projectId][_address] > 0) {
                count++;
            }
        }

        // Create arrays to hold project IDs and amounts
        projectIds = new uint256[](count);
        amounts = new uint256[](count);
        uint256 index = 0;

        // Populate the arrays with project IDs and corresponding withdrawable amounts
        for (uint256 i = 0; i < projectCount; i++) {
            uint256 projectId = launchedProjects[i];
            if (withdrawableEth[projectId][_address] > 0) {
                projectIds[index] = i;
                amounts[index] = withdrawableEth[i][_address];
                index++;
            }
        }
    }

    // Function to allow creators to withdraw their share of ticket sales
    function withdrawCreatorShare(uint256 _projectId) external nonReentrant whenNotPaused {
        // Get the project vault
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        // Get the creator's withdrawable ETH
        uint256 creatorWithdrawable = withdrawableEth[_projectId][vault.creator];
        require(creatorWithdrawable > 0, "No withdrawable ETH for the creator");

        // Transfer the creator's share to their wallet
        (bool success, ) = vault.creator.call{value: creatorWithdrawable}("");
        require(success, "Transfer failed");

        // Update withdrawn shares
        withdrawnShares[_projectId][vault.creator] += creatorWithdrawable;

        // Reset creatorWithdrawableEth
        withdrawableEth[_projectId][vault.creator] = 0;

        emit FundsWithdrawn(_projectId, vault.creator, creatorWithdrawable);
    }
}
