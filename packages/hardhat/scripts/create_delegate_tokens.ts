import "@nomicfoundation/hardhat-ethers";
import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { parseEther } from "ethers";

/**
 * This script mints 222 CrowdFlix tokens to the admin and delegates them for voting power.
 */
async function createDelegateTokens(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // Get the deployed contracts
  const crowdFlixToken = await hre.ethers.getContract<Contract>("CrowdFlixToken", deployer);
  const crowdFlixDaoGovernor = await hre.ethers.getContract<Contract>("CrowdFlixDaoGovernor", deployer);

  // Mint 222 tokens to the admin
  const mintTx = await crowdFlixToken.mint(deployer, parseEther("555"));
  await mintTx.wait();
  console.log(`✅ 222 CrowdFlix tokens minted to ${deployer}`);

  // Delegate voting power
  const delegateTx = await crowdFlixToken.delegate(deployer);
  await delegateTx.wait();
  console.log(`✅ Voting power delegated from ${deployer} to ${deployer}`);

  // Verify delegation
  const delegatedVotes = await crowdFlixDaoGovernor.getVotes(deployer);
  console.log(`✅ Delegated votes for ${deployer}: ${delegatedVotes.toString()}`);
}

// Run the script
async function main() {
  await createDelegateTokens(hre);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
