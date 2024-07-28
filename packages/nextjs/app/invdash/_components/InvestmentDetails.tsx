"use client";

import React from "react";
import { useAccount } from "wagmi";
import { NumberDisplayToken } from "~~/app/dao/_components/utilDisplay";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Props = object;

const InvestmentDetails = (props: Props) => {
  const { address: userAddress } = useAccount();
  const { data: totalWithDrawableFuel, isLoading: totalWithDrawableFuelLoading } = useScaffoldReadContract({
    contractName: "CrowdFlixVault",
    functionName: "getTotalWithdrawableEth",
    args: [userAddress],
  });

  const { data: withFuellist, isLoading: fuelWithListLoading } = useScaffoldReadContract({
    contractName: "CrowdFlixVault",
    functionName: "getWithdrawableEthBreakdown",
    args: [userAddress],
  });

  const { writeContractAsync: withdrawFunds } = useScaffoldWriteContract("CrowdFlixVault");

  return (
    <div className="mt-8 items-center flex flex-col container">
      <h2 className="text-2xl font-bold p-4">Details of your Investments</h2>
      <div className="gap-8 mt-4">
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            <CardTitle className="text-center">Total TFUEL Returns</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p className="font-bold text-xl">
              {totalWithDrawableFuelLoading ? (
                "Loading..."
              ) : totalWithDrawableFuel === 0n ? (
                "You have no Withdrawable TFUEL"
              ) : (
                <NumberDisplayToken value={totalWithDrawableFuel as bigint} />
              )}
            </p>
          </CardContent>
        </Card>
        {/* Render a card for each project ID only if totalWithDrawableFuel is not zero */}
        {totalWithDrawableFuel !== 0n && !fuelWithListLoading && (
          <div className="gap-8 mt-4 flex flex-wrap items-center justify-center">
            {withFuellist?.[0].map((projectId, index) => (
              <Card key={index} className="p-4 basis-1/2 md:basis-1/3 lg:basis-1/4" style={{ height: "auto" }}>
                <CardHeader className="flex items-center justify-center">
                  <CardTitle className="text-center">Project ID: {projectId.toString()}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col mt-2 items-center">
                  <p className="font-bold text-xl">
                    <NumberDisplayToken value={withFuellist[1][index]} /> TFUEL
                  </p>
                  {/* Add withdraw button */}
                  <Button
                    className="text-background p-2 bg-orange-500 hover:bg-orange-700 mt-4"
                    onClick={async () => {
                      try {
                        await withdrawFunds({
                          functionName: "withdrawFunds",
                          args: [projectId],
                        });
                        console.log("Funds withdrawn successfully!");
                      } catch (e) {
                        console.error("Error withdrawing funds:", e);
                      }
                    }}
                  >
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentDetails;
