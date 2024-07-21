import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import type { Signers } from "../types";
import { deployGovernanceContractsFixture } from "./Governance.fixture";
import { shouldBehaveLikeLaunchPadGovernance } from "./Governance.behaviour";

describe("CrowdFlixDaoGovernor", async function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user1 = signers[1];
    this.signers.user2 = signers[2]; // Add more signers as needed
    this.loadFixture = loadFixture;
  });

  describe("With Timestamp Mode", async function () {
    beforeEach(async function () {
      const { token, timelock, governor, launchPad, masterTicket, ticketManager, crowdFlixVault } =
        await this.loadFixture(deployGovernanceContractsFixture);
      this.governor = governor;
      this.token = token;
      this.timelock = timelock;
      this.launchPad = launchPad;
      this.masterTicket = masterTicket;
      this.ticketManager = ticketManager;
      this.crowdFlixVault = crowdFlixVault;
    });

    // shouldBehaveLikeGovernorWithTimestamp();
    shouldBehaveLikeLaunchPadGovernance(); // Add the new test suite
  });
});
