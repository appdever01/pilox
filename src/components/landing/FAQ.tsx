"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What blockchain + AI tools does PILOX offer?",
      answer:
        "PILOX offers Smart PDF Viewer, AI PDF Chat, PDF ↔ Images, AI PDF Generator, and Document Converter, now extended for blockchain edtech: optional IPFS pinning, on‑chain integrity hashes, verifiable credentials for learning milestones, and token‑gated content flows.",
    },
    {
      question: "How does the credit system work with web3 options?",
      answer:
        "New users receive 15 free credits upon signup. Premium features use credits: AI PDF Generation (2), PDF Analysis (2), Quiz Generation (2), Video Explanations (3), YouTube Analysis (3). For hackathons, you can issue optional on‑chain proofs for completed tasks without requiring crypto wallets for basic usage.",
    },
    {
      question: "What types of documents can I convert and anchor on‑chain?",
      answer:
        "Convert PDFs to images and back, merge, and rearrange. For integrity, you can create a content hash that can be written on‑chain while the file itself stays private or stored on IPFS according to your policy.",
    },
    {
      question: "Is my data secure and how does blockchain help?",
      answer:
        "Yes. We use enterprise‑grade security and do not permanently store documents for non‑signed‑in users. Blockchain features are opt‑in: we record only minimal hashes/claims for verifiability. Sensitive files can remain off‑chain with encryption.",
    },
    {
      question: "How does YouTube Chat support blockchain learning?",
      answer:
        "Analyze videos (3 credits), get key insights, and generate quizzes. Earn verifiable credentials or badges for completed modules that can be checked on‑chain by judges or institutions.",
    },
    {
      question: "What's included in the free plan?",
      answer:
        "Free includes Smart PDF Viewer, basic PDF ↔ Images, Document Conversion, 15 free credits, and basic support. Web3 features are optional and can be demonstrated in hackathons without requiring payments or wallets.",
    },
    {
      question: "Do you offer enterprise or academic credentials solutions?",
      answer:
        "Yes. We support institution‑level verifiable credentials (VCs), DID methods, audit logs with on‑chain anchors, private storage, and custom governance for course completion proofs.",
    },
  ];

  return (
    <section className="relative py-20 bg-gray-50 lg:px-20 xl:px-32" id="faq">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 text-sm font-medium mb-8">
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold">
            Frequently Asked
            <span className="block text-blue-500">Blockchain Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                <span
                  className="text-2xl text-blue-600 transition-transform duration-200"
                  style={{
                    transform:
                      openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              <div
                className={`transition-all duration-200 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
