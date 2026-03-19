import { apiFetch } from "./apiBase";

export interface Subject {
  id: string;
  name: string;
  description?: string;
  publish_status?: string;
  chapters_sequence?: string[];
}

interface BackendSubject {
  id: string;
  title: string;
  description?: string;
  publish_status?: string;
  chapters_sequence?: string[];
}

const mapBackendSubject = (subject: BackendSubject): Subject => ({
  id: subject.id,
  name: subject.title,
  description: subject.description,
  publish_status: subject.publish_status,
  chapters_sequence: subject.chapters_sequence,
});

export async function getSubjects(): Promise<Subject[]> {
  const subjects = await apiFetch<BackendSubject[]>('/api/subjects');
  return subjects.map(mapBackendSubject);
}

export async function getSubject(subjectId: string): Promise<Subject> {
  const subject = await apiFetch<BackendSubject>(`/api/subjects/${subjectId}`);
  return mapBackendSubject(subject);
}

export async function createSubject(data: { id?: string; name: string; description?: string; publish_status?: string; chapters_sequence?: string[] }): Promise<Subject> {
  const id = data.id || `sub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const subject = await apiFetch<BackendSubject>('/api/subjects', 'POST', {
    id,
    title: data.name,
    description: data.description ?? '',
    publish_status: data.publish_status ?? 'Draft',
    chapters_sequence: data.chapters_sequence ?? [],
  });
  return mapBackendSubject(subject);
}

export async function updateSubject(subjectId: string, data: { name?: string; description?: string; publish_status?: string; chapters_sequence?: string[] }): Promise<Subject> {
  const subject = await apiFetch<BackendSubject>(`/api/subjects/${subjectId}`, 'PUT', {
    ...(data.name ? { title: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.publish_status !== undefined ? { publish_status: data.publish_status } : {}),
    ...(data.chapters_sequence !== undefined ? { chapters_sequence: data.chapters_sequence } : {}),
  });
  return mapBackendSubject(subject);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await apiFetch<void>(`/api/subjects/${subjectId}`, 'DELETE');
}

