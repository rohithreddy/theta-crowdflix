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
  const proposalId = 100182563380527534695632964678253795559380631890143088677162434068449085386573n;
  try {
    console.log(await governer.castVote(proposalId, 1));
  } catch (e) {
    console.log(e);
  }
  console.log("Proposal State");
  console.log(await governer.state(proposalId));
  console.log("Proposal Details");
  console.log(await governer.proposalDetails(proposalId));
  console.log("Proposal proposalDeadline");
  console.log(await governer.proposalDeadline(proposalId));
  console.log("Proposal proposalVotes");
  console.log(await governer.proposalVotes(proposalId));
  console.log("Proposer ");
  console.log(await governer.proposalProposer(proposalId));

  console.log("Get proposals snapshot");
  console.log(await governer.proposalSnapshot(proposalId));
  console.log("Posposal Count");
  console.log(await governer.proposalCount());
  console.log("Get Details at index 0");
  for (let i = 0; i < (await governer.proposalCount()); i++) {
    console.log(await governer.proposalDetailsAt(i));
  }

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
