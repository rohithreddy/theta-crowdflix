import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
/**
 * This function demonstrates how to listen for ProposalCreated events emitted by the CrowdFlixDaoGovernor contract.
 */
async function listenForProposals(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed CrowdFlixDaoGovernor contract
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Create a filter for ProposalCreated events
  const proposalCreatedFilter = crowdFlixDaoGovernor.filters.ProposalCreated();

  // Listen for events
  crowdFlixDaoGovernor.on(proposalCreatedFilter, proposalId => {
    console.log("New Proposal Created!");
    console.log("  ID:", proposalId);
  });

  // Keep the script running to listen for events
  console.log("Listening for ProposalCreated events...");
  await new Promise(() => {}); // Keep the script running indefinitely
}

// Run the script
async function main() {
  await listenForProposals(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
