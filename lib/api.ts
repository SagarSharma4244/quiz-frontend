const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export interface Sector {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  sectorId: string;
  name: string;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getSectors(): Promise<Sector[]> {
  return fetchApi<Sector[]>("/api/sectors");
}

export async function getSector(sectorId: string): Promise<Sector> {
  return fetchApi<Sector>(`/api/sectors/${sectorId}`);
}

export async function getTopics(sectorId?: string): Promise<Topic[]> {
  const query = sectorId ? `?sectorId=${encodeURIComponent(sectorId)}` : "";
  return fetchApi<Topic[]>(`/api/topics${query}`);
}

export async function getTopic(topicId: string): Promise<Topic> {
  return fetchApi<Topic>(`/api/topics/${topicId}`);
}

export async function getQuestions(topicId?: string): Promise<QuizQuestion[]> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : "";
  return fetchApi<QuizQuestion[]>(`/api/questions${query}`);
}

export async function getQuestion(questionId: string): Promise<QuizQuestion> {
  return fetchApi<QuizQuestion>(`/api/questions/${questionId}`);
}

export async function submitAnswer(
  questionId: string,
  selectedIndex: number
): Promise<{ isCorrect: boolean; correctIndex: number }> {
  const res = await fetch(`${API_URL}/api/questions/${questionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedIndex }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
