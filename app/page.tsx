import Header from "@/components/Header";
import Link from "next/link";
import PageError from "@/app/quiz/components/PageError";
import { getSubjects } from "@/lib/api";

export default async function Home() {
  const subjects = await getSubjects();

  if (subjects.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <PageError
            message="No subjects available."
            backLink="/"
            backLinkLabel="Refresh"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900">
          Choose a subject
        </h1>
        <p className="mb-10 text-lg text-zinc-600">
          Select any of these subjects to explore topics and start a quiz.
        </p> */}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/subject/${subject.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-zinc-900">{subject.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {subject.description || "No description provided."}
                </p>
                <p className="mt-4 text-sm font-medium text-indigo-600">View topics →</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
