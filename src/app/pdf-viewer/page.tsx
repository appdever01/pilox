"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  SidebarOpen,
  SidebarClose,
  Bot,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFViewerPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPdfFile(file);
      setCurrentPage(1);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);

    const generateThumbnails = async () => {
      const thumbs = [];
      for (let i = 1; i <= numPages; i++) {
        const canvas = document.createElement("canvas");
        const page = await pdfjs
          .getDocument(URL.createObjectURL(pdfFile!))
          .promise.then((pdf: PDFDocumentProxy) => pdf.getPage(i));
        const viewport = page.getViewport({ scale: 0.4 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvasContext: context,
          viewport,
          intent: "fast",
        }).promise;
        thumbs.push(canvas.toDataURL("image/jpeg", 0.5));
        setThumbnails((current) => [
          ...current,
          canvas.toDataURL("image/jpeg", 0.5),
        ]);
      }
    };

    generateThumbnails();
    setIsLoading(false);
  };

  const handleZoom = (type: "in" | "out") => {
    setScale((prev) =>
      type === "in" ? prev + 0.1 : Math.max(0.1, prev - 0.1)
    );
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const center = container.scrollTop + container.clientHeight / 2;

    let closestPage = 1;
    let minDistance = Infinity;

    pageRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const distance = Math.abs(
          rect.top + rect.height / 2 - window.innerHeight / 2
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = index + 1;
        }
      }
    });

    setCurrentPage(closestPage);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-background">
      {!pdfFile ? (
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              PDF Viewer
            </h1>
            <p className="text-xl text-muted-foreground/80">
              View, search, and interact with your PDF documents
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl transition-all duration-300
              ${isDragActive ? "border-primary/80 bg-primary/5" : "border-muted-foreground/20"}
              p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10
              group h-[300px] max-w-2xl mx-auto flex flex-col items-center justify-center
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center
                          transition-transform duration-300 group-hover:scale-110"
              >
                <Upload className="w-8 h-8 text-primary group-hover:text-primary/80" />
              </div>
              <div>
                <p className="text-2xl font-medium">
                  {isDragActive ? "Drop PDF here" : "Open PDF"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Sidebar */}
          {!showSidebar ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="h-10 w-10 lg:hidden"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          ) : (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full border-r border-border bg-muted/30 backdrop-blur-xl"
            >
              <div className="p-4 space-y-4 overflow-auto h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Document Outline</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(false)}
                  >
                    <SidebarClose className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search in document..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  {thumbnails.map((thumb, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentPage(index + 1);
                        pageRefs.current[index]?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className={`
                        relative rounded-lg overflow-hidden cursor-pointer
                        border-2 transition-all duration-200
                        bg-white shadow-sm
                        hover:shadow-md
                        ${
                          currentPage === index + 1
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-primary/50"
                        }
                      `}
                    >
                      <img
                        src={thumb}
                        alt={`Page ${index + 1}`}
                        className="w-full object-contain"
                        style={{
                          imageRendering: "auto",
                          WebkitFontSmoothing: "antialiased",
                        }}
                      />
                      <div
                        className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm 
                                    text-white text-xs px-2 py-1 rounded-md"
                      >
                        Page {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full">
            {/* Toolbar */}
            <div className="border-b border-border bg-muted/30 backdrop-blur-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!showSidebar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(true)}
                  >
                    <SidebarOpen className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center gap-1 bg-muted rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleZoom("out")}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="px-2 text-sm">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleZoom("in")}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      setCurrentPage(newPage);
                      requestAnimationFrame(() => {
                        pageRefs.current[newPage - 1]?.scrollIntoView({
                          behavior: "smooth",
                        });
                      });
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-w-[80px] text-center text-sm"
                      transition={{ duration: 0.15 }}
                    >
                      Page {currentPage} of {numPages}
                    </motion.span>
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newPage = Math.min(numPages, currentPage + 1);
                      setCurrentPage(newPage);
                      requestAnimationFrame(() => {
                        pageRefs.current[newPage - 1]?.scrollIntoView({
                          behavior: "smooth",
                        });
                      });
                    }}
                    disabled={currentPage === numPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(
                      `/chat/${encodeURIComponent(pdfFile?.name || "document")}`
                    )
                  }
                >
                  <Bot className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPdfFile(null);
                    setNumPages(0);
                    setCurrentPage(1);
                    setThumbnails([]);
                    setRotation(0);
                  }}
                  className="ml-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose New PDF
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div
              className="flex-1 overflow-auto bg-muted/30 p-8"
              ref={containerRef}
            >
              <div className="max-w-4xl mx-auto">
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-[800px]">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={index}
                      className="mb-8"
                      ref={(el: HTMLDivElement | null) => {
                        pageRefs.current[index] = el;
                      }}
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        rotate={rotation}
                        className="mx-auto shadow-xl"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
