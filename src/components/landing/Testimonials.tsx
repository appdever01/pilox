"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  MessageSquare,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    content:
      "PDFX has revolutionized how I study. The quiz generation feature helps me prepare for exams effectively, and the AI chat makes understanding complex documents so much easier.",
    author: "Sarah J.",
    role: "Graduate Student",
    rating: 5,
  },
  {
    id: 2,
    content:
      "As a teacher, this tool is invaluable. I can quickly create quizzes from textbook content and provide better learning materials for my students. The video explanations are a game-changer.",
    author: "Dr. Michael C.",
    role: "University Professor",
    rating: 5,
  },
  {
    id: 3,
    content:
      "The document analysis capabilities are outstanding. Being able to process large PDFs and get instant insights has saved me countless hours of work.",
    author: "Emma T.",
    role: "Research Analyst",
    rating: 5,
  },
  {
    id: 4,
    content:
      "I love how I can analyze documents on the go. The mobile experience is seamless, and the pay-as-you-go option fits my needs perfectly.",
    author: "David W.",
    role: "Business Consultant",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) =>
      prevIndex + newDirection < 0
        ? testimonials.length - 1
        : (prevIndex + newDirection) % testimonials.length,
    );
  };

  return (
    <section
      className="relative  bg-white lg:px-20 xl:px-32"
      id="testimonials"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 text-sm font-medium mb-8">
            <MessageSquare className="w-4 h-4" />
            <span>What People Say</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how PDFX is helping professionals and teams work smarter
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-all"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white transition-all"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>

          <div className="relative h-[300px] mx-8 md:mx-12 mb-8">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-200">
                  <div className="relative flex flex-col justify-between gap-6">
                    <Quote className="absolute -top-2 -left-1 w-12 h-12 md:w-16 md:h-16 text-primary/10" />

                    <div className="relative z-10">
                      <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-700">
                        "{testimonials[currentIndex].content}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-base md:text-lg">
                          {testimonials[currentIndex].author}
                        </h4>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {testimonials[currentIndex].role}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {[...Array(testimonials[currentIndex].rating)].map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

       
        </div>
      </div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-8 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
    </section>
  );
}
