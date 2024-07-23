"use client";

import React, { useState } from "react";
import { NumberDisplayToken } from "./utilDisplay";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
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
    <div className="flex items-center flex-col text-center gap-4 mt-8">
      <h2 className="text-2xl font-semibold">DAO Details</h2>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-4">
          {" "}
          {/* Add p-4 class for padding */}
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            {totalSupply !== undefined && <NumberDisplayToken value={totalSupply} />}
            <div>CFLIX Tokens</div>
          </CardContent>
        </Card>
        {/* Add space between cards */}
        <div className="gap-8">
          <Card className="p-4">
            {" "}
            {/* Add p-4 class for padding */}
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col mt-2 items-center">
              {userAddress ? (
                <>
                  {userTokenBalance !== undefined ? <NumberDisplayToken value={userTokenBalance} /> : "0"} CFLIX Tokens
                  <br />
                  {votingPower !== undefined && <p>Your voting power is: {votingPower.toFixed(2)}%</p>}
                </>
              ) : (
                "Please connect your wallet"
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
