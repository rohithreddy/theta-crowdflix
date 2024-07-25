"use client";

import React from "react";
import { formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type TicketProps = {
  ticket: {
    ticketContract: string;
    projectId: bigint;
    price: bigint;
    category: string;
    title: string;
    ticketsSold: bigint;
    index: number;
  };
};

const TicketCard = ({ ticket }: TicketProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync: ticketManagerW } = useScaffoldWriteContract("TicketManager");

  return (
    <Card className="p-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>{ticket.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 mt-2 flex-grow">
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Ticket Contract:</p>
          <p className="break-words">{ticket.ticketContract}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Project ID:</p>
          <p>{ticket.projectId.toString()}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Price:</p>
          <p>{formatUnits(ticket.price, 18)} ETH</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Category:</p>
          <p>{ticket.category}</p>
        </div>
        <div className="grid-cols-2 gap-2">
          <p className="font-semibold mb-2">Tickets Sold:</p>
          <p>{ticket.ticketsSold.toString()}</p>
        </div>
        {/* Add Buy Button */}
        <div className="flex justify-center mt-auto">
          <Button
            className="text-background p-2"
            onClick={async () => {
              if (!userAddress) return;
              try {
                await ticketManagerW({
                  functionName: "buyTicket",
                  args: [ticket.projectId],
                  value: parseEther(formatUnits(ticket.price, 18)), // Pass the price in ETH
                });
                notification.success("Ticket purchased successfully!");
              } catch (e: any) {
                notification.error("Error purchasing ticket:", e.toString());
              }
            }}
          >
            Buy Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
