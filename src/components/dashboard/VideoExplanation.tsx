"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Download,
  Pause,
  Loader2,
  Video,
  Info,
  ChevronRight,
  Cog,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import AuthApiClient from "@/lib/auth-api-client";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";
import { BuyCredit } from "@/components/landing/BuyCredit";
import { isFeatureEnabled, getMaintenanceMessage } from "@/lib/feature-flags";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

interface VideoExplanationProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  currentPdfId: string | null;
  onGenerateVideo: (voiceId: string) => Promise<string | null>;
  isGenerating: boolean;
}

const voiceOptions = {
  female: [
    {
      id: "en-US-JennyNeural",
      name: "Jenny",
      description: "US English",
      sampleAudio: "/audio/sample6.mp3",
      text: "Hi, I'm Jenny. Let me help you explore your documents with PILOX Chat's intelligent features.",
    },
    {
      id: "en-GB-SoniaNeural",
      name: "Sonia",
      description: "British English",
      sampleAudio: "/audio/sample7.mp3",
      text: "Hello, Sonia here. Welcome to PILOX Chat, your smart document analysis companion.",
    },
    {
      id: "en-AU-NatashaNeural",
      name: "Natasha",
      description: "Australian English",
      sampleAudio: "/audio/sample8.mp3",
      text: "G'day, I'm Natasha. Ready to make your document analysis easier with PILOX Chat?",
    },
    {
      id: "en-IN-NeerjaNeural",
      name: "Neerja",
      description: "Indian English",
      sampleAudio: "/audio/sample9.mp3",
      text: "Hello, this is Neerja. Let's explore your documents together using PILOX Chat's AI features.",
    },
    {
      id: "en-US-AriaNeural",
      name: "Aria",
      description: "US English",
      sampleAudio: "/audio/sample10.mp3",
      text: "Hi, Aria here. Welcome to PILOX Chat, where we transform document analysis with AI.",
    },
  ],
  male: [
    {
      id: "en-NG-AbeoNeural",
      name: "Abeo",
      description: "Nigerian English",
      sampleAudio: "/audio/sample1.mp3",
      text: "Hello, I'm Abeo. Welcome to PILOX Chat. Let me help you analyze your documents with our AI-powered tools.",
    },
    {
      id: "en-US-ChristopherNeural",
      name: "Christopher",
      description: "US English",
      sampleAudio: "/audio/sample2.mp3",
      text: "Hi, Christopher here. I'm your PILOX Chat assistant, ready to help you process your documents efficiently.",
    },
    {
      id: "en-GB-RyanNeural",
      name: "Ryan",
      description: "British English",
      sampleAudio: "/audio/sample3.mp3",
      text: "Hello, this is Ryan. Welcome to PILOX Chat. I'll help you navigate through your documents with ease.",
    },
    {
      id: "en-AU-WilliamNeural",
      name: "William",
      description: "Australian English",
      sampleAudio: "/audio/sample4.mp3",
      text: "G'day, William speaking. Let's explore your documents together using PILOX Chat's smart features.",
    },
    {
      id: "en-CA-LiamNeural",
      name: "Liam",
      description: "Canadian English",
      sampleAudio: "/audio/sample5.mp3",
      text: "Hi there, I'm Liam. Welcome to PILOX Chat, where we make document analysis simple and effective.",
    },
  ],
};

interface VideoPreviewProps {
  pdfId: string;
  generationId: string;
  onError: (error: string) => void;
}

const VideoPreview = ({ pdfId, generationId, onError }: VideoPreviewProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCount = useRef(0);
  const MAX_ATTEMPTS = 60;

  const checkVideoStatus = async () => {
    try {
      const data = await AuthApiClient.get<{
        status: string;
        message: string;
        data: {
          isCompleted: boolean;
          videoUrl: string;
          error: string;
        };
      }>(`${API_ROUTES.VIDEO_STATUS}/${pdfId}`);

      if (data.status === "success") {
        console.log("Video status is success");
        if (data.data.isCompleted && data.data.videoUrl) {
          const videoResponse = await fetch(data.data.videoUrl, {
            headers: {
              Authorization: `Bearer ${auth.getToken()}`,
            },
          });

          if (!videoResponse.ok) throw new Error("Failed to load video");

          const blob = await videoResponse.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setIsChecking(false);
          if (pollRef.current) {
            clearInterval(pollRef.current);
          }
        } else if (data.data.error) {
          throw new Error(data.data.error);
        }
      }

      attemptCount.current++;
      if (attemptCount.current >= MAX_ATTEMPTS) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
        setIsChecking(false);
        onError("Video upload timed out. You can still download the video.");
      }
    } catch (error) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      setIsChecking(false);
      onError(
        error instanceof Error ? error.message : "Failed to check video status"
      );
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.DOWNLOAD_VIDEO}/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );
      if (!response.ok) {
        if (videoUrl) {
          const videoResponse = await fetch(videoUrl);
          if (!videoResponse.ok) throw new Error("Download failed");
          const blob = await videoResponse.blob();
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = `video-${generationId}.mp4`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
          return;
        }
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `video-${generationId}.mp4`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      onError("Failed to download video");
    }
  };

  useEffect(() => {
    pollRef.current = setInterval(checkVideoStatus, 5000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [pdfId]);

  return (
    <div className="space-y-6">
      {isChecking ? (
        <div className="p-8 rounded-lg border bg-accent/50 space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm font-medium">
              Uploading video to cloud storage...
            </p>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            This may take a few minutes. You can download the video while
            waiting.
          </p>
        </div>
      ) : videoUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border overflow-hidden"
        >
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full"
            poster="/video-thumbnail.png"
          />
        </motion.div>
      ) : null}

      {/* Download button - always visible */}
      <Button
        className="w-full gap-2"
        onClick={handleDownload}
        variant="default"
      >
        <Download className="w-4 h-4" />
        Download Video
      </Button>
    </div>
  );
};

