import "@nomicfoundation/hardhat-ethers";
import { Contract, EventLog } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { parseEther } from "ethers";

interface LaunchPadProject {
  name: string;
  description: string;
  category: string;
}

const launchPadProjects: LaunchPadProject[] = [
  {
    name: "Theta Blockchain: The Inception",
    description:
      "A documentary exploring the origins and evolution of the Theta Network, a decentralized video delivery platform.",
    category: "documentary",
  },
  {
    name: "Decentralized Filmmaking: A New Era",
    description:
      "A deep dive into the impact of blockchain technology on the film industry, exploring new models of funding, distribution, and ownership.",
    category: "documentary",
  },
  {
    name: "Cryptocurrency in Cinema: A Short Film",
    description: "A short film exploring the themes of cryptocurrency and blockchain through a fictional narrative.",
    category: "short_film",
  },
  {
    name: "The Blockchain Revolution: A Web Series",
    description:
      "A web series exploring the potential of blockchain technology to disrupt various industries, from finance to healthcare.",
    category: "web_series",
  },
  {
    name: "NFT Art: A New Frontier",
    description:
      "A documentary exploring the rise of non-fungible tokens (NFTs) in the art world, examining their impact on artists and collectors.",
    category: "documentary",
  },
  {
    name: "The Metaverse: A Blockchain-Powered Future",
    description:
      "A web series exploring the concept of the metaverse, a virtual world powered by blockchain technology.",
    category: "web_series",
  },
  {
    name: "Blockchain Gaming: The Next Generation",
    description:
      "A documentary exploring the evolution of blockchain gaming, examining the role of NFTs and decentralized finance (DeFi) in the industry.",
    category: "documentary",
  },
];

/**
 * This script creates proposals to launch new projects on the CrowdFlix LaunchPad.
 */
async function createProposals(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed contracts
  const launchPad = await hre.ethers.getContract<Contract>("LaunchPad", deployer);
  console.log("LaunchPad deployed to:", await launchPad.getAddress());
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Set a common funding goal and time frame for all proposals
  const fundingGoal = parseEther("100");
  const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
  const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  // Add one day to startTime and endTime
  const oneDayInSeconds = 24 * 60 * 60;
  const extendedStartTime = startTime + oneDayInSeconds;
  const extendedEndTime = endTime + oneDayInSeconds;

  // Team wallet address (replace with your actual team wallet)
  const teamWallet = "0xF014198122454b5745bb33c5C91bF78A8Ac49DF7";

  // Create proposals for each project
  for (const project of launchPadProjects) {
    // Prepare the call data for the createProject function
    const createLaunchPadCampaignCallData = launchPad.interface.encodeFunctionData("createProject", [
      project.name, // _name
      project.description, // _description
      fundingGoal, // _fundingGoal
      extendedStartTime, // _startTime
      extendedEndTime, // _endTime
      teamWallet, // _teamWallet
      deployer, // _creator
      50, // _profitSharePercentage
      project.category, // _category
    ]);

    const launchPadAddress = (await launchPad.getAddress()).toString();
    const governer = await hre.ethers.getContractAt("CrowdFlixDaoGovernor", await crowdFlixDaoGovernor.getAddress());
    const proposalDescription = `Proposal to launch ${project.name} category ${project.category} on CrowdFlix`;

    const proposal = await governer.propose(
      [launchPadAddress], //targets
      [0], //values
      [createLaunchPadCampaignCallData], //transaction call data
      proposalDescription,
    );

    console.log(`✅ Proposal created for ${project.name} with transaction hash: ${proposal.hash}`);
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
    } catch (error) {
      console.log(error);
    }
  }
}

// Run the script
async function main() {
  await createProposals(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
