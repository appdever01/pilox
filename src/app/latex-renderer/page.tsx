"use client";

import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Eraser, Loader2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MathJax, MathJaxContext } from "better-react-mathjax";

export default function LatexRendererPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const config = {
    loader: { load: ["input/asciimath", "output/svg"] },
    tex: {
      inlineMath: [["$", "$"]],
      displayMath: [["$$", "$$"]],
      processEscapes: true,
    },
  };

  const handleRender = async () => {
    if (!input.trim()) {
      toast.error("Please enter LaTeX code");
      return;
    }

    setLoading(true);
    try {
      const mathInput = input.trim().startsWith("$") ? input : `$$${input}$$`;
      setOutput(mathInput);
      toast.success("LaTeX rendered successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to render LaTeX");
      setOutput(`<span class="text-red-500">Error: ${error.message}</span>`);
    } finally {
      setLoading(false);
    }
  };

  const exportAsImage = async () => {
    setExporting(true);
    try {
      // Ensure MathJax has finished rendering
      await (window as any).MathJax.typesetPromise?.();

      const element = document.querySelector(".latex-output") as HTMLElement;
      if (!element) return;

      // Create a clone for better handling
      const clone = element.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.padding = "40px";
      clone.style.backgroundColor = "white";
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.height = `${element.offsetHeight}px`;

      // Try vector format first
      try {
        const dataUrl = await htmlToImage.toSvg(clone, {
          backgroundColor: "white",
          width: element.offsetWidth,
          height: element.offsetHeight,
          style: {
            margin: "40px",
            transform: "scale(1)",
            transformOrigin: "center center",
            fontSize: "16px",
          },
          quality: 1,
          pixelRatio: 3,
        });

        const link = document.createElement("a");
        link.download = "latex-equation.svg";
        link.href = dataUrl;
        link.click();

        document.body.removeChild(clone);
        toast.success("Image downloaded successfully!");
      } catch (svgError) {
        // Fallback to PNG with high quality
        console.warn("SVG export failed, trying PNG:", svgError);
        const pngData = await htmlToImage.toPng(clone, {
          backgroundColor: "white",
          width: element.offsetWidth,
          height: element.offsetHeight,
          style: {
            margin: "40px",
            transform: "scale(1)",
            transformOrigin: "center center",
            fontSize: "16px",
          },
          quality: 1,
          pixelRatio: 3,
          canvasWidth: element.offsetWidth * 3,
          canvasHeight: element.offsetHeight * 3,
        });

        const link = document.createElement("a");
        link.download = "latex-equation.png";
        link.href = pngData;
        link.click();

        document.body.removeChild(clone);
        toast.success("Image downloaded successfully!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export image");
    } finally {
      setExporting(false);
    }
  };

  return (
    <MathJaxContext config={config}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-10 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 md:space-y-4 mb-16"
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              LaTeX Renderer
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground/80">
              Transform your LaTeX equations into beautiful rendered mathematics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Input LaTeX</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your LaTeX code here..."
                  className="min-h-[300px] font-mono"
                />
                <Button
                  className="absolute bottom-4 right-4"
                  onClick={handleRender}
                  disabled={loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {exporting ? <Loader2 className="w-4 h-4" /> : "Render"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Rendered Output</h2>
              </div>
              <div className="latex-output min-h-[300px] p-8 bg-white rounded-lg border border-border/50 shadow-sm flex items-center justify-center">
                <div className="max-w-full">
                  <MathJax dynamic>{output}</MathJax>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}
