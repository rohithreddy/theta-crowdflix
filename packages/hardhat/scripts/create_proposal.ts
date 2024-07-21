import "@nomicfoundation/hardhat-ethers";
import { Contract, EventLog } from "ethers";
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
  console.log("LaunchPad deployed to:", await launchPad.getAddress());
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Prepare the call data for the createProject function
  const createLaunchPadCampaignCallData = launchPad.interface.encodeFunctionData("createProject", [
    "Test Project", // _name
    "This is a test project", // _description
    parseEther("100"), // _fundingGoal
    Math.floor(Date.now() / 1000) + 60, // _startTime (1 minute from now)
    Math.floor(Date.now() / 1000) + 3600, // _endTime (1 hour from now)
    "0xF014198122454b5745bb33c5C91bF78A8Ac49DF7", // _teamWallet
    deployer, // _creator
    50, // _profitSharePercentage
    "test", // _category
  ]);

  console.log("CallData`");
  console.log(createLaunchPadCampaignCallData);

  console.log(Math.floor(Date.now() / 1000) + 60);
  console.log("dATE stAMP ONE minute from now");
  const launchPadAddress = (await launchPad.getAddress()).toString();
  const governer = await hre.ethers.getContractAt("CrowdFlixDaoGovernor", await crowdFlixDaoGovernor.getAddress());
  const proposalDescription = hre.ethers.id("dafaq is this VOTING shit");
  console.log("proposalDescription");
  console.log(proposalDescription);
  const proposal = await governer.propose(
    [launchPadAddress], //targets
    [0], //values
    [createLaunchPadCampaignCallData], //transaction call data
    proposalDescription,
  );
  console.log("The proposal ID is ", proposal);
  console.log(`✅ Proposal created with transaction hash: ${proposal.hash}`);
  console.log(`Proposal description: ${proposalDescription}`);
  const receipt = await proposal.wait(1);
  console.log(receipt);

  try {
    const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

    // Find the ProposalCreated event in the transaction receipt
    const event = eventLogs.find(log => log.fragment.name === "ProposalCreated");

    const logDescription = governer.interface.parseLog({
      topics: event?.topics ? [...event.topics] : [],
      data: event?.data ?? "",
    });

    // Get the proposalId from the event arguments
    const proposalId = logDescription?.args["proposalId"];
    console.log(proposalId);
    // console.log(await governer.castVote(proposalId, 1)); // For
    // governer.castVote(proposalId, 1); // For
  } catch (error) {
    console.log(error);
  }
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
