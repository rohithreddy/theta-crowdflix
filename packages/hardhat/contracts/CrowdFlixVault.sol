// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CrowdFlixVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant TICKET_MANAGER_ROLE = keccak256("TICKET_MANAGER_ROLE"); 
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); 

    struct ProjectVault {
        uint256 totalShares; 
        mapping(address => uint256) balances;
        bool isOpen; 
    }

    mapping(uint256 => ProjectVault) public projectVaults;

    event FundsDeposited(uint256 indexed projectId, address indexed contributor, uint256 amount, uint256 sharesMinted);
    event FundsWithdrawn(uint256 indexed projectId, address indexed contributor, uint256 amount, uint256 sharesBurned);
    event VaultClosed(uint256 indexed projectId);

    constructor(address _initialManager, address _initialPauser) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TICKET_MANAGER_ROLE, _initialManager);
        _grantRole(PAUSER_ROLE, _initialPauser);
    }

    // --- Core Vault Functionality ---

    function depositFunds(uint256 _projectId, address _contributor, uint256 _amount) 
        external 
        onlyRole(TICKET_MANAGER_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        uint256 sharesToMint = vault.totalShares == 0
            ? _amount // Initial deposit, 1:1 mapping for simplicity
            : (_amount * vault.totalShares) / address(this).balance;

        vault.balances[_contributor] += sharesToMint;
        vault.totalShares += sharesToMint;

        (bool success, ) = payable(address(this)).call{value: _amount}(""); 
        require(success, "Deposit transfer failed");

        emit FundsDeposited(_projectId, _contributor, _amount, sharesToMint);
    }

    function withdrawFunds(uint256 _projectId) external nonReentrant whenNotPaused {
        ProjectVault storage vault = projectVaults[_projectId];
        require(vault.isOpen, "Vault is closed for this project");

        uint256 userShares = vault.balances[msg.sender];
        require(userShares > 0, "No shares to withdraw");

        uint256 withdrawalAmount = (userShares * address(this).balance) / vault.totalShares;

        vault.balances[msg.sender] = 0;
        vault.totalShares -= userShares;

        (bool success, ) = payable(msg.sender).call{value: withdrawalAmount}("");
        require(success, "Withdrawal transfer failed");

        emit FundsWithdrawn(_projectId, msg.sender, withdrawalAmount, userShares);
    }

    function createProjectVault(uint256 _projectId) external onlyRole(TICKET_MANAGER_ROLE) {
        require(projectVaults[_projectId].totalShares == 0, "Vault already exists for this project");
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
}