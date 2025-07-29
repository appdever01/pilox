export const seoConfig = {
  default: {
    title: "PILOX - Free PDF Tools & AI Document Assistant",
    description: "Access powerful free tools: LaTeX renderer, PDF converters, and document management. Upgrade for AI features like document chat, quiz generation, and video explanations.",
    images: [
      {
        url: "/pilox.png",
        width: 1200,
        height: 630,
        alt: "PILOX - Document Tools & AI Assistant",
      },
    ],
  },
  
  routes: {
    "/": {
      title: "PILOX - Free PDF Tools & AI Document Assistant",
      description: "Access powerful free tools: LaTeX renderer, PDF converters, and document management. Upgrade for AI features like document chat, quiz generation, and video explanations.",
    },
    
    "/chat": {
      title: "PILOX Chat - AI-Powered PDF Document Assistant",
      description: "Chat with your PDF documents using advanced AI. Get instant answers, generate quizzes, and create explanatory videos from your documents.",
    },
    
    "/youtube-chat": {
      title: "PILOX YouTube Chat - AI Video Analysis & Insights",
      description: "Analyze YouTube videos with AI. Get summaries, key points, and engage in meaningful conversations about video content.",
    },
    
    "/pdf-to-images": {
      title: "Convert PDF to Images - Free PDF to Image Converter | PILOX",
      description: "Convert PDF files to high-quality images or combine multiple images into professional PDF documents. Free and easy to use.",
    },
    
    "/generate-pdf": {
      title: "AI PDF Generator - Create PDFs from Text | PILOX",
      description: "Transform text into professionally formatted PDFs using AI. Create documents, reports, and more with our advanced PDF generator.",
    },
    
    "/convert-documents": {
      title: "Document Converter - Convert Between Multiple Formats | PILOX",
      description: "Convert documents between various formats while maintaining perfect formatting. Support for all major document types.",
    },
    
    "/latex-renderer": {
      title: "Free LaTeX Renderer - Online LaTeX Editor | PILOX",
      description: "Free online LaTeX renderer with real-time preview. Support for mathematical equations and advanced document formatting.",
    },
  },
} as const; 