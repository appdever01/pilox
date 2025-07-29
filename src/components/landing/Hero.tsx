"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";
import { FileText, Laptop, Bot, Sparkles } from "lucide-react";
import { Users2, Shield, Upload, GripHorizontal } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);
      setIsProcessing(true);

      // Store the file in sessionStorage
      const reader = new FileReader();
      reader.onload = () => {
        // Store file data and metadata
        sessionStorage.setItem("uploadedPDF", reader.result as string);
        sessionStorage.setItem("pdfFileName", file.name);
        sessionStorage.setItem("pdfFileSize", file.size.toString());

        // Redirect to chat page
        router.push("/chat");
      };
      reader.readAsDataURL(file);
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <section className="relative pt-24 md:pt-32">
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-blue-600/90 text-sm font-medium mb-1 flex items-center justify-center gap-1.5 bg-blue-50/50 w-fit mx-auto px-3 py-1.5 rounded-full border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered PDF magic ✨
          </p>

          <div className="mb-1">
            <div className="min-h-[150px] md:min-h-[180px] flex items-center justify-center">
              <TypeAnimation
                sequence={[
                  "Turn Your Photos into PDFs",
                  1000,
                  "Convert PDFs to Images",
                  1000,
                  "Switch Document Formats",
                  1000,
                  "Organize PDF Pages",
                  1000,
                  "Create Study Materials",
                  1000,
                  "Make PDFs Work for You",
                  1000,
                  "Transform with AI Magic",
                  1000,
                  "Your PDF Assistant",
                  1000,
                ]}
                wrapper="h1"
                speed={50}
                repeat={Infinity}
                className="text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.3] md:!leading-normal bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent max-w-[90vw] text-center"
              />
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 md:mb-12">
            Transform your PDF experience with AI-powered intelligence. Upload,
            analyze, and interact with your documents like never before.
          </p>

          <div className="flex flex-row items-center justify-center gap-2 mb-16">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
              <Users2 className="w-4 h-4  text-blue-600" />
              <span className="text-sm sm:text-sm text-gray-600">
                10k+ users
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
              <Shield className="w-4 h-4  text-blue-600" />
              <span className="text-sm sm:text-sm text-gray-600">
                Enterprise security
              </span>
            </div>
          </div>

         
          <div className="relative max-w-4xl mx-auto mt-20 mb-24 h-100 hidden md:block">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 px-16">
              <div className="relative animate-fade-in">
                <div className="w-28 md:w-32 h-36 md:h-40 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg transform -rotate-6 border-4 border-blue-500/20 animate-float">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-10 md:w-12 h-10 md:h-12 text-blue-600/60" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                  <GripHorizontal className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                </div>
              </div>

              <div className="hidden md:block flex-1 mx-4">
                <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 relative animate-flow-right">
                  <div className="absolute -top-1 right-0 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                  <div className="absolute -top-1 left-0 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="px-3 py-1 bg-blue-100 rounded-full">
                      <span className="text-xs text-blue-700 font-medium">
                        Processing
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative animate-fade-in animation-delay-500">
                <div className="w-32 md:w-40 h-28 md:h-32 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-4 border-blue-500/20 animate-brighten animation-delay-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Laptop className="w-14 md:w-16 h-14 md:h-16 text-blue-600/60" />
                  </div>
                </div>
              </div>

              <div className="hidden md:block flex-1 mx-4">
                <div className="h-0.5 bg-gradient-to-r from-blue-600 to-blue-600 relative animate-flow-right animation-delay-2000">
                  <div className="absolute -top-1 right-0 w-2 h-2 bg-blue-600 rounded-full animate-ping animation-delay-2000" />
                  <div className="absolute -top-1 left-0 w-2 h-2 bg-blue-600 rounded-full animate-ping animation-delay-2000" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="px-3 py-1 bg-blue-100 rounded-full">
                      <span className="text-xs text-blue-700 font-medium">
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative animate-fade-in animation-delay-2500">
                <div className="w-32 md:w-36 h-32 md:h-36 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border-4 border-blue-500/20 animate-shake animation-delay-3000">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="w-14 md:w-16 h-14 md:h-16 text-blue-600/60" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 md:w-8 h-6 md:h-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse animation-delay-3000">
                    <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob pointer-events-none" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
