"use client";

import React, { useState } from "react";
import { encodeFunctionData, formatUnits } from "viem";
import { useAccount } from "wagmi";
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
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~~/components/ui/select";
import { Textarea } from "~~/components/ui/textarea";
import { useDeployedContractInfo, useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const CreateProposal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [startTime, setStartTime] = useState(""); // Store startTime as Date
  const [endTime, setEndTime] = useState(""); // Store endTime as Date
  const [teamWallet, setTeamWallet] = useState("");
  const [category, setCategory] = useState("movie"); // Default category to "movie"
  const [profitSharePercentage, setProfitSharePercentage] = useState(""); // Add state for profitSharePercentage
  const [teaserURI, setTeaserURI] = useState(""); // Add state for teaserURI

  const { data: launchPadInfo } = useDeployedContractInfo("LaunchPad");
  const { data: governer, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  const { address: userAddress } = useAccount();

  const { writeContractAsync: govWriter } = useScaffoldWriteContract("CrowdFlixDaoGovernor");

  const handleSubmit = async () => {
    if (!launchPadInfo || !governer || !userAddress) return;

    // Convert startTime and endTime to Unix timestamps
    const extendedStartTime = startTime ? Math.floor(Date.parse(startTime) / 1000) : 0;
    const extendedEndTime = endTime ? Math.floor(Date.parse(endTime) / 1000) : 0;
    const fundingGoalBigInt = BigInt(Number(fundingGoal) * 10 ** 18);
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
        teaserURI, // _teaserURI
      ],
    });

    const launchPadAddress = launchPadInfo.address;
    const proposalDescription = `Proposal to launch ${projectName} category ${category} on CrowdFlix`;

    try {
      const txhash = await govWriter({
        functionName: "propose",
        args: [
          [launchPadAddress], //targets
          [0n], //values
          [createLaunchPadCampaignCallData], //transaction call data
          proposalDescription,
        ],
      });
      notification.success(`✅ Proposal created for ${projectName} with transaction hash: ${txhash}`);
      setIsOpen(false);
    } catch (e: any) {
      notification.error("Error creating proposal:", e.toString());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-background p-2">Apply for a new FlixStarter Campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        {" "}
        {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>Create a New Proposal</DialogTitle>
          <DialogDescription>Create a proposal to launch a new project on CrowdFlix.</DialogDescription>
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
              onChange={e => setProjectName(e.target.value)}
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
              onChange={e => setProjectDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fundingGoal" className="text-right">
              Funding Goal (CFLIX tokens)
            </Label>
            <Input
              id="fundingGoal"
              defaultValue={fundingGoal}
              className="col-span-3"
              type="number"
              onChange={e => setFundingGoal(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              className="col-span-3"
              value={startTime} // Format date for input
              onChange={e => setStartTime(e.target.value)} // Convert input to Date
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              className="col-span-3"
              value={endTime} // Format date for input
              onChange={e => setEndTime(e.target.value)} // Convert input to Date
            />
          </div>
          {/* <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-col gap-2">
          <Label>Start Time</Label>
          <Input type="datetime-local" className="w-max py-6" />
          </div>
          <div className="flex flex-col gap-2">
          <Label>End Time</Label>
          <Input type="datetime-local" className="w-max py-6" />
          </div>
          </div> */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamWallet" className="text-right">
              Team Wallet Address
            </Label>
            <Input
              id="teamWallet"
              defaultValue={teamWallet}
              className="col-span-3"
              onChange={e => setTeamWallet(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <Select value={category} onValueChange={value => setCategory(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="shortfilm">Short Film</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
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
              onChange={e => setProfitSharePercentage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teaserURI" className="text-right">
              Teaser Link
            </Label>
            <Input
              id="teaserURI"
              defaultValue={teaserURI}
              className="col-span-3"
              onChange={e => setTeaserURI(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="text-background p-2">
            Submit
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposal;
