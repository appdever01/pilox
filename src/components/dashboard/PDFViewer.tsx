"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export default function PDFViewer({ isOpen, onClose, pdfUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [scale] = useState(1.5);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [windowWidth, setWindowWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleClose = () => {
    if (containerRef.current) {
      localStorage.setItem(
        "pdfViewerState",
        JSON.stringify({
          currentPage,
          scrollPosition: containerRef.current.scrollTop,
        })
      );
    }
    onClose();
  };

  useEffect(() => {
    const savedState = localStorage.getItem("pdfViewerState");
    if (savedState) {
      const { currentPage: savedPage, scrollPosition: savedScroll } =
        JSON.parse(savedState);
      setCurrentPage(savedPage);
      setPageInputValue(savedPage.toString());
      setScrollPosition(savedScroll);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && scrollPosition > 0) {
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  const scrollToPage = (pageNum: number) => {
    if (containerRef.current) {
      const pageElement = containerRef.current.querySelector(
        `[data-page-number="${pageNum}"]`
      );
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInputValue(value);

    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      scrollToPage(pageNum);
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInputValue);
    if (isNaN(pageNum) || pageNum < 1) {
      setPageInputValue("1");
      setCurrentPage(1);
      scrollToPage(1);
    } else if (pageNum > numPages) {
      setPageInputValue(numPages.toString());
      setCurrentPage(numPages);
      scrollToPage(numPages);
    } else {
      setPageInputValue(pageNum.toString());
      setCurrentPage(pageNum);
      scrollToPage(pageNum);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card w-full max-w-5xl h-[90vh] rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">PDF Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      {numPages} page{numPages !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pageInputValue}
                      onChange={handlePageChange}
                      onBlur={handlePageInputBlur}
                      className="w-12 h-8 px-2 text-sm border rounded-md"
                      placeholder="Page"
                    />
                    <span className="text-sm text-muted-foreground">
                      of {numPages}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
                <div className="w-full mx-auto">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center gap-4"
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <div key={`page_${index + 1}`} className="shadow-lg">
                        <Page
                          pageNumber={index + 1}
                          width={Math.min(windowWidth - 80, 800)}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          data-page-number={index + 1}
                        />
                      </div>
                    ))}
                  </Document>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
