import AnswerOption from "./AnswerOption";
import QuizProgressBar from "./QuizProgressBar";
import DidYouKnowSection from "./DidYouKnowSection";
import type { QuizQuestion } from "@/lib/api";

interface QuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  showResult: boolean;
  onSelectOption: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  chapterName?: string;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  showResult,
  onSelectOption,
  onSubmit,
  onNext,
  chapterName,
}: QuestionCardProps) {
  return (
    <>
    {/* Right-side feedback panel */}
    {showResult && (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-80 p-4 flex flex-col gap-4 z-50 transition-all duration-300">
        <DidYouKnowSection />
      </div>
    )}

    <div className="rounded-2xl pt-2 px-8 pb-8">
      <QuizProgressBar currentIndex={currentIndex} totalQuestions={totalQuestions} chapterName={chapterName} showResult={showResult} />
      <div className="mt-20 mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">{question.question}</h2>
        {/* <p className="text-zinc-600">Is this statement true or false?</p> */}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            option={option}
            index={index}
            isSelected={selectedOption === index}
            isCorrect={index === question.correctIndex}
            isWrong={index !== question.correctIndex}
            showResult={showResult}
            isUserAnswer={index === selectedOption}
            onSelect={onSelectOption}
          />
        ))}
      </div>


      {/* Navigation */}
      <div className="flex justify-center gap-4">
        {showResult ? (
          <button
            onClick={onNext}
            className="rounded-lg bg-zinc-900 px-12 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={selectedOption === null}
            className="rounded-lg bg-zinc-900 px-12 py-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
        )}
      </div>
    </div>
    </>
  );
}
