import Link from "next/link";

interface QuizCompletionProps {
  score: number;
  totalQuestions: number;
  onRetake: () => void;
  onNextChapter?: () => void;
  hasNextChapter?: boolean;
}

export default function QuizCompletion({
  score,
  totalQuestions,
  onRetake,
  onNextChapter,
  hasNextChapter,
}: QuizCompletionProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-12 text-center">
      <h2 className="mb-4 text-3xl font-bold text-zinc-900">Quiz Complete! 🎉</h2>
      <p className="mb-8 text-xl text-zinc-600">
        Your score:{" "}
        <span className="font-bold text-indigo-600">
          {score} / {totalQuestions}
        </span>
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onRetake}
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          Retake Quiz
        </button>
        {hasNextChapter && onNextChapter ? (
          <button
            onClick={onNextChapter}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Next Chapter
          </button>
        ) : (
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Back to Subjects
          </Link>
        )}
      </div>
    </div>
  );
}
