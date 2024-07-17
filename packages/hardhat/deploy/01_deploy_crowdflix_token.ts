import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

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
  // Deploy Access Manager

  const { deployer } = await hre.getNamedAccounts();
  console.log("Deploying contracts with the account:", deployer);

  const { deploy } = hre.deployments;

  await deploy("AccessManager", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  const accessManager = await hre.ethers.getContract<Contract>("AccessManager", deployer);
  console.log("Access Manager Deployed at address", await accessManager.getAddress());

  await deploy("CrowdFlixToken", {
    from: deployer,
    // Contract constructor arguments
    args: [await accessManager.getAddress()],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const crowdFlixToken = await hre.ethers.getContract<Contract>("CrowdFlixToken", deployer);
  console.log("CROWDFLIX Token Deployed at address", await crowdFlixToken.getAddress());
  const tokenAdd = await crowdFlixToken.getAddress();
  console.log("Deploying launchpad contract");

  await deploy("LaunchPad", {
    from: deployer,
    // Contract constructor arguments
    args: [tokenAdd, await accessManager.getAddress()],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const launchPad = await hre.ethers.getContract<Contract>("LaunchPad", deployer);
  console.log("Launchpad Deployed at address", await launchPad.getAddress());

  console.log("Deploying Time lock controller");

  await deploy("Timelock", {
    from: deployer,
    // Contract constructor arguments
    args: [10, [], []], //just 10 seconds + public proposers
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const timeLock = await hre.ethers.getContract<Contract>("Timelock", deployer);
  console.log("Time lock deployed at address", await timeLock.getAddress());

  const timeLockAdd = await timeLock.getAddress();

  // Get the deployed contract to interact with it after deploying.

  await deploy("CrowdFlixDaoGovernor", {
    from: deployer,
    // Contract constructor arguments
    args: [tokenAdd, timeLockAdd],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);
  console.log("Deployed Governer successfully", await crowdFlixDaoGovernor.getAddress());

  console.log("Minting CROWDFLIX TOken to Flix Governer");
  await crowdFlixToken
    .mint(await crowdFlixDaoGovernor.getAddress(), 10000000 * 10 ** 8)
    .then(() => console.log("Minted CROWDFLIX Token to Flix Governer"))
    .catch(err => console.log(err));
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["CROWDFLIX", "DaoGov", "TimeLock"];
