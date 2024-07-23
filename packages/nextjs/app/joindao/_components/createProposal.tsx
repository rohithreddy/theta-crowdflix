"use client";

import React, { useState } from "react";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Input } from "~~/components/ui/input";
import { Textarea } from "~~/components/ui/textarea";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Label } from "~~/components/ui/label";

const CreateProposal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [teamWallet, setTeamWallet] = useState("");
  const [category, setCategory] = useState("");

  const { data: launchPad, isLoading } = useScaffoldContract({
    contractName: "LaunchPad",
  });

  const { data: governer, isLoading: governerLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  const { address: userAddress } = useAccount();

  const { writeContractAsync: govWriter } = useScaffoldWriteContract("CrowdFlixDaoGovernor");

  const handleSubmit = async () => {
    if (!launchPad || !governer) return;

    const extendedStartTime = BigInt(startTime);
    const extendedEndTime = BigInt(endTime);
    const fundingGoalBigInt = BigInt(fundingGoal);

    const createLaunchPadCampaignCallData = launchPad.interface.encodeFunctionData("createProject", [
      projectName, // _name
      projectDescription, // _description
      fundingGoalBigInt, // _fundingGoal
      extendedStartTime, // _startTime
      extendedEndTime, // _endTime
      teamWallet, // _teamWallet
      userAddress, // _creator
      50, // _profitSharePercentage
      category, // _category
    ]);

    const launchPadAddress = await launchPad.address
    const proposalDescription = `Proposal to launch ${projectName} category ${category} on CrowdFlix`;

    try {
      await govWriter({
        functionName: "propose",
        args: [
          [launchPadAddress], //targets
          [0n], //values
          [createLaunchPadCampaignCallData], //transaction call data
          proposalDescription,
        ],
      });
      console.log(`✅ Proposal created for ${projectName} with transaction hash: ${proposal.hash}`);
      console.log(`Proposal description: ${proposalDescription}`);
      setIsOpen(false);
    } catch (e) {
      console.error("Error creating proposal:", e);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-background p-2">Create a New Proposal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Proposal</DialogTitle>
          <DialogDescription>
            Create a proposal to launch a new project on CrowdFlix.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectName" className="text-right">
              Project Name
            </Label>
            <Input
              id="projectName"
              defaultValue={projectName}
              className="col-span-3"
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectDescription" className="text-right">
              Project Description
            </Label>
            <Textarea
              id="projectDescription"
              defaultValue={projectDescription}
              className="col-span-3"
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fundingGoal" className="text-right">
              Funding Goal (ETH)
            </Label>
            <Input
              id="fundingGoal"
              defaultValue={fundingGoal}
              className="col-span-3"
              type="number"
              onChange={(e) => setFundingGoal(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time (Unix Timestamp)
            </Label>
            <Input
              id="startTime"
              defaultValue={startTime}
              className="col-span-3"
              type="number"
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time (Unix Timestamp)
            </Label>
            <Input
              id="endTime"
              defaultValue={endTime}
              className="col-span-3"
              type="number"
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamWallet" className="text-right">
              Team Wallet Address
            </Label>
            <Input
              id="teamWallet"
              defaultValue={teamWallet}
              className="col-span-3"
              onChange={(e) => setTeamWallet(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              defaultValue={category}
              className="col-span-3"
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="text-background p-2">Submit</Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposal;
