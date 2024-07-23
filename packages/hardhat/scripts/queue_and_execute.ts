import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { setNextBlockTimestamp } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

/**
 * This script queues and executes a specific proposal by ID.
 */
async function queueAndExecuteProposal(hre: HardhatRuntimeEnvironment, proposalId: bigint) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed CrowdFlixDaoGovernor contract
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  console.log(`\nProposal ID: ${proposalId}`);
  console.log("Proposal State:", await crowdFlixDaoGovernor.state(proposalId));
  //   await crowdFlixDaoGovernor.queue(proposalId);
  //   console.log("Queued Proposal!");
  //   console.log("Proposal State:", await crowdFlixDaoGovernor.state(proposalId));
  await crowdFlixDaoGovernor.execute(proposalId);
  const currentTimestamp = await crowdFlixDaoGovernor.clock();

  // Calculate the new timestamp (10 seconds forward)
  const newTimestamp = currentTimestamp + 10;

  // Set the next block timestamp
  await setNextBlockTimestamp(newTimestamp);

  // Mine a block to update the timestamp
  await hre.ethers.provider.send("evm_mine", []);

  // Log the updated timestamp
  console.log(`Clock mined 10 seconds forward. New timestamp: ${newTimestamp}`);
  await crowdFlixDaoGovernor.execute(proposalId);

  // Queue the proposal if it's in the 'Active' state
  //   if (await crowdFlixDaoGovernor.state(proposalId) === 1n) {
  //     console.log("Queueing Proposal...");
  //     await crowdFlixDaoGovernor.queue(proposalId);
  //     console.log("Proposal Queued!");
  //   }

  //   // Execute the proposal if it's in the 'Queued' state
  //   if (await crowdFlixDaoGovernor.state(proposalId) === 3n) {
  //     console.log("Executing Proposal...");
  //     await crowdFlixDaoGovernor.execute(proposalId);
  //     console.log("Proposal Executed!");
  //   }
}

// Run the script
async function main() {
  // Replace this with the actual proposal ID you want to queue and execute
  //   const proposalIdToProcess = 80467161753310519972516954178295310469192506580462564827888170643475391129634n;...
  const proposalIdToProcess = 95370154930303756739519235969586336554111685001189125184377107305438917153290n;
  await queueAndExecuteProposal(hre, proposalIdToProcess);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
