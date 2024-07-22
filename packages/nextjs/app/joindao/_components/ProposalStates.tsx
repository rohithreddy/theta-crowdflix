import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useScaffoldContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

// Define your types
export type Proposal = {
  id: string;
  proposer: string;
  targets: string[];
  values: string[]; // Store values as strings
  signatures: string[];
  calldatas: string[];
  startBlock: bigint; // Store block numbers as bigint
  endBlock: bigint;
  description: string;
  state: number;
};

// Define your ProposalState enum
enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Succeeded = 3,
  Queued = 4,
  Expired = 5,
  Executed = 6,
}

// New component for fetching proposals
const ProposalsFetching = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const { data: governer, isLoading } = useScaffoldContract({
    contractName: "CrowdFlixDaoGovernor",
  });

  // Use useScaffoldEventHistory to get ProposalCreated events
  const proposalCreatedEvents = useScaffoldEventHistory({
    contractName: "CrowdFlixDaoGovernor",
    eventName: "ProposalCreated",
    fromBlock: 0n,
    receiptData: true,
  });
  console.log(proposalCreatedEvents.data);
  console.log(typeof proposalCreatedEvents.data);

  useEffect(() => {
    const fetchProposals = async () => {
      if (proposalCreatedEvents.data) {
        const newProposals = proposalCreatedEvents.data.map(event => {
          // Access event arguments directly
          const proposalId = event.args.proposalId?.toString();
          const proposer = event.args.proposer;
          const targets = event.args.targets?.map(target => target.toString()); // Convert to string[]
          const values = event.args.values.map(value => formatUnits(value, 18));
          const signatures = event.args.signatures;
          const calldatas = event.args.calldatas;
          const startBlock = event.args.voteStart; // Access directly
          const endBlock = event.args.voteEnd; // Access directly
          const description = event.args.description;

          return {
            id: proposalId,
            proposer,
            targets,
            values,
            signatures,
            calldatas,
            startBlock, // Use the correct event argument
            endBlock, // Use the correct event argument
            description,
            state: 0, // Assuming all proposals start in Pending state
          };
        });

        setProposals(newProposals); // Now the types match
      }
    };

    fetchProposals();
  }, [proposalCreatedEvents.data]);

  return (
    <div className="mt-8">
      <h2 className="text-xl">Proposals</h2>
      <ul>
        {proposals.map(proposal => (
          <li key={proposal.id}>
            <p>
              <strong>Proposal ID:</strong> {proposal.id}
            </p>
            <p>
              <strong>Description:</strong> {proposal.description}
            </p>
            <p>
              <strong>State:</strong> {ProposalState[proposal.state]}
            </p>
            <p>
              <strong>Proposer:</strong> {proposal.proposer}
            </p>
            <p>
              <strong>Start Block:</strong> {proposal.startBlock.toString()}
            </p>
            <p>
              <strong>End Block:</strong> {proposal.endBlock.toString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProposalsFetching;
