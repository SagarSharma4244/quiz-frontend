import Link from "next/link";
import type { Topic } from "@/lib/api";

interface QuizCompletionProps {
  topics: Topic[];
  currentTopicId: string;
  chapterName?: string;
}

export default function QuizCompletion({ topics, currentTopicId, chapterName }: QuizCompletionProps) {
  return (
    <div className="rounded-2xl pt-2 px-8 pb-8">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
          <span className="text-sm font-semibold text-zinc-700">{chapterName}</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-full" />
        </div>
      </div>

      <div className="mt-20 mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Chapter Complete!</h2>
        <p className="text-zinc-500 text-sm">Pick your next chapter to continue</p>
      </div>

      {/* Chapter list */}
      <div className="flex flex-col gap-3">
        {topics.map((topic) => {
          const isCurrent = topic.id === currentTopicId;
          return (
            <Link
              key={topic.id}
              href={`/quiz/${topic.id}`}
              className={`rounded-xl border px-6 py-4 font-medium transition-colors ${
                isCurrent
                  ? "border-green-400 bg-green-50 text-green-800 pointer-events-none"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{topic.name}</span>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-normal">
                    <span>✓</span> Completed
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
