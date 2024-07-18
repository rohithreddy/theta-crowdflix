"use client";

import React, { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Props = object;

const TokenDetails = (props: Props) => {
  const [totalSupply, setTotalSupply] = useState<string | undefined>(undefined);
  const [governorSupply, setGovernorSupply] = useState<string | undefined>(undefined);
  const [amountToBuy, setAmountToBuy] = useState<string>("0");

  const { data: flixToken, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixToken",
  });

  const { data: crowdFlixDaoGovernor, isLoading: governorLoading } = useDeployedContractInfo("CrowdFlixDaoGovernor");

  const { address: userAddress } = useAccount();

  const { writeContractAsync: transferFrom } = useScaffoldWriteContract("CrowdFlixToken");

  // Fetch the total supply directly when the component renders
  // This assumes the contract is already available
  if (!isLoading && flixToken) {
    flixToken.read.totalSupply().then(supply => {
      setTotalSupply(supply?.toString());
    });
  }

  // Fetch the governor's supply when the component renders
  if (!governorLoading && crowdFlixDaoGovernor && flixToken) {
    flixToken.read.balanceOf([crowdFlixDaoGovernor.address]).then(supply => {
      setGovernorSupply(supply.toString());
    });
  }

  const handleBuy = async () => {
    if (flixToken && userAddress && amountToBuy && crowdFlixDaoGovernor) {
      try {
        // Use useScaffoldWriteContract
        await transferFrom({
          functionName: "transferFrom",
          args: [crowdFlixDaoGovernor.address, userAddress, parseEther(amountToBuy)],
        });

        // Update the governorSupply after successful transfer
        if (!governorLoading && crowdFlixDaoGovernor && flixToken) {
          flixToken.read.balanceOf([crowdFlixDaoGovernor.address]).then(supply => {
            setGovernorSupply(supply.toString());
          });
        }
      } catch (error) {
        console.error("Error transferring tokens:", error);
      }
    }
  };

  return (
    <div className="text-center">
      <h2>Token Details</h2>
      <br />
      <p>Total Supply of CFLIX Token is</p>
      <br />
      <p>{totalSupply}</p>
      <br />
      <p>Supply of CFLIX Token available with CrowdFlixDaoGovernor is</p>
      <br />
      <p>{governorSupply}</p>
      <br />
      <p>You can buy tokens from Governer to become a DAO member</p>
      <div>
        <label htmlFor="amountToBuy">Amount to buy:</label>
        <input
          type="number"
          id="amountToBuy"
          value={amountToBuy}
          onChange={e => setAmountToBuy(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <button onClick={handleBuy} disabled={isLoading || governorLoading}>
        Buy Tokens
      </button>
    </div>
  );
};

export default TokenDetails;
