"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Send,
  Clock,
  Search,
  Trash2,
  Download,
  X,
  Upload,
  Plus,
  Sparkles,
  Youtube,
  LayoutGrid,
  Bot,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  History,
  Video,
  PanelLeftClose,
  AlignLeft,
  LayoutDashboard,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { Quiz } from "@/components/dashboard/Quiz";
import { useRouter } from "next/navigation";
import AuthApiClient from "@/lib/auth-api-client";
import { BuyCredit } from "@/components/landing/BuyCredit";
import { VideoPlayer } from "@/components/dashboard/VideoPlayer";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VideoExplanation } from "@/components/dashboard/VideoExplanation";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Flashcards } from "@/components/dashboard/Flashcards";
import PDFViewer from "@/components/dashboard/PDFViewer";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "explanation" | "normal" | "video-recommendations" | "loading";
  currentPage?: number;
  totalPages?: number;
  startPage?: number;
  endPage?: number;
  videoRecommendations?: VideoRecommendation[];
  pdfId?: string;
}

interface ChatHistory {
  _id: string;
  pdfId: string;
  filename: string;
  createdAt: string;
  lastUpdated: string;
}

interface ChatData {
  messages: Message[];
  explanations: Explanation[];
  relatedVideos: VideoRecommendation[];
  pdfId: string;
  filename: string;
  createdAt: string;
  lastUpdated: string;
  pdfUrl: string;
}

interface PDFInfo {
  fileName: string;
  pageCount: number;
  fileSize: string;
}

