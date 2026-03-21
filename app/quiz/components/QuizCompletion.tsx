import Link from "next/link";
import type { Topic } from "@/lib/api";

interface QuizCompletionProps {
  topics: Topic[];
  currentTopicId: string;
}

export default function QuizCompletion({ topics, currentTopicId }: QuizCompletionProps) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Chapters</h2>
      <div className="flex flex-col gap-3">
        {topics.map((topic) => {
          const isCurrent = topic.id === currentTopicId;
          return (
            <Link
              key={topic.id}
              href={`/quiz/${topic.id}`}
              className={`rounded-xl border px-6 py-4 font-medium transition-colors ${
                isCurrent
                  ? "border-green-400 bg-green-50 text-green-800"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{topic.name}</span>
                {isCurrent && <span className="text-sm text-green-600 font-normal">Completed</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
