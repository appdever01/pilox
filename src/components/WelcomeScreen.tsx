"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Upload, Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface WelcomeScreenProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
  onStartAnalysis: (pageRange: { startPage: number; endPage: number }) => void;
  loadingMessage: string;
  isSidebarOpen: boolean;
}

const loadingMessages = [
  "Uploading your document...",
  "Reading through the pages...",
  "Analyzing the content...",
  "Understanding the context...",
  "Preparing intelligent responses...",
  "Almost ready...",
  "Making it perfect for you...",
  "Final touches..."
];

export function WelcomeScreen({
  onFileSelect,
  isUploading,
  selectedFile,
  onStartAnalysis,
  loadingMessage,
  isSidebarOpen
}: WelcomeScreenProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => 
          prev === loadingMessages.length - 1 ? prev : prev + 1
        );
      }, 6000);

      return () => {
        clearInterval(interval);
        setLoadingMessageIndex(0);
      };
    }
  }, [isUploading]);

  useEffect(() => {
    if (selectedFile) {
      const getPageCount = async () => {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await pdfjs.getDocument(arrayBuffer).promise;
          setTotalPages(pdf.numPages);
          setPageRange({ start: '1', end: pdf.numPages.toString() });
        } catch (error) {
          console.error('Error getting page count:', error);
          toast.error('Error reading PDF file');
        }
      };
      getPageCount();
    }
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const calculateCost = (start: string, end: string) => {
    if (!start || !end) return 0;
    const numPages = Math.max(0, parseInt(end) - parseInt(start) + 1);
    return (numPages * 0.02).toFixed(2);
  };

  const isPageRangeValid = () => {
    const start = parseInt(pageRange.start);
    const end = parseInt(pageRange.end);
    
    if (isNaN(start) || isNaN(end)) return false;
    if (start < 1 || end < 1) return false;
    if (start > totalPages || end > totalPages) return false;
    if (start > end) return false;
    if (!pageRange.start || !pageRange.end) return false;
    
    return true;
  };

  return (
    <div className={`absolute top-[72px] bottom-0 left-0 right-0 overflow-y-auto flex items-center justify-center transition-all duration-300 ${
      isSidebarOpen ? 'lg:ml-80' : ''
    }`}>
      <div className="w-full max-w-md p-4">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to PILOX Chat
          </h1>
          <p className="text-muted-foreground">
            Upload a PDF to start chatting with your documents
          </p>
        </div>

        {isUploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed rounded-lg p-8 relative bg-accent/50 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 mb-4">
              <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium mb-2">{loadingMessage}</p>
            <p className="text-muted-foreground">
              File: {selectedFile?.name}
            </p>
          </motion.div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (isUploading) return;
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf";
              input.onchange = (e) => handleFileSelect(e as any);
              input.click();
            }}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              {selectedFile ? (
                <>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Click to choose a different file
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Drag & drop your PDF here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (Maximum file size: 50MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {selectedFile && totalPages > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-4 shadow-sm mt-4"
          >
            <div className="flex items-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{totalPages} pages</p>
                <p className="text-muted-foreground text-xs">Select range to analyze</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block text-left">
                    Start Page
                  </label>
                  <input
                    type="number"
                    value={pageRange.start}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPageRange(prev => ({
                        ...prev,
                        start: value,
                        end: parseInt(value) > parseInt(prev.end) ? value : prev.end
                      }));
                    }}
                    onBlur={() => {
                      setPageRange(prev => ({
                        ...prev,
                        start: prev.start === '' ? '1' : 
                               Math.max(1, Math.min(parseInt(prev.start), parseInt(prev.end))).toString()
                      }));
                    }}
                    className="w-full h-9 px-3 rounded-md border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-sm"
                    min="1"
                    max={totalPages}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block text-left">
                    End Page
                  </label>
                  <input
                    type="number"
                    value={pageRange.end}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPageRange(prev => ({
                        ...prev,
                        end: value,
                        start: parseInt(value) < parseInt(prev.start) ? value : prev.start
                      }));
                    }}
                    onBlur={() => {
                      setPageRange(prev => ({
                        ...prev,
                        end: prev.end === '' ? totalPages.toString() : 
                             Math.min(totalPages, Math.max(parseInt(prev.start), parseInt(prev.end))).toString()
                      }));
                    }}
                    className="w-full h-9 px-3 rounded-md border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-sm"
                    min={pageRange.start}
                    max={totalPages}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">
                  Cost to summarize
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {calculateCost(pageRange.start, pageRange.end)} credits
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (0.02 per page)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {selectedFile && !isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 mb-8"
          >
            <Button
              onClick={() => {
                onStartAnalysis({
                  startPage: parseInt(pageRange.start),
                  endPage: parseInt(pageRange.end)
                });
              }}
              disabled={!isPageRangeValid()}
              className="w-full bg-primary hover:bg-primary/90 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
