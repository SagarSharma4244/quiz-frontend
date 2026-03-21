"use client";

import { use, useEffect, useState } from "react";
import Header from "@/components/Header";
import QuestionCard from "../components/QuestionCard";
import QuizCompletion from "../components/QuizCompletion";
import PageError from "../components/PageError";
import { getChapter, getChapters, getQuestions, type Chapter, type QuizQuestion } from "@/lib/api";


interface QuizPageProps {
  params: Promise<{ chapterId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { chapterId } = use(params);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    getChapter(chapterId)
      .then((c) => {
        setChapter(c);
        return getChapters(c.subjectId);
      })
      .then((chapterList) => {
        setChapters(chapterList);
        return getQuestions(chapterId);
      })
      .then((qs) => {
        setQuestions(qs);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [chapterId]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;


  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-zinc-600">Loading quiz...</p>
        </main>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <PageError message="Chapter not found." backLink="/" backLinkLabel="Back to home" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <PageError
          message="No quiz questions for this chapter yet."
          backLink="/"
          backLinkLabel="Back to home"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex">
        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-8 py-8">
            {isComplete ? (
              <QuizCompletion
                chapters={chapters}
                currentChapterId={chapterId}
                chapterName={chapter.name}
              />
            ) : (
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                selectedOption={selectedOption}
                showResult={showResult}
                onSelectOption={handleOptionSelect}
                onSubmit={handleSubmit}
                onNext={handleNext}
                chapterName={chapter.name}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
