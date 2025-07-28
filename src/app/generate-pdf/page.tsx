"use client";

import {
  Loader2,
  FileText,
  Download,
  Eye,
  Settings2,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";
import { auth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { BuyCredit } from "@/components/landing/BuyCredit";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

// Dynamically import PDFViewer with no SSR
const PDFViewer = dynamic(() => import("@/components/dashboard/PDFViewer"), {
  ssr: false,
});

// Initialize PDF.js worker only on client side
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface GeneratedPDF {
  title: string;
  url: string;
  createdAt: Date;
}

interface PDFParams {
  prompt: string;
  pages: number;
  includeImages: boolean;
  fontSize: number;
  fontStyle: string;
  alignment: "left" | "center" | "right" | "justify";
  introText: string;
  endingNotes: string;
}

interface GeneratePDFResponse {
  status: string;
  message: string;
  blob: Blob;
  low_balance: boolean;
}

const FONTS = [
  {
    value: "Helvetica",
    label: "Helvetica",
    style: { fontFamily: "Helvetica, Arial, sans-serif" },
  },
  {
    value: "Times-Roman",
    label: "Times-Roman",
    style: { fontFamily: "Times, 'Times New Roman', serif" },
  },
  {
    value: "Courier",
    label: "Courier",
    style: { fontFamily: "Courier, 'Courier New', monospace" },
  },
  { value: "Symbol", label: "Symbol", style: { fontFamily: "Symbol" } },
  {
    value: "ZapfDingbats",
    label: "ZapfDingbats",
    style: { fontFamily: "ZapfDingbats" },
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function GeneratePDFPage() {
  const router = useRouter();
  const [low_balance, setLowBalance] = useState(false);

  useEffect(() => {
    if (!auth.getToken()) {
      router.replace("/login");
    }
  }, [router]);

  const [pdfParams, setPDFParams] = useState<PDFParams>({
    prompt: "",
    pages: 2,
    includeImages: false,
    fontSize: 12,
    fontStyle: "Helvetica",
    alignment: "left",
    introText: "",
    endingNotes: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState<GeneratedPDF | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!pdfParams.prompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }
    setIsGenerating(true);
    setLowBalance(false);

    try {
      const token = auth.getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.GENERATE_PDF}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: pdfParams.prompt,
            pages: pdfParams.pages,
            fontSize: pdfParams.fontSize,
            fontStyle: pdfParams.fontStyle,
            alignment: pdfParams.alignment,
            introText: pdfParams.introText,
            endingNotes: pdfParams.endingNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const jsonResponse = await response.json();
        if (jsonResponse.data.low_balance) {
          setLowBalance(true);
          return;
        }
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const fileSize = formatFileSize(pdfBlob.size);

      setGeneratedPDF({
        title: `Generated Document (${fileSize})`,
        url: pdfUrl,
        createdAt: new Date(),
      });

      toast.success("✨ PDF generated successfully!", {
        duration: 3000,
      });
    } catch (error: any) {
      toast.error(error.message || "❌ Oops! Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-pdf-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      // Cleanup function
      if (generatedPDF?.url) {
        URL.revokeObjectURL(generatedPDF.url);
      }
    };
  }, [generatedPDF]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="w-full h-full">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="text-center md:mt-12 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Generate PDF
              </h1>
              <p className="text-muted-foreground mt-2">
                Create professional PDFs from your prompts using AI
              </p>
            </div>

            {low_balance && <BuyCredit />}

            <div className="space-y-6">
              <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-semibold">
                        Prompt <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Required
                      </span>
                    </div>
                    <textarea
                      value={pdfParams.prompt}
                      onChange={(e) =>
                        setPDFParams({ ...pdfParams, prompt: e.target.value })
                      }
                      placeholder="Enter your prompt for PDF generation..."
                      className="w-full h-32 px-4 py-3 bg-background/50 rounded-lg 
                               border border-border/50 focus:outline-none focus:ring-2 
                               focus:ring-primary/50 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Advanced Settings</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showAdvanced ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-base">
                                Introduction Text
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                Optional
                              </span>
                            </div>
                            <textarea
                              value={pdfParams.introText}
                              onChange={(e) =>
                                setPDFParams({
                                  ...pdfParams,
                                  introText: e.target.value,
                                })
                              }
                              placeholder="Add an introduction to your PDF..."
                              className="w-full h-20 px-4 py-3 bg-background/50 rounded-lg 
                                       border border-border/50 focus:outline-none focus:ring-2 
                                       focus:ring-primary/50 focus:border-transparent resize-none"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-base">Ending Notes</Label>
                              <span className="text-xs text-muted-foreground">
                                Optional
                              </span>
                            </div>
                            <textarea
                              value={pdfParams.endingNotes}
                              onChange={(e) =>
                                setPDFParams({
                                  ...pdfParams,
                                  endingNotes: e.target.value,
                                })
                              }
                              placeholder="Add ending notes to your PDF..."
                              className="w-full h-20 px-4 py-3 bg-background/50 rounded-lg 
                                       border border-border/50 focus:outline-none focus:ring-2 
                                       focus:ring-primary/50 focus:border-transparent resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>Font Size</Label>
                              <Select
                                value={pdfParams.fontSize.toString()}
                                onValueChange={(value) =>
                                  setPDFParams({
                                    ...pdfParams,
                                    fontSize: parseInt(value),
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select font size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[10, 11, 12, 14, 16, 18, 20].map((size) => (
                                    <SelectItem
                                      key={size}
                                      value={size.toString()}
                                    >
                                      {size}px
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Font Style</Label>
                              <Select
                                value={pdfParams.fontStyle}
                                onValueChange={(value) =>
                                  setPDFParams({
                                    ...pdfParams,
                                    fontStyle: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-full bg-background/50 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                  <SelectValue placeholder="Select font style" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FONTS.map((font) => (
                                    <SelectItem
                                      key={font.value}
                                      value={font.value}
                                      style={font.style}
                                      className="text-base"
                                    >
                                      {font.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Text Alignment
                              </Label>
                              <Select
                                value={pdfParams.alignment}
                                onValueChange={(value) =>
                                  setPDFParams({
                                    ...pdfParams,
                                    alignment: value as
                                      | "left"
                                      | "center"
                                      | "right"
                                      | "justify",
                                  })
                                }
                              >
                                <SelectTrigger className="h-10 w-full bg-background/50 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                  <SelectValue placeholder="Select alignment" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                  <SelectItem value="justify">
                                    Justify
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Number of Pages
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                  Max 200 pages
                                </span>
                              </div>
                              <div className="flex items-center h-10 space-x-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 shrink-0 rounded-lg border border-border/50 hover:bg-primary/5"
                                  onClick={() =>
                                    setPDFParams((prev) => ({
                                      ...prev,
                                      pages: Math.max(1, prev.pages - 1),
                                    }))
                                  }
                                  disabled={pdfParams.pages <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="relative flex-1">
                                  <input
                                    type="number"
                                    value={pdfParams.pages}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        setPDFParams((prev) => ({
                                          ...prev,
                                          pages: Math.min(
                                            Math.max(1, value),
                                            200
                                          ),
                                        }));
                                      }
                                    }}
                                    className="w-full h-10 px-4 bg-background/50 rounded-lg 
                                             border border-border/50 focus:outline-none focus:ring-2 
                                             focus:ring-primary/50 focus:border-transparent text-center
                                             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                                             [&::-webkit-inner-spin-button]:appearance-none"
                                    min="1"
                                    max="200"
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="text-sm text-muted-foreground">
                                      pages
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 shrink-0 rounded-lg border border-border/50 hover:bg-primary/5"
                                  onClick={() =>
                                    setPDFParams((prev) => ({
                                      ...prev,
                                      pages: Math.min(200, prev.pages + 1),
                                    }))
                                  }
                                  disabled={pdfParams.pages >= 200}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleGenerate}
                      disabled={!pdfParams.prompt.trim() || isGenerating}
                      className="bg-gradient-to-r from-primary to-primary/50 hover:opacity-90 transition-opacity"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {generatedPDF && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">
                            {generatedPDF.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Generated on{" "}
                            {generatedPDF.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/10"
                          onClick={() => setIsPreviewOpen(true)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/10"
                          onClick={() => handleDownload(generatedPDF.url)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {generatedPDF && (
          <PDFViewer
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            pdfUrl={generatedPDF.url}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
