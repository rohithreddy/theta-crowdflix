// packages/hardhat/test/Gov/Goverance.behavior.ts
import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

// ... other imports ...

export async function shouldBehaveLikeLaunchPadGovernance(): Promise<void> {
  it("should receive answer from CLOCK_MODE", async function () {
    const { governor, _ } = this;

    const clock_mode = await governor.CLOCK_MODE();

    expect(clock_mode).to.be.equal("mode=timestamp");
  });

  it("clock should return the current block number", async function () {
    const { governor, _ } = this;

    const clock = await governor.clock();
    // const pTime = await ethers.provider.getBlock("latest");
    const pBlock = await ethers.provider.getBlock("latest");

    expect(clock).to.be.equal(pBlock?.timestamp);
  });

  it("should mint 10000 tokens", async function () {
    const { token, signers } = this;

    const amountToMint = 10000n;
    await token.mint(signers.admin.address, amountToMint);

    const balance = await token.balanceOf(signers.admin.address);
    expect(balance).to.be.equal(amountToMint);
  });
  it("should propose, vote, execute project creation, and finalize", async function () {
    const { token, governor, launchPad, signers, timelock, masterTicket, ticketManager, crowdFlixVault } = this;

    const admin = signers.admin;
    const user1 = signers.user1;
    const user2 = signers.user2;

    // 1. Mint Tokens & Delegate
    const amountToMint = parseEther("10000");
    await token.mint(admin.address, amountToMint);
    await token.connect(user1).delegate(user1.address);
    await token.connect(user2).delegate(user2.address);
    await token.delegate(admin.address);

    // 2. Prepare `createProject` Call Data
    const projectName = "Test Project";
    const projectDescription = "This is a test project";
    const fundingGoal = parseEther("100");
    const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const endTime = startTime + 86400 * 7; // 1 week from startTime
    const teamWallet = admin.address;
    const profitShare = 50;
    const category = "Test Category";

    const createProjectCalldata = launchPad.interface.encodeFunctionData("createProject", [
      projectName,
      projectDescription,
      fundingGoal,
      startTime,
      endTime,
      teamWallet,
      admin.address, // Assuming admin is the creator for this test
      profitShare,
      category,
    ]);

    // 3. Propose Project Creation
    const proposalTx = await governor.propose(
      [launchPad.getAddress()], // Targets
      [0], // Values (ETH)
      [createProjectCalldata], // Calldatas
      "Proposal to create a new project", // Description
    );
    const proposalReceipt = await proposalTx.wait(1);
    const proposalCreatedEvent = proposalReceipt.events?.find(event => event.event === "ProposalCreated");
    const proposalId = proposalCreatedEvent?.args?.proposalId;
    expect(proposalId).to.not.be.undefined; // Make sure proposalId exists

    // 4. Vote (after voting delay)
    await mine(Number(await governor.votingDelay()) + 1);
    await governor.connect(admin).castVote(proposalId, 1); // For
    await governor.connect(user1).castVote(proposalId, 1); // For

    // 5. Queue and Execute (after voting period + timelock)
    await mine(Number(await governor.votingPeriod()) + 1);
    await governor.queue(proposalId);

    await mine(Number(await timelock.getMinDelay()) + 1);
    await governor.execute(proposalId);
    // ... (Assert project creation using launchPad.projects(0))

    // 6. Contribute (to reach the funding goal)
    await token.connect(user1).approve(await launchPad.getAddress(), fundingGoal); // Make sure user1 has enough tokens
    await launchPad.connect(user1).contribute(0, fundingGoal);

    // 7. Finalize Project
    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine");
    await launchPad.finalizeProject(0);

    // ... (Assert project finalization - check balances, project status, etc.)
  });

  it("should fail to create a project if the proposal is not executed", async function () {
    const { token, governor, launchPad, signers, timelock, masterTicket, ticketManager, crowdFlixVault } = this;

    const admin = signers.admin;
    const user1 = signers.user1;
    const user2 = signers.user2;

    // 1. Mint Tokens & Delegate
    const amountToMint = parseEther("10000");
    await token.mint(admin.address, amountToMint);
    await token.connect(user1).delegate(user1.address);
    await token.connect(user2).delegate(user2.address);
    await token.delegate(admin.address);

    // 2. Prepare `createProject` Call Data
    const projectName = "Test Project";
    const projectDescription = "This is a test project";
    const fundingGoal = parseEther("100");
    const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const endTime = startTime + 86400 * 7; // 1 week from startTime
    const teamWallet = admin.address;
    const profitShare = 50;
    const category = "Test Category";

    const createProjectCalldata = launchPad.interface.encodeFunctionData("createProject", [
      projectName,
      projectDescription,
      fundingGoal,
      startTime,
      endTime,
      teamWallet,
      admin.address, // Assuming admin is the creator for this test
      profitShare,
      category,
    ]);

    // 3. Propose Project Creation
    const proposalTx = await governor.propose(
      [launchPad.getAddress()], // Targets
      [0], // Values (ETH)
      [createProjectCalldata], // Calldatas
      "Proposal to create a new project", // Description
    );
    const proposalReceipt = await proposalTx.wait(1);
    const proposalCreatedEvent = proposalReceipt.events?.find(event => event.event === "ProposalCreated");
    const proposalId = proposalCreatedEvent?.args?.proposalId;
    expect(proposalId).to.not.be.undefined; // Make sure proposalId exists

    // 4. Vote (after voting delay)
    await mine(Number(await governor.votingDelay()) + 1);
    await governor.connect(admin).castVote(proposalId, 1); // For
    await governor.connect(user1).castVote(proposalId, 1); // For

    // 5. Queue and Execute (after voting period + timelock)
    await mine(Number(await governor.votingPeriod()) + 1);
    await governor.queue(proposalId);

    // 6. Contribute (to reach the funding goal)
    await token.connect(user1).approve(await launchPad.getAddress(), fundingGoal); // Make sure user1 has enough tokens
    await expect(launchPad.connect(user1).contribute(0, fundingGoal)).to.be.revertedWith(
      "LaunchPad: Project not found",
    );
  });

  it("should fail to finalize a project if the funding goal is not reached", async function () {
    const { token, governor, launchPad, signers, timelock, masterTicket, ticketManager, crowdFlixVault } = this;

    const admin = signers.admin;
    const user1 = signers.user1;
    const user2 = signers.user2;

    // 1. Mint Tokens & Delegate
    const amountToMint = parseEther("10000");
    await token.mint(admin.address, amountToMint);
    await token.connect(user1).delegate(user1.address);
    await token.connect(user2).delegate(user2.address);
    await token.delegate(admin.address);

    // 2. Prepare `createProject` Call Data
    const projectName = "Test Project";
    const projectDescription = "This is a test project";
    const fundingGoal = parseEther("100");
    const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const endTime = startTime + 86400 * 7; // 1 week from startTime
    const teamWallet = admin.address;
    const profitShare = 50;
    const category = "Test Category";

    const createProjectCalldata = launchPad.interface.encodeFunctionData("createProject", [
      projectName,
      projectDescription,
      fundingGoal,
      startTime,
      endTime,
      teamWallet,
      admin.address, // Assuming admin is the creator for this test
      profitShare,
      category,
    ]);

    // 3. Propose Project Creation
    const proposalTx = await governor.propose(
      [launchPad.getAddress()], // Targets
      [0], // Values (ETH)
      [createProjectCalldata], // Calldatas
      "Proposal to create a new project", // Description
    );
    const proposalReceipt = await proposalTx.wait(1);
    const proposalCreatedEvent = proposalReceipt.events?.find(event => event.event === "ProposalCreated");
    const proposalId = proposalCreatedEvent?.args?.proposalId;
    expect(proposalId).to.not.be.undefined; // Make sure proposalId exists

    // 4. Vote (after voting delay)
    await mine(Number(await governor.votingDelay()) + 1);
    await governor.connect(admin).castVote(proposalId, 1); // For
    await governor.connect(user1).castVote(proposalId, 1); // For

    // 5. Queue and Execute (after voting period + timelock)
    await mine(Number(await governor.votingPeriod()) + 1);
    await governor.queue(proposalId);

    await mine(Number(await timelock.getMinDelay()) + 1);
    await governor.execute(proposalId);

    // 7. Finalize Project
    await ethers.provider.send("evm_setNextBlockTimestamp", [endTime + 1]);
    await ethers.provider.send("evm_mine");
    await expect(launchPad.finalizeProject(0)).to.be.revertedWith("LaunchPad: Funding goal not reached");
  });

  it("should fail to finalize a project if the end time has not passed", async function () {
    const { token, governor, launchPad, signers, timelock, masterTicket, ticketManager, crowdFlixVault } = this;

    const admin = signers.admin;
    const user1 = signers.user1;
    const user2 = signers.user2;

    // 1. Mint Tokens & Delegate
    const amountToMint = parseEther("10000");
    await token.mint(admin.address, amountToMint);
    await token.connect(user1).delegate(user1.address);
    await token.connect(user2).delegate(user2.address);
    await token.delegate(admin.address);

    // 2. Prepare `createProject` Call Data
    const projectName = "Test Project";
    const projectDescription = "This is a test project";
    const fundingGoal = parseEther("100");
    const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const endTime = startTime + 86400 * 7; // 1 week from startTime
    const teamWallet = admin.address;
    const profitShare = 50;
    const category = "Test Category";

    const createProjectCalldata = launchPad.interface.encodeFunctionData("createProject", [
      projectName,
      projectDescription,
      fundingGoal,
      startTime,
      endTime,
      teamWallet,
      admin.address, // Assuming admin is the creator for this test
      profitShare,
      category,
    ]);

    // 3. Propose Project Creation
    const proposalTx = await governor.propose(
      [launchPad.getAddress()], // Targets
      [0], // Values (ETH)
      [createProjectCalldata], // Calldatas
      "Proposal to create a new project", // Description
    );
    const proposalReceipt = await proposalTx.wait(1);
    const proposalCreatedEvent = proposalReceipt.events?.find(event => event.event === "ProposalCreated");
    const proposalId = proposalCreatedEvent?.args?.proposalId;
    expect(proposalId).to.not.be.undefined; // Make sure proposalId exists

    // 4. Vote (after voting delay)
    await mine(Number(await governor.votingDelay()) + 1);
    await governor.connect(admin).castVote(proposalId, 1); // For
    await governor.connect(user1).castVote(proposalId, 1); // For

    // 5. Queue and Execute (after voting period + timelock)
    await mine(Number(await governor.votingPeriod()) + 1);
    await governor.queue(proposalId);

    await mine(Number(await timelock.getMinDelay()) + 1);
    await governor.execute(proposalId);

    // 6. Contribute (to reach the funding goal)
    await token.connect(user1).approve(await launchPad.getAddress(), fundingGoal); // Make sure user1 has enough tokens
    await launchPad.connect(user1).contribute(0, fundingGoal);

    // 7. Finalize Project
    await expect(launchPad.finalizeProject(0)).to.be.revertedWith("LaunchPad: Project end time has not passed");
  });
}
