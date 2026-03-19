"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubjects, type Subject } from "@/lib/api";

export default function SubjectSelect() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    if (subjectId) {
      router.push(`/subject/${subjectId}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-zinc-500">
        Loading subjects...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <select
        id="subject-select"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        onChange={handleChange}
        defaultValue=""
      >
        <option value="" disabled>
          Choose a subject...
        </option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </div>
  );
}
