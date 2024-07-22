"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "~~/@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/@/components/ui/card";
import { NumberDisplayToken } from "~~/app/joindao/_components/utilDisplay";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// import { NumberDisplayToken } from "./utilDisplay";

type Props = object;

const DaoFaucet = (props: Props) => {
  const [userClaimed, setUserClaimed] = useState<boolean>(false);
  const [userTokenBalance, setUserTokenBalance] = useState<bigint | undefined>(undefined);
  const [votingPower, setVotingPower] = useState<number | undefined>(undefined);

  const { address: userAddress } = useAccount();
  const { writeContractAsync: claimTokensAsync } = useScaffoldWriteContract("CrowdFlixFaucet");
  const { data: flixToken, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixToken",
  });

  const { data: governer, isLoading: governerLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  const { writeContractAsync: delegateTokens } = useScaffoldWriteContract("CrowdFlixToken");

  const handleClaimTokens = async () => {
    if (userAddress) {
      try {
        await claimTokensAsync({
          functionName: "claim",
        });
        setUserClaimed(true);
      } catch (e) {
        console.error("Error claiming tokens:", e);
      }
    }
  };

  const handleDelegateTokens = async () => {
    if (userAddress) {
      try {
        await delegateTokens({
          functionName: "delegate",
          args: [userAddress],
        });
        console.log("Tokens delegated successfully!");
      } catch (e) {
        console.error("Error delegating tokens:", e);
      }
    }
  };

  if (userAddress && flixToken) {
    flixToken.read.balanceOf([userAddress]).then(balance => {
      setUserTokenBalance(balance);
    });
  }

  // Fetch voting power from the token contract
  if (userAddress && flixToken) {
    flixToken.read.getVotes([userAddress]).then(votes => {
      // Assuming getVotes returns a bigint
      setVotingPower(Number(votes));
    });
  }

  return (
    <div className="flex items-center flex-col text-center">
      <h2>DAO Faucet</h2>
      <br />
      <p>Claim CFLIX Tokens</p>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            {userAddress ? (
              <>
                {userTokenBalance !== undefined ? <NumberDisplayToken value={userTokenBalance} /> : "0"}
                CFLIX Tokens
              </>
            ) : (
              "Please connect your wallet"
            )}
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Voting Power</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            {userAddress ? (
              <>{votingPower !== undefined ? <p>Your have {votingPower / 1000000000000000000} votes </p> : null}</>
            ) : (
              "Please connect your wallet"
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        {userAddress ? (
          <>
            {userClaimed ? (
              <p>You have already claimed your tokens!</p>
            ) : (
              <Button variant={"default"} className="p-3 text-background bg-foreground" onClick={handleClaimTokens}>
                Claim Tokens
              </Button>
            )}
          </>
        ) : (
          "Please connect your wallet"
        )}
      </div>
      {/* Show the delegate button if userTokenBalance > votingPower */}
      {userTokenBalance! > votingPower! && (
        <div className="mt-4">
          <Button variant={"default"} className="p-3 text-background bg-foreground" onClick={handleDelegateTokens}>
            Delegate Tokens
          </Button>
        </div>
      )}
    </div>
  );
};

export default DaoFaucet;
