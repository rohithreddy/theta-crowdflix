import TokenDetails from "./_components/TokenDetails";
import GovernerDetails from "./_components/governerDetails";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Join Flix DAO",
  description: "Join the Awesomest DAO and build the Future",
});

const JoinDAO: NextPage = async () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Crowd Flix DAO</h1>
        <p className="text-neutral">
          DAO Members(CFLIX Token Holders) can vote and decide
          <br />
          on the media projects they want to turn into reality.
          <br />
          Approved projects can raise Funds via Crowd Funding in Flix Starter
          <br /> Be Part of the{" "}
          <code className="italic bg-base-300 text-blue-700 font-bold [word-spacing:-0.5rem] px-1">Future</code>
        </p>
      </div>
      <div>
        <TokenDetails />
      </div>
      <div>
        <GovernerDetails />
      </div>
    </>
  );
};

export default JoinDAO;
