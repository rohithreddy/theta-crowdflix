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

  // State to store proposals with fetched votes
  const [proposals, setProposals] = useState<any[]>([]);

  // Fetch proposals and votes when eventHistory is available
  useEffect(() => {
    if (eventHistory && governer) {
      const fetchProposals = async () => {
        const fetchedProposals = await Promise.all(
          eventHistory.map(async event => {
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

            // Fetch votes directly
            const fetchedVotes = await governer.read.proposalVotes([BigInt(event.args.proposalId!)]);
            const votes = {
              againstVotes: formatUnits(fetchedVotes[0], 18),
              forVotes: formatUnits(fetchedVotes[1], 18),
              abstainVotes: formatUnits(fetchedVotes[2], 18),
            };

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
            };
          }),
        );
        setProposals(fetchedProposals);
      };
      fetchProposals();
    }
  }, [eventHistory]);

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
              <TableCell>{new Date(Number(proposal.endBlock) * 1000).toLocaleString()}</TableCell>
              <TableCell>{proposal.votes?.againstVotes}</TableCell>
              <TableCell>{proposal.votes?.forVotes}</TableCell>
              <TableCell>{proposal.votes?.abstainVotes}</TableCell>
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
