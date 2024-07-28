"use client";

import ProjectCard from "./ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const LaunchPadDetails = () => {
  const { data: upcomingLaunchPadProjects, isLoading: upcomingLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getUpcomingProjects",
  });
  const { data: currentLaunchPadProjects, isLoading: currentLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getProjectsInProgress",
  });
  const { data: successLaunchPadProjects, isLoading: successLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getSuccessfulProjects",
  });
  const { data: failedLaunchPadProjects, isLoading: failedLoading } = useScaffoldReadContract({
    contractName: "LaunchPad",
    functionName: "getFailedProjects",
  });

  return (
    <div className="container mx-auto mt-8">
      {/* Cards for project counts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="flex flex-col items-center">
          {" "}
          {/* Add flex and items-center to center content */}
          <CardHeader className="text-center">
            {" "}
            {/* Add text-center to center title */}
            <CardTitle>Upcoming Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {" "}
            {/* Add text-center to center content */}
            {upcomingLoading ? <p>Loading...</p> : <p>{upcomingLaunchPadProjects?.length || 0}</p>}
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center">
          <CardHeader className="text-center">
            <CardTitle>Current Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {currentLoading ? <p>Loading...</p> : <p>{currentLaunchPadProjects?.length || 0}</p>}
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center">
          <CardHeader className="text-center">
            <CardTitle>Successful Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {successLoading ? <p>Loading...</p> : <p>{successLaunchPadProjects?.length || 0}</p>}
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center">
          <CardHeader className="text-center">
            <CardTitle>Failed Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {failedLoading ? <p>Loading...</p> : <p>{failedLaunchPadProjects?.length || 0}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for project details */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="success">Successful</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4 items-center justify-around">
            {upcomingLoading ? (
              <p>Loading projects...</p>
            ) : (
              upcomingLaunchPadProjects?.map((project, index) => (
                <ProjectCard
                  key={project.projectId}
                  project={{ ...project, contributors: project.contributors.map(c => c as `0x${string}`) }}
                  // Pass a prop to disable buttons in ProjectCard
                  status="upcoming"
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4 items-center justify-around">
            {currentLoading ? (
              <p>Loading projects...</p>
            ) : (
              currentLaunchPadProjects?.map((project, index) => (
                <ProjectCard
                  key={project.projectId}
                  project={{ ...project, contributors: project.contributors.map(c => c as `0x${string}`) }}
                  status="current"
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="success">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4 items-center justify-around">
            {successLoading ? (
              <p>Loading projects...</p>
            ) : (
              successLaunchPadProjects?.map((project, index) => (
                <ProjectCard
                  key={project.projectId}
                  project={{ ...project, contributors: project.contributors.map(c => c as `0x${string}`) }}
                  status="success"
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="failed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4 items-center justify-around">
            {failedLoading ? (
              <p>Loading projects...</p>
            ) : (
              failedLaunchPadProjects?.map((project, index) => (
                <ProjectCard
                  key={project.projectId}
                  project={{ ...project, contributors: project.contributors.map(c => c as `0x${string}`) }}
                  status="failed"
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaunchPadDetails;
