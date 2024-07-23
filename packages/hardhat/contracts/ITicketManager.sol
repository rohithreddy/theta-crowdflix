// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITicketManager {
    function createTicketCollection(
        uint256 _projectId,
        string memory _name,
        string memory _symbol,
        uint256 _price,
        string memory _category,
        string memory _title
    ) external returns (address);
}