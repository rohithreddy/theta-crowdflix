import "@nomicfoundation/hardhat-ethers";
import { Contract, EventLog } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { parseEther } from "ethers";

/**
 * This script creates a proposal to launch a new project on the CrowdFlix LaunchPad.
 */
async function voteOnProposal(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed contracts
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);
  const governer = await hre.ethers.getContractAt("CrowdFlixDaoGovernor", await crowdFlixDaoGovernor.getAddress());
  const proposalId = 106464462801094336640974236640284074364672103461479185401421891255034893349713n;
  try {
    console.log(await governer.castVote(proposalId, 1));
  } catch (e) {
    console.log(e);
  }
  console.log(await governer.state(proposalId));
  console.log(await governer.proposalDetails(proposalId));
  console.log(await governer.proposalDeadline(proposalId));
  console.log(await governer.proposalVotes(proposalId));
  console.log(await governer.proposalProposer(proposalId));

  // Prepare the call data for the createProject function
}

// Run the script
async function main() {
  await voteOnProposal(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
