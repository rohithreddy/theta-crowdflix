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
  //   const proposalTestFilter = crowdFlixDaoGovernor.filters.listenForProposals();

  // Listen for events
  crowdFlixDaoGovernor.on(proposalCreatedFilter, proposalId => {
    console.log("New Proposal Created!");
    console.log("  ID:", proposalId);
  });
  //   crowdFlixDaoGovernor.on(proposalTestFilter, event => {
  //     console.log("New Proposal Created!");
  //     console.log("  ID:", event);
  //   });
  // Keep the script running to listen for events
  console.log("Listening for ProposalCreated events...");
  crowdFlixDaoGovernor.on(
    "ProposalCreated",
    (proposalId, proposer, targets, values, calldatas, description, startBlock, endBlock) => {
      console.log("New Proposal Created!");
      console.log("  Proposal ID:", proposalId.toString()); // Convert BigInt to string
      console.log("  Proposer:", proposer);
      console.log("  Targets:", targets);
      console.log("  Values:", values);
      console.log("  Calldatas:", calldatas);
      console.log("  Description:", description);
      console.log("  Start Block:", startBlock.toString());
      console.log("  End Block:", endBlock.toString());
      // ... (Log other event data as needed) ...
    },
  );

  // 2. Listen for the 'VoteCast' Event:
  crowdFlixDaoGovernor.on("VoteCast", (voter, proposalId, support, weight, reason) => {
    console.log("Vote Cast:");
    console.log("  Voter:", voter);
    console.log("  Proposal ID:", proposalId.toString());
    console.log("  Support:", support); // 0 = Against, 1 = For, 2 = Abstain
    console.log("  Weight:", weight.toString());
    console.log("  Reason:", reason);
  });

  // 3. Listen for the 'ProposalCanceled' Event:
  crowdFlixDaoGovernor.on("ProposalCanceled", proposalId => {
    console.log("Proposal Canceled:");
    console.log("  Proposal ID:", proposalId.toString());
  });

  // 4. Listen for the 'ProposalExecuted' Event:
  crowdFlixDaoGovernor.on("ProposalExecuted", proposalId => {
    console.log("Proposal Executed:");
    console.log("  Proposal ID:", proposalId.toString());
  });
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
