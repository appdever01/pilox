import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, X, Settings2, X as CloseIcon, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { addWatermark, addFooter, formatPDFText, willContentFitOnPage } from "@/components/shared/pdfHelpers";

interface TrueFalseQuestion {
  id: string;
  question: string;
  correctAnswer: boolean;
  explanation: string;
  userAnswer?: boolean;
  isChecked?: boolean;
}

interface TrueFalseQuizProps {
  questions: TrueFalseQuestion[];
  onClose: () => void;
  onNewQuiz: () => void;
  pdfName?: string;
}

export function TrueFalseQuiz({ questions, onClose, onNewQuiz, pdfName }: TrueFalseQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<TrueFalseQuestion[]>(questions);
  const [checkAtEnd, setCheckAtEnd] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = answers[currentIndex];
  const answeredQuestions = answers.filter(q => q.userAnswer !== undefined).length;
  const correctAnswers = answers.filter(q => q.userAnswer === q.correctAnswer).length;
  const progress = (answeredQuestions / answers.length) * 100;

  const handleAnswer = (answer: boolean) => {
    if (checkAtEnd) {
      setAnswers(prev => prev.map((q, idx) => 
        idx === currentIndex ? { ...q, userAnswer: answer } : q
      ));
    } else {
      setAnswers(prev => prev.map((q, idx) => 
        idx === currentIndex ? { 
          ...q, 
          userAnswer: answer,
          isChecked: true
        } : q
      ));
    }
  };

  const handleNext = () => {
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    const title = `True/False Quiz ${pdfName ? `- ${pdfName}` : ''}`;
    doc.text(title, 20, 20);
    
    let yPosition = 40;
    
    answers.forEach((question, index) => {
      addWatermark(doc);
      
      // Format content
      const questionTitle = formatPDFText(doc, `Question ${index + 1}:`, true);
      const questionText = formatPDFText(doc, question.question);
      const answerTitle = formatPDFText(doc, 'Answer:', true);
      const explanationTitle = formatPDFText(doc, 'Explanation:', true);
      const explanationText = formatPDFText(doc, question.explanation);
      
      const totalContentHeight = 
        (questionTitle.length + questionText.length + answerTitle.length + 
         explanationTitle.length + explanationText.length) * 7 + 40;
      
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
      
      // Answer
      doc.setFont('helvetica', 'bold');
      doc.text(answerTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${question.correctAnswer ? 'True' : 'False'}`, 20, yPosition);
      yPosition += 15;
      
      // Explanation
      doc.setFont('helvetica', 'bold');
      doc.text(explanationTitle, 20, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(explanationText, 20, yPosition);
      yPosition += explanationText.length * 7 + 20;
    });
    
    addFooter(doc);
    doc.save(`true-false-quiz${pdfName ? `-${pdfName}` : ''}.pdf`);
    toast.success("Quiz downloaded successfully!");
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setAnswers(questions.map(q => ({ ...q, userAnswer: undefined, isChecked: false })));
    setCurrentIndex(0);
    setShowResults(false);
    setCheckAtEnd(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-hidden">
      <div className="p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base md:text-xl">True/False Quiz</h2>
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
            <div className="bg-accent/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
              <span className="text-xs md:text-sm font-medium">
                {currentIndex + 1}/{questions.length}
              </span>
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

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {showResults ? (
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-muted-foreground text-base md:text-lg">Here's how you did</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {correctAnswers}/{questions.length}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Total Score</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {correctAnswers}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Correct Answers</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                    {questions.length - correctAnswers}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">Incorrect Answers</p>
                </div>
              </div>

              {/* Question review section */}
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-semibold border-b pb-2">Question Review</h3>
                {answers.map((question, index) => (
                  <div key={question.id} className={`p-4 md:p-6 rounded-lg border ${
                    question.userAnswer === question.correctAnswer 
                      ? 'bg-blue-500/5 border-blue-500/20' 
                      : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-sm md:text-base font-medium">Question {index + 1}</div>
                        <p className="text-xs md:text-sm text-muted-foreground">{question.question}</p>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <span className="font-medium">Your answer:</span>
                          <span className={question.userAnswer === question.correctAnswer ? 'text-blue-600' : 'text-red-600'}>
                            {question.userAnswer ? 'True' : 'False'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <span className="font-medium">Correct answer:</span>
                          <span className="text-primary">{question.correctAnswer ? 'True' : 'False'}</span>
                        </div>
                        {question.explanation && (
                          <div className="mt-3 pt-3 border-t text-xs md:text-sm text-muted-foreground">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRetakeQuiz} variant="outline" className="w-full">
                  Retake Quiz
                </Button>
                <Button onClick={onNewQuiz} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-xl p-4 md:p-6 border">
                <h3 className="text-sm md:text-base font-medium mb-6">{currentQuestion.question}</h3>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[true, false].map((answer) => (
                    <button
                      key={answer.toString()}
                      onClick={() => handleAnswer(answer)}
                      disabled={currentQuestion.isChecked}
                      className={`
                        p-3 md:p-4 rounded-lg border transition-all text-sm md:text-base
                        ${currentQuestion.isChecked
                          ? answer === currentQuestion.correctAnswer
                            ? 'border-blue-500 bg-blue-500/10'
                            : answer === currentQuestion.userAnswer
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-muted bg-muted/5'
                          : currentQuestion.userAnswer === answer
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:bg-accent/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {currentQuestion.isChecked && (
                          <>
                            {answer === currentQuestion.correctAnswer && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                            {answer === currentQuestion.userAnswer && answer !== currentQuestion.correctAnswer && (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                          </>
                        )}
                        <span className="font-medium">{answer ? 'True' : 'False'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex justify-between max-w-md mx-auto">
          {showResults ? (
            <div className="flex gap-3 w-full">
              <Button onClick={handleRetakeQuiz} variant="outline" className="w-full">
                Retake Quiz
              </Button>
              <Button onClick={onNewQuiz} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
            </div>
          ) : (
            <>
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
                onClick={currentIndex === answers.length - 1 ? handleSubmitQuiz : handleNext}
                className="px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base"
              >
                {currentIndex === answers.length - 1 ? "Submit" : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
