import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Join Flix DAO",
  description: "Join the Awesomest DAO and build the Future",
});

const JoinDAO: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Join the Flix DAO</h1>
        <p className="text-neutral">
          You can vote and decide on the media projects / teams you love
          <br /> Build the{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">Future</code>
        </p>
      </div>
    </>
  );
};

export default JoinDAO;
