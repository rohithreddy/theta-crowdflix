import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, parseEther } from "ethers";
import { ethers } from "hardhat";
import { getExpectedContractAddress } from "../helpers/expected_contract";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log(hre.network.name);
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer); // Get the signer for the deployer account

  console.log("Deploying contracts with the account:", deployer);
  const ticketManagerAddress = await getExpectedContractAddress(deployerSigner, 6);
  const dao_governor_address = await getExpectedContractAddress(deployerSigner, 2);
  const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
  const token_address = await getExpectedContractAddress(deployerSigner, 0);
  const { deploy } = hre.deployments;

  // Deploy CrowdFlixToken
  console.log("Deploying CrowdFlixToken...");
  await deploy("CrowdFlixToken", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, deployer, deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const crowdFlixToken = await hre.ethers.getContract<Contract>("CrowdFlixToken", deployer);
  console.log("CROWDFLIX Token Deployed at address", await crowdFlixToken.getAddress());
  console.log("expected token address iS :D ", token_address);
  const cflixTokenAddress = await crowdFlixToken.getAddress();

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy TimeLockController
  console.log("Deploying TimeLockController...");
  const proposers = [deployer, timelock_address, dao_governor_address];
  const executors = [deployer, timelock_address, dao_governor_address];

  await deploy("FlixTimelock", {
    from: deployer,
    args: [10, proposers, executors, deployer], // Pass the CrowdFlixToken address
    log: true,
    autoMine: true,
  });

  const timeLockController = await hre.ethers.getContract<Contract>("FlixTimelock", deployer);
  console.log("TimeLockController Deployed at address", await timeLockController.getAddress());
  console.log("The expected timelock address is", timelock_address);

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy CrowdFlixDaoGovernor
  console.log("Deploying CrowdFlixDaoGovernor...");
  const args = [
    "Crowd Flix DAO",
    cflixTokenAddress,
    await timeLockController.getAddress(),
    2, //quorum numerator
    100, //voting extension
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const governor = await deploy("CrowdFlixDaoGovernor", {
    from: deployer,
    // Contract constructor arguments
    args: args,
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);
  console.log("Deployed Governer successfully", await crowdFlixDaoGovernor.getAddress());
  console.log("expected dao governor address iS :D ", dao_governor_address);

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy LaunchPad
  console.log("Deploying LaunchPad...");
  await deploy("LaunchPad", {
    from: deployer,
    args: [
      cflixTokenAddress, //token
      deployer, //admin
      timelock_address, //dao gov role
      deployer, //pauser role
      deployer, //team ops role
    ],
    log: true,
    // autoMine: true, // can be passed to the deploy function to make the deployment process faster on local networks by
    //  automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const launchPad = await hre.ethers.getContract<Contract>("LaunchPad", deployer);
  console.log("Launchpad Deployed at address", await launchPad.getAddress());

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy MasterTicket
  console.log("Deploying MasterTicket...");
  // const MasterTicket = await hre.ethers.getContractFactory("MasterTicket");
  // const masterTicket = await MasterTicket.deploy();
  // await masterTicket.deployed();
  await deploy("MasterTicket", {
    from: deployer,
    args: [],
    log: true,
    // autoMine: true, // can be passed to the deploy function to make the deployment process faster on local networks by
    //  automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const masterTicket = await hre.ethers.getContract<Contract>("MasterTicket", deployer);
  // // Initialize MasterTicket

  console.log("MasterTicket deployed to:", await masterTicket.getAddress());

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy CrowdFlixVault
  console.log("Deploying CrowdFlixVault...");
  const crowdFlixVaultDeployment = await deploy("CrowdFlixVault", {
    from: deployer,
    args: [deployer, deployer], // Set initial roles (consider multi-sig or DAO later)
    log: true,
    autoMine: true,
  });
  const crowdFlixVault = await hre.ethers.getContractAt("CrowdFlixVault", crowdFlixVaultDeployment.address);
  console.log("CrowdFlixVault deployed to:", crowdFlixVaultDeployment.address);

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy TicketManager
  console.log("Deploying TicketManager...");
  await deploy("TicketManager", {
    from: deployer,
    args: [await masterTicket.getAddress(), await launchPad.getAddress(), await crowdFlixVault.getAddress()],
    log: true,
    autoMine: true,
  });
  const ticketManager = await hre.ethers.getContract<Contract>("TicketManager", deployer);
  console.log("TicketManager Deployed at address", await ticketManager.getAddress());

  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds timeout

  // Deploy CrowdFlixFaucet
  console.log("Deploying CrowdFlixFaucet...");
  await deploy("CrowdFlixFaucet", {
    from: deployer,
    args: [cflixTokenAddress], // Pass the CrowdFlixToken address
    log: true,
    autoMine: true,
  });

  const crowdFlixFaucet = await hre.ethers.getContract<Contract>("CrowdFlixFaucet", deployer);
  console.log("CrowdFlixFaucet Deployed at address", await crowdFlixFaucet.getAddress());

  // Check if the current network is hardhat
  if (hre.network.name === "localhost") {
    // TODO
    // 1. mint tokens to faucet
    // Mint 10 million CROWDFLIX tokens to CrowdFlixFaucet
    console.log("Minting CROWDFLIX tokens to CrowdFlixFaucet...");
    await crowdFlixToken
      .mint(await crowdFlixFaucet.getAddress(), parseEther("10000")) // thousand tokens
      .then(() => console.log("Minted CROWDFLIX Token to CrowdFlixFaucet"))
      .catch(err => console.log(err));

    // 2 . initialize ticket manager on Launchpad
    console.log("Initializing TicketManager on LaunchPad...");
    await launchPad.initializeTicketManager(await ticketManager.getAddress());
    console.log("TicketManager initialized on LaunchPad");
    // 3. vault grant ticket_manager role to ticket mamanager address
    await crowdFlixVault.grantRole(ethers.id("TICKET_MANAGER_ROLE"), await ticketManager.getAddress());
    console.log("GRANTED TICKET MANAGER ROLE to=> " + (await ticketManager.getAddress()));
  }

  // await crowdFlixVault.grantRole(await crowdFlixVault.TICKET_MANAGER_ROLE, await ticketManager.getAddress())

  // // Initialize the TicketManager on the LaunchPad contract
  //

  // Initialize the CrowdFlixVault on the LaunchPad contract
  // console.log("Initializing CrowdFlixVault on LaunchPad...");
  // await launchPad.initializeCrowdFlixVault(await crowdFlixVault.getAddress());
  // console.log("CrowdFlixVault initialized on LaunchPad");

  // Initialize the CrowdFlixDaoGovernor on the LaunchPad contract
  // await launchPad.initializeCrowdFlixDaoGovernor(await crowdFlixDaoGovernor.getAddress());
  // console.log("CrowdFlixDaoGovernor initialized on LaunchPad")
  // // await masterTicket.initialize(
  // //   await ticketManager.getAddress(), // Replace with the address of your initial authority
  // //   "Master Ticket", // Replace with your desired name
  // //   "MTKT", // Replace with your desired symbol
  // //   100, // Replace with your desired initial price (in wei)
  // // );
  // Testing a create proposal
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.id = "Crowdflix";
deployYourContract.tags = ["CROWDFLIX", "DaoGov", "MasterTicket", "TicketManager", "CrowdFlixVault"];
