interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  showResult: boolean;
  isUserAnswer: boolean;
  onSelect: (index: number) => void;
}

export default function AnswerOption({
  option,
  index,
  isSelected,
  isCorrect,
  isWrong,
  showResult,
  isUserAnswer,
  onSelect,
}: AnswerOptionProps) {
  const getButtonClass = () => {
    const base = "relative rounded-xl border px-16 py-8 text-center font-medium transition-all";

    if (!showResult && !isSelected) {
      return `${base} border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 cursor-pointer`;
    }

    if (!showResult && isSelected) {
      return `${base} border-blue-500 bg-blue-50 text-blue-900`;
    }

    if (showResult && isCorrect) {
      return `${base} border-green-500 bg-green-50 text-green-900`;
    }

    if (showResult && isUserAnswer && isWrong) {
      return `${base} border-red-500 bg-red-50 text-red-900`;
    }

    if (showResult) {
      return `${base} border-zinc-300 bg-white text-zinc-500`;
    }

    return base;
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      disabled={showResult}
      className={getButtonClass()}
    >
      <span className="capitalize">{option}</span>
    </button>
  );
}
