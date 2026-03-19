interface ResultFeedbackProps {
  isCorrect: boolean;
}

export default function ResultFeedback({ isCorrect }: ResultFeedbackProps) {
  return (
    <div className="mb-8 rounded-xl p-6 bg-white border border-zinc-200">
      <p className={`font-semibold text-lg ${isCorrect ? "text-green-600" : "text-orange-600"}`}>
        {isCorrect ? "✓ Right answer" : "✗ Incorrect"}
      </p>
      <p className="text-zinc-600 mt-2 text-sm">
        {isCorrect ? "Great job! You got this one right." : "Not quite, but keep learning!"}
      </p>
    </div>
  );
}
