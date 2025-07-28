"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Loader2,
  LayoutDashboard,
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  Download,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MathJax } from "better-react-mathjax";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addWatermark, addFooter, formatPDFText, willContentFitOnPage, processMathForPDF } from "@/components/shared/pdfHelpers";

interface FlashcardsProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  pdfName?: string;
  totalPages: number;
}

interface FlashcardQuestion {
  question: string;
  answer: string;
  detailed_explanation: string;
  page: number;
}

interface FlashcardResponse {
  status: "success" | "error";
  message: string;
  data: {
    flashcard: {
      questions: FlashcardQuestion[];
    };
  };
}

const LoadingCards = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
      <div className="relative">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-48 h-64 bg-card rounded-xl border shadow-sm"
            initial={{ rotate: 0, y: 0 }}
            animate={{
              rotate: [-2, 2][i % 2],
              y: i * -4,
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          repeatType: "reverse",
        }}
        className="text-lg text-muted-foreground font-medium"
      >
        Generating Flashcards
      </motion.p>
    </div>
  );
};

const processLatexContent = (content: string | undefined) => {
  if (!content) return '';
  
  return content
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\pm/g, "±")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
};

export function Flashcards({
  isOpen,
  onClose,
  pdfUrl,
  pdfName,
  totalPages,
}: FlashcardsProps) {
  const [numCards, setNumCards] = useState(10);
  const [startPage, setStartPage] = useState<number | string>(1);
  const [endPage, setEndPage] = useState<number | string>(totalPages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSelector, setShowSelector] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardQuestion[]>([]);

  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  useEffect(() => {
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowSelector(true);
    setIsGenerating(false);
    setStartPage(1);
    setEndPage(totalPages);
  }, [pdfUrl, totalPages]);

  const handleGenerate = async () => {
    if (!pdfUrl) {
      toast.error("No PDF URL provided");
      return;
    }

    setIsGenerating(true);
    setShowSelector(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.GENERATE_FLASHCARDS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.getToken()}`,
          },
          body: JSON.stringify({
            pdfUrl,
            numQuestions: numCards,
            startPage,
            endPage,
          }),
        }
      );

      const data: FlashcardResponse = await response.json();

      if (data.status === "error") {
        throw new Error(data.message);
      }

      setFlashcards(data.data.flashcard.questions);
      setCurrentCardIndex(0);
      setShowSelector(false);
      setIsFlipped(false);
      toast.success("Flashcards generated successfully!");
    } catch (error) {
      toast.error("Failed to generate flashcards");
      setShowSelector(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(
        (prev) => (prev - 1 + flashcards.length) % flashcards.length
      );
    }, 200);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    const title = `Flashcards ${pdfName ? `- ${pdfName}` : ''}`;
    doc.text(title, 20, 20);
    
    let yPosition = 40;
    
    flashcards.forEach((card, index) => {
      addWatermark(doc);
      
      // Process content for PDF
      const processedQuestion = processMathForPDF(card.question);
      const processedAnswer = processMathForPDF(card.answer);
      const processedExplanation = card.detailed_explanation ? processMathForPDF(card.detailed_explanation) : '';
      
      // Format content
      const cardTitle = formatPDFText(doc, `Card ${index + 1}:`, true);
      const questionTitle = formatPDFText(doc, 'Question:', true);
      const questionText = formatPDFText(doc, processedQuestion);
      const answerTitle = formatPDFText(doc, 'Answer:', true);
      const answerText = formatPDFText(doc, processedAnswer);
      const explanationTitle = card.detailed_explanation ? formatPDFText(doc, 'Detailed Explanation:', true) : [];
      const explanationText = card.detailed_explanation ? formatPDFText(doc, processedExplanation) : [];
      
      const totalContentHeight = 
        (cardTitle.length + questionTitle.length + questionText.length + 
         answerTitle.length + answerText.length + 
         explanationTitle.length + explanationText.length) * 7 + 50;
      
      if (!willContentFitOnPage(doc, totalContentHeight, yPosition)) {
        addFooter(doc);
        doc.addPage();
        yPosition = 20;
        addWatermark(doc);
      }
      
      // Card number
      doc.setFont('helvetica', 'bold');
      doc.text(cardTitle, 20, yPosition);
      yPosition += cardTitle.length * 7 + 10;
      
      // Question
      doc.text(questionTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(questionText, 20, yPosition);
      yPosition += questionText.length * 7 + 15;
      
      // Answer
      doc.setFont('helvetica', 'bold');
      doc.text(answerTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(answerText, 20, yPosition);
      yPosition += answerText.length * 7 + 15;
      
      // Explanation if exists
      if (card.detailed_explanation) {
        doc.setFont('helvetica', 'bold');
        doc.text(explanationTitle, 20, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text(explanationText, 20, yPosition);
        yPosition += explanationText.length * 7 + 20;
      }
    });
    
    addFooter(doc);
    doc.save(`flashcards${pdfName ? `-${pdfName}` : ''}.pdf`);
    toast.success("Flashcards downloaded successfully!");
  };

  const isGenerateDisabled = () => {
    const start = parseInt(startPage.toString());
    const end = parseInt(endPage.toString());
    return isNaN(start) || isNaN(end) || end < start || endPage === '' || startPage === '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div className="relative w-[90vw] max-w-[500px] h-[85vh] bg-background rounded-lg shadow-lg flex flex-col z-50">
          {isGenerating ? (
            <LoadingCards />
          ) : showSelector ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-semibold text-lg">Generate Flashcards</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowSelector(true);
                      setFlashcards([]);
                    }}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    title="Generate New Flashcards"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div className="bg-accent/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">Flashcard Settings</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Number of Flashcards
                        </label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setNumCards(Math.max(1, numCards - 1))}
                            disabled={numCards <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <input
                            type="number"
                            value={numCards}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value)) {
                                setNumCards(Math.min(Math.max(1, value), 30));
                              }
                            }}
                            className="w-20 h-10 text-center border rounded-md"
                            min="1"
                            max="30"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setNumCards(Math.min(30, numCards + 1))}
                            disabled={numCards >= 30}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Maximum 30 flashcards
                          </p>
                          <p className="text-sm text-primary">
                            Cost: {(numCards * 0.01).toFixed(2)} credits
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Page Range (Total Pages: {totalPages})
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="number"
                              value={startPage}
                              onChange={(e) => {
                                const value = e.target.value;
                                setStartPage(value === '' ? '' : Math.max(1, parseInt(value)));
                              }}
                              onBlur={() => {
                                setStartPage(prev => 
                                  prev === '' ? 1 : Math.min(Math.max(1, parseInt(prev.toString())), parseInt(endPage.toString()))
                                );
                              }}
                              className="w-full h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                              min="1"
                              max={endPage}
                              placeholder="Start"
                            />
                          </div>
                          <span className="text-muted-foreground">to</span>
                          <div className="flex-1">
                            <input
                              type="number"
                              value={endPage}
                              onChange={(e) => {
                                const value = e.target.value;
                                setEndPage(value === '' ? '' : Math.min(Math.max(parseInt(value), parseInt(startPage.toString())), totalPages));
                              }}
                              onBlur={() => {
                                setEndPage(prev => 
                                  prev === '' ? totalPages : Math.min(Math.max(parseInt(startPage.toString()), parseInt(prev.toString())), totalPages)
                                );
                              }}
                              className="w-full h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                              min={startPage}
                              max={totalPages}
                              placeholder="End"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Select pages to generate flashcards from
                        </p>
                      </div>
                    </div>
                  </div>
                   <Alert variant="default">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Note: Flashcards are not saved permanently. Please download
                          them before closing or reloading the page.
                        </AlertDescription>
                      </Alert>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-background/95 backdrop-blur">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  disabled={isGenerateDisabled()}
                >
                  <LayoutDashboard className="w-5 h-5 mr-1" />
                  Generate Flashcards
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-semibold text-lg">Flashcards</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowSelector(true);
                      setFlashcards([]);
                    }}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    title="Generate New Flashcards"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    title="Download Flashcards"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm text-muted-foreground text-center mb-4">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    className="relative w-full min-h-[300px] sm:min-h-[400px] perspective-1000 overflow-hidden"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {[
                      ...Array(
                        Math.min(3, flashcards.length - currentCardIndex - 1)
                      ),
                    ].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border shadow-sm"
                        style={{
                          transform: `translate(${(i + 1) * 2}px, ${(i + 1) * 2}px)`,
                          zIndex: -10 - i,
                        }}
                      />
                    ))}

                    <motion.div
                      initial={{
                        x: slideDirection === "right" ? 300 : -300,
                        opacity: 0,
                        rotateY: 0,
                      }}
                      animate={{
                        x: 0,
                        opacity: 1,
                        rotateY: isFlipped ? 180 : 0,
                      }}
                      exit={{
                        x: slideDirection === "right" ? -300 : 300,
                        opacity: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                      className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
                    >
                      {/* Front of card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-background to-background/95 p-6 sm:p-8 rounded-xl border shadow-lg flex flex-col items-center justify-center text-center backface-hidden">
                        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            Question
                          </span>
                        </div>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-8 sm:mt-10 text-base sm:text-xl font-medium max-w-md overflow-y-auto max-h-[60vh] sm:max-h-[50vh]"
                        >
                          <MathJax dynamic>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: processLatexContent(
                                  flashcards[currentCardIndex]?.question
                                ),
                              }}
                            />
                          </MathJax>
                        </motion.div>
                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute bottom-6 text-xs sm:text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span>Click to flip and see answer</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </motion.p>
                      </div>

                      {/* Back of card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95 p-6 sm:p-8 rounded-xl border shadow-lg flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] backface-hidden">
                        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            Answer
                          </span>
                        </div>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-8 sm:mt-10 space-y-4 w-full max-w-md overflow-y-auto max-h-[60vh] sm:max-h-[50vh]"
                        >
                          <div>
                            <MathJax dynamic>
                              <div
                                className="text-sm sm:text-lg font-medium"
                                dangerouslySetInnerHTML={{
                                  __html: processLatexContent(
                                    flashcards[currentCardIndex]?.answer
                                  ),
                                }}
                              />
                            </MathJax>
                          </div>
                          <div>
                            <MathJax dynamic>
                              <div
                                className="text-xs sm:text-sm text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                  __html: processLatexContent(
                                    flashcards[currentCardIndex]?.detailed_explanation
                                  ),
                                }}
                              />
                            </MathJax>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                    className="flex items-center gap-2 transition-all hover:gap-3"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="flex items-center gap-2 transition-all hover:gap-3"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
