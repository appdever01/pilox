"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  Sparkles,
  Minus,
  Plus,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  X as CloseIcon,
} from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AuthApiClient from "@/lib/auth-api-client";
import { jsPDF } from "jspdf";
import { TrueFalseQuiz } from "./TrueFalseQuiz";
import { TheoryQuiz } from "./TheoryQuiz";
import { MultipleChoiceQuiz } from "../MultipleChoiceQuiz";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isChecked?: boolean;
}

interface TrueFalseQuestion {
  id: string;
  question: string;
  correctAnswer: boolean;
  explanation: string;
  userAnswer?: boolean;
  isChecked?: boolean;
}

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  pdfName?: string;
  totalPages: number;
}

interface QuizSummary {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  credits: number;
  isActive: boolean;
}

interface QuizSettings {
  numQuestions: number;
  startPage: number | string;
  endPage: number | string;
}

interface TheoryQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  page: number;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

const LoadingQuiz = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>
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
        Generating Quiz...
      </motion.p>
    </div>
  );
};

const processLatexContent = (content: string) => {
  if (!content) return "";
  return content
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\pm/g, "±")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");
};

export function Quiz({
  isOpen,
  onClose,
  pdfUrl,
  pdfName,
  totalPages,
}: QuizProps) {
  const [checkAtEnd, setCheckAtEnd] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(true);
  const [quizSummary, setQuizSummary] = useState<QuizSummary[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(true);
  const [quizType, setQuizType] = useState<string | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    numQuestions: 10,
    startPage: 1,
    endPage: totalPages,
  });
  const [trueFalseQuestions, setTrueFalseQuestions] = useState<
    TrueFalseQuestion[]
  >([]);
  const [theoryQuestions, setTheoryQuestions] = useState<TheoryQuestion[]>([]);

  const quizTypes: QuizType[] = [
    {
      id: "multiple-choice",
      title: "Multiple Choice Quiz",
      description: "Test your knowledge with multiple choice questions",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      credits: 0.01,
      isActive: true,
    },
    {
      id: "true-false",
      title: "True/False Quiz",
      description: "Quick true or false questions to test understanding",
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      credits: 0.01,
      isActive: true,
    },
    {
      id: "theory",
      title: "Theory Quiz",
      description: "Open-ended questions for deeper understanding",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      credits: 0.08,
      isActive: true,
    },
  ];

  useEffect(() => {
    if (isOpen && pdfUrl && !quizType) {
      setIsGeneratingQuiz(false);
      setShowQuestionSelector(true);
      setQuizQuestions([]);
    }
  }, [isOpen, pdfUrl, quizType]);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setQuizSettings((prev) => ({
        ...prev,
        endPage: totalPages,
      }));
    }
  }, [isOpen, pdfUrl, totalPages]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const answeredQuestions = quizQuestions.filter((q) => q.userAnswer).length;
  const correctAnswers = quizQuestions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;

  const handleNext = () => {
    if (!checkAtEnd && !currentQuestion?.isChecked) {
      handleCheckAnswer();
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleCheckAnswer = () => {
    if (checkAtEnd) {
      setQuizQuestions((questions) =>
        questions.map((q) => ({ ...q, isChecked: true }))
      );
      setShowResults(true);
    } else {
      setQuizQuestions((questions) =>
        questions.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, isChecked: true } : q
        )
      );
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (!checkAtEnd || !currentQuestion.isChecked) {
      setQuizQuestions((questions) =>
        questions.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, userAnswer: option } : q
        )
      );
    }
  };

  const handleSubmitQuiz = () => {
    const summary = quizQuestions.map((q) => ({
      question: q.question,
      userAnswer: q.userAnswer || "Not answered",
      correctAnswer: q.correctAnswer,
      isCorrect: q.userAnswer === q.correctAnswer,
      explanation: q.explanation,
    }));

    setQuizSummary(summary);
    setShowSummary(true);
  };

  const handleStartQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);
      setShowQuestionSelector(false);
      setShowSummary(false);
      setShowResults(false);
      setCurrentQuestionIndex(0);
      setQuizSummary([]);
      setQuizQuestions([]);

      if (quizType === "multiple-choice") {
        const data = await AuthApiClient.post<{
          status: string;
          message: string;
          data: {
            quiz: {
              questions: {
                question: string;
                options: string[];
                correctAnswer: number;
                explanation: string;
                page: number;
              }[];
            };
          };
        }>(API_ROUTES.GENERATE_QUIZ, {
          pdfUrl: pdfUrl,
          numQuestions: quizSettings.numQuestions,
          startPage: quizSettings.startPage,
          endPage: quizSettings.endPage,
        });

        if (data.status === "success") {
          const transformedQuestions = data.data.quiz.questions.map((q) => ({
            id: crypto.randomUUID(),
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.correctAnswer],
            explanation: q.explanation,
            userAnswer: undefined,
            isChecked: false,
          }));
          setQuizQuestions(transformedQuestions);
        }
      } else if (quizType === "true-false") {
        const data = await AuthApiClient.post<{
          status: string;
          message: string;
          data: {
            questions: {
              questions: {
                question: string;
                correctAnswer: boolean;
                explanation: string;
                page: number;
              }[];
            };
          };
        }>(API_ROUTES.GENERATE_MCQ, {
          pdfUrl: pdfUrl,
          numQuestions: quizSettings.numQuestions,
          startPage: quizSettings.startPage,
          endPage: quizSettings.endPage,
        });

        if (data.status === "success") {
          const transformedQuestions = data.data.questions.questions.map(
            (q) => ({
              id: crypto.randomUUID(),
              question: q.question,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              userAnswer: undefined,
              isChecked: false,
            })
          );
          setTrueFalseQuestions(transformedQuestions);
        }
      } else if (quizType === "theory") {
        const data = await AuthApiClient.post<{
          status: string;
          message: string;
          data: {
            questions: {
              questions: {
                question: string;
                modelAnswer: string;
                page: number;
              }[];
            };
          };
        }>(API_ROUTES.GENERATE_THEORY, {
          pdfUrl: pdfUrl,
          numQuestions: quizSettings.numQuestions,
          startPage: quizSettings.startPage,
          endPage: quizSettings.endPage,
        });

        if (data.status === "success" && data.data?.questions?.questions) {
          const transformedQuestions = data.data.questions.questions.map(
            (q) => ({
              id: crypto.randomUUID(),
              question: q.question,
              modelAnswer: q.modelAnswer,
              keyPoints: [],
              page: q.page,
              userAnswer: undefined,
              score: undefined,
              feedback: undefined,
            })
          );
          setTheoryQuestions(transformedQuestions);
        }
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz");
      setShowQuestionSelector(true);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    const title = `Quiz Generated from ${pdfName || "PDF"}`;
    const titleLines = doc.splitTextToSize(title, 170);
    titleLines.forEach((line: string, index: number) => {
      doc.text(line, 20, 20 + index * 12);
    });

    let yPosition = 20 + titleLines.length * 12 + 20;

    quizQuestions.forEach((question, index) => {
      if (yPosition > 250) {
        addFooter(doc);
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Question ${index + 1}`, 20, yPosition);
      yPosition += 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Question:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const questionLines = doc.splitTextToSize(question.question, 170);
      doc.text(questionLines, 20, yPosition);
      yPosition += questionLines.length * 7 + 5;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Answer:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const answerLines = doc.splitTextToSize(question.correctAnswer, 170);
      doc.text(answerLines, 20, yPosition);
      yPosition += answerLines.length * 7 + 10;
    });

    // Add footer on the last page
    addFooter(doc);

    doc.save("quiz.pdf");
    toast.success("Quiz downloaded successfully!");
  };

  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "This quiz is generated from https://pilox.com",
      doc.internal.pageSize.width / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);
  };

  const handleRetakeQuiz = () => {
    setShowSummary(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setQuizSummary([]);
    setQuizQuestions((questions) =>
      questions.map((q) => ({
        ...q,
        userAnswer: undefined,
        isChecked: false,
      }))
    );
  };

  const handleClose = () => {
    onClose();
  };

  const handleNewQuiz = () => {
    setQuizType(null);
    setShowQuestionSelector(true);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setShowSummary(false);
    setShowResults(false);
    setQuizSummary([]);
    setIsGeneratingQuiz(true);
    setCheckAtEnd(false);
    setQuizSettings((prev) => ({
      ...prev,
      numQuestions: 10,
      startPage: 1,
      endPage: totalPages,
    }));
  };

  const QuizSettingsPanel = () => (
    <div className="relative flex flex-col h-[90vh] overflow-hidden">
      {/* Header - Fixed */}
      <div className="p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base md:text-xl">Quiz Settings</h2>
          <div className="flex items-center gap-[5px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewQuiz}
              className="h-8 rounded-full hover:bg-accent"
            >
              <Plus className="w-4 h-4" />
              <span className="ml-2">New Quiz</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 rounded-full hover:bg-accent"
            >
              <CloseIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="bg-accent/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Quiz Configuration</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Number of Questions
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuizSettings((prev) => ({
                          ...prev,
                          numQuestions: Math.max(1, prev.numQuestions - 1),
                        }))
                      }
                      disabled={quizSettings.numQuestions <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <input
                      type="number"
                      value={quizSettings.numQuestions}
                      onChange={(e) => {
                        setQuizSettings((prev) => {
                          const value =
                            e.target.value === ""
                              ? prev.numQuestions
                              : parseInt(e.target.value);
                          return {
                            ...prev,
                            numQuestions: Math.min(
                              Math.max(1, parseInt(value.toString())),
                              30
                            ),
                          };
                        });
                      }}
                      className="w-20 h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                      min="1"
                      max="30"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuizSettings((prev) => ({
                          ...prev,
                          numQuestions: Math.min(30, prev.numQuestions + 1),
                        }))
                      }
                      disabled={quizSettings.numQuestions >= 30}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Maximum 30 questions
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Page Range (Total Pages: {totalPages})
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Start Page
                      </label>
                      <input
                        type="number"
                        value={quizSettings.startPage}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuizSettings((prev) => ({
                            ...prev,
                            startPage:
                              value === "" ? "" : Math.max(1, parseInt(value)),
                          }));
                        }}
                        onBlur={() => {
                          setQuizSettings((prev) => ({
                            ...prev,
                            startPage:
                              prev.startPage === ""
                                ? 1
                                : Math.min(
                                    Math.max(
                                      1,
                                      parseInt(prev.startPage.toString())
                                    ),
                                    parseInt(prev.endPage.toString())
                                  ),
                          }));
                        }}
                        className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                        min="1"
                        max={quizSettings.endPage}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        End Page
                      </label>
                      <input
                        type="number"
                        value={quizSettings.endPage}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQuizSettings((prev) => ({
                            ...prev,
                            endPage:
                              value === ""
                                ? ""
                                : Math.min(parseInt(value), totalPages),
                          }));
                        }}
                        onBlur={() => {
                          setQuizSettings((prev) => ({
                            ...prev,
                            endPage:
                              prev.endPage === ""
                                ? totalPages
                                : Math.min(
                                    Math.max(
                                      parseInt(prev.startPage.toString()),
                                      parseInt(prev.endPage.toString())
                                    ),
                                    totalPages
                                  ),
                          }));
                        }}
                        className="w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                        min={quizSettings.startPage}
                        max={totalPages}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select pages to generate questions from
                  </p>
                </div>
              </div>
            </div>
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Note: Quizzes are not saved permanently. Please download them
                before closing or reloading the page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="p-4 border-t bg-background/95 backdrop-blur sticky bottom-0">
        <Button
          className="w-full"
          onClick={handleStartQuiz}
          disabled={isGeneratingQuiz}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Questions
        </Button>
      </div>
    </div>
  );

  const QuizNavigation = () => (
    <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <Button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="w-[130px] group"
        >
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Previous
        </Button>

        <Button
          onClick={
            currentQuestionIndex === quizQuestions.length - 1
              ? handleSubmitQuiz
              : handleNext
          }
          className="w-[130px] group"
        >
          {currentQuestionIndex === quizQuestions.length - 1 ? (
            "Check Answer"
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderQuizHeader = () => (
    <div className="p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl md:text-2xl sm:text-4xl">
            Multiple Choice Quiz
          </h2>
          <div className="flex items-center gap-1">
            {quizQuestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 rounded-full hover:bg-accent"
                title="Download Quiz"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleNewQuiz}
              className="h-8 rounded-fullbg-accent hidden md:flex"
            >
              New Quiz
            </Button>
            <div
              onClick={handleNewQuiz}
              className="h-8 rounded-full bg-accent md:hidden"
              title="New Quiz"
            >
              <Plus className="w-1 h-4" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 rounded-full hover:bg-accent"
            >
              <CloseIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress and Settings Row */}
        <div className="flex items-center justify-between">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className="bg-accent/30 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                {currentQuestionIndex + 1}/{quizQuestions.length}
              </span>
            </div>
            <div className="hidden md:block relative w-[200px] h-1.5 bg-accent/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Check at End Toggle */}
          <div
            className={`
              flex items-center gap-3 px-4 py-2 rounded-full transition-colors
              ${checkAtEnd ? "bg-primary/10 text-primary" : "bg-accent/30 text-muted-foreground"}
            `}
          >
            <Switch
              checked={checkAtEnd}
              onCheckedChange={setCheckAtEnd}
              className={`
                ${checkAtEnd ? "bg-primary" : "bg-accent/50"}
                data-[state=checked]:bg-primary
              `}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              Check at end
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizContent = () => {
    if (!quizType) {
      return (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Select Quiz Type</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-accent rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="grid grid-cols-1 gap-4">
              {quizTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setQuizType(type.id)}
                  disabled={!type.isActive}
                  className={`relative p-6 rounded-lg border text-left transition-all ${
                    type.isActive
                      ? "hover:border-primary hover:bg-accent/50 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {type.icon}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {type.credits} credits/question
                    </span>
                  </div>
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (showQuestionSelector) {
      return <QuizSettingsPanel />;
    }

    if (quizType === "true-false") {
      if (isGeneratingQuiz) {
        return <LoadingQuiz />;
      }

      return (
        <TrueFalseQuiz
          questions={trueFalseQuestions}
          onClose={handleClose}
          onNewQuiz={handleNewQuiz}
          pdfName={pdfName}
        />
      );
    }

    if (quizType === "theory") {
      if (isGeneratingQuiz) {
        return <LoadingQuiz />;
      }

      return (
        <TheoryQuiz
          questions={theoryQuestions}
          onClose={handleClose}
          onNewQuiz={handleNewQuiz}
          pdfUrl={pdfUrl ?? ""}
          pdfName={pdfName}
        />
      );
    }

    if (isGeneratingQuiz) {
      return <LoadingQuiz />;
    }

    return (
      <MultipleChoiceQuiz
        questions={quizQuestions}
        onClose={handleClose}
        onNewQuiz={handleNewQuiz}
        pdfName={pdfName}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-[90vw] max-w-[800px] max-h-[85vh] bg-background rounded-lg shadow-lg flex flex-col z-50"
          >
            {renderQuizContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
