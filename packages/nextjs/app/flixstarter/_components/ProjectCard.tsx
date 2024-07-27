// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx
"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/_components/ProjectCard.tsx

type ProjectProps = {
  project: {
    name: string;
    description: string;
    fundingGoal: bigint;
    startTime: bigint;
    endTime: bigint;
    teamWallet: string;
    totalFunded: bigint;
    isActive: boolean;
    contributors: `0x${string}`[];
    creator: string;
    profitSharePercentage: bigint;
    category: string;
    status: number;
    ticketCollection: string;
    projectId: bigint;
    daoProposalId: bigint;
  };
};

const ProjectCard = ({ project }: ProjectProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync: launchPad } = useScaffoldWriteContract("LaunchPad");
  const { writeContractAsync: flixToken } = useScaffoldWriteContract("CrowdFlixToken");
  const { data: pad } = useDeployedContractInfo("LaunchPad");
  const [amount, setAmount] = useState("");
  const [ticketPrice, setTicketPrice] = useState(""); // State for ticket price

  return (
    <Card className="p-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Name : {project.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 mt-2 flex-grow">
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Description:</p>
          <p>{project.description}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Creator:</p>
          <p className="break-words">{project.creator}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Funding Goal:</p>
          <p>
            {formatUnits(project.fundingGoal, 18)} CFLIX ({formatUnits(project.totalFunded, 18)} CFLIX raised)
          </p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Active:</p>
          <p>{project.isActive ? "Yes" : "No"}</p>
        </div>
        {/* Calculate and display excess funds */}
        {project.totalFunded > project.fundingGoal && (
          <div className="grid-cols-2 gap-2">
            <p className="font-semibold mb-2">Excess Funds:</p>
            <p>{formatUnits(project.totalFunded - project.fundingGoal, 18)} CFLIX</p>
          </div>
        )}
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Start Time:</p>
          <p>
            {new Date(Number(project.startTime) * 1000).toLocaleString()} ({project.startTime.toString()})
          </p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">End Time:</p>
          <p>
            {new Date(Number(project.endTime) * 1000).toLocaleString()} ({project.endTime.toString()})
          </p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Team Wallet:</p>
          <p className="break-words">{project.teamWallet}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Category:</p>
          <p>{project.category}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Profit Share Percentage:</p>
          <p>{project.profitSharePercentage.toString()} %</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Status:</p>
          <p>{project.status}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Ticket Collection:</p>
          <p className="break-words">{project.ticketCollection}</p>
        </div>
        {project.totalFunded < project.fundingGoal && (
          <span className="ml-2">
            ({formatUnits(project.fundingGoal - project.totalFunded, 18)} CFLIX needed to reach the funding goal)
          </span>
        )}
        {/* Add input for amount */}
        <div className="grid-cols-4 items-center gap-4 mt-4">
          <Label htmlFor={`amount-${project.projectId}`} className="font-semibold mb-2">
            Amount (CFLIX)
          </Label>
          <Input
            id={`amount-${project.projectId}`}
            defaultValue={amount}
            className="col-span-3"
            type="number"
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        {/* Add button to contribute */}
        <div className="flex justify-center mt-auto items-center container flex-col">
          <Button
            className="text-background p-2"
            disabled={project.totalFunded >= project.fundingGoal} // Disable button if funding goal reached
            title={project.totalFunded >= project.fundingGoal ? "Funding goal reached" : "Contribute"} // Add title attribute
            onClick={async () => {
              if (!userAddress || !amount) return;
              try {
                //add flixToken.write.allowance method here
                await flixToken({
                  functionName: "approve",
                  args: [pad?.address, BigInt(Number(amount) * 10 ** 18)],
                });
                const ctxn = await launchPad({
                  functionName: "contribute",
                  args: [BigInt(project.projectId), BigInt(Number(amount) * 10 ** 18)],
                });
                console.log("Contribution successful!");
                setAmount(""); // Clear the input after contribution
              } catch (e) {
                console.error("Error contributing:", e);
              }
            }}
          >
            {project.totalFunded >= project.fundingGoal ? "Funding Goal Reached" : "Contribute"}
            {/* Show amount needed to reach the goal if the goal is not reached */}
          </Button>
        </div>
        {/* Add button to finalize the project */}
        {project.totalFunded >= project.fundingGoal && (
          <div className="flex justify-center mt-auto items-center container flex-col">
            {/* Show ticket price input and Finalize Project button only if the user is the creator */}
            {userAddress === project.creator && (
              <div>
                <div className="grid-cols-4 items-center gap-4 mt-4">
                  <Label htmlFor={`ticketPrice-${project.projectId}`} className="font-semibold mb-2">
                    Ticket Price (ETH)
                  </Label>
                  <Input
                    id={`ticketPrice-${project.projectId}`}
                    defaultValue={ticketPrice}
                    className="col-span-3"
                    type="number"
                    onChange={e => setTicketPrice(e.target.value)}
                  />
                </div>
                <div className="flex justify-center mt-2">
                  <Button
                    className="text-background p-2"
                    onClick={async () => {
                      if (!userAddress || !ticketPrice) return; // Check if ticketPrice is provided
                      try {
                        await launchPad({
                          functionName: "finalizeProject",
                          args: [BigInt(project.projectId), BigInt(Number(ticketPrice) * 10 ** 18)], // Pass ticketPrice in wei
                        });
                        console.log("Project finalized successfully!");
                      } catch (e) {
                        console.error("Error finalizing project:", e);
                      }
                    }}
                  >
                    Finalize Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
