import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
// import { parseBytes32String } from "ethers/lib/utils";

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
    const [targets, values, calldatas, descriptionHash] = await crowdFlixDaoGovernor.proposalDetails(
      proposalDetails[0],
    );
    console.log("Targets");
    console.log(targets);
    console.log("Values");
    console.log(values);
    console.log("Calldatas");
    console.log(calldatas);
    console.log("Description Hash");
    console.log(descriptionHash);
    console.log("=+++++++++++++++++++++++++=");
    console.log(proposalDetails);
    console.log(`\nProposal ${i + 1}:`);
    console.log("Proposal Details");
    console.log(proposalDetails);
    console.log("Proposal State");
    console.log(await crowdFlixDaoGovernor.state(proposalDetails[0]));
    console.log("Proposal ETA");
    console.log(await crowdFlixDaoGovernor.proposalEta(proposalDetails[0]));
    console.log(await crowdFlixDaoGovernor.proposalVotes());

    // Convert proposal deadline into time
    const proposalDeadline = await crowdFlixDaoGovernor.proposalDeadline(proposalDetails[0]);
    const deadlineDate = new Date(Number(proposalDeadline) * 1000); // Convert BigInt to number and then to milliseconds
    console.log("Proposal Deadline:", deadlineDate.toLocaleString()); // Format the date

    // Decode the description from the hash
    const proposalDescription = hre.ethers.decodeBytes32String(hre.ethers.stripZerosLeft(descriptionHash));
    console.log("Proposal Description:", proposalDescription);
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
