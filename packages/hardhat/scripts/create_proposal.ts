import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { parseEther } from "ethers";

/**
 * This script creates a proposal to launch a new project on the CrowdFlix LaunchPad.
 */
async function createProposal(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed contracts
  const launchPad = await hre.ethers.getContract<Contract>("LaunchPad", deployer);
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Prepare the call data for the createProject function
  const createLaunchPadCampaignCallData = launchPad.interface.encodeFunctionData("createProject", [
    "Test Project", // _name
    "This is a test project", // _description
    parseEther("100"), // _fundingGoal
    Math.floor(Date.now() / 1000) + 60, // _startTime (1 minute from now)
    Math.floor(Date.now() / 1000) + 3600, // _endTime (1 hour from now)
    deployer, // _teamWallet
    deployer, // _creator
    50, // _profitSharePercentage
    "Test Category", // _category
  ]);

  console.log(Math.floor(Date.now() / 1000) + 60);
  console.log("dATE stAMP ONE minute from now");
  const launchPadAddress = (await launchPad.getAddress()).toString();
  const governer = await hre.ethers.getContractAt("CrowdFlixDaoGovernor", await crowdFlixDaoGovernor.getAddress());
  const proposalDescription = "Crowdfunding 1# Create a documentary about Theta Blockchain";
  const proposal = await governer.propose(
    [launchPadAddress], //targets
    [0], //values
    [createLaunchPadCampaignCallData], //transaction call data
    proposalDescription,
  );
  console.log(`✅ Proposal created with transaction hash: ${proposal.hash}`);
  console.log(`Proposal description: ${proposalDescription}`);
  const receipt = await proposal.wait();
  console.log(receipt);
  //   const proposalId = receipt.events?.find(event => event.event === "ProposalCreated")?.args?.proposalId;

  //   console.log(`Proposal ID: ${proposalId}`);
}

// Run the script
async function main() {
  await createProposal(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
