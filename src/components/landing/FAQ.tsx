"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What tools does PILOX offer?",
      answer:
        "PILOX offers a comprehensive suite of tools including Smart PDF Viewer, PDF Chat, PDF ↔ Images conversion, AI PDF Generator, Document Converter, and YouTube Chat. Each tool is designed to enhance your document interaction experience.",
    },
    {
      question: "How does the credit system work?",
      answer:
        "New users receive 15 free credits upon signup. Premium features require credits: AI PDF Generation (2 credits), PDF Analysis (2 credits), PDF Quiz Generation (2 credits), PDF Video Explanations (3 credits), and YouTube Video Analysis (3 credits). You can purchase additional credits anytime as needed.",
    },
    {
      question: "What types of documents can I convert?",
      answer:
        "Our Document Converter supports multiple formats. You can convert PDFs to images, combine images into PDFs, and process various document formats seamlessly. We handle text-based PDFs, scanned documents, and image-only PDFs.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we prioritize security with enterprise-grade measures. We use encryption for uploads and don't store documents permanently for non-signed-in users. Your documents and privacy are protected throughout the process.",
    },
    {
      question: "How does the YouTube Chat feature work?",
      answer:
        "YouTube Chat allows you to interact with video content using AI. You can analyze videos (3 credits), get detailed explanations of complex topics, and understand key concepts covered in the videos. The analysis includes summaries, key points, and interactive Q&A.",
    },
    {
      question: "What's included in the free plan?",
      answer:
        "The free plan includes Smart PDF Viewer, basic PDF to Images conversion, Images to PDF conversion, Document Format Conversion, 15 free credits for new users, and basic support. You can upgrade anytime to access premium features.",
    },
    {
      question: "Do you offer enterprise solutions?",
      answer:
        "Yes, we provide customized enterprise solutions with unlimited access, priority support, and additional security features. Contact our sales team for tailored pricing and solutions for your organization.",
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
            <span className="block text-blue-500">Questions</span>
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
