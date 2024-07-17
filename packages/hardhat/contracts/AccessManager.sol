// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/manager/AccessManager.sol";

/// @custom:security-contact crash@web108.xyz
contract CFlixAccessManager is AccessManager {

    // Constructor
    constructor(address initialAdmin) AccessManager(initialAdmin) { 
    }
}