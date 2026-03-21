interface QuizProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  chapterName?: string;
  showResult: boolean;
}

export default function QuizProgressBar({ currentIndex, totalQuestions, chapterName, showResult }: QuizProgressBarProps) {
  const answered = showResult ? currentIndex + 1 : currentIndex;
  const percent = Math.round((answered / totalQuestions) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
        {chapterName ? <span className="text-sm font-semibold text-zinc-700">{chapterName}</span> : <span />}
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
