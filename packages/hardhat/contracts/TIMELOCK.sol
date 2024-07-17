//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/// @custom:security-contact crash@web108.xyz
contract Timelock is TimelockController {
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors) TimelockController(minDelay, proposers, executors, msg.sender) {}
}