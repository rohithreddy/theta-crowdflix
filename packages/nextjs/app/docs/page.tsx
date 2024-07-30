import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Flix Starter",
  description: "A Lauchpad for the Awesomest Media Projects",
});

const FlixStarter: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0 font-semibold">Docs</h1>{" "}
        {/* Added font-semibold */}
        <p className="text-neutral">How to use the Application</p>
      </div>
      <div className="container flex flex-col items-start">{" "}
        {/* Align items to the start (left) */}
        <h2 className="mb-8 font-semibold">Getting Started</h2>{" "}
        {/* Added font-semibold */}{" "}
        {/* Add margin bottom for spacing */}
        <p>
          Before you can start using Flix Starter, you&apos;ll need some CFLIX
          tokens. You can claim these from the Faucet.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">
          1. Claim Tokens from Faucet
        </h3>{" "}
        {/* Added font-semibold */}{" "}
        {/* Add margin top and bottom for spacing */}
        <p>
          Visit the Faucet page to claim your initial CFLIX tokens. This will
          allow you to interact with the platform and participate in proposals.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">2. Create a New Proposal</h3>{" "}
        {/* Added font-semibold */}
        <p>
          Navigate to the DAO page to create a new proposal. This is where you&apos;ll
          outline your media project, including its goals, budget, and team.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">
          3. Proposal Voting and Crowdfunding
        </h3>{" "}
        {/* Added font-semibold */}
        <p>
          Once your proposal is submitted, it will be open for voting. If it
          receives enough votes, it will move to the crowdfunding stage on Flix
          Starter.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">4. Crowdfunding Campaign</h3>{" "}
        {/* Added font-semibold */}
        <p>
          The crowdfunding campaign takes place on the Flix Starter page. Here,
          users can contribute CFLIX tokens to support your project.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">
          5. Project Success and Finalization
        </h3>{" "}
        {/* Added font-semibold */}
        <p>
          If your crowdfunding campaign is successful, you&apos;ll be able to
          finalize your project. This involves uploading your video, setting
          ticket prices, and transferring the raised funds to your team wallet.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">
          6. Ticket Sales and Revenue Distribution
        </h3>{" "}
        {/* Added font-semibold */}
        <p>
          Viewers can purchase tickets to watch your video on the Theater page.
          The funds from ticket sales are distributed to your team wallet and
          contributors based on their contributions.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">
          7. Investor and Team Withdrawals
        </h3>{" "}
        {/* Added font-semibold */}
        <p>
          Investors and team members can withdraw their funds from the vault on
          the Invdash page, based on the ticket sales revenue.
        </p>

        <h3 className="mt-12 mb-4 font-semibold">8. Automating the DAO</h3>{" "}
        {/* Added font-semibold */}
        <p>
          The proposal process can be easily extended to automate the entire DAO,
          streamlining project creation, funding, and distribution.
        </p>
      </div>
    </>
  );
};

export default FlixStarter;
