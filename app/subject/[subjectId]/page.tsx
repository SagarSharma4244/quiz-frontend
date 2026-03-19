import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getSubject, getTopics } from "@/lib/api";

interface SubjectPageProps {
  params: Promise<{ subjectId: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;

  let subject;
  let subjectTopics;

  try {
    [subject, subjectTopics] = await Promise.all([
      getSubject(subjectId),
      getTopics(subjectId),
    ]);
  } catch {
    notFound();
  }

  if (!subject) {
    notFound();
  }

  if (subjectTopics.length > 0) {
    redirect(`/quiz/${subjectTopics[0].id}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-zinc-500">No topics available for this subject yet.</p>
      </main>
    </div>
  );
}
