import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getSector, getTopics } from "@/lib/api";

interface SectorPageProps {
  params: Promise<{ sectorId: string }>;
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { sectorId } = await params;

  let sector;
  let sectorTopics;

  try {
    [sector, sectorTopics] = await Promise.all([
      getSector(sectorId),
      getTopics(sectorId),
    ]);
  } catch {
    notFound();
  }

  if (!sector) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {sector.name}
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Select a topic to start a quiz
        </p>

        {sectorTopics.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            No topics available for this sector yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectorTopics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/quiz/${topic.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {topic.name}
                  </span>
                  <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                    Start quiz →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
