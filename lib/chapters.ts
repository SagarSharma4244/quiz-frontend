import { apiFetch } from "./apiBase";

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  publish_status?: string;
  questions_sequence?: string[];
  level?: string;
}

interface BackendChapter {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  publish_status?: string;
  questions_sequence?: string[];
  level?: string;
}

const mapChapter = (chapter: BackendChapter): Chapter => ({
  id: chapter.id,
  subjectId: chapter.subjectId,
  name: chapter.title,
  description: chapter.description,
  publish_status: chapter.publish_status,
  questions_sequence: chapter.questions_sequence,
  level: chapter.level,
});

export async function getChapters(subjectId?: string): Promise<Chapter[]> {
  const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : "";
  const chapters = await apiFetch<BackendChapter[]>(`/api/chapters${query}`);
  return chapters.map(mapChapter);
}

export async function getChapter(chapterId: string): Promise<Chapter> {
  const chapter = await apiFetch<BackendChapter>(`/api/chapters/${chapterId}`);
  return mapChapter(chapter);
}

export async function createChapter(data: { subjectId: string; name: string; description?: string; publish_status?: string; questions_sequence?: string[]; level?: string }): Promise<Chapter> {
  const payload = {
    id: `chap-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subjectId: data.subjectId,
    title: data.name,
    description: data.description ?? "",
    publish_status: data.publish_status ?? "Draft",
    questions_sequence: data.questions_sequence ?? [],
    level: data.level ?? "Easy",
  };
  const chapter = await apiFetch<BackendChapter>("/api/chapters", "POST", payload);
  return mapChapter(chapter);
}

export async function updateChapter(chapterId: string, data: { name?: string; description?: string; publish_status?: string; questions_sequence?: string[]; level?: string }): Promise<Chapter> {
  const chapter = await apiFetch<BackendChapter>(`/api/chapters/${chapterId}`, "PUT", {
    ...(data.name ? { title: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.publish_status !== undefined ? { publish_status: data.publish_status } : {}),
    ...(data.questions_sequence !== undefined ? { questions_sequence: data.questions_sequence } : {}),
    ...(data.level !== undefined ? { level: data.level } : {}),
  });
  return mapChapter(chapter);
}

export async function createChaptersBulk(chapters: { id: string; subjectId: string; title: string; description?: string; publish_status?: string; questions_sequence?: string[]; level?: string }[]): Promise<{ created: Chapter[]; errors: { chapter: string; error: string }[] }> {
  const result = await apiFetch<{ created: ReturnType<typeof Array<any>>; errors: { chapter: string; error: string }[] }>("/api/chapters/bulk", "POST", { chapters });
  return {
    created: (result.created as any[]).map(mapChapter),
    errors: result.errors,
  };
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await apiFetch<void>(`/api/chapters/${chapterId}`, "DELETE");
}
