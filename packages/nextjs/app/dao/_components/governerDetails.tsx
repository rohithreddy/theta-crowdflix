"use client";

import React, { useEffect, useState } from "react";
import { NumberDisplayToken } from "./utilDisplay";
import { Address } from "~~/components/scaffold-eth";
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
        setVotingDelay(Number(delay));
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
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">DAO Name</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p className="font-bold text-xl">{name}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">Total Proposals</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 font-bold text-xl items-center">
            <NumberDisplayToken value={BigInt(proposalCount)} />
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">Voting Period</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center justify-center">
            <p className="font-bold text-xl text-center">
              {" "}
              {/* Add text-center to the p tag */}
              {votingPeriod / 60 / 60 / 24} days <br />
              {votingPeriod} seconds
            </p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">Quorum Numerator</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p className="font-bold text-xl">{quorumNumerator}</p>
            <p className="text-sm">% votes required for a success</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">Voting Delay</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <p className="font-bold text-xl">{votingDelay} seconds</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="flex items-center justify-center">
            {" "}
            {/* Center the CardHeader */}
            <CardTitle className="text-center">Governor Address</CardTitle> {/* Center the CardTitle */}
          </CardHeader>
          <CardContent className="flex flex-col mt-2 items-center">
            <Address address={governorAddress as `0x${string}`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GovernerDetails;
