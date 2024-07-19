import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, parseEther } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  console.log("Deploying contracts with the account:", deployer);

  const { deploy } = hre.deployments;
  // Deploy CrowdFlixToken
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
  const cflixTokenAddress = await crowdFlixToken.getAddress();

  // Deploy CrowdFlixFaucet
  await deploy("CrowdFlixFaucet", {
    from: deployer,
    args: [cflixTokenAddress], // Pass the CrowdFlixToken address
    log: true,
    autoMine: true,
  });

  const crowdFlixFaucet = await hre.ethers.getContract<Contract>("CrowdFlixFaucet", deployer);
  console.log("CrowdFlixFaucet Deployed at address", await crowdFlixFaucet.getAddress());

  // Mint 10 million CROWDFLIX tokens to CrowdFlixFaucet
  await crowdFlixToken
    .mint(await crowdFlixFaucet.getAddress(), parseEther("1000")) // thousand tokens
    .then(() => console.log("Minted CROWDFLIX Token to CrowdFlixFaucet"))
    .catch(err => console.log(err));

  await deploy("CrowdFlixDaoGovernor", {
    from: deployer,
    // Contract constructor arguments
    args: [cflixTokenAddress],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);
  console.log("Deployed Governer successfully", await crowdFlixDaoGovernor.getAddress());

  await deploy("LaunchPad", {
    from: deployer,
    args: [cflixTokenAddress, await crowdFlixDaoGovernor.getAddress()],
    log: true,
    // autoMine: true, // can be passed to the deploy function to make the deployment process faster on local networks by
    //  automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const launchPad = await hre.ethers.getContract<Contract>("LaunchPad", deployer);
  console.log("Launchpad Deployed at address", await launchPad.getAddress());

  // console.log("Minting CROWDFLIX TOken to Flix Governer");
  // await crowdFlixToken
  //   .mint(await crowdFlixDaoGovernor.getAddress(), parseEther("1000000000"))
  //   .then(() => console.log("Minted CROWDFLIX Token to Flix Governer"))
  //   .catch(err => console.log(err));

  // await deploy("AccessManager", {
  //   from: deployer,
  //   args: [deployer],
  //   log: true,
  //   autoMine: true,
  // });
  // const accessManager = await hre.ethers.getContract<Contract>("AccessManager", deployer);
  // console.log("Access Manager Deployed at address", await accessManager.getAddress());
  // console.log("Deploying launchpad contract");

  // console.log("Deploying Time lock controller");

  // await deploy("Timelock", {
  //   from: deployer,
  //   // Contract constructor arguments
  //   args: [10, [], []], //just 10 seconds + public proposers
  //   log: true,
  //   // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
  //   // automatically mining the contract deployment transaction. There is no effect on live networks.
  //   autoMine: true,
  // });

  // const timeLock = await hre.ethers.getContract<Contract>("Timelock", deployer);
  // console.log("Time lock deployed at address", await timeLock.getAddress());

  // const timeLockAdd = await timeLock.getAddress();

  // // Get the deployed contract to interact with it after deploying.

  // // Deploy MasterTicket
  // await deploy("MasterTicket", {
  //   from: deployer,
  //   log: true,
  //   autoMine: true,
  // });
  // const masterTicket = await hre.ethers.getContract<Contract>("MasterTicket", deployer);
  // console.log("MasterTicket Deployed at address", await masterTicket.getAddress());

  // // ... (other imports and variables)

  const MasterTicket = await hre.ethers.getContractFactory("MasterTicket");
  const masterTicket = await MasterTicket.deploy();
  // await masterTicket.deployed();

  // // Initialize MasterTicket

  console.log("MasterTicket deployed to:", await masterTicket.getAddress());
  const crowdFlixVaultDeployment = await deploy("CrowdFlixVault", {
    from: deployer,
    args: [deployer, deployer], // Set initial roles (consider multi-sig or DAO later)
    log: true,
    autoMine: true,
  });
  const crowdFlixVault = await hre.ethers.getContractAt("CrowdFlixVault", crowdFlixVaultDeployment.address);
  console.log("CrowdFlixVault deployed to:", crowdFlixVaultDeployment.address);

  // Deploy TicketManager
  await deploy("TicketManager", {
    from: deployer,
    args: [await masterTicket.getAddress(), await launchPad.getAddress(), await crowdFlixVault.getAddress()],
    log: true,
    autoMine: true,
  });
  const ticketManager = await hre.ethers.getContract<Contract>("TicketManager", deployer);
  console.log("TicketManager Deployed at address", await ticketManager.getAddress());
  // // await masterTicket.initialize(
  // //   await ticketManager.getAddress(), // Replace with the address of your initial authority
  // //   "Master Ticket", // Replace with your desired name
  // //   "MTKT", // Replace with your desired symbol
  // //   100, // Replace with your desired initial price (in wei)
  // // );
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["CROWDFLIX", "DaoGov", "MasterTicket", "TicketManager", "CrowdFlixVault"];
