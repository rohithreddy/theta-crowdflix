// packages/hardhat/test/types.ts
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type {
  CrowdFlixDaoGovernor,
  CrowdFlixToken,
  FlixTimelock,
  LaunchPad,
  MasterTicket,
  TicketManager,
  CrowdFlixVault,
} from "../typechain-types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    governor: CrowdFlixDaoGovernor;
    token: CrowdFlixToken;
    timelock: FlixTimelock;
    launchPad: LaunchPad;
    masterTicket: MasterTicket;
    ticketManager: TicketManager;
    crowdFlixVault: CrowdFlixVault;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  notAuthorized: SignerWithAddress;
}
