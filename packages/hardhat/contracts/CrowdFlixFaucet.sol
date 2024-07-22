// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdFlixFaucet {
    IERC20 public immutable crowdFlixToken;
    uint256 public claimLimit = 40 * 10 ** 18; // Example limit
    mapping(address => uint256) public lastClaimTime;

    constructor(address _crowdFlixToken) {
        crowdFlixToken = IERC20(_crowdFlixToken);
    }

    function claim() public {
        require(block.timestamp - lastClaimTime[msg.sender] >= 3600, "Cooldown period not met"); // 1 hour cooldown
        require(crowdFlixToken.balanceOf(address(this)) >= claimLimit, "Insufficient tokens");

        crowdFlixToken.transfer(msg.sender, claimLimit);
        lastClaimTime[msg.sender] = block.timestamp;
    }
}