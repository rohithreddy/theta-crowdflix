"use client";

import React, { useEffect, useState } from "react";
import ProposalsFetching from "./ProposalStates";
import { NumberDisplayToken } from "./utilDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const GovernerDetails = () => {
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [quorumNumerator, setQuorumNumerator] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [votingPeriod, setVotingPeriod] = useState<number>(0);
  const [votingDelay, setVotingDelay] = useState<number>(0);
  const [governorAddress, setGovernorAddress] = useState<string>(""); // Add state for governor address

  const { data: governer, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  useEffect(() => {
    if (!isLoading && governer) {
      // Fetch the total number of proposals
      governer.read.proposalCount().then(count => {
        setProposalCount(Number(count));
      });

      // Fetch quorumNumerator
      governer.read.quorumNumerator().then(numerator => {
        setQuorumNumerator(Number(numerator));
      });

      // Fetch name
      governer.read.name().then(name => {
        setName(name);
      });

      // Fetch votingPeriod
      governer.read.votingPeriod().then(period => {
        setVotingPeriod(Number(period));
      });

      // Fetch votingDelay
      governer.read.votingDelay().then(delay => {
        setVotingDelay(Number(delay) + 10);
      });

      // Fetch governor address
      setGovernorAddress(governer.address); // Set the address
    }
  }, [governer, isLoading]);

  return (
    <div className="flex flex-col container items-center justify-center mt-8">
      <h1 className="text-2xl font-semibold">DAO Governor Details</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>DAO Name</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p>{name}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Total Proposals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <NumberDisplayToken value={BigInt(proposalCount)} />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Voting Period</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p>{votingPeriod} seconds = {votingPeriod / 60 / 60 / 24} days </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Quorum Numerator</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p>{quorumNumerator}</p>
            <p className="text-sm">% votes required for proposal success</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Voting Delay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p>{votingDelay} seconds</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Governor Address</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p>{governorAddress}</p>
          </CardContent>
        </Card>
      </div>
      <ProposalsFetching />
    </div>
  );
};

export default GovernerDetails;
