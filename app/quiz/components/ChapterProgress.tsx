interface ChapterProgressProps {
  chapterName: string;
  currentChapter?: number;
}

export default function ChapterProgress({ chapterName, currentChapter = 1 }: ChapterProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-zinc-600">Course • Level 1</p>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">{chapterName}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 mb-1">❤️ ❤️ ❤️ ❤️</p>
        </div>
      </div>

      {/* Chapter Indicators */}
      <div className="mt-6 flex items-center gap-2">
        {[1, 2, 3].map((ch) => (
          <div key={ch} className="flex items-center">
            <div
              className={`h-8 w-16 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                ch === 1
                  ? "bg-green-100 text-green-700"
                  : ch === 2
                  ? "bg-blue-100 text-blue-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              Chapter {ch}
            </div>
            {ch < 3 && (
              <div
                className={`h-1 w-8 mx-1 rounded-full ${
                  ch === 1 ? "bg-green-200" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
