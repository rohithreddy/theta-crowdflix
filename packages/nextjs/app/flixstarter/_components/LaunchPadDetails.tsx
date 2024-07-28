"use client";

import ProjectCard from "./ProjectCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const LaunchPadDetails = () => {
  const { data: upcomingLaunchPadProjects, isLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getUpcomingProjects",
  });

  console.log("LaunchPad Projects");
  console.log(upcomingLaunchPadProjects);

  return (
    <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-center justify-around">
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        upcomingLaunchPadProjects?.map((project, index) => (
          <ProjectCard
            key={project.projectId}
            project={{ ...project, contributors: project.contributors.map(c => c as `0x${string}`) }}
          />
        ))
      )}
    </div>
  );
};

export default LaunchPadDetails;
