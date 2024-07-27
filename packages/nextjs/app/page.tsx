"use client";

// import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/ui/card";

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
          <br />
          <p className="text-center text-lg leading-relaxed">
            Imagine a future where you&apos;re not just a viewer, but an{" "}
            <span className="text-primary font-bold">owner</span>. <br />
            <br />A future where platforms like Netflix are powered by the{" "}
            <span className="text-primary font-bold">community</span>, and profits are shared fairly with everyone who
            contributes.
          </p>
          <br />
          <p className="text-center text-lg leading-relaxed">
            Crowd Flix is building that future, a decentralized platform built on the{" "}
            <span className="text-blue-700 font-bold ">
              <a href="https://www.thetaedgecloud.com/" target="_blank" rel="noopener noreferrer">
                Theta Edge Cloud
              </a>
            </span>{" "}
            and{" "}
            <span className="text-blue-700 font-bold">
              <a href="https://thetatoken.org/ " target="_blank" rel="noopener noreferrer">
                Theta Blockchain
              </a>
            </span>
            .
            <br />
            <br />
            We&apos;re still in beta, so use at your own risk, but we&apos;re excited to share this vision with you.
          </p>
          <br />
          <p className="text-center text-lg leading-relaxed">
            We&apos;re also exploring different names, so let us know what you think: Crowd Flix or the FLIX?
          </p>
          <br />
          <p className="text-center text-lg leading-relaxed">
            Join us on this journey to revolutionize entertainment and empower the{" "}
            <span className="text-primary font-bold">community</span>.
          </p>
          <br />
          <br />
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} format="long" disableAddressLink />
          </div>
        </div>

        {/* <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <Card className="max-w-xs">
              <CardHeader>
                <CardTitle>
                  <BugAntIcon className="h-8 w-8 fill-secondary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tinker with your smart contract using the{" "}
                  <Link href="/debug" passHref className="link">
                    Debug Contracts
                  </Link>{" "}
                  tab.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="max-w-xs">
              <CardHeader>
                <CardTitle>
                  <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore your local transactions with the{" "}
                  <Link href="/blockexplorer" passHref className="link">
                    Block Explorer
                  </Link>{" "}
                  tab.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Home;