interface VideoRecommendation {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

interface Explanation {
  page: number;
  content: string;
}

// New interface for quiz types
interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const config = {
  loader: { load: ["input/tex", "output/svg"] },
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true,
    packages: ["base", "ams", "noerrors", "noundefined"],
  },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>(
    {}
  );
  const [currentPdfId, setCurrentPdfId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  const [pdfInfo, setPdfInfo] = useState<PDFInfo>({
    fileName: "",
    pageCount: 0,
    fileSize: "",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentExplanationPage, setCurrentExplanationPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isQuizPanelOpen, setIsQuizPanelOpen] = useState(false);
  const [isVideoExplanationOpen, setIsVideoExplanationOpen] = useState(false);
  const router = useRouter();
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [low_balance, setLowBalance] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChatHistory, setFilteredChatHistory] = useState<ChatHistory[]>(
    []
  );
  const [canFetchMoreVideos, setCanFetchMoreVideos] = useState(true);
  const [videoPage, setVideoPage] = useState(0);
  const [isLoadingMoreVideos, setIsLoadingMoreVideos] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingMessages] = useState([
    "Uploading your document...",
    "Processing pages...",
    "Analyzing the content...",
    "Extracting key information...",
    "Preparing intelligent responses...",
    "Almost done...",
  ]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsLargeScreen(width >= 1024);
      if (width >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated() && !auth.isFirstVisit()) {
      toast.info("Please login to continue using the chat feature!");
      router.push("/login");
      return;
    }

    if (auth.isFirstVisit()) {
      auth.markVisited();
    }
  }, [router]);

  if (!auth.isAuthenticated() && !auth.isFirstVisit()) {
    return null;
  }

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentPdfId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      pdfId: currentPdfId,
    };

    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      content: "",
      sender: "ai",
      timestamp: new Date(),
      type: "loading",
      pdfId: currentPdfId,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputMessage("");
    resetTextareaHeight();

    setTimeout(scrollToBottom, 100);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.ANALYTICS_QUERY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.getToken()}`,
          },
          body: JSON.stringify({
            query: inputMessage,
            pdfId: currentPdfId,
          }),
        }
      );

      const data = await response.json();

      setMessages((prev) => {
        const withoutLoading = prev.filter(
          (msg) => msg.id !== loadingMessage.id
        );
        return [
          ...withoutLoading,
          {
            id: crypto.randomUUID(),
            content: data.data.data,
            sender: "ai",
            timestamp: new Date(),
            pdfId: currentPdfId,
          },
        ];
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message. Please try again.");
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
    }
  };

  const handleDelete = async (pdfId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.CHAT_HISTORY}/${pdfId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setChatHistory((prev) => prev.filter((chat) => chat.pdfId !== pdfId));
        toast.success(data.message || "Chat deleted successfully");

        if (currentPdfId === pdfId) {
          setMessages([]);
          setCurrentPdfId(null);
          setPdfUrl(null);
          setPdfInfo({
            fileName: "",
            pageCount: 0,
            fileSize: "",
          });
        }
      } else {
        throw new Error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    console.log("Download clicked");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewUpload = async (file?: File) => {
    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,application/pdf";
      input.onchange = async (e) => {
        const selectedFile = (e.target as HTMLInputElement).files?.[0];
        if (selectedFile) {
          if (!selectedFile.type.includes("pdf")) {
            toast.error("Please upload a PDF file");
            return;
          }
          setSelectedFile(selectedFile);
          setCurrentFileName(selectedFile.name);
        }
      };
      input.click();
    } else {
      if (!file.type.includes("pdf")) {
        toast.error("Please upload a PDF file");
        return;
      }
      setSelectedFile(file);
      setCurrentFileName(file.name);
    }
    setIsFlashcardsOpen(false);
  };

  const handleStartAnalysis = async (pageRange: {
    startPage: number;
    endPage: number;
  }) => {
    if (!selectedFile) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      formData.append("startPage", pageRange.startPage.toString());
      formData.append("endPage", pageRange.endPage.toString());

      // Initial submission
      const initialResponse = await AuthApiClient.postForm<{
        status: string;
        message: string;
        data: {
          phase: "uploading" | "analyzing" | "completed" | "error";
          progress: number;
          message: string;
          explanations: any[];
          analysisId: string;
        };
      }>(API_ROUTES.ANALYZE_PDF, formData);

      if (initialResponse.status === "error") {
        setIsUploading(false);
        toast.error(initialResponse.message || "Failed to start analysis");
        return;
      }

      // Ensure analysisId exists
      if (!initialResponse.data?.analysisId) {
        setIsUploading(false);
        toast.error("Invalid analysis ID received");
        return;
      }

      const analysisId = initialResponse.data.analysisId;

      // Poll for status
      const checkStatus = async () => {
        try {
          const statusResponse = await AuthApiClient.get<{
            status: string;
            message: string;
            data: {
              phase: "uploading" | "analyzing" | "completed" | "error";
              progress: number;
              message: string;
              explanations: any[];
              pdfUrl?: string;
              pdfId?: string;
              filename?: string;
              low_balance?: boolean;
            };
          }>(`${API_ROUTES.ANALYSIS_STATUS}/${analysisId}`);

          const { status, data } = statusResponse;

          if (status === "error" || data.phase === "error") {
            setIsUploading(false);
            toast.error(data.message || "Analysis failed");
            return;
          }

          if (data.phase === "completed" && data.explanations?.length > 0) {
            setIsUploading(false);

            if (data.low_balance) {
              setLowBalance(true);
              return;
            }

            const pdfId = data.pdfId || crypto.randomUUID();

            setPdfUrl(data.pdfUrl || "");
            setCurrentPdfId(pdfId);
            setPdfInfo({
              fileName: selectedFile.name,
              pageCount: pageRange.endPage,
              fileSize: formatFileSize(selectedFile.size),
            });

            const initialExplanation: Message = {
              id: crypto.randomUUID(),
              content: data.explanations[0].content,
              sender: "ai",
              timestamp: new Date(),
              type: "explanation",
              currentPage: data.explanations[0].page,
              totalPages: data.explanations.length,
              startPage: pageRange.startPage,
              endPage: pageRange.endPage,
              pdfId: pdfId,
            };

            const explanationsMap = data.explanations.reduce(
              (acc: { [key: string]: string }, exp: any) => {
                acc[exp.page] = exp.content;
                return acc;
              },
              {}
            );

            setExplanations(explanationsMap);
            setMessages([initialExplanation]);
            return;
          }

          setLoadingMessageIndex(() => {
            switch (data.phase) {
              case "uploading":
                return 0;
              case "analyzing":
                return 2;
              default:
                return 0;
            }
          });

          setTimeout(checkStatus, 2000);
        } catch (error) {
          console.error("Error checking analysis status:", error);
          setIsUploading(false);
          toast.error("Error analyzing file");
        }
      };

      checkStatus();
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast.error("Error analyzing file. Please try again.");
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    e.target.style.height = "40px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const value = e.currentTarget.value;
        setInputMessage(
          value.substring(0, start) + "\n" + value.substring(end)
        );

        e.preventDefault();

        setTimeout(() => {
          e.currentTarget.selectionStart = start + 1;
          e.currentTarget.selectionEnd = start + 1;
        }, 0);
        return;
      }
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePageNavigation = (
    direction: "next" | "prev",
    messageId: string
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.type === "explanation") {
          const currentPage = msg.currentPage || msg.startPage || 1;
          const newPage =
            direction === "next"
              ? Math.min(currentPage + 1, msg.endPage || 1)
              : Math.max(currentPage - 1, msg.startPage || 1);

          return {
            ...msg,
            currentPage: newPage,
            content: explanations[newPage] || msg.content,
          };
        }
        return msg;
      })
    );
  };

  useEffect(() => {
    const loadChatHistories = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_ROUTES.CHAT_HISTORIES}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.getToken()}`,
            },
          }
        );
        const data = await response.json();

        if (data.status === "success") {
          setChatHistory(data.data.histories);
        } else {
          throw new Error(data.message || "Failed to load chat histories");
        }
      } catch (error: any) {
        console.error("Error loading chat histories:", error);
        toast.error(error.message || "Failed to load chat histories");
      } finally {
        setIsLoadingHistory(false);
        setIsLoading(false);
      }
    };

    loadChatHistories();
  }, []);

  const handleChatSelect = async (pdfId: string) => {
    setIsLoadingChat(true);
    try {
      setLoadingChatId(pdfId);
      setIsLoading(true);
      setIsFlashcardsOpen(false);

      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.GET_CHAT_MESSAGES}/${pdfId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setPdfUrl(data.data.pdfUrl || null);
        setVideoUrl(data.data.videoUrl || null);

        setCurrentPdfId(data.data.pdfId);
        setPdfInfo({
          fileName: data.data.filename,
          pageCount: data.data.explanations.length,
          fileSize: formatFileSize(data.data.fileSize || 0),
        });

        const parsedMessages = data.data.messages.map((msg: any) => ({
          id: msg._id,
          content: msg.role === "model" ? msg.parts[0].text : msg.parts[0].text,
          sender: msg.role === "model" ? "ai" : "user",
          timestamp: new Date(msg.timestamp),
          pdfId: data.data.pdfId,
        }));

        const filteredMessages = parsedMessages.slice(1);

        const explanationsMap = data.data.explanations.reduce(
          (acc: { [key: string]: string }, exp: any) => {
            acc[exp.page] = exp.content;
            return acc;
          },
          {}
        );
        setExplanations(explanationsMap);

        const initialExplanation: Message = {
          id: crypto.randomUUID(),
          content: data.data.explanations[0].content,
          sender: "ai",
          timestamp: new Date(),
          type: "explanation",
          currentPage: 1,
          totalPages: data.data.explanations.length,
          startPage: 1,
          endPage: data.data.explanations.length,
          pdfId: data.data.pdfId,
        };

        const videoMessage: Message = {
          id: crypto.randomUUID(),
          content: "Here are some helpful video explanations I found:",
          sender: "ai",
          timestamp: new Date(),
          type: "video-recommendations",
          videoRecommendations: data.data.relatedVideos.map((video: any) => ({
            id: crypto.randomUUID(),
            title: video.title,
            thumbnail: video.thumbnailUrl,
            duration: "10:00",
            videoId: video.videoId,
          })),
          pdfId: data.data.pdfId,
        };

        setMessages([initialExplanation, videoMessage, ...filteredMessages]);

        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoadingChatId(null);
      setIsLoading(false);
      setIsLoadingChat(false);
    }
  };

  const handleGenerateVideo = async (voiceId: string) => {
    if (!pdfUrl || !currentPdfId) {
      toast.error("PDF data not available");
      return null;
    }

    try {
      const response = await AuthApiClient.post<{
        status: string;
        message: string;
        data: {
          generationId: string;
          low_balance: boolean;
        };
      }>(API_ROUTES.GENERATE_VIDEO, {
        pdfUrl: pdfUrl,
        audiovoice: voiceId,
        pdfId: currentPdfId,
      });

      if (response.data.low_balance) {
        setLowBalance(true);
        return null;
      }

      if (response.status === "processing") {
        setIsGeneratingVideo(true);
        return response.data.generationId;
      } else {
        throw new Error(response.message || "Failed to start video generation");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video");
      return null;
    }
  };

  const handleDownloadChat = () => {
    const chatContent = messages
      .map((msg) => {
        const role = msg.sender === "user" ? "User" : "AI";
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `[${timestamp}] ${role}:\n${msg.content}\n\n`;
      })
      .join("");

    const fileContent =
      `Chat History - ${pdfInfo?.fileName}\n` +
      `Generated on: ${new Date().toLocaleString()}\n\n` +
      `${chatContent}`;

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `chat-history-${pdfInfo?.fileName || "chat"}-${new Date().toISOString().split("T")[0]}.txt`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      setIsPdfPreviewOpen(true);
    } else {
      toast.error("PDF not available for download");
    }
  };

  const handleDownloadVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, "_blank");
    } else {
      toast.error("Video not available for download");
    }
  };

  const EmptyChatHistory = () => (
    <div className="h-full flex items-center justify-center mt-25">
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No Chat History</h3>
        <p className="text-sm text-muted-foreground">
          Your chat history with PDFs will appear here
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    const storedPDF = sessionStorage.getItem("uploadedPDF");
    const fileName = sessionStorage.getItem("pdfFileName");

    if (storedPDF && fileName) {
      const dataUrl = storedPDF;
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const file = new File([u8arr], fileName, { type: mime });

      handleNewUpload(file);

      sessionStorage.removeItem("uploadedPDF");
      sessionStorage.removeItem("pdfFileName");
      sessionStorage.removeItem("pdfFileSize");
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChatHistory(chatHistory);
      return;
    }

    const filtered = chatHistory.filter((chat) =>
      chat.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChatHistory(filtered);
  }, [searchQuery, chatHistory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLoadMoreVideos = async () => {
    if (!currentPdfId || isLoadingMoreVideos) return;

    setIsLoadingMoreVideos(true);
    try {
      const response = await AuthApiClient.post<{
        status: string;
        message: string;
        data: {
          videos: any[];
          canFetchMore: boolean;
        };
      }>(API_ROUTES.MORE_VIDEOS, {
        pdfId: currentPdfId,
        page: videoPage + 1,
      });

      if (response.status === "success") {
        setVideoPage((prev) => prev + 1);
        setCanFetchMoreVideos(response.data.canFetchMore);

        setMessages((prevMessages) => {
          const lastVideoRecIndex = [...prevMessages]
            .reverse()
            .findIndex((m) => m.type === "video-recommendations");

          if (lastVideoRecIndex === -1) return prevMessages;

          const newMessages = [...prevMessages];
          const actualIndex = prevMessages.length - 1 - lastVideoRecIndex;
          const currentMessage = newMessages[actualIndex];

          newMessages[actualIndex] = {
            ...currentMessage,
            videoRecommendations: [
              ...(currentMessage.videoRecommendations || []),
              ...response.data.videos.map((video: any) => ({
                id: crypto.randomUUID(),
                title: video.title,
                thumbnail: video.thumbnailUrl,
                duration: "10:00",
                videoId: video.videoId,
              })),
            ],
          };

          return newMessages;
        });
      } else {
        setCanFetchMoreVideos(false);
        toast.error(response.message || "Failed to load more videos");
      }
    } catch (error) {
      console.error("Error loading more videos:", error);
      setCanFetchMoreVideos(false);
      toast.error("Failed to load more videos");
    } finally {
      setIsLoadingMoreVideos(false);
    }
  };

  useEffect(() => {
    const handlePlaceholder = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        const isMobile = window.innerWidth < 640;
        textarea.placeholder = isMobile
          ? textarea.getAttribute("data-mobile-placeholder") ||
            "Type your message..."
          : textarea.getAttribute("data-desktop-placeholder") ||
            "Type your message... (Ctrl + Enter for new line)";
      }
    };

    handlePlaceholder();
    window.addEventListener("resize", handlePlaceholder);
    return () => window.removeEventListener("resize", handlePlaceholder);
  }, []);

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;

      // Preserve LaTeX content when copying
      let plainText = tempDiv.innerHTML
        .replace(/<div>/gi, "\n")
        .replace(/<\/div>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        // Don't strip LaTeX delimiters
        .replace(/&nbsp;/g, " ")
        .trim();

      await navigator.clipboard.writeText(plainText);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");

      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const processLatexContent = (content: string) => {
    return content
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      .replace(/\\pm/g, "±")
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$")
      .replace(/times/g, "\\times")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/frac12/g, "\\frac{1}{2}")
      .replace(/frac(\d+)(\d+)/g, "\\frac{$1}{$2}");
  };

  return (
    <MathJaxContext config={config}>
      <div className="flex h-[calc(100vh-62px)] w-full relative overflow-hidden">
        {!isSidebarOpen && !currentPdfId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-10 w-10 absolute left-4 top-4 z-30 lg:hidden"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="h-5 w-5 text-primary" />
            </div>
          </Button>
        )}

        {/* Sidebar with AnimatePresence */}
        <AnimatePresence mode="wait">
          {(isSidebarOpen || isLargeScreen) && (
            <>
              {/* Overlay for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed lg:relative w-80 flex-shrink-0 border-r bg-card/50 backdrop-blur-sm flex flex-col h-full z-40"
              >
                {/* Search bar */}
                <div className="p-4 border-b flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chat history..."
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>

                {/* Chat history list */}
                <div className="flex-1 overflow-y-auto">
                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center h-full">
                      <LoadingSpinner />
                    </div>
                  ) : filteredChatHistory.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filteredChatHistory.map((chat) => (
                        <motion.div
                          key={chat._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors
                            ${currentPdfId === chat.pdfId ? "bg-accent" : ""}`}
                          onClick={() => {
                            handleChatSelect(chat.pdfId);
                            if (!isLargeScreen) {
                              setIsSidebarOpen(false);
                            }
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">
                              {chat.filename}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(chat.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                          {loadingChatId === chat.pdfId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
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
                        Your chat history will appear here
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t mt-auto sticky bottom-0 bg-card/50 backdrop-blur-sm">
                  <Button
                    onClick={() => {
                      setMessages([]);
                      setCurrentPdfId(null);
                      setPdfUrl(null);
                      setPdfInfo({
                        fileName: "",
                        pageCount: 0,
                        fileSize: "",
                      });
                      handleNewUpload();
                      if (!isLargeScreen) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New PDF
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          {!currentPdfId ? (
            <div className="flex-1 flex items-center justify-center h-[calc(100vh-62px)] -mt-[72px]">
              <div
                className={`w-full transition-all duration-300 ${
                  isSidebarOpen || isLargeScreen
                    ? "lg:w-[calc(100%-320px)]"
                    : ""
                }`}
              >
                {isLoadingChat ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">
                      Opening chat...
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl px-4 mx-auto ">
                    <WelcomeScreen
                      onFileSelect={handleNewUpload}
                      isUploading={isUploading}
                      selectedFile={selectedFile}
                      onStartAnalysis={handleStartAnalysis}
                      loadingMessage={loadingMessages[loadingMessageIndex]}
                      isSidebarOpen={isSidebarOpen}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading chat history...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b p-3 sm:p-4 flex items-center gap-2 sm:gap-4 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 hover:bg-accent rounded-full transition-colors duration-200"
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <AlignLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex flex-col min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold truncate max-w-[180px] sm:max-w-full">
                      {isUploading
                        ? "Uploading..."
                        : pdfInfo.fileName ||
                          currentFileName ||
                          "No document selected"}
                    </h1>
                    {pdfInfo.pageCount > 0 && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {pdfInfo.pageCount} pages
                      </p>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={handleDownloadChat}
                      className="p-2 hover:bg-accent rounded-full transition-colors duration-200"
                      title="Download Chat History"
                    >
                      <Download className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="p-2 hover:bg-accent rounded-full transition-colors duration-200"
                      title="Download PDF"
                      disabled={!pdfUrl}
                    >
                      <FileText className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                    </button>

                    {videoUrl && (
                      <button
                        onClick={handleDownloadVideo}
                        className="p-2 hover:bg-accent rounded-full transition-colors duration-200 group"
                        title="Download Video"
                      >
                        <Video className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      </button>
                    )}

                    <AlertDialog.Root>
                      <AlertDialog.Trigger asChild>
                        <button
                          className="p-2 hover:bg-destructive/10 rounded-full transition-colors duration-200 group"
                          title="Delete chat"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors duration-200" />
                        </button>
                      </AlertDialog.Trigger>

                      <AlertDialog.Portal>
                        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90vw] max-w-[500px] shadow-lg z-[51]">
                          <AlertDialog.Title className="text-lg font-semibold mb-2">
                            Are you sure?
                          </AlertDialog.Title>
                          <AlertDialog.Description className="text-sm text-gray-500 mb-4">
                            This action cannot be undone. This will permanently
                            delete this chat history.
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
                                  currentPdfId && handleDelete(currentPdfId)
                                }
                                disabled={isDeleting || !currentPdfId}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {isDeleting ? (
                                  <>
                                    <span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </AlertDialog.Action>
                          </div>
                        </AlertDialog.Content>
                      </AlertDialog.Portal>
                    </AlertDialog.Root>
                  </div>
                </div>
              </div>

              {/* Messages container with padding bottom for input box */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3 space-y-4 pb-[100px] sm:pb-[120px]"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {message.sender === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      )}

                      <div
                        className={`rounded-lg relative group  ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.type === "video-recommendations"
                              ? "bg-transparent"
                              : "bg-accent"
                        } text-sm`}
                      >
                        {message.sender === "ai" &&
                          message.type !== "loading" &&
                          message.type !== "video-recommendations" && (
                            <button
                              onClick={() =>
                                handleCopyMessage(message.content, message.id)
                              }
                              className="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent"
                              title="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          )}

                        {message.type === "explanation" ? (
                          <div className="flex flex-col">
                            <div className="p-4 prose prose-gray max-w-none">
                              <MathJax dynamic>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: processLatexContent(
                                      message.content
                                    ),
                                  }}
                                />
                              </MathJax>
                            </div>
                            <div className="border-t bg-accent/50 p-3 flex items-center justify-between">
                              <button
                                onClick={() =>
                                  handlePageNavigation("prev", message.id)
                                }
                                disabled={
                                  !message.startPage ||
                                  !message.currentPage ||
                                  message.currentPage <= message.startPage
                                }
                                className="p-1 hover:bg-accent rounded-sm disabled:opacity-50"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="text-sm">
                                Page {message.currentPage}/{message.endPage}
                              </span>
                              <button
                                onClick={() =>
                                  handlePageNavigation("next", message.id)
                                }
                                disabled={
                                  !message.endPage ||
                                  !message.currentPage ||
                                  message.currentPage >= message.endPage
                                }
                                className="p-1 hover:bg-accent rounded-sm disabled:opacity-50"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : message.type === "video-recommendations" ? (
                          <div className="flex flex-col space-y-3 w-full">
                            <div className="flex items-center gap-2 px-1">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                                <Youtube className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-primary">
                                  Related Videos
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {message.videoRecommendations
                                ?.slice(0, 3)
                                .map((video, index) => (
                                  <div
                                    key={video.id}
                                    onClick={() =>
                                      setSelectedVideo(video.videoId)
                                    }
                                    className="group relative overflow-hidden rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
                                  >
                                    {/* Thumbnail Container */}
                                    <div className="relative aspect-video">
                                      <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />

                                      {/* Overlay with Play Button */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                            <Play className="w-4 h-4 text-primary ml-0.5" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Content Section */}
                                      <div className="p-2">
                                        <h4 className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
                                          {video.title}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                          <div className="text-[10px] px-2 py-0.5 my-1 rounded-full bg-accent/50">
                                            Tutorial
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {/* View More Card */}
                              {message.videoRecommendations &&
                                message.videoRecommendations.length > 3 && (
                                  <button
                                    onClick={() => setShowAllVideos(true)}
                                    className="relative overflow-hidden rounded-lg border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
                                  >
                                    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-primary" />
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs font-medium text-primary">
                                          View{" "}
                                          {message.videoRecommendations.length -
                                            3}{" "}
                                          More
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1.5">
                                          Click to see all
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                )}
                            </div>
                          </div>
                        ) : message.type === "loading" ? (
                          <div className="flex items-center gap-2 p-3">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`p-4 ${message.sender === "user" ? "" : "overflow-x-scroll max-w-[96%]"}`}
                          >
                            <MathJax dynamic>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: processLatexContent(message.content),
                                }}
                              />
                            </MathJax>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input area - Fixed at bottom */}
              <div className="border-t bg-background/95 backdrop-blur-sm p-2 sm:p-4 fixed bottom-0 z-20 w-full">
                <div
                  className={`flex gap-2 items-center mx-auto ${isSidebarOpen ? "lg:pr-[320px]" : ""}`}
                >
                  <div
                    className={`flex gap-2 items-center w-full max-w-[1200px] mx-auto px-2 sm:px-4`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-accent flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            if (!pdfUrl) {
                              toast.error("Please upload a PDF first");
                              return;
                            }
                            setIsQuizPanelOpen(true);
                            setIsSidebarOpen(false);
                          }}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span>Generate Quiz</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsVideoExplanationOpen(true);
                            setIsSidebarOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            <Youtube className="mr-2 h-4 w-4" />
                            <span>Generate Video</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (!pdfUrl) {
                              toast.error("Please upload a PDF first");
                              return;
                            }
                            setIsFlashcardsOpen(true);
                            setIsSidebarOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Generate Flashcards</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about the PDF here..."
                      className="flex-1 resize-none rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto"
                      rows={1}
                      data-mobile-placeholder="Ask about the PDF here..."
                      data-desktop-placeholder="Ask about the PDF here... (Ctrl + Enter for new line)"
                    />

                    <Button
                      onClick={handleSendMessage}
                      className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0"
                      disabled={!inputMessage.trim()}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Quiz
          isOpen={isQuizPanelOpen}
          onClose={() => setIsQuizPanelOpen(false)}
          pdfUrl={pdfUrl}
          pdfName={pdfInfo.fileName}
          totalPages={pdfInfo.pageCount}
        />

        <VideoExplanation
          isOpen={isVideoExplanationOpen}
          onClose={() => setIsVideoExplanationOpen(false)}
          pdfUrl={pdfUrl}
          currentPdfId={currentPdfId}
          onGenerateVideo={handleGenerateVideo}
          isGenerating={isGeneratingVideo}
        />

        {selectedVideo && (
          <VideoPlayer
            videoId={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}

        {/* All Videos Modal */}
        <AnimatePresence>
          {showAllVideos && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-[calc(100%-32px)] max-w-2xl mx-auto mt-20 bg-card rounded-xl shadow-lg overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold">
                      Related Video Explanations
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAllVideos(false)}
                    className="p-1.5 hover:bg-background/80 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-4">
                    {messages
                      .find((m) => m.type === "video-recommendations")
                      ?.videoRecommendations?.map((video, index) => (
                        <div
                          key={video.id}
                          onClick={() => {
                            setSelectedVideo(video.videoId);
                            setShowAllVideos(false);
                          }}
                          className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group border border-border/50"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-md text-xs text-white font-medium">
                              #{index + 1}
                            </div>
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-32 sm:w-40 aspect-video object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-primary ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-medium mb-2 line-clamp-2 leading-snug">
                                {video.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Click to watch</span>
                                </div>
                              </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 mt-2">
                              <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                Video Guide
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Flashcards
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
          pdfUrl={pdfUrl}
          pdfName={pdfInfo.fileName}
          totalPages={pdfInfo.pageCount}
        />

        {pdfUrl && (
          <PDFViewer
            isOpen={isPdfPreviewOpen}
            onClose={() => setIsPdfPreviewOpen(false)}
            pdfUrl={pdfUrl}
          />
        )}
      </div>
    </MathJaxContext>
  );
}
