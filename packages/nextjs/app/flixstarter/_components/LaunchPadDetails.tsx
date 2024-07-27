// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx
"use client";

import ProjectCard from "./ProjectCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// /home/crash/code/builds/theta_hack/cflix/packages/nextjs/app/flixstarter/page.tsx

// import ProjectCard from "./_components/ProjectCard";

const LaunchPadDetails = () => {
  const { data: launchPadProjects, isLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getProjectsInProgress",
  });

  console.log("LaunchPad Projects");
  console.log(launchPadProjects);

  return (
    <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-center justify-around">
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        launchPadProjects?.map((project, index) => (
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
