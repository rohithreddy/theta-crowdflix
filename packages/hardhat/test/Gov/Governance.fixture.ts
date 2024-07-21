/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethers } from "hardhat";
import { getExpectedContractAddress } from "../../helpers/expected_contract";

import {
  CrowdFlixToken,
  FlixTimelock,
  CrowdFlixDaoGovernor,
  CrowdFlixToken__factory,
  CrowdFlixDaoGovernor__factory,
  CrowdFlixVault__factory,
  FlixTimelock__factory,
  LaunchPad__factory,
  MasterTicket__factory,
  TicketManager__factory,
} from "../../typechain-types";

// Assume you have a 'config' object with settings
// (or define these values directly here)
const config = {
  timelock: {
    minDelay: 10, // Example: 10 seconds delay
  },
  governor: {
    name: "Crowd Flix DAO",
    votingDelay: 2, // Example: 2 blocks delay
    votingPeriod: 100, // Example: 100 blocks voting period
    quorumNumerator: 2, // 2%
    voteExtension: 100, // blocks
  },
};

export async function deployGovernanceContractsFixture(): Promise<{
  token: CrowdFlixToken;
  timelock: FlixTimelock;
  governor: CrowdFlixDaoGovernor;
  launchPad: LaunchPad;
  masterTicket: MasterTicket;
  ticketManager: TicketManager;
  crowdFlixVault: CrowdFlixVault;
}> {
  const signers = await ethers.getSigners();
  const deployerSigner = signers[0];

  // Get Expected Contract Addresses (from your deployment script)
  const governanceAddress = await getExpectedContractAddress(deployerSigner, 2);
  const timelockAddress = await getExpectedContractAddress(deployerSigner, 1);
  const tokenAddress = await getExpectedContractAddress(deployerSigner, 0);

  // Deploy CrowdFlixToken
  const GovernorToken: CrowdFlixToken__factory = (await ethers.getContractFactory(
    "CrowdFlixToken",
  )) as CrowdFlixToken__factory;
  const token = await GovernorToken.connect(deployerSigner).deploy(
    deployerSigner.address,
    deployerSigner.address,
    deployerSigner.address,
  );

  // Deploy FlixTimelock
  const Timelock: FlixTimelock__factory = (await ethers.getContractFactory("FlixTimelock")) as FlixTimelock__factory;
  const timelock = await Timelock.connect(deployerSigner).deploy(
    config.timelock.minDelay,
    [deployerSigner.address, timelockAddress],
    [deployerSigner.address, timelockAddress],
    timelockAddress,
  );

  // Deploy CrowdFlixDaoGovernor
  const Governor: CrowdFlixDaoGovernor__factory = (await ethers.getContractFactory(
    "CrowdFlixDaoGovernor",
  )) as CrowdFlixDaoGovernor__factory;
  const governor = await Governor.connect(deployerSigner).deploy(
    config.governor.name,
    tokenAddress,
    timelockAddress,
    config.governor.quorumNumerator,
    config.governor.voteExtension,
  );

  // Deploy LaunchPad
  const LaunchPad: LaunchPad__factory = (await ethers.getContractFactory("LaunchPad")) as LaunchPad__factory;
  const launchPad = await LaunchPad.connect(deployerSigner).deploy(
    await token.getAddress(),
    deployerSigner.address,
    await governor.getAddress(),
    deployerSigner.address,
  );

  // Deploy MasterTicket
  const MasterTicket: MasterTicket__factory = (await ethers.getContractFactory(
    "MasterTicket",
  )) as MasterTicket__factory;
  const masterTicket = await MasterTicket.connect(deployerSigner).deploy();

  // Deploy TicketManager
  const TicketManager: TicketManager__factory = (await ethers.getContractFactory(
    "TicketManager",
  )) as TicketManager__factory;
  const ticketManager = await TicketManager.connect(deployerSigner).deploy(
    await masterTicket.getAddress(),
    await launchPad.getAddress(),
    deployerSigner.address,
  );

  // Deploy CrowdFlixVault
  const CrowdFlixVault: CrowdFlixVault__factory = (await ethers.getContractFactory(
    "CrowdFlixVault",
  )) as CrowdFlixVault__factory;
  const crowdFlixVault = await CrowdFlixVault.connect(deployerSigner).deploy(
    deployerSigner.address,
    deployerSigner.address,
  );

  // Grant Necessary Roles (if applicable)
  // - Give the timelock the MINTER_ROLE on your token
  await token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress());
  // - Grant any necessary roles to LaunchPad (e.g., by the governor)
  //   ...
  await crowdFlixVault.grantRole(ethers.id("TICKET_MANAGER_ROLE"), await ticketManager.getAddress());

  return { token, timelock, governor, launchPad, masterTicket, ticketManager, crowdFlixVault };
}
