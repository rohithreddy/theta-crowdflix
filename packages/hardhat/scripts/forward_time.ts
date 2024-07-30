import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { setNextBlockTimestamp } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

/**
 * This script forwards the time to a desired timestamp and executes a proposal.
 */
async function forwardTimeAndExecute(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed contracts
  //   const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Get the proposal ID you want to execute
  //   const proposalId = 100182563380527534695632964678253795559380631890143088677162434068449085386573n; // Replace with your actual proposal ID

  // Get the proposal deadline
  //   const proposalDeadline = await crowdFlixDaoGovernor.proposalDeadline(proposalId);

  // Forward the time to the proposal deadline
  //   await hre.ethers.provider.send("evm_setNextBlockTimestamp", [Number(proposalDeadline)]);
  console.log(await hre.ethers.provider.send("evm_mine", [1722701644]));

  // Check the current state of the proposal
  //   console.log("Proposal State:", await crowdFlixDaoGovernor.state(proposalId));

  // If the proposal is in the 'Queued' state, execute it
  //   if (await crowdFlixDaoGovernor.state(proposalId) === 1) {
  //     console.log("Executing Proposal...");
  //     await crowdFlixDaoGovernor.execute(proposalId);
  //     console.log("Proposal Executed!");
  //   } else {
  //     console.log("Proposal is not in the 'Queued' state. Cannot execute.");
  //   }
}

// Run the script
async function main() {
  await forwardTimeAndExecute(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
