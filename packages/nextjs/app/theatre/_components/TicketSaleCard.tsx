"use client";

import React from "react";
import TicketCard from "./TicketCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type Props = object;

const TicketSales = (props: Props) => {
  const { data: tickets, isLoading } = useScaffoldReadContract({
    contractName: "TicketManager",
    functionName: "getCollections",
  });

  return (
    <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-around">
      {isLoading ? (
        <p>Loading tickets...</p>
      ) : (
        tickets?.map((ticket, index) => <TicketCard key={index} ticket={{ ...ticket, index }} />)
      )}
    </div>
  );
};

export default TicketSales;
