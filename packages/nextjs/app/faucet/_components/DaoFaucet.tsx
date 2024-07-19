"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Props = object;

const DaoFaucet = (props: Props) => {
  const [userClaimed, setUserClaimed] = useState<boolean>(false);

  const { address: userAddress } = useAccount();
  const { writeContractAsync: claimTokensAsync } = useScaffoldWriteContract("CrowdFlixFaucet");

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

  return (
    <div className="flex items-center flex-col text-center">
      <h2>DAO Faucet</h2>
      <br />
      <p>Claim CFLIX Tokens</p>
      <br />
      <div>
        {userAddress ? (
          <>
            {userClaimed ? (
              <p>You have already claimed your tokens!</p>
            ) : (
              <button className="btn btn-primary" onClick={handleClaimTokens}>
                Claim Tokens
              </button>
            )}
          </>
        ) : (
          "Please connect your wallet"
        )}
      </div>
    </div>
  );
};

export default DaoFaucet;
