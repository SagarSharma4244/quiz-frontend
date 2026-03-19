import AnswerOption from "./AnswerOption";
import ResultFeedback from "./ResultFeedback";
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
}: QuestionCardProps) {
  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="rounded-2xl  p-8">
      <div className="mb-8 text-center">
        <p className="text-sm text-zinc-600 mb-4">
          Question {currentIndex + 1}/{totalQuestions}
        </p>
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

      {/* Feedback Section */}
      {showResult && <ResultFeedback isCorrect={isCorrect} />}

      {/* Did you know? Section */}
      {showResult && <DidYouKnowSection />}

      {/* Navigation */}
      <div className="flex justify-end gap-4">
        {showResult ? (
          <button
            onClick={onNext}
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={selectedOption === null}
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
