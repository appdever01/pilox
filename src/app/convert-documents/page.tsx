"use client";

import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { convertDocument } from "@/lib/documentConverter";
import {
  Upload,
  FileType,
  Download,
  File,
  Loader2,
  FileText,
  Book,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFeatureEnabled, getMaintenanceMessage } from "@/lib/feature-flags";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

interface ConvertedFile {
  id: string;
  name: string;
  format: string;
  size: string;
  status: "processing" | "completed";
  url?: string;
}

interface FormatOption {
  value: string;
  label: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ext === "epub" ? "epub" : ext;
};

const getAvailableTargetFormats = (sourceFormat: string): FormatOption[] => {
  const formats: { [key: string]: FormatOption[] } = {
    pdf: [
      { value: "docx", label: "Word Document (.docx)" },
      { value: "txt", label: "Text File (.txt)" },
      { value: "epub", label: "EPUB (.epub)" },
    ],
    docx: [
      { value: "pdf", label: "PDF Document (.pdf)" },
      { value: "txt", label: "Text File (.txt)" },
    ],
    txt: [
      { value: "pdf", label: "PDF Document (.pdf)" },
      { value: "docx", label: "Word Document (.docx)" },
    ],
    epub: [{ value: "pdf", label: "PDF Document (.pdf)" }],
  };

  return formats[sourceFormat.toLowerCase()] || [];
};

const acceptedFileTypes = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
  "application/epub+zip": [".epub"],
};

const validateFile = (file: File) => {
  const validTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/epub+zip",
  ];

  if (!validTypes.includes(file.type)) {
    toast.error(
      "Invalid file type. Please upload a PDF, DOCX, TXT, or EPUB file."
    );
    return false;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size should be less than 10MB");
    return false;
  }

  return true;
};

export default function ConvertPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const isConversionEnabled = isFeatureEnabled('DOCUMENT_CONVERSION');
  const maintenanceMessage = getMaintenanceMessage('DOCUMENT_CONVERSION');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setSourceFormat(getFileExtension(file.name));
        setTargetFormat("");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSourceFormat(getFileExtension(file.name));
      setTargetFormat("");
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat || isConverting) return;

    setIsConverting(true);

    try {
      const convertedFile = await convertDocument(
        selectedFile,
        targetFormat,
        sourceFormat
      );

      const baseFileName = convertedFile.filename.replace(
        `.${sourceFormat}`,
        ""
      );
      const newFileName = `${baseFileName}.${targetFormat}`;

      const newConvertedFile: ConvertedFile = {
        id: crypto.randomUUID(),
        name: newFileName,
        format: targetFormat.toUpperCase(),
        size: formatFileSize(convertedFile.blob.size),
        status: "completed" as const,
        url: URL.createObjectURL(convertedFile.blob),
      };

      setConvertedFiles((prev) => [newConvertedFile, ...prev]);

      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background/95">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-16">
        <div className="text-center space-y-2 sm:space-y-4 mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent !leading-tight">
            Convert Documents
          </h1>
          <p className="text-lg sm:text-2xl text-muted-foreground/80">
            Convert between PDF, DOCX, TXT, and EPUB formats
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs sm:text-sm mt-3">
            <span className="px-2 py-0.5 rounded-full bg-primary/10">
              PDF ↔ DOCX
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10">
              PDF ↔ TXT
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10">
              PDF ↔ EPUB
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10">
              DOCX ↔ TXT
            </span>
          </div>
        </div>

        {!isConversionEnabled && maintenanceMessage && (
          <div className="max-w-2xl mx-auto mb-8">
            <MaintenanceBanner message={maintenanceMessage} />
          </div>
        )}

        <div className={!isConversionEnabled ? "opacity-50 pointer-events-none" : ""}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop as unknown as React.DragEventHandler<HTMLDivElement>}
            className={`
              relative border-2 border-dashed rounded-xl transition-all duration-300
              ${isDragging ? "border-primary/80 bg-primary/5" : "border-muted-foreground/20"}
              p-6 sm:p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10
              group h-[250px] sm:h-[300px] max-w-2xl mx-auto flex flex-col items-center justify-center
            `}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt,.epub"
            />
            <div className="space-y-3 sm:space-y-4">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center
                          transition-transform duration-300 group-hover:scale-110"
              >
                {selectedFile ? (
                  <File className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-primary/80" />
                ) : (
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-primary/80" />
                )}
              </div>
              <div>
                <p className="text-lg sm:text-xl font-medium">
                  {isDragging
                    ? "Drop file here"
                    : selectedFile
                      ? selectedFile.name
                      : "Upload Document"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {selectedFile
                    ? "Click to choose a different file"
                    : "Drag and drop or click to browse • Supports "}
                  {!selectedFile && (
                    <span className="text-primary font-medium">
                      PDF, DOCX, TXT, EPUB
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-12 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center px-3"
            >
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select target format" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTargetFormats(sourceFormat).map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleConvert}
                  disabled={isConverting || !targetFormat}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileType className="w-4 h-4 mr-1.5" />
                      Convert Now
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {convertedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mt-16 space-y-4 px-3"
              >
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Converted Files
                </h2>

                <div className="space-y-3">
                  {convertedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card/30 backdrop-blur-sm border border-muted-foreground/10 rounded-xl p-3 sm:p-4
                               flex items-center justify-between hover:bg-card/40 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          {file.format.toLowerCase() === "pdf" && (
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                          {file.format.toLowerCase() === "docx" && (
                            <File className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                          {file.format.toLowerCase() === "txt" && (
                            <FileType className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                          {file.format.toLowerCase() === "epub" && (
                            <Book className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium truncate max-w-[180px] sm:max-w-[300px]">
                            {file.name}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground/80">
                            {file.size} • {file.format}
                          </p>
                        </div>
                      </div>

                      {file.status === "processing" ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/90 hover:bg-primary/10"
                          onClick={() => {
                            if (!file.url) return;
                            const link = document.createElement("a");
                            link.href = file.url;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Download
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
