import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
// const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0x1111111111111111111111111111111111111111111111111111111111111111";
// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const config: HardhatUserConfig = {
  mocha: {
    timeout: 1000000000,
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
        runs: 200,
      },
      evmVersion: "paris",
    },
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 5000,
      },
    },
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    theta_testnet: {
      url: `https://eth-rpc-api-testnet.thetatoken.org/rpc`,
      accounts: [deployerPrivateKey],
      chainId: 365,
      gasPrice: 4000000000000,
      timeout: 8000000,
    },
    theta_mainnet: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      accounts: [deployerPrivateKey],
      chainId: 361,
      gasPrice: 4000000000000,
    },
    theta_privatenet: {
      url: "http://localhost:18888/rpc",
      accounts: [
        "1111111111111111111111111111111111111111111111111111111111111111", // 0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A
        "2222222222222222222222222222222222222222222222222222222222222222", // 0x1563915e194D8CfBA1943570603F7606A3115508
        "3333333333333333333333333333333333333333333333333333333333333333", // 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB
        "4444444444444444444444444444444444444444444444444444444444444444", // 0x7564105E977516C53bE337314c7E53838967bDaC
        "5555555555555555555555555555555555555555555555555555555555555555", // 0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9
        "6666666666666666666666666666666666666666666666666666666666666666", // 0xdb2430B4e9AC14be6554d3942822BE74811A1AF9
        "7777777777777777777777777777777777777777777777777777777777777777", // 0xAe72A48c1a36bd18Af168541c53037965d26e4A8
        "8888888888888888888888888888888888888888888888888888888888888888", // 0x62f94E9AC9349BCCC61Bfe66ddAdE6292702EcB6
        "9999999999999999999999999999999999999999999999999999999999999999", // 0x0D8e461687b7D06f86EC348E0c270b0F279855F0
        "1000000000000000000000000000000000000000000000000000000000000000", // 0x7B2419E0Ee0BD034F7Bf24874C12512AcAC6e21C
      ],
      chainId: 366,
      gasPrice: 4000000000000,
      timeout: 8000000,
    },
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
