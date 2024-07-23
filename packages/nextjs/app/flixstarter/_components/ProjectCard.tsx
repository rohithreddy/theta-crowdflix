// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { formatUnits } from "viem";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Label } from "~~/components/ui/label";

type ProjectProps = {
  project: {
    name: string;
    description: string;
    fundingGoal: bigint;
    totalFunded: bigint;
    startTime: bigint;
    endTime: bigint;
    teamWallet: string;
    category: string;
    profitSharePercentage: bigint;
    index: number;
  };
};

const ProjectCard = ({ project }: ProjectProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync: contribute } = useScaffoldWriteContract("LaunchPad");
  const { writeContractAsync: token } = useScaffoldWriteContract("CrowdFlixToken");
  const { data: pad } = useDeployedContractInfo("LaunchPad");
  const [amount, setAmount] = useState("");

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Name : {project.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Description:</p>
          <p>{project.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Funding Goal:</p>
          <p>
            {formatUnits(project.fundingGoal, 18)} CFLIX (
            {formatUnits(project.totalFunded, 18)} CFLIX raised)
          </p>
        </div>
        {/* Calculate and display excess funds */}
        {project.totalFunded > project.fundingGoal && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="font-semibold">Excess Funds:</p>
            <p>
              {formatUnits(project.totalFunded - project.fundingGoal, 18)} CFLIX
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Start Time:</p>
          <p>
            {new Date(Number(project.startTime) * 1000).toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">End Time:</p>
          <p>
            {new Date(Number(project.endTime) * 1000).toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Team Wallet:</p>
          <p className="break-words">{project.teamWallet}</p> {/* Added break-words */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Category:</p>
          <p>{project.category}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="font-semibold">Profit Share Percentage:</p>
          <p>{project.profitSharePercentage.toString()} %</p>
        </div>
        {/* Add input for amount */}
        <div className="grid grid-cols-4 items-center gap-4 mt-4">
          <Label htmlFor={`amount-${project.index}`} className="text-right">
            Amount (CFLIX)
          </Label>
          <Input
            id={`amount-${project.index}`}
            defaultValue={amount}
            className="col-span-3"
            type="number"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {/* Add button to contribute */}
        <Button
          className="text-background p-2 mt-4"
          onClick={async () => {
            if (!userAddress || !amount) return;
            try {
              //add flixToken.write.allowance method here
              await token({
                functionName: "approve",
                args: [pad.address, BigInt(Number(amount) * 10 ** 18)],
              });
              await contribute({
                functionName: "contribute",
                args: [BigInt(project.index), BigInt(Number(amount) * 10 ** 18)],
              });
              console.log("Contribution successful!");
              setAmount(""); // Clear the input after contribution
            } catch (e) {
              console.error("Error contributing:", e);
            }
          }}
        >
          Contribute
        </Button>
        {/* Add button to finalize the project */}
        {project.totalFunded >= project.fundingGoal && (
          <Button
            className="text-background p-2 mt-4"
            onClick={async () => {
              if (!userAddress) return;
              try {
                await contribute({
                  functionName: "finalizeProject",
                  args: [BigInt(project.index)],
                });
                console.log("Project finalized successfully!");
              } catch (e) {
                console.error("Error finalizing project:", e);
              }
            }}
          >
            Finalize Project
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
