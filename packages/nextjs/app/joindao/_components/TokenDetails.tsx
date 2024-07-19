"use client";

import React, { useState } from "react";
import { NumberDisplayToken } from "./utilDisplay";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Props = object;

const TokenDetails = (props: Props) => {
  const [totalSupply, setTotalSupply] = useState<bigint | undefined>(undefined);
  const [userTokenBalance, setUserTokenBalance] = useState<bigint | undefined>(undefined);
  const [votingPower, setVotingPower] = useState<number | undefined>(undefined);

  const { data: flixToken, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixToken",
  });

  const { address: userAddress } = useAccount();
  const { writeContractAsync: transferFrom } = useScaffoldWriteContract("CrowdFlixToken");

  // Fetch the total supply directly when the component renders
  // This assumes the contract is already available
  if (!isLoading && flixToken) {
    flixToken.read.totalSupply().then(supply => {
      setTotalSupply(supply);
    });
  }
  if (userAddress && flixToken) {
    flixToken.read.balanceOf([userAddress]).then(balance => {
      setUserTokenBalance(balance);
      if (totalSupply !== undefined && balance !== undefined) {
        const power = (Number(balance) / Number(totalSupply)) * 100;
        setVotingPower(power);
      }
    });
  }

  return (
    <div className="flex items-center flex-col text-center">
      <h2>Token Details</h2>
      <br />
      <p>Total Supply of CFLIX Token is</p>
      <br />
      <div className="">{totalSupply !== undefined && <NumberDisplayToken value={totalSupply} />}</div>
      <br />
      <div>
        {userAddress ? (
          <>
            You have {userTokenBalance !== undefined ? <NumberDisplayToken value={userTokenBalance} /> : "0"} CFLIX
            Tokens
            <br />
            {votingPower !== undefined && <p>Your voting power is: {votingPower.toFixed(2)}%</p>}
          </>
        ) : (
          "Please connect your wallet"
        )}
      </div>
      <div></div>
    </div>
  );
};

export default TokenDetails;
