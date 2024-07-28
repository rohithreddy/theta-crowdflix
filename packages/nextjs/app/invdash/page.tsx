import InvestmentDetails from "./_components/InvestmentDetails";
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
        <h1 className="text-4xl my-0">Investment Dashboard</h1>
        <p className="text-neutral">Returns from your investments in Flix Starter Campaigns</p>
      </div>
      <div className="items-center flex container">
        <InvestmentDetails />
      </div>
    </>
  );
};

export default FlixStarter;
