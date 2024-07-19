import DaoFaucet from "./_components/DaoFaucet";
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
        <h1 className="text-4xl my-0">Crowd Flix Token Faucet </h1>
        <p className="text-neutral">Just for this hackathon !</p>
      </div>
      <div>
        <DaoFaucet />
      </div>
    </>
  );
};

export default FlixStarter;
