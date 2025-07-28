"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Send,
  Bot,
  Loader2,
  Play,
  Link as LinkIcon,
  X,
  ChevronRight,
  PanelLeftClose,
  AlignLeft,
  History,
  Maximize2,
  Minimize2,
  MessageSquare,
  Trash,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { API_ROUTES } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthApiClient from "@/lib/auth-api-client";
import { BuyCredit } from "@/components/landing/BuyCredit";
import { MoreQuestions } from "@/components/dashboard/MoreQuestions";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface AiMessage {
  metadata: {
    title: string;
    sections: {
      title: string;
      timestamp: number;
      duration: number;
    }[];
    keyPoints: string[];
  };
  analysis: {
    summary: string;
    evidence: {
      quote: string;
      timestamp: number;
      context: string;
    }[];
    concepts: {
      term: string;
      explanation: string;
    }[];
  };
}
interface ChatHistoryMessage {
  _id: string;
  question?: string;
  role: "user" | "model";
  data?: AiMessage;
  timestamp: Date;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  timestamps?: {
    text: string;
    time: number;
  }[];
}

interface YoutubeChatHistory {
  _id: string;
  title: string;
  video_id: string;
  messages?: ChatHistoryMessage[];
  createdAt: string;
  lastUpdated: string;
}

interface YoutubeChatHistoryResponse {
  status: "success" | "error";
  message: string;
  error?: string;
  data: {
    chatHistory: YoutubeChatHistory[];
  };
}

interface YoutubeChatHistoryByIdResponse {
  status: "success" | "error";
  message: string;
  error?: string;
  data: {
    chatHistory: YoutubeChatHistory;
    usage: number;
    limit: number;
  };
}

interface YoutubeChatResponse {
  status: "success" | "processing" | "analyzing" | "error" | "limit_reached";
  message: string;
  error?: string;
  data: {
    first_time: boolean;
    chat_history: YoutubeChatHistory[];
    low_balance: boolean;
    usage: number;
    data: AiMessage;
    limit: number;
    chat_id: string;
  };
}

interface YoutubeChatProgress {
  status: "in_progress" | "completed" | "error" | "not_found";
  message: string;
  data: {
    progress: number;
  };
  error?: string;
}

