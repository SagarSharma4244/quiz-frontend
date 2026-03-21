import { apiFetch } from "./apiBase";

export interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
  question_type?: string;
  subtitle?: string;
  reason?: string;
  publish_status?: string;
}

interface BackendQuestion {
  id: string;
  chapterId: string;
  question_type: string;
  title: string;
  options: string[];
  answer: number;
  subtitle?: string;
  reason?: string;
  publish_status?: string;
}

const mapBackendQuestion = (q: BackendQuestion): QuizQuestion => ({
  id: q.id,
  chapterId: q.chapterId,
  question: q.title,
  options: q.options,
  correctIndex: q.answer,
  question_type: q.question_type,
  subtitle: q.subtitle,
  reason: q.reason,
  publish_status: q.publish_status,
});

export function validateQuestionPayload(data: {
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
}) {
  const errors: string[] = [];

  if (!data.chapterId?.trim()) {
    errors.push("chapterId is required");
  }

  if (!data.question?.trim()) {
    errors.push("question text is required");
  }

  if (!Array.isArray(data.options) || data.options.length < 2) {
    errors.push("at least 2 options are required");
  } else {
    data.options.forEach((option, idx) => {
      if (!option || !option.toString().trim()) {
        errors.push(`option ${idx + 1} cannot be empty`);
      }
    });
  }

  if (typeof data.correctIndex !== "number" || Number.isNaN(data.correctIndex)) {
    errors.push("correctIndex must be a number");
  } else if (data.correctIndex < 0 || data.correctIndex >= data.options.length) {
    errors.push("correctIndex must be within the options array range");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateQuestionUpdatePayload(data: {
  question?: string;
  options?: string[];
  correctIndex?: number;
}) {
  const errors: string[] = [];
  if (data.question !== undefined && !data.question.trim()) {
    errors.push("question text cannot be empty");
  }

  if (data.options !== undefined) {
    if (!Array.isArray(data.options) || data.options.length < 2) {
      errors.push("at least 2 options are required");
    } else {
      data.options.forEach((option, idx) => {
        if (!option || !option.toString().trim()) {
          errors.push(`option ${idx + 1} cannot be empty`);
        }
      });
    }
  }

  if (data.correctIndex !== undefined) {
    if (typeof data.correctIndex !== "number" || Number.isNaN(data.correctIndex)) {
      errors.push("correctIndex must be a number");
    } else if (data.options && (data.correctIndex < 0 || data.correctIndex >= data.options.length)) {
      errors.push("correctIndex must be within the options array range");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function getQuestions(chapterId?: string): Promise<QuizQuestion[]> {
  const query = chapterId ? `?chapterId=${encodeURIComponent(chapterId)}` : "";
  const questions = await apiFetch<BackendQuestion[]>(`/api/questions${query}`);
  return questions.map(mapBackendQuestion);
}

export async function getQuestion(questionId: string): Promise<QuizQuestion> {
  const q = await apiFetch<BackendQuestion>(`/api/questions/${questionId}`);
  return mapBackendQuestion(q);
}

export async function createQuestion(data: {
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
  subtitle?: string;
  reason?: string;
}): Promise<QuizQuestion> {
  const validation = validateQuestionPayload(data);
  if (!validation.valid) {
    throw new Error(`Invalid question data: ${validation.errors.join(", ")}`);
  }

  const backend = await apiFetch<BackendQuestion>("/api/questions", "POST", {
    id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    chapterId: data.chapterId,
    question_type: "mcq",
    title: data.question,
    options: data.options,
    answer: data.correctIndex,
    ...(data.subtitle ? { subtitle: data.subtitle } : {}),
    ...(data.reason ? { reason: data.reason } : {}),
  });

  return mapBackendQuestion(backend);
}

export async function updateQuestionsBulk(
  ids: string[],
  updates: { publish_status?: string }
): Promise<{ matched: number; modified: number }> {
  return apiFetch('/api/questions/bulk', 'PUT', { ids, updates });
}

export async function createQuestionsBulk(questions: { id: string; chapterId: string; title: string; options: string[]; answer: number }[]): Promise<{ created: QuizQuestion[]; errors: { question: string; error: string }[] }> {
  const result = await apiFetch<{ created: any[]; errors: { question: string; error: string }[] }>("/api/questions/bulk", "POST", { questions });
  return {
    created: result.created.map(mapBackendQuestion),
    errors: result.errors,
  };
}

export async function updateQuestion(
  questionId: string,
  data: {
    question?: string;
    options?: string[];
    correctIndex?: number;
    publish_status?: string;
    subtitle?: string;
    reason?: string;
  }
): Promise<QuizQuestion> {
  if (Object.keys(data).length === 0) {
    throw new Error("At least one field is required to update");
  }

  const validation = validateQuestionUpdatePayload(data);
  if (!validation.valid) {
    throw new Error(`Invalid question update data: ${validation.errors.join(", ")}`);
  }

  const payload: Partial<Pick<BackendQuestion, "title" | "options" | "answer" | "publish_status" | "subtitle" | "reason">> = {};
  if (data.question !== undefined) payload.title = data.question;
  if (data.options !== undefined) payload.options = data.options;
  if (data.correctIndex !== undefined) payload.answer = data.correctIndex;
  if (data.publish_status !== undefined) payload.publish_status = data.publish_status;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.reason !== undefined) payload.reason = data.reason;

  const updated = await apiFetch<BackendQuestion>(`/api/questions/${questionId}`, "PUT", payload);
  return mapBackendQuestion(updated);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiFetch<void>(`/api/questions/${questionId}`, "DELETE");
}

export async function submitAnswer(questionId: string, selectedIndex: number): Promise<{ isCorrect: boolean; correctIndex: number }> {
  const result = await apiFetch<{ isCorrect: boolean; answer: number }>(`/api/questions/${questionId}/submit`, "POST", { selectedIndex });
  return {
    isCorrect: result.isCorrect,
    correctIndex: result.answer,
  };
}

