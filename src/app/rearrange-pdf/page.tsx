"use client";

import { useState, useCallback, useRef } from "react";
import { Reorder } from "framer-motion";
import {
  Upload,
  Loader2,
  GripVertical,
  X,
  FileText,
  Undo2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPage {
  id: string;
  pageNumber: number;
  type: "pdf" | "image";
  content: number | string;
}

export default function RearrangePDFPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState("rearranged");
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [originalOrder, setOriginalOrder] = useState<PDFPage[]>([]);
  const [deletedPages, setDeletedPages] = useState<PDFPage[]>([]);
  const [history, setHistory] = useState<PDFPage[][]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPdfFile(file);
      setFilename(file.name.replace(".pdf", ""));
      toast.success("PDF uploaded successfully", {
        duration: 2000,
        dismissible: true,
      });
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    const newPages = Array.from({ length: numPages }, (_, i) => ({
      id: crypto.randomUUID(),
      pageNumber: i + 1,
      type: "pdf" as const,
      content: i + 1,
    }));
    setPages(newPages);
    setOriginalOrder(newPages);
    setNumPages(numPages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleDelete = (pageIndex: number) => {
    setHistory((prev) => [...prev, [...pages]]);
    const newPages = [...pages];
    const deletedPage = newPages.splice(pageIndex, 1)[0];
    setPages(newPages);
    toast.success("Page deleted successfully", {
      duration: 2000,
      dismissible: true,
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setPages(previousState);
    setHistory((prev) => prev.slice(0, -1));
  };

  const resetOrder = () => {
    setPages([...originalOrder]);
    setDeletedPages([]);
  };

  const handlePageNumberChange = (
    currentIndex: number,
    newPageNumber: string
  ) => {
    const num = parseInt(newPageNumber);
    if (isNaN(num) || num < 1 || num > pages.length) return;

    const targetIndex = num - 1;
    if (targetIndex === currentIndex) return;

    setHistory((prev) => [...prev, [...pages]]);
    const newPages = [...pages];
    const [movedPage] = newPages.splice(currentIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);
    setPages(newPages);
  };

  const movePageUpDown = (currentIndex: number, direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === pages.length - 1)
    )
      return;

    setHistory((prev) => [...prev, [...pages]]);
    const newPages = [...pages];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    [newPages[currentIndex], newPages[targetIndex]] = [
      newPages[targetIndex],
      newPages[currentIndex],
    ];
    setPages(newPages);
  };

  const handleImageInsert = async (index: number, files: File[]) => {
    setHistory((prev) => [...prev, [...pages]]);
    const newPages = [...pages];

    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPage: PDFPage = {
          id: crypto.randomUUID(),
          pageNumber: index + 1,
          type: "image",
          content: reader.result as string,
        };

        newPages.splice(index, 0, newPage);
        
        for (let i = 0; i < newPages.length; i++) {
          newPages[i].pageNumber = i + 1;
        }

        setPages([...newPages]);
      };
      reader.readAsDataURL(file);
    }
  };

  const InsertImageButton = ({
    onInsert,
    index,
  }: {
    onInsert: (index: number, files: File[]) => void;
    index: number;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              handleImageInsert(index, Array.from(e.target.files));
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-background shadow-sm hover:bg-primary/5"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="w-3 h-3 mr-1" />
          Insert Image
        </Button>
      </div>
    );
  };

  const handleSavePDF = async () => {
    if (!pdfFile) return;
    setIsLoading(true);

    try {
      const newPdf = await PDFDocument.create();
      const existingPdf = await PDFDocument.load(await pdfFile.arrayBuffer());

      for (const page of pages) {
        if (page.type === "pdf") {
          const [copiedPage] = await newPdf.copyPages(existingPdf, [
            (page.content as number) - 1,
          ]);
          newPdf.addPage(copiedPage);
        } else {
          const base64Data = (page.content as string).split(',')[1];
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const image = await newPdf.embedJpg(imageBytes);
          
          const pdfPage = newPdf.addPage([
            existingPdf.getPage(0).getSize().width,
            existingPdf.getPage(0).getSize().height,
          ]);
          
          const pageWidth = pdfPage.getSize().width;
          const pageHeight = pdfPage.getSize().height;
          const imgWidth = image.width;
          const imgHeight = image.height;
          
          const ratio = Math.min(
            pageWidth / imgWidth,
            pageHeight / imgHeight
          );
          
          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;
          
          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;
          
          pdfPage.drawImage(image, {
            x,
            y,
            width: finalWidth,
            height: finalHeight,
          });
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF saved successfully");
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-6 md:py-16">
        <div className="text-center space-y-2 md:space-y-4 mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent leading-tight">
            Rearrange PDF
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80">
            Reorder pages in your PDF document with ease
          </p>
        </div>

        {pdfFile ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {numPages} page{numPages !== 1 ? "s" : ""}
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2">
                <div className="col-span-2 sm:col-span-1 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="flex-1 sm:flex-initial text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Undo2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetOrder}
                    className="flex-1 sm:flex-initial text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Undo2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Reset
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPdfFile(null);
                    setPages([]);
                    setNumPages(0);
                    setFilename("rearranged");
                  }}
                  className="col-span-2 sm:col-span-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Upload New
                </Button>
              </div>
            </div>

            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50 mb-20" />
                </div>
              }
            >
              <Reorder.Group
                axis="y"
                values={pages}
                onReorder={(newPages) => {
                  if (JSON.stringify(newPages) !== JSON.stringify(pages)) {
                    setHistory((prev) => [...prev, [...pages]]);
                    setPages(newPages);
                  }
                }}
                className="grid grid-cols-1 gap-4"
                layoutScroll
              >
                {pages.map((page, index) => (
                  <div key={page.id} className="relative">
                    <InsertImageButton
                      onInsert={handleImageInsert}
                      index={index}
                    />
                    <Reorder.Item
                      value={page}
                      className="group bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-2 sm:p-4 flex items-center gap-2 sm:gap-4 hover:border-primary/50 transition-colors"
                      initial={false}
                      animate={{ y: 0, transition: { duration: 0 } }}
                      exit={{ y: 0, transition: { duration: 0 } }}
                      layoutId={page.id}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div
                          className="relative w-[40px] h-[60px] md:w-[60px] md:h-[80px] bg-muted rounded-md overflow-hidden shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50"
                          onClick={() => setSelectedPage(page.pageNumber)}
                        >
                          {page.type === "pdf" ? (
                            <Page
                              pageNumber={page.content as number}
                              width={60}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              className="!w-full !h-full"
                              loading={
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin text-muted-foreground/50" />
                                </div>
                              }
                            />
                          ) : (
                            <Image
                              fill
                              className="object-cover"
                              src={page.content as string}
                              alt={`Page ${page.pageNumber}`}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 whitespace-nowrap">
                        <p className="text-xs md:text-sm font-medium">
                          Page {page.pageNumber}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {page.type === "pdf" ? "PDF Page" : "Inserted Image"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 pr-2 sm:pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 sm:size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(pages.indexOf(page))}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-2">
                          <p className="text-[10px] whitespace-nowrap text-muted-foreground">
                            Move to
                          </p>
                          <Input
                            type="number"
                            min={1}
                            max={pages.length}
                            className="w-12 sm:w-16 h-6 sm:h-8 text-center text-xs sm:text-sm"
                            placeholder="#"
                            onChange={(e) =>
                              handlePageNumberChange(
                                pages.indexOf(page),
                                e.target.value
                              )
                            }
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-3 w-3 sm:h-4 sm:w-4 hover:bg-muted rounded-sm flex items-center justify-center"
                            onClick={() =>
                              movePageUpDown(pages.indexOf(page), "up")
                            }
                            disabled={pages.indexOf(page) === 0}
                          >
                            <ChevronUp className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-3 w-3 sm:h-4 sm:w-4 hover:bg-muted rounded-sm flex items-center justify-center"
                            onClick={() =>
                              movePageUpDown(pages.indexOf(page), "down")
                            }
                            disabled={pages.indexOf(page) === pages.length - 1}
                          >
                            <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  </div>
                ))}
              </Reorder.Group>
            </Document>

            {selectedPage && (
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedPage(null);
                  }
                }}
              >
                <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-medium">Page {selectedPage}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPage(null)}
                      className="hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-auto p-6">
                    <Document file={pdfFile}>
                      <Page
                        pageNumber={selectedPage}
                        width={Math.min(800, window.innerWidth - 100)}
                        className="mx-auto"
                        renderAnnotationLayer={false}
                        loading={
                          <div className="w-full h-[600px] flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        }
                      />
                    </Document>
                  </div>

                  <div className="p-4 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPage(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-sm sm:max-w-md px-4 backdrop-blur-xl bg-background/95 rounded-2xl p-3 sm:p-4 shadow-xl z-50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter filename"
                    className="pr-10 sm:pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground">
                    .pdf
                  </span>
                </div>
                <Button
                  onClick={handleSavePDF}
                  disabled={isLoading || !filename.trim() || pages.length === 0}
                  className="bg-primary hover:bg-primary/90 text-sm w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save PDF"
                  )}
                </Button>
              </div>
            </div>
          </div>
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
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Upload className="w-6 h-6 text-primary group-hover:text-primary/80" />
              </div>
              <div>
                <p className="text-2xl font-medium">
                  {isDragActive ? "Drop PDF here" : "Upload PDF"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
