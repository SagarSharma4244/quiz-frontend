"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { getSubjects, Subject, updateSubject, createSubject } from "@/lib/subjects";
import { getChapters, Chapter, createChaptersBulk, updateChapter, createChapter } from "@/lib/chapters";
import { getQuestions, QuizQuestion, createQuestionsBulk, updateQuestion, updateQuestionsBulk, createQuestion } from "@/lib/questions";

interface QuestionInput {
  title: string;
  options: string[];
  answer: number;
}

interface ChapterInput {
  title: string;
  questions: QuestionInput[];
}

interface UploadPayload {
  chapters: ChapterInput[];
}

type UploadStatus = "idle" | "running" | "done" | "error";

const SUBJECT_STATUSES = ["Draft", "private", "public"] as const;
const CHAPTER_STATUSES = ["Draft", "private", "public"] as const;
const QUESTION_STATUSES = ["Draft", "private", "public", "testing"] as const;

const STATUS_STYLES: Record<string, string> = {
  public:   "bg-green-100 text-green-700",
  private:  "bg-yellow-100 text-yellow-700",
  Draft:    "bg-zinc-100 text-zinc-500",
  testing:  "bg-blue-100 text-blue-700",
};

const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

function SettingsDropdown({
  statuses,
  current,
  onSelect,
  updating,
  onEdit,
  onAdd,
  onBulkUpload,
}: {
  statuses: readonly string[];
  current?: string;
  onSelect: (s: string) => void;
  updating: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
  onBulkUpload?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setStatusOpen(false); }}
        disabled={updating}
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40"
        title="Settings"
      >
        {updating ? (
          <span className="text-xs">…</span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.3" />
            <circle cx="8" cy="8" r="1.3" />
            <circle cx="8" cy="13" r="1.3" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {/* Add new button */}
          {onAdd && (
            <button
              onClick={() => { onAdd(); setOpen(false); setStatusOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M7 2v10M2 7h10" />
              </svg>
              <span>Add new</span>
            </button>
          )}
          {/* Edit details button */}
          {onEdit && (
            <button
              onClick={() => { onEdit(); setOpen(false); setStatusOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" />
              </svg>
              <span>Edit details</span>
            </button>
          )}
          {/* Bulk upload button */}
          {onBulkUpload && (
            <button
              onClick={() => { onBulkUpload(); setOpen(false); setStatusOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 9V2M4 5l3-3 3 3M2 11h10" />
              </svg>
              <span>Bulk upload</span>
            </button>
          )}
          {(onAdd || onEdit || onBulkUpload) && <div className="border-t border-zinc-100" />}

          {/* Status parent row */}
          <button
            onClick={() => setStatusOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <span>Publish status</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
              className={`text-zinc-400 transition-transform ${statusOpen ? "rotate-90" : ""}`}
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Status children */}
          {statusOpen && (
            <div className="border-t border-zinc-100">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { onSelect(s); setOpen(false); setStatusOpen(false); }}
                  className={`flex w-full items-center justify-between px-5 py-1.5 text-sm hover:bg-zinc-50 ${
                    current === s ? "font-medium text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  <span>{capitalize(s)}</span>
                  {current === s && <span className="text-zinc-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditSubjectForm({
  entity,
  saving,
  onSave,
  onCancel,
  submitLabel = "Save",
}: {
  entity: Subject;
  saving: boolean;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description ?? "");
  const canSave = name.trim().length > 0 && !saving;

  return (
    <div className="space-y-4 px-6 py-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(name.trim(), description)}
          disabled={!canSave}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

const LEVELS = ["Easy", "Medium", "Hard"] as const;

function EditChapterForm({
  entity,
  saving,
  onSave,
  onCancel,
  submitLabel = "Save",
}: {
  entity: Chapter;
  saving: boolean;
  onSave: (name: string, description: string, level: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description ?? "");
  const [level, setLevel] = useState(entity.level ?? "Easy");
  const canSave = name.trim().length > 0 && !saving;

  return (
    <div className="space-y-4 px-6 py-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Level</label>
        <div className="flex rounded-lg border border-zinc-300 overflow-hidden">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                level === l
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(name.trim(), description, level)}
          disabled={!canSave}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

function EditQuestionForm({
  entity,
  saving,
  onSave,
  onCancel,
  submitLabel = "Save",
}: {
  entity: QuizQuestion;
  saving: boolean;
  onSave: (question: string, options: string[], correctIndex: number, subtitle: string, reason: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [question, setQuestion] = useState(entity.question);
  const [options, setOptions] = useState<string[]>(entity.options.length > 0 ? [...entity.options] : ["", ""]);
  const [correctIndex, setCorrectIndex] = useState(entity.correctIndex);
  const [subtitle, setSubtitle] = useState(entity.subtitle ?? "");
  const [reason, setReason] = useState(entity.reason ?? "");

  const canSave =
    !saving &&
    question.trim().length > 0 &&
    options.length >= 2 &&
    options.every((o) => o.trim().length > 0) &&
    correctIndex >= 0 &&
    correctIndex < options.length;

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctIndex >= newOptions.length) {
      setCorrectIndex(Math.max(0, newOptions.length - 1));
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  return (
    <div className="space-y-4 px-6 py-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Options</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                i === correctIndex ? "border-green-300 bg-green-50" : "border-zinc-200 bg-white"
              }`}
            >
              <input
                type="radio"
                checked={i === correctIndex}
                onChange={() => setCorrectIndex(i)}
                className="shrink-0 accent-green-600"
                title="Mark as correct"
              />
              <span className={`shrink-0 w-5 font-mono text-xs ${i === correctIndex ? "text-green-600" : "text-zinc-400"}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 bg-transparent text-sm text-zinc-900 focus:outline-none"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 text-zinc-400 hover:text-red-500"
                  title="Remove option"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 2l10 10M12 2L2 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 text-sm text-zinc-500 hover:text-zinc-700"
        >
          + Add option
        </button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Subtitle <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Reason / Explanation <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(question.trim(), options, correctIndex, subtitle, reason)}
          disabled={!canSave}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);


  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingChapters, setSyncingChapters] = useState(false);
  const [updatingSubject, setUpdatingSubject] = useState(false);
  const [updatingChapter, setUpdatingChapter] = useState(false);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);

  type EditTarget =
    | { kind: "subject";  entity: Subject }
    | { kind: "chapter";  entity: Chapter }
    | { kind: "question"; entity: QuizQuestion };

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  type CreateTarget = { kind: "subject" } | { kind: "chapter" } | { kind: "question" };
  const [createTarget, setCreateTarget] = useState<CreateTarget | null>(null);
  const [createSaving, setCreateSaving] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [json, setJson] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [summary, setSummary] = useState("");

  useEffect(() => { getSubjects().then(setSubjects); }, []);

  const selectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setSelectedQuestion(null);
    setQuestions([]);
    setLoadingChapters(true);
    setChapters(await getChapters(subject.id));
    setLoadingChapters(false);
  };

  const selectChapter = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedQuestion(null);
    setLoadingQuestions(true);
    setQuestions(await getQuestions(chapter.id));
    setLoadingQuestions(false);
  };

  const handleSubjectStatus = async (status: string) => {
    if (!selectedSubject) return;
    setUpdatingSubject(true);
    const updated = await updateSubject(selectedSubject.id, { publish_status: status });
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSubject(updated);
    setUpdatingSubject(false);
  };

  const handleChapterStatus = async (status: string) => {
    if (!selectedChapter) return;
    setUpdatingChapter(true);
    const updated = await updateChapter(selectedChapter.id, { publish_status: status });
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? updated : ch)));
    setSelectedChapter(updated);

    if (questions.length > 0) {
      const ids = questions.map((q) => q.id);
      await updateQuestionsBulk(ids, { publish_status: status });
      setQuestions((prev) => prev.map((q) => ({ ...q, publish_status: status })));
    }

    setUpdatingChapter(false);
  };

  const handleQuestionStatus = async (status: string) => {
    if (!selectedQuestion) return;
    setUpdatingQuestion(true);
    const updated = await updateQuestion(selectedQuestion.id, { publish_status: status });
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setSelectedQuestion(updated);
    setUpdatingQuestion(false);
  };

  const chaptersOutOfSync =
    selectedSubject !== null &&
    !loadingChapters &&
    chapters.length !== (selectedSubject.chapters_sequence?.length ?? 0);

  const handleSyncChapters = async () => {
    if (!selectedSubject) return;
    setSyncingChapters(true);
    const updated = await updateSubject(selectedSubject.id, { chapters_sequence: chapters.map((ch) => ch.id) });
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSubject(updated);
    setSyncingChapters(false);
  };

  const isOutOfSync =
    selectedChapter !== null &&
    !loadingQuestions &&
    questions.length !== (selectedChapter.questions_sequence?.length ?? 0);

  const handleSync = async () => {
    if (!selectedChapter) return;
    setSyncing(true);
    const updated = await updateChapter(selectedChapter.id, { questions_sequence: questions.map((q) => q.id) });
    setSelectedChapter(updated);
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? updated : ch)));
    setSyncing(false);
  };

  const handleEditSubjectSave = async (name: string, description: string) => {
    if (!selectedSubject) return;
    setEditSaving(true);
    const updated = await updateSubject(selectedSubject.id, { name, description });
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSubject(updated);
    setEditSaving(false);
    setEditTarget(null);
  };

  const handleEditChapterSave = async (name: string, description: string, level: string) => {
    if (!selectedChapter) return;
    setEditSaving(true);
    const updated = await updateChapter(selectedChapter.id, { name, description, level });
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? updated : ch)));
    setSelectedChapter(updated);
    setEditSaving(false);
    setEditTarget(null);
  };

  const handleEditQuestionSave = async (
    question: string, options: string[], correctIndex: number,
    subtitle: string, reason: string
  ) => {
    if (!selectedQuestion) return;
    setEditSaving(true);
    const updated = await updateQuestion(selectedQuestion.id, { question, options, correctIndex, subtitle, reason });
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setSelectedQuestion(updated);
    setEditSaving(false);
    setEditTarget(null);
  };

  const handleCreateSubjectSave = async (name: string, description: string) => {
    setCreateSaving(true);
    const created = await createSubject({ name, description });
    setSubjects((prev) => [...prev, created]);
    setSelectedSubject(created);
    setChapters([]);
    setSelectedChapter(null);
    setSelectedQuestion(null);
    setQuestions([]);
    setCreateSaving(false);
    setCreateTarget(null);
  };

  const handleCreateChapterSave = async (name: string, description: string, level: string) => {
    if (!selectedSubject) return;
    setCreateSaving(true);
    const created = await createChapter({ subjectId: selectedSubject.id, name, description, level });
    setChapters((prev) => [...prev, created]);
    setSelectedChapter(created);
    setSelectedQuestion(null);
    setQuestions([]);
    setCreateSaving(false);
    setCreateTarget(null);
  };

  const handleCreateQuestionSave = async (
    question: string, options: string[], correctIndex: number,
    subtitle: string, reason: string
  ) => {
    if (!selectedChapter) return;
    setCreateSaving(true);
    const created = await createQuestion({ chapterId: selectedChapter.id, question, options, correctIndex, subtitle, reason });
    setQuestions((prev) => [...prev, created]);
    setSelectedQuestion(created);
    setCreateSaving(false);
    setCreateTarget(null);
  };

  const appendLog = (line: string) => setLog((prev) => [...prev, line]);

  const handleUpload = async () => {
    setLog([]);
    setSummary("");

    if (!selectedSubject) { setSummary("Please select a subject first."); setUploadStatus("error"); return; }

    let payload: UploadPayload;
    try { payload = JSON.parse(json); } catch {
      setSummary("Invalid JSON — please check your input."); setUploadStatus("error"); return;
    }
    if (!payload || !Array.isArray(payload.chapters)) {
      setSummary('JSON must have a top-level "chapters" array.'); setUploadStatus("error"); return;
    }

    setUploadStatus("running");

    const chapterPayloads = payload.chapters.map((ch) => ({
      id: `chap-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      subjectId: selectedSubject.id,
      title: ch.title,
    }));
    appendLog(`Creating ${chapterPayloads.length} chapter(s)…`);
    const chaptersResult = await createChaptersBulk(chapterPayloads);
    chaptersResult.created.forEach((ch) => appendLog(`✓ Chapter: ${ch.name}`));
    chaptersResult.errors.forEach((e) => appendLog(`✗ Chapter "${e.chapter}": ${e.error}`));

    const questionPayloads = chaptersResult.created.flatMap((createdChapter) => {
      const original = payload.chapters.find((ch) => ch.title === createdChapter.name);
      if (!original) return [];
      return (original.questions ?? []).map((q) => ({
        id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        chapterId: createdChapter.id,
        title: q.title,
        options: q.options,
        answer: q.answer,
      }));
    });
    appendLog(`Creating ${questionPayloads.length} question(s)…`);
    const questionsResult = await createQuestionsBulk(questionPayloads);
    questionsResult.created.forEach((q) => appendLog(`✓ Question: ${q.question}`));
    questionsResult.errors.forEach((e) => appendLog(`✗ Question "${e.question}": ${e.error}`));

    const totalErrors = chaptersResult.errors.length + questionsResult.errors.length;
    setSummary(`${chaptersResult.created.length} chapter(s) and ${questionsResult.created.length} question(s) created${totalErrors > 0 ? `, ${totalErrors} error(s)` : ""}.`);
    setUploadStatus(totalErrors > 0 ? "error" : "done");
    setChapters(await getChapters(selectedSubject.id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <Header />

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>

        {/* Column 1 — Subjects */}
        <div className="flex w-64 min-h-0 flex-shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-zinc-100 px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Subjects</p>
            <div className="flex items-center gap-1">
            {selectedSubject && (
              <SettingsDropdown
                statuses={SUBJECT_STATUSES}
                current={selectedSubject.publish_status}
                onSelect={handleSubjectStatus}
                updating={updatingSubject}
                onAdd={() => setCreateTarget({ kind: "subject" })}
                onEdit={() => setEditTarget({ kind: "subject", entity: selectedSubject })}
                onBulkUpload={() => { setShowUpload(true); setLog([]); setSummary(""); setUploadStatus("idle"); }}
              />
            )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {subjects.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-400">Loading…</p>
            ) : (
              subjects.map((s) => {
                const selected = selectedSubject?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSubject(s)}
                    className={`flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm transition-colors ${
                      selected ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                        {s.chapters_sequence?.length ?? 0} chapters
                      </p>
                    </div>
                    {s.publish_status && s.publish_status !== "public" && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.publish_status] ?? "bg-zinc-100 text-zinc-500"}`}>
                        {capitalize(s.publish_status)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2 — Chapters */}
        <div className="flex w-72 min-h-0 flex-shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-zinc-100 px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {selectedSubject ? `Chapters — ${selectedSubject.name}` : "Chapters"}
            </p>
            <div className="flex items-center gap-2">
              {chaptersOutOfSync && (
                <button
                  onClick={handleSyncChapters}
                  disabled={syncingChapters}
                  className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  title={`Sequence has ${selectedSubject?.chapters_sequence?.length ?? 0} IDs but ${chapters.length} chapters exist`}
                >
                  {syncingChapters ? "Syncing…" : "⚠ Sync sequence"}
                </button>
              )}
              {selectedChapter && (
                <SettingsDropdown
                  statuses={CHAPTER_STATUSES}
                  current={selectedChapter.publish_status}
                  onSelect={handleChapterStatus}
                  updating={updatingChapter}
                  onAdd={() => setCreateTarget({ kind: "chapter" })}
                  onEdit={() => setEditTarget({ kind: "chapter", entity: selectedChapter })}
                />
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!selectedSubject ? (
              <p className="px-4 py-6 text-sm text-zinc-400">Select a subject</p>
            ) : loadingChapters ? (
              <p className="px-4 py-6 text-sm text-zinc-400">Loading…</p>
            ) : chapters.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-400">No chapters yet</p>
            ) : (
              chapters.map((ch, i) => {
                const selected = selectedChapter?.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => selectChapter(ch)}
                    className={`flex cursor-pointer items-start gap-2 px-4 py-3 text-sm transition-colors ${
                      selected ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="shrink-0 pt-0.5 font-mono text-xs text-zinc-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ch.name}</p>
                      <p className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                        {ch.level} · {ch.questions_sequence?.length ?? 0} questions
                      </p>
                    </div>
                    {ch.publish_status && ch.publish_status !== "public" && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ch.publish_status] ?? "bg-zinc-100 text-zinc-500"}`}>
                        {capitalize(ch.publish_status)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3 — Questions */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Questions list */}
          <div className="flex h-[28rem] flex-shrink-0 flex-col border-b border-zinc-200">
            <div className="flex h-11 items-center justify-between border-b border-zinc-100 bg-white px-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {selectedChapter ? `Questions — ${selectedChapter.name}` : "Questions"}
              </p>
              <div className="flex items-center gap-2">
                {isOutOfSync && (
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    title={`Sequence has ${selectedChapter?.questions_sequence?.length ?? 0} IDs but ${questions.length} questions exist`}
                  >
                    {syncing ? "Syncing…" : "⚠ Sync sequence"}
                  </button>
                )}
                {selectedQuestion && (
                  <SettingsDropdown
                    statuses={QUESTION_STATUSES}
                    current={selectedQuestion.publish_status}
                    onSelect={handleQuestionStatus}
                    updating={updatingQuestion}
                    onAdd={() => setCreateTarget({ kind: "question" })}
                    onEdit={() => setEditTarget({ kind: "question", entity: selectedQuestion })}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {!selectedChapter ? (
                <p className="px-4 py-6 text-sm text-zinc-400">Select a chapter</p>
              ) : loadingQuestions ? (
                <p className="px-4 py-6 text-sm text-zinc-400">Loading…</p>
              ) : questions.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-400">No questions yet</p>
              ) : (
                questions.map((q, i) => {
                  const selected = selectedQuestion?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`flex cursor-pointer items-start gap-2 px-4 py-2.5 text-sm transition-colors ${
                        selected ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="shrink-0 pt-0.5 font-mono text-xs text-zinc-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{q.question}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                            {(q.question_type ?? "mcq").toUpperCase()}
                          </span>
                          <span className={`text-xs ${selected ? "text-zinc-400" : "text-zinc-300"}`}>·</span>
                          <span className={`text-xs ${selected ? "text-zinc-300" : "text-zinc-400"}`}>
                            {q.options.length} options
                          </span>
                        </div>
                      </div>
                      {q.publish_status && q.publish_status !== "public" && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[q.publish_status] ?? "bg-zinc-100 text-zinc-500"}`}>
                          {capitalize(q.publish_status)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Question detail */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50 px-6 py-5">
            {!selectedQuestion ? (
              <p className="text-sm text-zinc-400">Select a question to see details</p>
            ) : (
              <div className="space-y-4">
                <p className="text-base font-semibold text-zinc-900">{selectedQuestion.question}</p>
                <ul className="space-y-2">
                  {selectedQuestion.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
                        i === selectedQuestion.correctIndex
                          ? "border-green-300 bg-green-50 text-zinc-700"
                          : "border-zinc-200 bg-white text-zinc-700"
                      }`}
                    >
                      <span className="shrink-0 font-mono text-xs text-zinc-400">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Bulk Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-base font-semibold text-zinc-900">Bulk Upload</h2>
              <button onClick={() => setShowUpload(false)} className="text-lg leading-none text-zinc-400 hover:text-zinc-700">✕</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700">
                Uploading into: <span className="font-semibold">{selectedSubject?.name ?? "— no subject selected —"}</span>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">JSON Payload</label>
                <textarea
                  className="h-56 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder={`{\n  "chapters": [\n    {\n      "title": "Chapter title",\n      "questions": [\n        { "title": "Q?", "options": ["A","B","C","D"], "answer": 0 }\n      ]\n    }\n  ]\n}`}
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  disabled={uploadStatus === "running"}
                />
              </div>
              {log.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <ul className="space-y-0.5 font-mono text-xs">
                    {log.map((line, i) => (
                      <li key={i} className={line.includes("✗") ? "text-red-600" : "text-zinc-700"}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {summary && (
                <p className={`rounded-lg px-4 py-2.5 text-sm font-medium ${uploadStatus === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {summary}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
              <button onClick={() => setShowUpload(false)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
                Close
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadStatus === "running"}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {uploadStatus === "running" ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditTarget(null); }}
        >
          <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-base font-semibold text-zinc-900">
                {editTarget.kind === "subject" && "Edit Subject"}
                {editTarget.kind === "chapter" && "Edit Chapter"}
                {editTarget.kind === "question" && "Edit Question"}
              </h2>
              <button
                onClick={() => setEditTarget(null)}
                className="text-lg leading-none text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {editTarget.kind === "subject" && (
                <EditSubjectForm
                  entity={editTarget.entity}
                  saving={editSaving}
                  onSave={handleEditSubjectSave}
                  onCancel={() => setEditTarget(null)}
                />
              )}
              {editTarget.kind === "chapter" && (
                <EditChapterForm
                  entity={editTarget.entity}
                  saving={editSaving}
                  onSave={handleEditChapterSave}
                  onCancel={() => setEditTarget(null)}
                />
              )}
              {editTarget.kind === "question" && (
                <EditQuestionForm
                  entity={editTarget.entity}
                  saving={editSaving}
                  onSave={handleEditQuestionSave}
                  onCancel={() => setEditTarget(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {createTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setCreateTarget(null); }}
        >
          <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <h2 className="text-base font-semibold text-zinc-900">
                {createTarget.kind === "subject" && "New Subject"}
                {createTarget.kind === "chapter" && "New Chapter"}
                {createTarget.kind === "question" && "New Question"}
              </h2>
              <button
                onClick={() => setCreateTarget(null)}
                className="text-lg leading-none text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {createTarget.kind === "subject" && (
                <EditSubjectForm
                  entity={{ id: "", name: "", description: "" }}
                  saving={createSaving}
                  onSave={handleCreateSubjectSave}
                  onCancel={() => setCreateTarget(null)}
                  submitLabel="Create"
                />
              )}
              {createTarget.kind === "chapter" && (
                <EditChapterForm
                  entity={{ id: "", subjectId: "", name: "", description: "", level: "Easy" }}
                  saving={createSaving}
                  onSave={handleCreateChapterSave}
                  onCancel={() => setCreateTarget(null)}
                  submitLabel="Create"
                />
              )}
              {createTarget.kind === "question" && (
                <EditQuestionForm
                  entity={{ id: "", chapterId: "", question: "", options: ["", ""], correctIndex: 0 }}
                  saving={createSaving}
                  onSave={handleCreateQuestionSave}
                  onCancel={() => setCreateTarget(null)}
                  submitLabel="Create"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
