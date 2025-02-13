import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import LaunchPadDetails from "./_components/LaunchPadDetails";

export const metadata = getMetadata({
  title: "Flix Starter",
  description: "A Lauchpad for the Awesomest Media Projects",
});

const FlixStarter: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Flix Starter</h1>
        <p className="text-neutral">KickStart your Favorite Media Projects</p>
      </div>
      {/* Import and use the new LaunchPadDetails component */}
      <LaunchPadDetails />
    </>
  );
};

export default FlixStarter;
