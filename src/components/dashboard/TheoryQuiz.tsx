import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Lightbulb, X as CloseIcon, Loader2, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import AuthApiClient from "@/lib/auth-api-client";
import { API_ROUTES } from "@/lib/config";
import { toast } from "sonner";
import { MathJax } from "better-react-mathjax";
import jsPDF from "jspdf";
import { addWatermark, addFooter, processMathForPDF, willContentFitOnPage, formatPDFText } from "@/components/shared/pdfHelpers";

interface TheoryQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  page: number;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

interface TheoryQuizProps {
  questions: TheoryQuestion[];
  onClose: () => void;
  onNewQuiz: () => void;
  pdfUrl: string;
  pdfName?: string;
}

export function TheoryQuiz({ questions, onClose, onNewQuiz, pdfUrl, pdfName }: TheoryQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<TheoryQuestion[]>(questions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const currentQuestion = answers[currentIndex];
  const answeredQuestions = answers.filter(q => q.score !== undefined).length;
  const progress = (answeredQuestions / answers.length) * 100;

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-lg text-muted-foreground font-medium">No questions available</p>
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    setAnswers(prev => prev.map((q, idx) => 
      idx === currentIndex ? { ...q, userAnswer: answer } : q
    ));
    setShowAnswer(false);
  };

  const handleSubmit = async () => {
    if (!currentQuestion.userAnswer?.trim()) return;
    
    setIsSubmitting(true);
    try {
      const data = await AuthApiClient.post<{
        status: string;
        message: string;
        data: {
          evaluation: {
            score: number;
            feedback: string;
            correctAnswer: string;
          };
        };
      }>(API_ROUTES.VERIFY_THEORY_ANSWER, {
        pdfUrl,
        question: {
          question: currentQuestion.question,
          modelAnswer: currentQuestion.modelAnswer,
        },
        userAnswer: currentQuestion.userAnswer,
      });

      if (data.status === "success") {
        setAnswers(prev => prev.map((q, idx) => 
          idx === currentIndex 
            ? { 
                ...q, 
                score: data.data.evaluation.score,
                feedback: data.data.evaluation.feedback,
              }
            : q
        ));
        setShowAnswer(true);
        
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to verify answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleClose = () => {
    const stateToSave = {
      currentIndex,
      answers,
      showAnswer,
      isSubmitting
    };
    localStorage.setItem('theoryQuizState', JSON.stringify(stateToSave));
    onClose();
  };

  useEffect(() => {
    const savedState = localStorage.getItem('theoryQuizState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setCurrentIndex(parsed.currentIndex);
      setAnswers(parsed.answers);
      setShowAnswer(parsed.showAnswer);
      setIsSubmitting(parsed.isSubmitting);
    }
  }, []);

  const handleDownload = () => {
    const answeredQuestions = answers.filter(q => q.score !== undefined);
    
    if (answeredQuestions.length === 0) {
      toast.error("Please answer at least one question before downloading");
      return;
    }

    if (answeredQuestions.length < answers.length) {
      toast.warning("Only answered questions will be included in the download");
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    const title = `Theory Quiz ${pdfName ? `- ${pdfName}` : ''}`;
    doc.text(title, 20, 20);
    
    let yPosition = 40;
    
    answeredQuestions.forEach((question, index) => {
      addWatermark(doc);
      
      // Format question with title styling
      const questionTitle = formatPDFText(doc, `Question ${index + 1}:`, true);
      const questionText = formatPDFText(doc, question.question);
      const userAnswerTitle = formatPDFText(doc, 'Your Answer:', true);
      const userAnswerText = formatPDFText(doc, question.userAnswer || '');
      const scoreTitle = formatPDFText(doc, 'Score:', true);
      const feedbackTitle = formatPDFText(doc, 'Feedback:', true);
      const feedbackText = formatPDFText(doc, question.feedback || '');
      
      const totalContentHeight = 
        (questionTitle.length + questionText.length + 
         userAnswerTitle.length + userAnswerText.length +
         scoreTitle.length + feedbackTitle.length + feedbackText.length) * 7 + 60;
      
      if (!willContentFitOnPage(doc, totalContentHeight, yPosition)) {
        addFooter(doc);
        doc.addPage();
        yPosition = 20;
        addWatermark(doc);
      }
      
      // Question
      doc.setFont('helvetica', 'bold');
      doc.text(questionTitle, 20, yPosition);
      yPosition += questionTitle.length * 7 + 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(questionText, 20, yPosition);
      yPosition += questionText.length * 7 + 15;
      
      // User Answer
      doc.setFont('helvetica', 'bold');
      doc.text(userAnswerTitle, 20, yPosition);
      yPosition += userAnswerTitle.length * 7 + 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(userAnswerText, 20, yPosition);
      yPosition += userAnswerText.length * 7 + 15;
      
      // Score
      doc.setFont('helvetica', 'bold');
      doc.text(scoreTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${question.score}%`, 20, yPosition);
      yPosition += 15;
      
      // Feedback
      doc.setFont('helvetica', 'bold');
      doc.text(feedbackTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(feedbackText, 20, yPosition);
      yPosition += feedbackText.length * 7 + 20;
    });
    
    addFooter(doc);
    doc.save(`theory-quiz${pdfName ? `-${pdfName}` : ''}.pdf`);
    toast.success("Quiz downloaded successfully!");
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
      <div className="p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base md:text-xl">Theory Quiz</h2>
            <div className="flex items-center gap-[5px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 rounded-full hover:bg-accent"
                title="Download Quiz"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewQuiz}
                className="h-8 rounded-full hover:bg-accent"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 rounded-full hover:bg-accent"
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-accent/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-medium">
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>
              <div className="relative flex-1 h-1.5 bg-accent/30 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((currentIndex + 1) / questions.length) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <MathJax>
                <h3 className="text-sm md:text-base">{currentQuestion.question}</h3>
              </MathJax>

              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[150px] md:min-h-[200px] text-xs md:text-sm"
                value={currentQuestion.userAnswer || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                disabled={!!currentQuestion.score}
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !currentQuestion.userAnswer?.trim() || !!currentQuestion.score}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </Button>

              {currentQuestion.score !== undefined && (
                <div className="space-y-3 md:space-y-4 mt-4 md:mt-6">
                  <div className="p-3 md:p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm md:text-base font-medium">Score</h4>
                      <span className="text-primary font-medium">{currentQuestion.score}%</span>
                    </div>
                    <MathJax>
                      <p className="text-xs md:text-sm text-muted-foreground">{currentQuestion.feedback}</p>
                    </MathJax>
                  </div>

                  <div>
                    <h4 className="text-sm md:text-base font-medium mb-2">Answer</h4>
                    <MathJax>
                      <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">
                        {currentQuestion.modelAnswer}
                      </p>
                    </MathJax>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex justify-between max-w-md mx-auto">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base"
          >
            <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
            Previous
          </Button>

          <Button
            onClick={currentIndex === answers.length - 1 ? onClose : handleNext}
            className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base"
          >
            {currentIndex === answers.length - 1 ? "Finish" : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
