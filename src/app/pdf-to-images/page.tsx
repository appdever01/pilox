"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import JSZip from "jszip";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPage {
  id: string;
  pageNumber: number;
  preview: string;
}

export default function PDFToImagesPage() {
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsConverting(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: fileBuffer }).promise;
      const newPages: PDFPage[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        newPages.push({
          id: crypto.randomUUID(),
          pageNumber: i,
          preview: canvas.toDataURL("image/jpeg", 0.8),
        });
      }

      setPages(newPages);
    } catch (error) {
      console.error("Error converting PDF:", error);
    } finally {
      setIsConverting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
  });

  const handleDownloadPage = async (pageNumber: number) => {
    const page = pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return;

    const link = document.createElement("a");
    link.href = page.preview;
    link.download = `page-${pageNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();

      pages.forEach((page) => {
        // Convert base64 to blob
        const imageData = page.preview.split(",")[1];
        zip.file(`page-${page.pageNumber}.jpg`, imageData, { base64: true });
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "pdf-pages.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error creating zip:", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">
            PDF to Images
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Convert PDF pages into high-quality images
          </p>
        </div>

        {/* Conversion Status */}
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            <span>1 page extracted</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="w-full sm:w-auto flex items-center gap-2 py-6 px-8"
            variant="default"
          >
            <Download className="w-5 h-5" />
            Download All
          </Button>
          
          <Button 
            className="w-full sm:w-auto flex items-center gap-2 py-6 px-8"
            variant="outline"
          >
            <Upload className="w-5 h-5" />
            Upload New
          </Button>
        </div>

        {/* Preview Area */}
        <div className="bg-white/50 rounded-lg p-4 border border-border/50">
          {pages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pages.map((page) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden border border-border/50 bg-black/5 backdrop-blur-sm">
                      <Image
                        src={page.preview}
                        alt={`Page ${page.pageNumber}`}
                        fill
                        className="object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={() => handleDownloadPage(page.pageNumber)}
                        variant="secondary"
                        size="icon"
                        className="w-10 h-10"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Page {page.pageNumber}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
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
                {isConverting ? (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                    <p className="text-xl font-medium">Converting PDF...</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center
                                transition-transform duration-300 group-hover:scale-110"
                    >
                      <Upload className="w-8 h-8 text-primary group-hover:text-primary/80" />
                    </div>
                    <div>
                      <p className="text-2xl font-medium">
                        {isDragActive ? "Drop PDF here" : "Upload PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload a PDF file to convert its pages to images
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
