import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import TicketSales from "./_components/TicketSaleCard";

export const metadata = getMetadata({
  title: "Flix Theatre",
  description: "Join the Awesomest DAO and build the Future",
});

const Theatre: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Theatre</h1>
        <p className="text-neutral">
          Buy your NFT Tickets to watch the latest execlusive Movies / TV Shows / Documentaries / Music
        </p>
      </div>
      <div className="container">
      <TicketSales />
      </div>
    </>
  );
};

export default Theatre;
