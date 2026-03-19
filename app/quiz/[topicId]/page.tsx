"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import QuestionCard from "../components/QuestionCard";
import QuizCompletion from "../components/QuizCompletion";
import PageError from "../components/PageError";
import { getTopic, getTopics, getQuestions, type Topic, type QuizQuestion } from "@/lib/api";

interface QuizPageProps {
  params: Promise<{ topicId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { topicId } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const router = useRouter();

  useEffect(() => {
    getTopic(topicId)
      .then((t) => {
        setTopic(t);
        return getTopics(t.subjectId);
      })
      .then((topicList) => {
        setTopics(topicList);
        return getQuestions(topicId);
      })
      .then((qs) => {
        setQuestions(qs);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const currentTopicIndex = topics.findIndex((t) => t.id === topicId);
  const nextTopic = currentTopicIndex >= 0 && currentTopicIndex + 1 < topics.length ? topics[currentTopicIndex + 1] : null;

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;

    setShowResult(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  // Loading state
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

  // Error states
  if (!topic) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <PageError message="Topic not found." backLink="/" backLinkLabel="Back to home" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <PageError
          message="No quiz questions for this topic yet."
          backLink="/"
          backLinkLabel="Back to topics"
        />
      </div>
    );
  }

  const isQuizComplete = showResult && isLastQuestion;

  const handleNextTopic = () => {
    if (nextTopic) {
      router.push(`/quiz/${nextTopic.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex">
        {/* <QuizSidebar /> */}

        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-8 py-8 ">
            {/* <ChapterProgress topicName={topic.name} /> */}

            {isQuizComplete ? (
              <QuizCompletion
                score={score}
                totalQuestions={questions.length}
                onRetake={handleRetake}
                onNextChapter={nextTopic ? handleNextTopic : undefined}
                hasNextChapter={nextTopic !== null}
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
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
