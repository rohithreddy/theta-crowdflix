import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";

/**
 * This script retrieves all proposals from the CrowdFlixDaoGovernor contract.
 */
async function getAllProposals(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed CrowdFlixDaoGovernor contract
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Get the total number of proposals
  const proposalCount = await crowdFlixDaoGovernor.proposalCount();
  console.log(`Total proposals: ${proposalCount}`);

  // Iterate through each proposal and retrieve its details
  for (let i = 0; i < proposalCount; i++) {
    const proposalDetails = await crowdFlixDaoGovernor.proposalDetailsAt(i);
    const proposalId = proposalDetails[0];

    console.log(`\nProposal ${i + 1}:`);
    console.log("ProposalID");
    console.log(proposalId);
    console.log("Proposal State:", await crowdFlixDaoGovernor.state(proposalId));
    console.log("Proposal Votes:", await crowdFlixDaoGovernor.proposalVotes(proposalId));

    // Map the state to a human-readable description
    const state = await crowdFlixDaoGovernor.state(proposalId);
    let stateDescription = "";
    switch (state) {
      case 0n:
        stateDescription = "Pending";
        break;
      case 1n:
        stateDescription = "Active";
        break;
      case 2n:
        stateDescription = "Canceled";
        break;
      case 3n:
        stateDescription = "Queued";
        break;
      case 4n:
        stateDescription = "Succeeded";
        break;
      case 5n:
        stateDescription = "Expired";
        break;
      case 6n:
        stateDescription = "Executed";
        break;
      default:
        stateDescription = "Unknown";
    }
    console.log("Proposal State Description:", stateDescription);
  }
}

// Run the script
async function main() {
  await getAllProposals(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
