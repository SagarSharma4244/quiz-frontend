import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getSubject, getTopics } from "@/lib/api";

interface SubjectPageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;

  let subject;
  let topics;

  try {
    [subject, topics] = await Promise.all([
      getSubject(subjectId),
      getTopics(subjectId),
    ]);
  } catch {
    notFound();
  }

  if (!subject) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex">
        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-8 py-8">
            <div className="rounded-2xl pt-2 px-8 pb-8">
              <div className="mt-20 mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-zinc-900 mb-1">{subject.title}</h2>
                {subject.description && (
                  <p className="text-zinc-500 text-sm">{subject.description}</p>
                )}
              </div>

              {topics.length === 0 ? (
                <p className="text-center text-zinc-500">No chapters available yet.</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Chapters</p>
                  <div className="flex flex-col gap-3">
                  {topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/quiz/${topic.id}`}
                      className="rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
