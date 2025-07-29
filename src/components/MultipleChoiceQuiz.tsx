import { useState } from "react";
import { motion } from "framer-motion";
import { MathJax } from "better-react-mathjax";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  X,
  Plus,
  Download,
  X as CloseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { addWatermark, addFooter, formatPDFText, willContentFitOnPage } from "@/components/shared/pdfHelpers";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isChecked?: boolean;
}

interface MultipleChoiceQuizProps {
  questions: QuizQuestion[];
  onClose: () => void;
  onNewQuiz: () => void;
  pdfName?: string;
}

const processLatexContent = (content: string) => {
  if (!content) return '';
  return content
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\pm/g, "±")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
};

export function MultipleChoiceQuiz({ questions, onClose, onNewQuiz, pdfName }: MultipleChoiceQuizProps) {
  const [checkAtEnd, setCheckAtEnd] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(questions);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const answeredQuestions = quizQuestions.filter((q) => q.userAnswer).length;
  const correctAnswers = quizQuestions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[currentQuestionIndex].userAnswer = answer;
    setQuizQuestions(updatedQuestions);

    if (!checkAtEnd) {
      handleCheckAnswer(answer);
    }
  };

  const handleCheckAnswer = (selectedAnswer?: string) => {
    const updatedQuestions = [...quizQuestions];
    const answerToCheck = selectedAnswer ?? updatedQuestions[currentQuestionIndex].userAnswer;
    
    if (answerToCheck) {
      updatedQuestions[currentQuestionIndex].isChecked = true;
      setQuizQuestions(updatedQuestions);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    const title = `Multiple Choice Quiz ${pdfName ? `- ${pdfName}` : ''}`;
    doc.text(title, 20, 20);
    
    let yPosition = 40;
    
    quizQuestions.forEach((question, index) => {
      addWatermark(doc);
      
      // Format content
      const questionTitle = formatPDFText(doc, `Question ${index + 1}:`, true);
      const questionText = formatPDFText(doc, question.question);
      const optionsText = question.options.map((option, idx) => 
        formatPDFText(doc, `${String.fromCharCode(65 + idx)}. ${option}`)
      );
      const answerTitle = formatPDFText(doc, 'Correct Answer:', true);
      const explanationTitle = question.explanation ? formatPDFText(doc, 'Explanation:', true) : [];
      const explanationText = question.explanation ? formatPDFText(doc, question.explanation) : [];
      
      const totalContentHeight = 
        (questionTitle.length + questionText.length + optionsText.reduce((sum, opt) => sum + opt.length, 0) + 
         answerTitle.length + explanationTitle.length + explanationText.length) * 7 + 50;
      
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
      
      // Options
      optionsText.forEach(optionLines => {
        doc.text(optionLines, 30, yPosition);
        yPosition += optionLines.length * 7 + 5;
      });
      yPosition += 5;
      
      // Answer
      doc.setFont('helvetica', 'bold');
      doc.text(answerTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(question.correctAnswer, 20, yPosition);
      yPosition += 15;
      
      // Explanation if exists
      if (question.explanation) {
        doc.setFont('helvetica', 'bold');
        doc.text(explanationTitle, 20, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text(explanationText, 20, yPosition);
        yPosition += explanationText.length * 7 + 20;
      }
    });
    
    addFooter(doc);
    doc.save(`multiple-choice-quiz${pdfName ? `-${pdfName}` : ''}.pdf`);
    toast.success("Quiz downloaded successfully!");
  };

  const handleRetakeQuiz = () => {
    const resetQuestions = questions.map(q => ({
      ...q,
      userAnswer: undefined,
      isChecked: false
    }));
    
        setQuizQuestions(resetQuestions);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setCheckAtEnd(false);
  };

  return (
    <>
      {showResults ? (
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-muted-foreground text-lg">Here's how you did</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {correctAnswers}/{totalQuestions}
                </div>
                <p className="text-muted-foreground">Total Score</p>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {correctAnswers}
                </div>
                <p className="text-muted-foreground">Correct Answers</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {totalQuestions - correctAnswers}
                </div>
                <p className="text-muted-foreground">Incorrect Answers</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Question Review</h3>
              {quizQuestions.map((q, index) => (
                <div 
                  key={q.id}
                  className={`rounded-lg border p-6 ${
                    q.userAnswer === q.correctAnswer 
                      ? 'bg-blue-500/5 border-blue-500/20' 
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${q.userAnswer === q.correctAnswer 
                        ? 'bg-blue-500/20 text-blue-600' 
                        : 'bg-red-500/20 text-red-600'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div className="space-y-3 flex-1">
                      <MathJax>
                        <p className="font-medium">{processLatexContent(q.question)}</p>
                      </MathJax>
                      
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Your answer:</span>
                          <span className={`
                            ${q.userAnswer === q.correctAnswer 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                            }
                          `}>
                            <MathJax>{processLatexContent(q.userAnswer || 'Not answered')}</MathJax>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Correct answer:</span>
                          <span className="text-blue-600">
                            <MathJax>{processLatexContent(q.correctAnswer)}</MathJax>
                          </span>
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 mt-1 text-muted-foreground" />
                            <MathJax>
                              <div 
                                className="text-muted-foreground"
                                dangerouslySetInnerHTML={{ 
                                  __html: processLatexContent(q.explanation)
                                }}
                              />
                            </MathJax>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleRetakeQuiz} variant="outline" size="lg">
                Retake Quiz
              </Button>
              <Button onClick={onNewQuiz} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
              <Button onClick={handleDownload} variant="outline" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Results
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base md:text-xl">Multiple Choice Quiz</h2>
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
                    className="h-8 rounded-full hover:bg-accent flex items-center"
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
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="bg-accent/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                    <span className="text-xs md:text-sm font-medium">
                      {currentQuestionIndex + 1}/{totalQuestions}
                    </span>
                  </div>
                  <div className="hidden md:block relative w-[200px] h-1.5 bg-accent/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentQuestionIndex + 1) / totalQuestions * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className={`
                  flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-colors
                  ${checkAtEnd ? 'bg-primary/10 text-primary' : 'bg-accent/30 text-muted-foreground'}
                `}>
                  <Switch
                    checked={checkAtEnd}
                    onCheckedChange={setCheckAtEnd}
                    className={`${checkAtEnd ? 'bg-primary' : 'bg-accent/50'}`}
                  />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                    Check answers at end
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <MathJax>
                <h3 className="text-base md:text-lg font-medium mb-4">
                  {processLatexContent(currentQuestion.question)}
                </h3>
              </MathJax>

              <div className="space-y-2 md:space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    className={`
                      w-full p-3 md:p-4 rounded-lg border text-left text-sm md:text-base transition-all
                      ${currentQuestion.isChecked
                        ? option === currentQuestion.correctAnswer
                          ? 'border-blue-500 bg-blue-500/10 text-blue-700'
                          : option === currentQuestion.userAnswer
                            ? 'border-red-500 bg-red-500/10 text-red-700'
                            : 'border-muted bg-background'
                        : currentQuestion.userAnswer === option
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MathJax>{processLatexContent(option)}</MathJax>
                  </motion.button>
                ))}
              </div>

              {currentQuestion.isChecked && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-lg bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    {currentQuestion.userAnswer === currentQuestion.correctAnswer ? (
                      <Check className="w-5 h-5 text-blue-500 mt-1" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mt-1" />
                    )}
                    <div>
                      <p className="font-medium mb-2">
                        {currentQuestion.userAnswer === currentQuestion.correctAnswer 
                          ? "Correct!" 
                          : "Incorrect"}
                      </p>
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 mt-1" />
                        <MathJax>
                          <div 
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{ 
                              __html: processLatexContent(currentQuestion.explanation)
                            }}
                          />
                        </MathJax>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 md:gap-3 max-w-md mx-auto">
              <Button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base group"
              >
                <ChevronLeft className="w-4 h-4 mr-1 md:mr-2 group-hover:-translate-x-0.5 transition-transform" />
                Previous
              </Button>

              <Button
                onClick={currentQuestionIndex === totalQuestions - 1 ? handleSubmitQuiz : handleNext}
                className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base group"
              >
                {currentQuestionIndex === totalQuestions - 1 ? (
                  "Submit"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1 md:ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 