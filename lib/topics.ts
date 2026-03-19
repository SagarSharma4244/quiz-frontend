import { apiFetch } from "./apiBase";

export interface Topic {
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

const mapChapterToTopic = (chapter: BackendChapter): Topic => ({
  id: chapter.id,
  subjectId: chapter.subjectId,
  name: chapter.title,
  description: chapter.description,
  publish_status: chapter.publish_status,
  questions_sequence: chapter.questions_sequence,
  level: chapter.level,
});

export async function getTopics(subjectId?: string): Promise<Topic[]> {
  const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : "";
  const chapters = await apiFetch<BackendChapter[]>(`/api/chapters${query}`);
  return chapters.map(mapChapterToTopic);
}

export async function getTopic(topicId: string): Promise<Topic> {
  const chapter = await apiFetch<BackendChapter>(`/api/chapters/${topicId}`);
  return mapChapterToTopic(chapter);
}

export async function createTopic(data: { subjectId: string; name: string; description?: string; publish_status?: string; questions_sequence?: string[]; level?: string }): Promise<Topic> {
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
  return mapChapterToTopic(chapter);
}

export async function updateTopic(topicId: string, data: { name?: string; description?: string; publish_status?: string; questions_sequence?: string[]; level?: string }): Promise<Topic> {
  const chapter = await apiFetch<BackendChapter>(`/api/chapters/${topicId}`, "PUT", {
    ...(data.name ? { title: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.publish_status !== undefined ? { publish_status: data.publish_status } : {}),
    ...(data.questions_sequence !== undefined ? { questions_sequence: data.questions_sequence } : {}),
    ...(data.level !== undefined ? { level: data.level } : {}),
  });
  return mapChapterToTopic(chapter);
}

export async function deleteTopic(topicId: string): Promise<void> {
  await apiFetch<void>(`/api/chapters/${topicId}`, "DELETE");
}