export function VideoExplanation({
  isOpen,
  onClose,
  pdfUrl,
  currentPdfId,
  onGenerateVideo,
  isGenerating,
}: VideoExplanationProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [buttonState, setButtonState] = useState<
    "idle" | "reading" | "generating"
  >("idle");
  const [lowBalance, setLowBalance] = useState(false);

  const isVideoEnabled = isFeatureEnabled("VIDEO_GENERATION");
  const maintenanceMessage = getMaintenanceMessage("VIDEO_GENERATION");

  const checkProgress = async (generationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.VIDEO_PROGRESS}/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.data.progress.status === "error") {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        toast.error(
          data.data.progress.error ||
            data.data.progress.details?.error ||
            "Video generation failed"
        );

        setButtonState("idle");
        setProgress(0);
        setCurrentStep("");
        generationIdRef.current = null;
        return;
      }

      setProgress(data.data.progress.percentage || 0);
      setCurrentStep(data.data.progress.currentStep || "Processing...");

      if (data.data.progress.status === "completed") {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setTimeout(() => {
          setGeneratedVideo(`${API_ROUTES.VIDEO_PREVIEW}/${generationId}`);
        }, 2000);
      }
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      toast.error("Error checking video generation progress");

      setButtonState("idle");
      setProgress(0);
      setCurrentStep("");
      generationIdRef.current = null;
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedVoice) {
      toast.error("Please select a voice first");
      return;
    }

    setButtonState("reading");
    const generationId = await onGenerateVideo(selectedVoice);

    if (generationId) {
      generationIdRef.current = generationId;
      setButtonState("generating");
      setProgress(0);
      setCurrentStep("Initializing video generation...");
      progressIntervalRef.current = setInterval(() => {
        checkProgress(generationId);
      }, 2000);
    } else {
      setButtonState("idle");
      setProgress(0);
      setCurrentStep("");
    }
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
    return () => {
      if (audio) {
        audio.onended = null;
      }
    };
  }, []);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handlePlaySample = async () => {
    const voice = [...voiceOptions.female, ...voiceOptions.male].find(
      (v) => v.id === selectedVoice
    );
    if (!voice) {
      console.error("No voice selected");
      return;
    }

    try {
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(voice.sampleAudio);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = (e) => {
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (generationIdRef.current && generatedVideo) {
      const video = document.querySelector("video");
      if (video) {
        video.src = generatedVideo;

        video.addEventListener("loadstart", () => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", generatedVideo);
          xhr.setRequestHeader("Authorization", `Bearer ${auth.getToken()}`);
          xhr.responseType = "blob";
          xhr.onload = () => {
            if (xhr.status === 200) {
              const url = URL.createObjectURL(xhr.response);
              video.src = url;
            }
          };
          xhr.send();
        });
      }
    }
  }, [generatedVideo]);

  const handleVideoError = (error: string) => {
    toast.error(error);
  };

  useEffect(() => {
    if (currentPdfId) {
      setButtonState("idle");
      setProgress(0);
      setCurrentStep("");
      setGeneratedVideo(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      generationIdRef.current = null;
    }
  }, [currentPdfId]);

  // Cleanup on unmount or when modal closes
  useEffect(() => {
    return () => {
      setButtonState("idle");
      setProgress(0);
      setCurrentStep("");
      setGeneratedVideo(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      generationIdRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedVoiceData = [...voiceOptions.female, ...voiceOptions.male].find(
    (v) => v.id === selectedVoice
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-[90vw] max-w-[500px] max-h-[85vh] bg-background rounded-lg shadow-lg flex flex-col z-50"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <h2 className="font-semibold text-base sm:text-lg">
              Generate Video Explanation
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-accent rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            {!isVideoEnabled && maintenanceMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="bg-destructive/5 border-none text-destructive relative overflow-hidden rounded-lg p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10" />

                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 relative">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Cog className="h-4 w-4 sm:h-5 sm:w-5 text-destructive animate-spin-slow" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-0.5">
                        Maintenance in Progress
                      </h3>
                      <p className="text-destructive/80 text-xs sm:text-sm break-words">
                        {maintenanceMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div
              className={
                !isVideoEnabled ? "opacity-50 pointer-events-none" : ""
              }
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Voice</label>
                  <Select
                    onValueChange={handleVoiceSelect}
                    value={selectedVoice}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a voice..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="space-y-2">
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          Female Voices
                        </div>
                        {voiceOptions.female.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name} ({voice.description.split(" ")[0]})
                          </SelectItem>
                        ))}

                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                          Male Voices
                        </div>
                        {voiceOptions.male.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name} ({voice.description.split(" ")[0]})
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {selectedVoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-accent/50 p-3 rounded-lg">
                      <span className="text-sm font-medium">
                        {selectedVoiceData?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlaySample}
                        className="hover:bg-accent"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-primary" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {buttonState === "reading" ? (
                      <Button disabled className="w-full gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reading PDF...
                      </Button>
                    ) : buttonState === "generating" ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Progress value={progress} className="h-1.5" />
                          <div className="text-center text-sm text-muted-foreground">
                            {currentStep} ({progress}%)
                          </div>
                        </div>

                        <div className="bg-accent/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-sm">
                              Video Generation in Progress
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You can safely leave this page. Your video will
                            continue generating and will be available:
                          </p>
                          <ul className="text-sm space-y-2 ml-4">
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-primary" />
                              In the chat page under the download options
                            </li>
                            <li className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-primary" />
                              We'll notify you when it's ready
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={!selectedVoice}
                        className="w-full gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Generate Video
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
