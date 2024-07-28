// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // Import IERC721
import "./LaunchPad.sol"; // Import LaunchPad contract
import "./ITicketManager.sol"; // Import ITicketManager interface
import "@openzeppelin/contracts/utils/math/Math.sol"; // Import Math from OpenZeppelin

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
    mapping(uint256 => mapping(address => uint256)) public withdrawableEth; // Track withdrawable ETH for each project and investor

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

        // Update withdrawable ETH for each investor
        address[] memory contributors = launchPad.getContributors(_projectId);
        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 shares = investorShares[_projectId][contributor];
            if (shares > 0) {
                // Use Math.mulDiv for safe multiplication and division
                uint256 allocatedEth = Math.mulDiv(msg.value, shares, totalShares[_projectId]);
                withdrawableEth[_projectId][contributor] += allocatedEth;
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
    
    function contributeAndUpdateShares(uint256 _projectId, address _contributor, uint256 _amount, uint256 profitSharePercentage) external {
        require(msg.sender == address(launchPad), "Only LaunchPad can update shares");

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

    // Function to get the total withdrawable ETH for a given address
    function getTotalWithdrawableEth(address _address) public view returns (uint256) {
        uint256 totalWithdrawable = 0;
        for (uint256 i = 0; i < launchPad.projectCount(); i++) {
            totalWithdrawable += withdrawableEth[i][_address];
        }
        return totalWithdrawable;
    }

    // Function to get the breakdown of withdrawable ETH for a given address
    function getWithdrawableEthBreakdown(address _address) public view returns (uint256[] memory projectIds, uint256[] memory amounts) {
    uint256 projectCount = launchPad.projectCount();
    uint256 count = 0;

    // First, count how many projects have withdrawable ETH for the address
    for (uint256 i = 0; i < projectCount; i++) {
        if (withdrawableEth[i][_address] > 0) {
            count++;
        }
    }

    // Create arrays to hold project IDs and amounts
    projectIds = new uint256[](count);
    amounts = new uint256[](count);
    uint256 index = 0;

    // Populate the arrays with project IDs and corresponding withdrawable amounts
    for (uint256 i = 0; i < projectCount; i++) {
        if (withdrawableEth[i][_address] > 0) {
            projectIds[index] = i;
            amounts[index] = withdrawableEth[i][_address];
            index++;
        }
    }
}

}
