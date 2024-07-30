"use client";

import { useEffect, useState } from "react";
import CreateProposal from "./createProposal";
import { formatUnits } from "viem";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { Address as AddressDisplay } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~~/components/ui/table";
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
  stateText: string;
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
    fromBlock: 27354059n, // 0n if the env is development
    receiptData: true,
  });

  console.log("eventHistory", eventHistory);
  console.log("eventHistoryLoading", eventHistoryLoading);

  // Access the writeContractAsync function from the hook
  const { writeContractAsync: govWriter } = useScaffoldWriteContract("CrowdFlixDaoGovernor"); // Renamed to govWriter
  const { address: connectedAddress } = useAccount();

  // State to store proposals with fetched votes
  const [proposals, setProposals] = useState<any[]>([]);

  // State to store proposal counts for each state
  const [proposalCounts, setProposalCounts] = useState<{ [key: string]: number }>({
    Pending: 0,
    Active: 0,
    Canceled: 0,
    Defeated: 0,
    Succeeded: 0,
    Queued: 0,
    Expired: 0,
    Executed: 0,
  });

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
            let userHasVoted = false;
            if (connectedAddress) {
              userHasVoted = await governer.read.hasVoted([BigInt(event.args.proposalId!), connectedAddress]);
            }

            // Fetch proposal state
            const proposalState = await governer.read.state([BigInt(event.args.proposalId!)]);

            // Map state to user-friendly text
            let stateText = "";
            switch (proposalState) {
              case 0:
                stateText = "Pending";
                break;
              case 1:
                stateText = "Active";
                break;
              case 2:
                stateText = "Canceled";
                break;
              case 3:
                stateText = "Defeated";
                break;
              case 4:
                stateText = "Succeeded";
                break;
              case 5:
                stateText = "Queued";
                break;
              case 6:
                stateText = "Expired";
                break;
              case 7:
                stateText = "Executed";
                break;
              default:
                stateText = proposalState.toString();
            }

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
              state: proposalState,
              stateText, // Set the state
              votes,
              userHasVoted,
            };
          }),
        );
        setProposals(fetchedProposals);

        // Update proposal counts for each state
        const updatedCounts = { ...proposalCounts };
        fetchedProposals.forEach(proposal => {
          updatedCounts[proposal.stateText]++; // Use stateText as the key
        });
        setProposalCounts(updatedCounts);
      };
      fetchProposals();
    }
  }, [eventHistory]);

  // Render the component
  return (
    <div className="mt-8 items-center flex flex-col container">
      <h2 className="text-2xl font-bold p-4">Proposals</h2>
      <div className="ml-auto float-right -mt-20 py-8">
        <CreateProposal />
      </div>

      {/* Display proposal state summary in cards */}
      <div className="flex flex-row gap-4 mt-4 mb-4 flex-wrap">
        {Object.entries(proposalCounts).map(([state, count]) => (
          <Card key={state} className="flex flex-col items-center flex-grow h-full">
            {" "}
            {/* Allow flex-grow and full height */}
            <CardHeader>
              <CardTitle>{state}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {" "}
              {/* Center content */}
              <p>{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Table>
        <TableCaption className="text-xl font-semibold">Details of Proposals</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Proposer</TableHead>
            {/* <TableHead>Start Block</TableHead> */}
            {/* <TableHead>End Block</TableHead> */}
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>For Votes</TableHead>
            <TableHead>Abstain Votes</TableHead>
            <TableHead>Against Votes</TableHead>
            <TableHead>State</TableHead>
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
              <TableCell>
                <AddressDisplay address={proposal.proposer} />
              </TableCell>
              {/* <TableCell>{proposal.startBlock}</TableCell> */}
              {/* <TableCell>{proposal.endBlock}</TableCell> */}
              <TableCell>
                {new Date(Number(proposal.startBlock) * 1000).toLocaleString()} ({proposal.startBlock})
              </TableCell>
              <TableCell>
                {new Date(Number(proposal.endBlock) * 1000).toLocaleString()} ({proposal.endBlock})
              </TableCell>
              <TableCell>{proposal.votes?.forVotes}</TableCell>
              <TableCell>{proposal.votes?.abstainVotes}</TableCell>
              <TableCell>{proposal.votes?.againstVotes}</TableCell>
              <TableCell>{proposal.stateText}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-2 grid-cols-2">
                  {/* First row of buttons */}
                  {proposal.state === 1 && !proposal.userHasVoted && (
                    <div className="flex flex-row gap-2">
                      <Button
                        className="text-green-500 p-2"
                        onClick={async () => {
                          try {
                            // Call the govWriter function with the proposalId and vote (1 for yes, 0 for no)
                            await govWriter({
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
                            // Call the govWriter function with the proposalId and vote (1 for yes, 0 for no)
                            await govWriter({
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
                            // Call the govWriter function with the proposalId and vote (1 for yes, 0 for no)
                            await govWriter({
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
                  )}
                  {/* Second row of buttons */}
                  <div className="flex flex-row gap-2">
                    {(proposal.state === 4 || proposal.state === 5) && (
                      <Button
                        className="text-background p-2"
                        onClick={async () => {
                          try {
                            if (proposal.state === 4) {
                              await govWriter({
                                functionName: "queue",
                                //@ts-ignore next-line
                                args: [BigInt(proposal.id)],
                              });
                              console.log("Proposal queued successfully!");
                            } else if (proposal.state === 5) {
                              await govWriter({
                                functionName: "execute",
                                //@ts-ignore next-line
                                args: [BigInt(proposal.id)],
                              });
                              console.log("Proposal executed successfully!");
                            }
                          } catch (e) {
                            console.error("Error queueing/executing proposal:", e);
                          }
                        }}
                      >
                        {proposal.state === 4 ? "Queue" : "Execute"}
                      </Button>
                    )}
                  </div>
                  {proposal.userHasVoted && <p className="text-center">Your vote is cast</p>}
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
