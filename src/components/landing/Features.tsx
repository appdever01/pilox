"use client";

import {
  FileText,
  Image,
  FileOutput,
  Bot,
  Youtube,
  Files,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: Bot,
    title: "PDF Chat (AI)",
    description:
      "Chat with your documents using AI. Generate quizzes and video explanations. Optionally attach on‑chain proofs of comprehension for hackathon showcases.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    route: "/chat",
  },
  {
    icon: Image,
    title: "PDF ↔ Images",
    description:
      "Convert PDFs to images and back. Pin assets to IPFS or keep them local—your choice based on compliance needs.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    route: "/pdf-to-images",
  },
  {
    icon: FileOutput,
    title: "AI PDF Generator",
    description:
      "Turn prompts into beautifully formatted PDFs. Stamp timeproof hashes for tamper‑evident study records.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    route: "/generate-pdf",
  },
  {
    icon: Files,
    title: "Document Converter",
    description:
      "Convert across formats with high fidelity. Produce web3‑ready exports and optional NFT‑certificate bundles for achievements.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    route: "/convert-documents",
  },
  {
    icon: FileText,
    title: "LaTeX Renderer",
    description:
      "Advanced LaTeX with real‑time preview. Ideal for cryptography notes, zero‑knowledge math, and reproducible research PDFs.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    route: "/latex-renderer",
  },
  
  {
    icon: Youtube,
    title: "YouTube Chat",
    description:
      "Engage with videos through AI chat. Earn token‑gated badges by completing on‑chain verified quizzes from content.",
    color: "text-red-500",
    bgColor: "bg-red-50",
    route: "/youtube-chat",
  },
];

export function Features() {
  return (
    <section
      className="relative py-18 bg-white lg:px-20 xl:px-32 mt-20"
      id="tools"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Powerful Web3‑Ready Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tools for Blockchain‑Native Learning
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience AI document tooling with optional IPFS storage, on‑chain proofs, and token‑gated achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className="p-8 rounded-3xl border border-gray-100 h-full 
                            bg-white hover:bg-gray-50/50
                            transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${tool.bgColor} 
                              flex items-center justify-center mb-6`}
                >
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>

                <h3 className="text-xl font-semibold mb-3">{tool.title}</h3>
                <p className="text-muted-foreground mb-6">{tool.description}</p>

                <Link href={tool.route} passHref>
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-200 hover:border-gray-300 hover:bg-transparent
                             transition-colors duration-300 group/button w-full"
                  >
                    Try it out
                    <ArrowRight
                      className="w-4 h-4 ml-2 transition-transform duration-300 
                                       group-hover/button:translate-x-1"
                    />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>
    </section>
  );
}
