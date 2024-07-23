// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx
"use client";

import { useDeployedContractInfo, useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import ProjectCard from "./ProjectCard";
// import ProjectCard from "./_components/ProjectCard";

const LaunchPadDetails = () => {
  const { data: launchPadProjects, isLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getProjectsInProgress",
  });

  return (
    <div className="container mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-center justify-around">
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        launchPadProjects?.map((project, index) => (
          <ProjectCard key={index} project={{ ...project, index }} />
        ))
      )}
    </div>
  );
};

export default LaunchPadDetails;
