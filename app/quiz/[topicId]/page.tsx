"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getTopic, getQuestions, type Topic, type QuizQuestion } from "@/lib/api";

interface QuizPageProps {
  params: Promise<{ topicId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { topicId } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTopic(topicId), getQuestions(topicId)])
      .then(([t, qs]) => {
        setTopic(t);
        setQuestions(qs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topicId]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;

    setShowResult(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleFinish = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-zinc-600 dark:text-zinc-400">Loading quiz...</p>
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-zinc-600 dark:text-zinc-400">Topic not found.</p>
          <Link href="/" className="mt-4 inline-block text-zinc-600 underline dark:text-zinc-400">
            Back to home
          </Link>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-zinc-600 dark:text-zinc-400">No quiz questions for this topic yet.</p>
          <Link href={`/sector/${topic.sectorId}`} className="mt-4 inline-block text-zinc-600 underline dark:text-zinc-400">
            Back to topics
          </Link>
        </main>
      </div>
    );
  }

  const getOptionClass = (index: number) => {
    const base =
      "block w-full rounded-lg border px-4 py-3 text-left text-base transition-colors";
    if (!showResult) {
      return `${base} cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 ${
        selectedOption === index
          ? "border-zinc-500 ring-2 ring-zinc-500 dark:border-zinc-400 dark:ring-zinc-400"
          : ""
      }`;
    }
    if (index === currentQuestion.correctIndex) {
      return `${base} border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-950/50`;
    }
    if (index === selectedOption && index !== currentQuestion.correctIndex) {
      return `${base} border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-950/50`;
    }
    return `${base} border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-900/50`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {topic.name} Quiz
          </h1>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {showResult && isLastQuestion ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Quiz Complete!
            </h2>
            <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
              Your score: {score} / {questions.length}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleFinish}
                className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Retake Quiz
              </button>
              <Link
                href={`/sector/${topic.sectorId}`}
                className="rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back to Topics
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {currentQuestion.question}
            </h2>
            <ul className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect(index)}
                    className={getOptionClass(index)}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-end gap-4">
              {showResult ? (
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
