"use client";

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
// Import useEffect from 'react'
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type VideoUploadProps = {
  projectId: bigint;
};

const VideoUpload = ({ projectId }: VideoUploadProps) => {
  const { address: userAddress } = useAccount();
  const { writeContractAsync: launchPad } = useScaffoldWriteContract("LaunchPad");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcodingId, setTranscodingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedResolutions, setSelectedResolutions] = useState<number[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string>("External Elite Edge Node");
  const { data: nftCollection, isLoading: ticketLoading } = useScaffoldReadContract({
    contractName: "TicketManager",
    functionName: "getTicketContractAddress",
    args: [projectId],
  });

  const { data: videoURI, isLoading: videoIdLoading } = useScaffoldReadContract({
    contractName: "TicketManager",
    functionName: "getVideoURL",
    args: [projectId],
  });

  console.log(nftCollection);
  const resolutions = [2160, 1080, 720, 360];
  const workers = ["External Elite Edge Node"]; // ['External Elite Edge Node', 'Internal Worker']; -> Internal worker not usable
  const networks = [
    { name: "Theta Testnet", value: 365 }, // Only Theta Testnet
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0].type.slice(0, 5) === "video") {
      setVideoFile(files[0]);
    }
  };

  const toggleResolution = (resolution: number) => {
    if (selectedResolutions.includes(resolution)) {
      setSelectedResolutions(prev => prev.filter(res => res !== resolution));
    } else {
      setSelectedResolutions(prev => [...prev, resolution]);
    }
  };

  const removeResolution = (resolution: number) => {
    setSelectedResolutions(prev => prev.filter(res => res !== resolution));
  };

  const getSignedURL = async () => {
    try {
      const response = await axios.post(
        "https://api.thetavideoapi.com/upload",
        {},
        {
          headers: {
            "x-tva-sa-id": process.env.NEXT_PUBLIC_THETA_API_KEY,
            "x-tva-sa-secret": process.env.NEXT_PUBLIC_THETA_API_SECRET,
          },
        },
      );
      return response.data.body.uploads[0];
    } catch (error) {
      console.error("Error fetching signed URL:", error);
      setErrorMessage("Error fetching signed URL. Please check your API keys.");
    }
  };

  const uploadVideo = async () => {
    if (videoFile) {
      try {
        setIsLoading(true);
        const uploads = await getSignedURL();
        const signedURL = uploads.presigned_url;
        console.log("signedURL");
        console.log(signedURL);
        if (!signedURL) {
          console.error("Failed to get signed URL.");
          setErrorMessage("Failed to get signed URL.");
          return;
        }

        await axios.put(signedURL, videoFile, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });
        console.log("UPLOAD ID @ uploadVideo");
        console.log(uploads.id);
        transcodeVideo(uploads.id);
      } catch (error) {
        setIsLoading(false);
        console.error("Error uploading the file:", error);
        setErrorMessage("Error uploading the file. Please try again.");
      }
    }
  };

  const createTranscodeData = (id: string | null): any => {
    const baseData = {
      playback_policy: "public",
      resolutions: selectedResolutions,
    };

    if (id) {
      console.log("Transcode via upload id");
      return { ...baseData, source_upload_id: id };
    } else {
      console.error("Transcode via external URL is not supported in this version.");
      return null;
    }
  };

  const getDrmRules = (): any[] => {
    if (nftCollection && ethers.isAddress(nftCollection)) {
      return [
        {
          chain_id: 365, // Theta Testnet
          nft_collection: nftCollection,
        },
      ];
    }
    return [];
  };

  const transcodeVideo = async (id: string | null) => {
    if (!id) {
      setErrorMessage("Transcoding via external URL is not supported in this version.");
      return;
    }

    const data = createTranscodeData(id);

    if (!data) {
      return;
    }

    const drmRules = getDrmRules();
    data.use_drm = drmRules.length > 0;
    if (data.use_drm) data.drm_rules = drmRules;

    try {
      const response = await axios.post("https://api.thetavideoapi.com/video", JSON.stringify(data), {
        headers: {
          "x-tva-sa-id": process.env.NEXT_PUBLIC_THETA_API_KEY,
          "x-tva-sa-secret": process.env.NEXT_PUBLIC_THETA_API_SECRET,
          "Content-Type": "application/json",
        },
      });

      console.log(response.data.body);
      const videoId = response.data.body.videos[0].id;
      setTranscodingId(response.data.body.videos[0].id);
      //call the setVideoURI here
      if (userAddress && videoId) {
        try {
          await launchPad({
            functionName: "setVideoURL",
            args: [projectId, videoId],
          });
          console.log("Video URL set successfully!");
        } catch (error) {
          console.error("Error setting video URL:", error);
        }
      }
      setIsLoading(false);
      setErrorMessage("");
    } catch (error) {
      setTranscodingId("");
      setErrorMessage("Error starting Video transcoding. Please check your API keys.");
      console.error("Error fetching transcoding Video:", error);
    }
  };

  const handleSaveVideo = () => {
    setErrorMessage("");
    if (selectedResolutions.length === 0) {
      setErrorMessage("Select Resolution for video Transcoding");
      return;
    }
    if (videoFile) {
      uploadVideo();
    } else {
      setErrorMessage("No video file provided!");
    }
  };

  if (transcodingId !== "") {
    return (
      <Transcoding
        apiKey={process.env.NEXT_PUBLIC_THETA_API_KEY!}
        apiSecret={process.env.NEXT_PUBLIC_THETA_API_SECRET!}
        id={transcodingId}
      />
    );
  }

  if (ticketLoading || videoIdLoading) {
    return <p>Loading...</p>;
  }

  if (!nftCollection) {
    return <p>Error: Could not retrieve ticket collection address.</p>;
  }

  // Show video upload form if videoId is empty
  if (!videoURI) {
    return (
      <div className="flex flex-col justify-center mt-2">
        <Input type="file" accept="video/*" onChange={handleFileChange} />
        {/*Select Resolutions and Worker*/}
        <div className="flex flex-col justify-center mt-2">
          <div className="flex flex-row justify-between">
            <label>Select Resolutions:</label>
            <div className="flex flex-row">
              {resolutions.map(resolution => (
                <Button
                  key={resolution}
                  className={`text-background ${selectedResolutions.includes(resolution) ? "bg-orange-500 hover:bg-orange-700" : "bg-gray-300 hover:bg-gray-400"} p-2 ml-2`}
                  onClick={() => toggleResolution(resolution)}
                >
                  {resolution}P
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-row justify-between mt-2">
            <label>Select a worker:</label>
            <div className="flex flex-row">
              {workers.map(worker => (
                <Button
                  key={worker}
                  className={`text-background ${selectedWorker === worker ? "bg-orange-500 hover:bg-orange-700" : "bg-gray-300 hover:bg-gray-400"} p-2 ml-2`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  {worker}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/*Save button, loading animation and Error messages*/}
        <div className="flex flex-col justify-center mt-2">
          {isLoading ? (
            <>
              <div className="spinner" />
              <p className="mt-2">Video uploading, do not close this browser tab!</p>
            </>
          ) : (
            <Button className="text-background bg-orange-500 hover:bg-orange-700 p-2 mt-2" onClick={handleSaveVideo}>
              Upload Video and Enable NFT DRM
            </Button>
          )}
          <p className="mt-2 text-red-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Show current video ID if it's not empty
  return (
    <div className="flex flex-col justify-center mt-2">
      <p>Current Video ID: {videoURI}</p>
    </div>
  );
};

interface TranscodingProps {
  apiKey: string;
  apiSecret: string;
  id: string;
}

const Transcoding = ({ apiKey, apiSecret, id }: TranscodingProps) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const fetchVideoProgress = async () => {
    const options = {
      method: "GET",
      url: `https://api.thetavideoapi.com/video/${id}`,
      headers: {
        "x-tva-sa-id": apiKey,
        "x-tva-sa-secret": apiSecret,
      },
    };

    try {
      const response = await axios(options);
      const videoData = response.data.body.videos[0];
      if (videoData) {
        setProgress(videoData.progress);

        if (videoData.progress === 100 && videoData.playback_uri) {
          console.log("Transcoding @ playback URI ");
          console.log("videoData.playback_uri");
          console.log(videoData.playback_uri);
          setPlaybackUri(videoData.playback_uri);
          if (intervalId) clearInterval(intervalId);
        }
      }
    } catch (error) {
      console.error("Error fetching video progress:", error);
    }
  };

  useEffect(() => {
    // Use useEffect instead of React.useEffect
    const interval = setInterval(() => {
      fetchVideoProgress();
    }, 2000);

    setIntervalId(interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center mt-2">
      <h2 className="text-2xl mb-4">{id}</h2>
      {playbackUri ? (
        <>
          <span>Watch Here:</span>
          <a className="text-blue-500" href={playbackUri} target="_blank" rel="noopener noreferrer">
            {playbackUri}
          </a>
          <iframe src={`https://player.thetavideoapi.com/video/${id}`} className="mt-4" allowFullScreen />
        </>
      ) : (
        <p className="mt-2">Encoding video: {progress ? `${progress.toFixed(2)}%` : "Starting..."}</p>
      )}
    </div>
  );
};

export default VideoUpload;
