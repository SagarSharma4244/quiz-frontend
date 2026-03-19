import { apiFetch } from "./apiBase";

export interface QuizQuestion {
  id: string;
  topicId: string;
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
  topicId: q.chapterId,
  question: q.title,
  options: q.options,
  correctIndex: q.answer,
  question_type: q.question_type,
  subtitle: q.subtitle,
  reason: q.reason,
  publish_status: q.publish_status,
});

export function validateQuestionPayload(data: {
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
}) {
  const errors: string[] = [];

  if (!data.topicId?.trim()) {
    errors.push("topicId is required");
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

export async function getQuestions(topicId?: string): Promise<QuizQuestion[]> {
  const query = topicId ? `?chapterId=${encodeURIComponent(topicId)}` : "";
  const questions = await apiFetch<BackendQuestion[]>(`/api/questions${query}`);
  return questions.map(mapBackendQuestion);
}

export async function getQuestion(questionId: string): Promise<QuizQuestion> {
  const q = await apiFetch<BackendQuestion>(`/api/questions/${questionId}`);
  return mapBackendQuestion(q);
}

export async function createQuestion(data: {
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
}): Promise<QuizQuestion> {
  const validation = validateQuestionPayload(data);
  if (!validation.valid) {
    throw new Error(`Invalid question data: ${validation.errors.join(", ")}`);
  }

  const backend = await apiFetch<BackendQuestion>("/api/questions", "POST", {
    id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    chapterId: data.topicId,
    question_type: "mcq",
    title: data.question,
    options: data.options,
    answer: data.correctIndex,
  });

  return mapBackendQuestion(backend);
}

export async function updateQuestion(
  questionId: string,
  data: {
    question?: string;
    options?: string[];
    correctIndex?: number;
  }
): Promise<QuizQuestion> {
  if (Object.keys(data).length === 0) {
    throw new Error("At least one field is required to update");
  }

  const validation = validateQuestionUpdatePayload(data);
  if (!validation.valid) {
    throw new Error(`Invalid question update data: ${validation.errors.join(", ")}`);
  }

  const payload: Partial<Pick<BackendQuestion, "title" | "options" | "answer">> = {};
  if (data.question !== undefined) payload.title = data.question;
  if (data.options !== undefined) payload.options = data.options;
  if (data.correctIndex !== undefined) payload.answer = data.correctIndex;

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

