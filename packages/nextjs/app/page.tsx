"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Crowd Flix</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Imagine a Decentralized Future where ...{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              Netflix is Owned and Operated BY PEOPLE
            </code>
          </p>
          <p className="text-center text-lg">
            And also{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              Profits are Shared
            </code>{" "}
            by{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              People
            </code>
          </p>
          <p className="text-center text-lg">We are in Beta for now. Use at your own risk.</p>
          <p className="text-center text-lg">
            Also we are stuck between Choosing the name{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              Crowd Flix
            </code>
            or{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              the FLIX
            </code>
          </p>
          <p className="text-center text-lg">
            Powered by{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              <a href="https://www.thetaedgecloud.com/">Theta Edge Cloud </a>
              <span> & </span>
              <a href="https://www.thetaedgecloud.com/">Theta Block Chain</a>
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
