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
import { useScaffoldContract, useScaffoldWriteContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Input } from "~~/components/ui/input";
import { Textarea } from "~~/components/ui/textarea";
import { useAccount } from "wagmi";
import { formatUnits, encodeFunctionData } from "viem";
import { Label } from "~~/components/ui/label";
import DTPicker from "~~/components/ui/dt-picker"; // Import the DateTimePicker component

const CreateProposal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null); // Store startTime as Date
  const [endTime, setEndTime] = useState<Date | null>(null); // Store endTime as Date
  const [teamWallet, setTeamWallet] = useState("");
  const [category, setCategory] = useState("");
  const [profitSharePercentage, setProfitSharePercentage] = useState(""); // Add state for profitSharePercentage

  const { data: launchPadInfo } = useDeployedContractInfo("LaunchPad");
  const { data: governer, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  const { address: userAddress } = useAccount();

  const { writeContractAsync: govWriter } = useScaffoldWriteContract("CrowdFlixDaoGovernor");

  const handleSubmit = async () => {
    if (!launchPadInfo || !governer || !userAddress) return;

    // Convert startTime and endTime to Unix timestamps
    const extendedStartTime = startTime ? Math.floor(startTime.getTime() / 1000) : 0;
    const extendedEndTime = endTime ? Math.floor(endTime.getTime() / 1000) : 0;
    const fundingGoalBigInt = BigInt(fundingGoal);
    const profitSharePercentageBigInt = BigInt(profitSharePercentage); // Convert profitSharePercentage to BigInt

    const createLaunchPadCampaignCallData = encodeFunctionData({
      abi: launchPadInfo.abi,
      functionName: "createProject",
      args: [
        projectName, // _name
        projectDescription, // _description
        fundingGoalBigInt, // _fundingGoal
        BigInt(extendedStartTime), // _startTime
        BigInt(extendedEndTime), // _endTime
        teamWallet as `0x${string}`, // _teamWallet - Ensure it's a valid address
        userAddress, // _creator - Ensure it's a valid address
        profitSharePercentageBigInt, // _profitSharePercentage
        category, // _category
      ],
    });

    const launchPadAddress = launchPadInfo.address;
    const proposalDescription = `Proposal to launch ${projectName} category ${category} on CrowdFlix`;

    try {
      const proposal_txn = await govWriter({
        functionName: "propose",
        args: [
          [launchPadAddress], //targets
          [0n], //values
          [createLaunchPadCampaignCallData], //transaction call data
          proposalDescription,
        ],
      });
      console.log(`✅ Proposal created for ${projectName} with transaction hash: ${proposal_txn}`);
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
      <DialogContent className="sm:max-w-[600px]"> {/* Increased max-width */}
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
          <div >
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <DTPicker
              onDateChange={(date) => setStartTime(date)}
              onTimeChange={(time) => setStartTime(time)}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
            />
          </div>
          <div >
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <DTPicker
              onDateChange={(date) => setEndTime(date)}
              onTimeChange={(time) => setEndTime(time)}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profitSharePercentage" className="text-right">
              Profit Share Percentage
            </Label>
            <Input
              id="profitSharePercentage"
              defaultValue={profitSharePercentage}
              className="col-span-3"
              type="number"
              onChange={(e) => setProfitSharePercentage(e.target.value)}
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
