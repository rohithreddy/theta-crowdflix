"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Address } from "viem";
import { Button } from "~~/@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~~/@/components/ui/table";
import { useScaffoldContract, useScaffoldEventHistory, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Define your types
export type newProposal = {
  id: string;
  contractAddress: Address;
  proposer: string;
  targets: string[];
  values: string[]; // Changed to string[]
  signatures: string[];
  calldatas: string[];
  startBlock: string; // Changed to string
  endBlock: string; // Changed to string
  description: string;
  state: number;
  votes: { againstVotes: string; forVotes: string; abstainVotes: string };
};

// New component for fetching proposals
const ProposalsFetching = () => {
  const { data: governer, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  // Use useScaffoldEventHistory to get ProposalCreated events
  const { data: eventHistory, isLoading: eventHistoryLoading } = useScaffoldEventHistory({
    contractName: "CrowdFlixDaoGovernor",
    eventName: "ProposalCreated",
    fromBlock: 0n,
    receiptData: true,
  });

  // Access the writeContractAsync function from the hook
  const { writeContractAsync: castVote } = useScaffoldWriteContract("CrowdFlixDaoGovernor");

  // Process event history directly
  const proposals =
    eventHistory?.map(event => {
      // Access event arguments directly
      const proposalId = event.args.proposalId?.toString();
      const proposer = event.args.proposer;
      const targets = event.args.targets?.map((target: { toString: () => any }) => target.toString()); // Convert to string[]
      const values = event.args.values.map((value: bigint) => formatUnits(value, 18)); // Convert to string[]
      const signatures = event.args.signatures;
      const calldatas = event.args.calldatas;
      const startBlock = event.args.voteStart?.toString(); // Convert to string
      const endBlock = event.args.voteEnd?.toString(); // Convert to string
      const description = event.args.description;

      // Fetch vote counts for the proposal
      // Initialize votes with placeholder values
      const votes = { againstVotes: "0", forVotes: "0", abstainVotes: "0" };

      return {
        id: proposalId,
        contractAddress: governer?.address as Address, // Assuming governer is available
        proposer,
        targets,
        values,
        signatures,
        calldatas,
        startBlock,
        endBlock,
        description,
        state: 0, // Assuming all proposals start in Pending state
        votes,
        // votes: { againstVotes: "0", forVotes: "0", abstainVotes: "0" }, // Initialize votes
      };
    }) || []; // Default to an empty array if eventHistory is not available

  // Fetch vote counts for all proposals
  const [voteCounts, setVoteCounts] = useState<{
    [key: string]: { againstVotes: string; forVotes: string; abstainVotes: string };
  }>({});
  useEffect(() => {
    // Only fetch votes if governer is available and proposals have changed
    if (governer && proposals.length > 0) {
      const fetchVotesPromises = proposals.map(proposal =>
        governer.read.proposalVotes([BigInt(proposal.id!)]).then(fetchedVotes => ({
          [proposal.id!]: {
            againstVotes: formatUnits(fetchedVotes[0], 18),
            forVotes: formatUnits(fetchedVotes[1], 18),
            abstainVotes: formatUnits(fetchedVotes[2], 18),
          },
        })),
      );

      Promise.all(fetchVotesPromises).then(results => {
        const combinedVoteCounts = results.reduce((acc, result) => ({ ...acc, ...result }), {});
        setVoteCounts(combinedVoteCounts);
      });
    }
  }, [proposals]); // Only re-run when governer or proposals change

  // Render the component
  return (
    <div className="mt-8 items-center flex flex-col">
      <h2 className="text-2xl font-bold">Proposals</h2>
      <Table>
        <TableCaption className="text-xl">Details of Proposals</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Proposer</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Against Votes</TableHead>
            <TableHead>For Votes</TableHead>
            <TableHead>Abstain Votes</TableHead>
            <TableHead>Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map(proposal => (
            <TableRow key={proposal.id}>
              <TableCell>
                {proposal.id?.substring(0, 4) + "..." + proposal.id?.substring(proposal.id.length - 4)}
              </TableCell>
              <TableCell>{proposal.description}</TableCell>
              <TableCell>{proposal.proposer}</TableCell>
              <TableCell>{new Date(Number(proposal.startBlock) * 1000).toLocaleString()}</TableCell>
              {/* <TableCell>{proposal.startBlock}</TableCell> */}
              <TableCell>{new Date(Number(proposal.endBlock) * 1000).toLocaleString()}</TableCell>
              {/* <TableCell>{proposal.endBlock}</TableCell> */}
              <TableCell>{voteCounts[proposal.id!]?.againstVotes || "0"}</TableCell>
              <TableCell>{voteCounts[proposal.id!]?.forVotes || "0"}</TableCell>
              <TableCell>{voteCounts[proposal.id!]?.abstainVotes || "0"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    className="text-green-500 p-2"
                    onClick={async () => {
                      try {
                        // Call the castVote function with the proposalId and vote (1 for yes, 0 for no)
                        await castVote({
                          functionName: "castVote",
                          args: [BigInt(proposal.id!), 1], // Assuming you want to vote "yes"
                        });
                        console.log("Vote cast successfully!");
                      } catch (e) {
                        console.error("Error casting vote:", e);
                      }
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    className="text-yellow-500 p-2"
                    onClick={async () => {
                      try {
                        // Call the castVote function with the proposalId and vote (1 for yes, 0 for no)
                        await castVote({
                          functionName: "castVote",
                          args: [BigInt(proposal.id!), 2], // Assuming you want to vote "yes"
                        });
                        console.log("Vote cast successfully!");
                      } catch (e) {
                        console.error("Error casting vote:", e);
                      }
                    }}
                  >
                    Abstain
                  </Button>
                  <Button
                    className="text-red-500 p-2"
                    onClick={async () => {
                      try {
                        // Call the castVote function with the proposalId and vote (1 for yes, 0 for no)
                        await castVote({
                          functionName: "castVote",
                          args: [BigInt(proposal.id!), 0], // Assuming you want to vote "yes"
                        });
                        console.log("Vote cast successfully!");
                      } catch (e) {
                        console.error("Error casting vote:", e);
                      }
                    }}
                  >
                    No
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalsFetching;
