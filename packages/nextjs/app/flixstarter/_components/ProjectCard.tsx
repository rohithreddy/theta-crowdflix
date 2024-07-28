"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
// Import Badge component
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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
    ticketCollection: string;
    projectId: bigint;
    daoProposalId: bigint;
    teaserURI: string;
    isFinalized: boolean;
    teamKycVerified: boolean;
  };
  status: string; // Use status prop instead of disableButtons
};

const ProjectCard = ({ project, status }: ProjectProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync: launchPad } = useScaffoldWriteContract("LaunchPad");
  const { writeContractAsync: flixToken } = useScaffoldWriteContract("CrowdFlixToken");
  const { data: pad } = useDeployedContractInfo("LaunchPad");
  const [amount, setAmount] = useState("");
  const [ticketPrice, setTicketPrice] = useState(""); // State for ticket price

  return (
    <Card className="p-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          {project.projectId.toString()} : {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 mt-2 flex-grow">
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Description:</p>
          <p>{project.description}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Creator:</p>
          <p className="break-words">
            <Address address={project.creator as `0x${string}`} disableAddressLink format="short" />
          </p>
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
          <p className="break-words">
            <Address address={project.teamWallet as `0x${string}`} disableAddressLink format="short" />
          </p>
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
          <p className="font-semibold mb-2">Team KYC Verified:</p>
          <p>{project.teamKycVerified ? "Yes" : "No"}</p>
          {/* <p>{getStatusText(project.status)}</p> Display status text */}
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Teaser</p>
          <p>{project.teaserURI}</p>
        </div>
        {/* <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Ticket Collection:</p>
          <p className="break-words">{project.ticketCollection}</p>
        </div> */}

        {/* Show buttons based on status */}
        {status === "current" && (
          <div className="items-center gap-4 mt-4">
            <Label htmlFor={`amount-${project.projectId}`} className="font-semibold mb-2">
              Amount (CFLIX)
            </Label>

            <div className="flex flex-row">
              <Input
                id={`amount-${project.projectId}`}
                defaultValue={amount}
                className="flex-grow mr-4"
                type="number"
                onChange={e => setAmount(e.target.value)}
              />
              <Button
                className="text-background bg-orange-500 hover:bg-orange-700 p-2 ml-auto font-bold"
                disabled={project.totalFunded >= project.fundingGoal} // Disable button if funding goal reached
                title={project.totalFunded >= project.fundingGoal ? "Funding goal reached" : "Crowd Fund the Project"} // Add title attribute
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
                {project.totalFunded >= project.fundingGoal ? "Funding Goal Reached" : "Crowd Fund the Project"}
                {/* Show amount needed to reach the goal if the goal is not reached */}
              </Button>
            </div>
          </div>
        )}

        {status === "success" && userAddress === project.creator && !project.isFinalized && (
          <div className="items-center gap-4 mt-4">
            <Label htmlFor={`ticketPrice-${project.projectId}`} className="font-semibold mb-2">
              Ticket Price (TFUEL)
            </Label>

            <div className="flex flex-row">
              <Input
                id={`ticketPrice-${project.projectId}`}
                defaultValue={ticketPrice}
                className="flex-grow mr-4"
                type="number"
                onChange={e => setTicketPrice(e.target.value)}
              />
              <Button
                className="text-background bg-orange-500 hover:bg-orange-700 p-2 ml-auto font-bold"
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

        {status === "failed" && userAddress === project.creator && !project.isFinalized && (
          <div>
            {/* <div className="grid-cols-4 items-center gap-4 mt-4">
              <Label htmlFor={`ticketPrice-${project.projectId}`} className="font-semibold mb-2">
                Ticket Price (TFUEL)
              </Label>
              <Input
                id={`ticketPrice-${project.projectId}`}
                defaultValue={ticketPrice}
                className="col-span-3"
                type="number"
                onChange={e => setTicketPrice(e.target.value)}
              />
            </div> */}
            <div className="flex justify-center mt-2">
              <Button
                className="text-background p-2 bg-orange-500 hover:bg-orange-700"
                onClick={async () => {
                  // if (!userAddress) return; // Check if ticketPrice is provided
                  try {
                    await launchPad({
                      functionName: "refundInvestors",
                      args: [BigInt(project.projectId)], // Pass ticketPrice in wei
                    });
                    console.log("Project finalized successfully!");
                  } catch (e) {
                    console.error("Error finalizing project:", e);
                  }
                }}
              >
                Refund Investors and Finalize Project
              </Button>
            </div>
          </div>
        )}

        {status === "failed" &&
          project.contributors.includes(userAddress as `0x${string}`) &&
          userAddress !== project.creator && (
            <div className="flex justify-center mt-2">
              <Button
                className="text-background p-2 bg-orange-500 hover:bg-orange-700"
                onClick={async () => {
                  // Implement withdraw logic here
                  try {
                    await launchPad({
                      functionName: "withdrawFunds",
                      args: [BigInt(project.projectId)], // Pass ticketPrice in wei
                    });
                    console.log("Project finalized successfully!");
                  } catch (e) {
                    console.error("Error finalizing project:", e);
                  }
                }}
              >
                Withdraw
              </Button>
            </div>
          )}

        {/* Show "Finalized" badge if project is finalized */}
        {project.isFinalized && (
          <div className="flex justify-center mt-2">
            <Badge className="bg-green-500">Finalized</Badge>
          </div>
        )}

        {/* Show "All users refunded" badge if project is finalized and failed */}
        {status === "failed" && project.isFinalized && (
          <div className="flex justify-center mt-2">
            <Badge className="bg-green-500">All Investors have been refunded</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
