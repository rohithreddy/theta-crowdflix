// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICrowdFlixVault {
    function depositSaleFunds(uint256 _projectId) external payable;
    function createProjectVault(uint256 _projectId, address[] memory _investors, uint256[] memory _investmentAmounts, uint256 _fundingGoal,uint256 _profitSharePercentage, address _creator) external;
    // Add other functions and events from CrowdFlixVault that TicketManager needs
}
