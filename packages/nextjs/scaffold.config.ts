import { defineChain } from "viem";
import * as chains from "viem/chains";

export const theta_privatenet = defineChain({
  id: 366,
  name: "Theta Private Net",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    default: {
      http: ["http://localhost:18888/rpc"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "" },
  },
  testnet: true,
});
export const theta_testnet = defineChain({
  id: 365,
  name: "Theta Test Net",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://testnet-explorer.thetatoken.org/" },
  },
  testnet: true,
});

export const theta_mainnet = defineChain({
  id: 361,
  name: "Theta Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-api.thetatoken.org/rpc"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.thetatoken.org/" },
  },
  testnet: false,
});

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.hardhat, theta_testnet],
  // targetNetworks: [chains.hardhat, theta_privatenet, theta_testnet, theta_mainnet],
  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: false,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
