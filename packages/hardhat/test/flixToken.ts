import { expect } from "chai";
import { ethers } from "hardhat";
import { CrowdFlixToken } from "../typechain-types";

describe("CrowdFlix", function () {
  let crowdFlix: CrowdFlixToken;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy CrowdFlix contract
    const CrowdFlixFactory = await ethers.getContractFactory("CrowdFlixToken");
    crowdFlix = await CrowdFlixFactory.deploy(owner.address, owner.address, owner.address);
    await crowdFlix.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the correct initial supply", async function () {
      const totalSupply = await crowdFlix.totalSupply();
      expect(totalSupply).to.equal(100000000000000000000n); // Assuming initial supply is 1 million
    });

    it("Should assign the correct initial balance to the owner", async function () {
      const ownerBalance = await crowdFlix.balanceOf(owner.address);
      expect(ownerBalance).to.equal(100000000000000000000n); // Assuming initial supply is 1 million
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens successfully", async function () {
      const transferAmount = 100;
      await crowdFlix.transfer(addr1.address, transferAmount);
      const addr1Balance = await crowdFlix.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("Should revert if transfer exceeds balance", async function () {
      const transferAmount = 100000000000000000001n; // Exceeds initial balance
      await expect(crowdFlix.transfer(addr1.address, transferAmount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });
  });

  describe("Approve", function () {
    it("Should approve tokens for transfer", async function () {
      const approveAmount = 50;
      await crowdFlix.approve(addr1.address, approveAmount);
      const allowance = await crowdFlix.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(approveAmount);
    });
  });

  describe("TransferFrom", function () {
    it("Should transfer tokens from one account to another", async function () {
      const approveAmount = 50;
      await crowdFlix.approve(addr1.address, approveAmount); // Set the allowance
      await crowdFlix.transferFrom(owner.address, addr2.address, approveAmount);
      const addr2Balance = await crowdFlix.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(approveAmount);
    });

    it("Should revert if transfer exceeds allowance", async function () {
      const transferAmount = 100;
      await crowdFlix.approve(addr1.address, 50); // Approve less than transfer amount
      await expect(crowdFlix.transferFrom(owner.address, addr2.address, transferAmount)).to.be.revertedWith(
        "ERC20: insufficient allowance",
      );
    });
  });
});
