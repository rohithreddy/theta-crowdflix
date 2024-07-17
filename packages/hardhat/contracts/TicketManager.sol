// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;


/// @custom:security-contact crash@web108.xyz

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TicketManager is Pausable, AccessManaged, ReentrancyGuard {
    IERC20 public ticketToken;

    constructor(IERC20 _ticketToken, address initialAuthority) AccessManaged(initialAuthority) {
        ticketToken = _ticketToken;
    }
    
}