export default function YoutubeChatPage() {
  const user = auth.getUser();
  const [videoUrl, setVideoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatHistory, setChatHistory] = useState<YoutubeChatHistory[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const [videoIdG, setVideoId] = useState<string | null>(null);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [lowBalance, setLowBalance] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChatHistory, setFilteredChatHistory] = useState<
    YoutubeChatHistory[]
  >([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChatHistory(chatHistory);
      return;
    }

    const filtered = chatHistory.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChatHistory(filtered);
  }, [searchQuery, chatHistory]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsLargeScreen(width >= 592);
      if (width >= 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      try {
        const data = await AuthApiClient.get<YoutubeChatHistoryResponse>(
          API_ROUTES.YOUTUBE_CHAT_HISTORY
        );
        if (data.status === "success") {
          setChatHistory(data.data.chatHistory);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    loadChatHistory();
  }, []);

  const handleChatHistoryClick = async (chatId: string) => {
    setIsChatHistoryLoading(true);
    setCurrentChatId(chatId);
    setIsLimitReached(false);
    setLowBalance(false);
    try {
      const data = await AuthApiClient.get<YoutubeChatHistoryByIdResponse>(
        API_ROUTES.YOUTUBE_CHAT_HISTORY_BY_ID + `/${chatId}`
      );
      if (data.status === "success") {
        if (data.data.chatHistory.messages) {
          setCurrentVideo(data.data.chatHistory.video_id);
          const parsedMessages: Message[] = data.data.chatHistory.messages.map(
            (msg: any) => ({
              id: msg._id,
              content:
                msg.role === "model"
                  ? msg.data[0].analysis.summary
                  : msg.question,
              sender: msg.role === "model" ? "ai" : "user",
              timestamp: new Date(msg.timestamp),
              timestamps:
                msg.role === "model"
                  ? msg.data[0].metadata.sections.map((section: any) => ({
                      text: section.title,
                      time: getTimestamp(section.timestamp),
                    }))
                  : undefined,
            })
          );
          setMessages(parsedMessages);
          setQuestionsUsed(data.data.usage);
          setLimit(data.data.limit);
        }
        setIsChatHistoryLoading(false);
        setVideoId(data.data.chatHistory.video_id);
      }
    } catch (error) {
      setIsChatHistoryLoading(false);
    }
  };

  const getTimestamp = (timestamp: string) => {
    return timestamp
      .split(":")
      .reduce((acc: number, time: string) => 60 * acc + parseInt(time), 0);
  };
  const handleAnalyze = async (url: string) => {
    if (!user) {
      toast.info("Please login to analyze a video");
      return;
    }
    const videoId = extractVideoId(url);
    if (url && !url.trim()) {
      toast.info("Please enter a video URL");
      return;
    }
    setIsAnalyzing(true);
    setCurrentVideo(videoId);
    setVideoId(videoId);
    setQuestionsUsed(0);
    setLimit(30);
    setCurrentChatId(null);
    setIsLimitReached(false);
    setLowBalance(false);
    const data = await AuthApiClient.post<YoutubeChatResponse>(
      API_ROUTES.CHAT_WITH_VIDEO,
      { url: url }
    );
    if (data.data.chat_history) {
      setChatHistory(data.data.chat_history);
    }
    if (data.data.chat_id) {
      setCurrentChatId(data.data.chat_id);
    }
    if (
      (data.status === "analyzing" || data.status === "processing") &&
      data.data.first_time === true
    ) {
      const loadingMessage: Message = {
        id: crypto.randomUUID(),
        content: `I'm watching and analyzing the video content. This will take a moment... ${progress}% done`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([loadingMessage]);
      const interval = setInterval(async () => {
        const checkResponse = await AuthApiClient.post<YoutubeChatProgress>(
          API_ROUTES.YOUTUBE_VIDEO_PROGRESS,
          { url: url }
        );
        if (checkResponse.status === "not_found") {
          setProgress(0);
          clearInterval(interval);
          setIsAnalyzing(false);
          toast.error("Video not found");
        } else if (checkResponse.status === "error") {
          setProgress(0);
          clearInterval(interval);
          setIsAnalyzing(false);
          toast.error("Error analyzing video");
        } else if (
          checkResponse.status === "completed" ||
          checkResponse.data.progress === 100
        ) {
          clearInterval(interval);
          setProgress(100);
          setMessages((prev) => [
            {
              ...prev[0],
              content: `I have finished analyzing the video! Hold on while I give you a summary of the video...`,
            },
          ]);
          const chatWithVideo = await AuthApiClient.post<YoutubeChatResponse>(
            API_ROUTES.CHAT_WITH_VIDEO,
            { url: url }
          );
          if (chatWithVideo.data.chat_history) {
            setChatHistory(chatWithVideo.data.chat_history);
          }
          if (chatWithVideo.data.chat_id) {
            setCurrentChatId(chatWithVideo.data.chat_id);
          }
          if (
            chatWithVideo.data.low_balance &&
            chatWithVideo.data.low_balance == true
          ) {
            setLowBalance(true);
            setIsAnalyzing(false);
            return;
          }
          const summaryMessage: Message = {
            id: crypto.randomUUID(),
            content: chatWithVideo.data.data.analysis.summary,
            sender: "ai",
            timestamp: new Date(),
            timestamps: chatWithVideo.data.data.metadata.sections.map(
              (section: any) => ({
                text: section.title,
                time: getTimestamp(section.timestamp),
              })
            ),
          };
          const followUpMessage: Message = {
            id: crypto.randomUUID(),
            content:
              "What specific part would you like to know more about? You can click on any timestamp to jump to that section, or ask me questions about any part of the content.",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages([summaryMessage, followUpMessage]);
          setIsAnalyzing(false);
          setProgress(0);
        } else if (checkResponse.status === "in_progress") {
          setProgress((prevProgress) => {
            let progressValue =
              checkResponse.data.progress === 0
                ? prevProgress + 1
                : checkResponse.data.progress;
            if (progressValue >= 100) {
              progressValue = 100;
            }
            setMessages((prev) => [
              {
                ...prev[0],
                content: `I'm watching and analyzing the video content. This will take a moment... ${progressValue}% done`,
              },
            ]);
            return progressValue;
          });
        }
      }, 1000);
    } else if (data.status === "success" && data.data.first_time === false) {
      const summaryMessage: Message = {
        id: crypto.randomUUID(),
        content: data.data.data.analysis.summary,
        sender: "ai",
        timestamp: new Date(),
        timestamps: data.data.data.metadata.sections.map((section: any) => ({
          text: section.title,
          time: section.timestamp
            .split(":")
            .reduce(
              (acc: number, time: string) => 60 * acc + parseInt(time),
              0
            ),
        })),
      };
      const followUpMessage: Message = {
        id: crypto.randomUUID(),
        content:
          "What specific part would you like to know more about? You can click on any timestamp to jump to that section, or ask me questions about any part of the content.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([summaryMessage, followUpMessage]);
      setIsAnalyzing(false);
    } else if (data.data.low_balance && data.data.low_balance == true) {
      setIsAnalyzing(false);
      setLowBalance(true);
    } else {
      setIsAnalyzing(false);
      toast.error(data.message || "Failed to analyze video");
    }
  };

  const handleSendMessage = async () => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    const userMessageContent = inputMessage;
    try {
      setIsSendingMessage(true);
      setIsLimitReached(false);
      if (!inputMessage.trim()) {
        toast.info("Please enter a question");
        setIsSendingMessage(false);
        return;
      }
      let videoId = videoIdG;
      let url = videoUrl;
      if (currentChatId) {
        url = "https://www.youtube.com/watch?v=" + videoIdG;
      } else {
        if (!videoUrl.trim()) {
          toast.info("Please enter a video URL");
          setIsSendingMessage(false);
          return;
        }
        videoId = extractVideoId(videoUrl);
        if (!videoId) {
          toast.info("Please enter a valid video URL");
          setIsSendingMessage(false);
          return;
        }
        setCurrentVideo(videoId);
        setVideoId(videoId);
      }
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);
      const dataSend = {
        url: url,
        question: userMessageContent,
        chat_id: currentChatId,
      };
      const response = await AuthApiClient.post<YoutubeChatResponse>(
        API_ROUTES.CHAT_WITH_VIDEO,
        dataSend
      );
      if (response.data.chat_history) {
        setChatHistory(response.data.chat_history);
      }
      if (response.data.chat_id) {
        setCurrentChatId(response.data.chat_id);
      }
      if (response.status == "error") {
        toast.error(response.error);
        setIsSendingMessage(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        setInputMessage(userMessageContent);
        setIsTyping(false);
        return;
      }
      if (response.status == "limit_reached") {
        setIsLimitReached(true);
        setIsSendingMessage(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        setInputMessage(userMessageContent);
        setIsTyping(false);
        return;
      }
      if (response.status == "processing" || response.status == "analyzing") {
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        setInputMessage(userMessageContent);
        setIsSendingMessage(false);
        setIsTyping(false);
        await handleAnalyze(url);
        return;
      }
      if (response.data.low_balance && response.data.low_balance == true) {
        setLowBalance(true);
        setIsSendingMessage(false);
        setIsTyping(false);
        return;
      }
      setQuestionsUsed(response.data.usage);
      setLimit(response.data.limit);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: response.data.data.analysis.summary,
        sender: "ai",
        timestamp: new Date(),
        timestamps: response.data.data.metadata.sections.map(
          (section: any) => ({
            text: section.title,
            time: section.timestamp
              .split(":")
              .reduce(
                (acc: number, time: string) => 60 * acc + parseInt(time),
                0
              ),
          })
        ),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
      setIsSendingMessage(false);
    } catch (error) {
      setIsSendingMessage(false);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setInputMessage(userMessageContent);
      setIsTyping(false);
      toast.error("An error occurred while sending message");
      setIsSendingMessage(false);
      setIsTyping(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsDeletingChat(true);
    try {
      const response = await AuthApiClient.delete<{
        status: string;
        message: string;
        data: {
          chat_history: YoutubeChatHistory[];
        };
      }>(API_ROUTES.DELETE_CHAT + `/${chatId}`);
      if (response.status === "success") {
        setChatHistory(response.data.chat_history);
        setCurrentChatId(null);
        setMessages([]);
        setIsDeletingChat(false);
        setIsLimitReached(false);
        setQuestionsUsed(0);
        setLimit(30);
        setCurrentVideo(null);
        setVideoId(null);
        setIsAnalyzing(false);
        setProgress(0);
        setIsSendingMessage(false);
        setIsTyping(false);
      }
      setIsDeletingChat(false);
    } catch (error) {
      toast.error("An error occurred while deleting chat");
      setIsDeletingChat(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="flex h-[calc(100vh-62px)]">
      <AnimatePresence mode="wait">
        {showSidebar ? (
          <>
            {!isLargeScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
              />
            )}

            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className={`${isLargeScreen ? "relative" : "fixed"} w-80 h-full bg-card/50 backdrop-blur-sm border-r z-40 flex flex-col`}
            >
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search chat history..."
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredChatHistory.length > 0 ? (
                  <div className="space-y-2">
                    {filteredChatHistory.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() =>
                          !isChatHistoryLoading &&
                          handleChatHistoryClick(chat._id)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer group ${
                          currentChatId === chat._id
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        } ${isChatHistoryLoading ? "pointer-events-none opacity-50" : ""}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Youtube className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">
                            {chat.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {isChatHistoryLoading && currentChatId === chat._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center text-muted-foreground py-8">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">No Chat History</h3>
                    <p className="text-sm text-muted-foreground">
                      Your chat history with YouTube videos will appear here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="h-10 w-10 fixed left-4 top-4 z-30 bg-primary/10"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full">
        {/* URL Input Section - Fixed at top */}
        <div className="p-2 sm:p-4 bg-gradient-to-b from-background to-background/95 border-b sticky top-0 z-20">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(true)}
                  className="h-10 w-10 bg-accent"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL here..."
                  className="pl-10 w-full"
                />
              </div>
              <Button
                onClick={() => handleAnalyze(videoUrl)}
                disabled={isAnalyzing || !videoUrl.trim()}
                className="flex-shrink-0"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
        </div>

        {lowBalance && <BuyCredit />}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row gap-2 lg:gap-4 lg:p-4">
            {/* Video Player - Collapsible on mobile */}
            {currentVideo && !isVideoCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="lg:w-[450px] w-full h-[200px] lg:h-auto rounded-none lg:rounded-xl overflow-hidden bg-black/95 shadow-lg flex-shrink-0 sticky top-[85px] z-10"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&start=${timestamp}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </motion.div>
            )}

            <div className="flex-1 flex flex-col bg-card/30 backdrop-blur-sm rounded-none lg:rounded-xl lg:border overflow-hidden h-full relative">
              <div className="p-2 border-b flex items-center justify-between sticky top-0 bg-background/95 z-10">
                {currentChatId && !isChatHistoryLoading && (
                  <div className="flex items-center gap-2 px-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {questionsUsed}/{limit} questions used
                    </span>
                    <MoreQuestions
                      chatId={currentChatId}
                      defaultOpen={isLimitReached}
                      setLimit={setLimit}
                      setUsage={setQuestionsUsed}
                    />
                    {currentChatId && (
                      <AlertDialog.Root>
                        <AlertDialog.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            disabled={isDeletingChat}
                          >
                            {isDeletingChat ? (
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            ) : (
                              <Trash2 className="w-5 h-5 text-destructive group-hover:text-destructive transition-colors duration-200" />
                            )}
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
                          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90vw] max-w-[500px] shadow-lg z-[101]">
                            <AlertDialog.Title className="text-lg font-semibold mb-2">
                              Are you sure?
                            </AlertDialog.Title>
                            <AlertDialog.Description className="text-sm text-gray-500 mb-4">
                              This action cannot be undone. This will
                              permanently delete this chat history.
                            </AlertDialog.Description>

                            <div className="flex justify-end gap-4">
                              <AlertDialog.Cancel asChild>
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                  Cancel
                                </button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action asChild>
                                <button
                                  onClick={() =>
                                    handleDeleteChat(currentChatId)
                                  }
                                  disabled={isDeletingChat}
                                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  {isDeletingChat ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                  ) : (
                                    "Delete"
                                  )}
                                </button>
                              </AlertDialog.Action>
                            </div>
                          </AlertDialog.Content>
                        </AlertDialog.Portal>
                      </AlertDialog.Root>
                    )}
                  </div>
                )}
                {isLimitReached && currentChatId && (
                  <MoreQuestions
                    chatId={currentChatId}
                    defaultOpen={true}
                    showChildButton={false}
                    lowQuestions={true}
                    setLimit={setLimit}
                    setUsage={setQuestionsUsed}
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
                  className="h-8"
                >
                  {isVideoCollapsed ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Messages Area */}
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <Youtube className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Video Analysis Yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Paste a YouTube URL above and click Analyze to start
                    exploring the video content
                  </p>
                </div>
              ) : (
                <div
                  className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4 custom-scrollbar pb-[50px]"
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    const isScrolledToBottom =
                      Math.abs(
                        target.scrollHeight -
                          target.clientHeight -
                          target.scrollTop
                      ) < 1;
                    if (isScrolledToBottom) {
                      target.dataset.userScrolled = "false";
                    } else {
                      target.dataset.userScrolled = "true";
                    }
                  }}
                >
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        onAnimationComplete={() => {
                          const container =
                            messagesEndRef.current?.parentElement;
                          if (
                            container &&
                            container.dataset.userScrolled !== "true"
                          ) {
                            messagesEndRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }
                        }}
                      >
                        <div
                          className={`flex items-start gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                        >
                          {message.sender === "ai" && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-primary" />
                            </div>
                          )}

                          <div
                            className={`rounded-lg ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            } p-4 shadow-sm`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>

                            {message.timestamps && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.timestamps.map((ts, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setTimestamp(ts.time)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/50 hover:bg-background/80 transition-colors text-xs font-medium"
                                  >
                                    <Play className="w-3 h-3" />
                                    {ts.text} ({Math.floor(ts.time / 60)}:
                                    {String(ts.time % 60).padStart(2, "0")})
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                          <div className="rounded-lg bg-muted p-4 shadow-sm">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Input Area */}
              <div className="p-2 sm:p-4 border-t bg-background/95 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        isLargeScreen
                          ? "Ask about the video... (Press Enter to send, Shift + Enter for new line)"
                          : "Ask about the video..."
                      }
                      className="w-full resize-none rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[200px] overflow-y-auto"
                      style={{ minHeight: "40px", maxHeight: "200px" }}
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isSendingMessage}
                      className="bg-primary hover:bg-primary/90 md:hidden h-10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="hidden md:flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isSendingMessage}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
