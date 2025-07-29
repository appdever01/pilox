"use client";

import {
  X,
  Upload,
  Loader2,
  FileText,
  FileOutput,
  GripVertical,
} from "lucide-react";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function ImageToPDFPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [filename, setFilename] = useState("pilox_combined");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    const toastId = toast.loading("Converting images to PDF...");

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
      });

      // Process each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Add new page for all images except the first one
        if (i > 0) {
          pdf.addPage();
        }

        // Get image dimensions
        const img = new window.Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = image.preview;
        });

        // Calculate dimensions to fit the page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        let finalWidth = pageWidth;
        let finalHeight = pageWidth / imgRatio;

        if (finalHeight > pageHeight) {
          finalHeight = pageHeight;
          finalWidth = pageHeight * imgRatio;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        pdf.addImage(image.preview, "JPEG", x, y, finalWidth, finalHeight);
      }

      // Save the PDF
      pdf.save(`${filename.trim()}.pdf`);

      toast.dismiss(toastId);
      toast.success("PDF created and downloaded successfully! 🎉");
    } catch (error) {
      console.error("Error converting to PDF:", error);
      toast.dismiss(toastId);
      toast.error("Failed to create PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background/95">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-2 md:space-y-4 mb-16">
          <h1 className="text-3xl md:text-5xl !leading-tight font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent ">
            Images to PDF
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80">
            Convert and combine multiple images into a single PDF
          </p>
        </div>

        {images.length > 0 ? (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-xl transition-all duration-300
                ${isDragActive ? "border-primary/80 bg-primary/5" : "border-muted-foreground/20"}
                p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10
                group h-[300px] w-full flex flex-col items-center justify-center
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-6">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center
                            transition-transform duration-300 group-hover:scale-110"
                >
                  <Upload className="w-8 h-8 text-primary group-hover:text-primary/80" />
                </div>
                <div>
                  <p className="text-2xl font-medium">
                    {isDragActive ? "Drop images here" : "Add images"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports PNG, JPG, JPEG, WEBP
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter filename"
                    className="pr-12 w-full"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    .pdf
                  </span>
                </div>
                <Button
                  onClick={handleConvert}
                  disabled={isConverting || !filename.trim()}
                  className="bg-primary hover:bg-primary/90 flex-shrink-0 text-base sm:text-sm"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Converting...</span>
                      <span className="sm:hidden">Convert</span>
                    </>
                  ) : (
                    <>
                      <FileOutput className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Convert to PDF</span>
                      <span className="sm:hidden">Convert</span>
                    </>
                  )}
                </Button>
              </div>

              <p className="text-base sm:text-sm text-muted-foreground mt-2">
                {images.length} image{images.length !== 1 ? "s" : ""} selected
              </p>

              <Reorder.Group
                axis="y"
                values={images}
                onReorder={setImages}
                className="space-y-3"
              >
                {images.map((image) => (
                  <Reorder.Item
                    key={image.id}
                    value={image}
                    className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-3 flex items-center gap-4 cursor-move hover:border-primary/50 transition-colors"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={image.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-xl transition-all duration-300
              ${isDragActive ? "border-primary/80 bg-primary/5" : "border-muted-foreground/20"}
              p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/10
              group h-[300px] max-w-4xl mx-auto w-full flex flex-col items-center justify-center
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-6">
              <div
                className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center
                          transition-transform duration-300 group-hover:scale-110"
              >
                <Upload className="w-8 h-8 text-primary group-hover:text-primary/80" />
              </div>
              <div>
                <p className="text-2xl font-medium">
                  {isDragActive ? "Drop images here" : "Add images"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PNG, JPG, JPEG, WEBP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

