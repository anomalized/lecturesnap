"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun, Shuffle, ChevronLeft, ChevronRight, History, X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import NotesDisplay from "@/components/NotesDisplay";
import FlashCard from "@/components/FlashCard";

const SUBJECTS = [
  { value: "auto", label: "✨ Auto-detect" },
  { value: "Mathematics", label: "📐 Mathematics" },
  { value: "Physics", label: "⚛️ Physics" },
  { value: "Chemistry", label: "🧪 Chemistry" },
  { value: "Biology", label: "🧬 Biology" },
  { value: "Computer Science", label: "💻 Computer Science" },
  { value: "History", label: "🏛️ History" },
  { value: "Economics", label: "📈 Economics" },
  { value: "Language/Literature", label: "📖 Language/Literature" },
  { value: "Other", label: "📚 Other" },
];

const LOADING_MESSAGES = [
  "Reading your image…",
  "Identifying concepts…",
  "Generating flashcards…",
  "Almost done…",
];

type Tab = "notes" | "flashcards" | "both";

interface HistoryItem {
  id: string;
  title: string;
  subject: string;
  timestamp: number;
  result: Record<string, unknown>;
  preview: string;
}

export default function Home() {
  const [dark, setDark] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [preview, setPreview] = useState<string | null>(null);
  const [subject, setSubject] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("notes");
  const [cardIndex, setCardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem("ls-dark");
    if (saved === "true") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);
  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("ls-dark", String(next));
      return next;
    });
  };

  // History
  useEffect(() => {
    const saved = localStorage.getItem("ls-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);
  const saveHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 5);
      localStorage.setItem("ls-history", JSON.stringify(next));
      return next;
    });
  }, []);

  // Loading message cycling
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(id);
  }, [loading]);

  const handleImageSelected = (b64: string, mime: string, prev: string) => {
    setImageBase64(b64);
    setMimeType(mime);
    setPreview(prev);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setImageBase64(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setLoadingMsg(0);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, subject }),
      });
      const data = await res.json();

      if (data.error && !data.flashcards) {
        setError(data.error);
      } else {
        setResult(data);
        const cards = (data.flashcards as { question: string; answer: string }[]) || [];
        setFlashcards(cards);
        setCardIndex(0);
        saveHistory({
          id: Date.now().toString(),
          title: (data.title as string) || "Untitled",
          subject: (data.subject as string) || subject,
          timestamp: Date.now(),
          result: data,
          preview: preview || "",
        });
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const shuffle = () => {
    setFlashcards((f) => [...f].sort(() => Math.random() - 0.5));
    setCardIndex(0);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setPreview(item.preview);
    setFlashcards((item.result.flashcards as { question: string; answer: string }[]) || []);
    setCardIndex(0);
    setShowHistory(false);
    setError(null);
  };

  const r = result as {
    title?: string;
    subject?: string;
    notes?: Record<string, unknown>;
    flashcards?: { question: string; answer: string }[];
    difficulty_level?: string;
    estimated_study_time?: string;
  } | null;

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#141210] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-[#141210]/90 backdrop-blur border-b border-amber-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📸</span>
            <span className="font-display text-xl text-ink-900 dark:text-cream-50">
              LectureSnap
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-amber-200 dark:border-ink-700 hover:border-amber-accent text-ink-700 dark:text-cream-200 transition-all"
            >
              <History size={14} />
              <span className="hidden sm:inline">Recent</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-accent text-white text-[10px] flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-full border border-amber-200 dark:border-ink-700 flex items-center justify-center hover:border-amber-accent transition-all text-ink-700 dark:text-cream-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative ml-auto w-80 h-full bg-cream-50 dark:bg-ink-900 border-l border-amber-100 dark:border-ink-700 overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink-900 dark:text-cream-50">Recent Sessions</h2>
              <button onClick={() => setShowHistory(false)} className="text-ink-700 dark:text-cream-200 hover:text-amber-accent">
                <X size={18} />
              </button>
            </div>
            {history.length === 0 && (
              <p className="text-sm text-ink-700/60 dark:text-cream-200/50 text-center py-8">No history yet</p>
            )}
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="w-full text-left p-4 rounded-xl border border-amber-100 dark:border-ink-700 hover:border-amber-accent bg-cream-100/50 dark:bg-ink-800/50 transition-all group"
              >
                {item.preview && (
                  <img src={item.preview} alt="" className="w-full h-24 object-cover rounded-lg mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <p className="font-semibold text-sm text-ink-900 dark:text-cream-50 line-clamp-1">{item.title}</p>
                <p className="text-xs text-amber-accent mt-0.5">{item.subject}</p>
                <p className="text-xs text-ink-700/50 dark:text-cream-200/40 mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl text-ink-900 dark:text-cream-50 leading-tight mb-3">
            Snap. Process.{" "}
            <span className="text-amber-accent italic">Master.</span>
          </h1>
          <p className="text-ink-700/70 dark:text-cream-200/60 max-w-xl mx-auto leading-relaxed">
            Photograph any study material — whiteboards, notes, slides, textbooks — and get structured notes and flashcards in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel — input */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-ink-800/60 rounded-2xl border border-amber-100 dark:border-ink-700 p-5 shadow-sm space-y-5">
              <ImageUploader
                onImageSelected={handleImageSelected}
                preview={preview}
                onClear={handleClear}
              />

              {/* Subject selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-amber-accent mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-cream-50 dark:bg-ink-800 border border-amber-200 dark:border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-900 dark:text-cream-50 appearance-none cursor-pointer focus:outline-none focus:border-amber-accent transition-colors"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Process button */}
              <button
                onClick={handleProcess}
                disabled={!imageBase64 || loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                  bg-amber-accent hover:bg-amber-light disabled:opacity-40 disabled:cursor-not-allowed
                  text-white shadow-lg shadow-amber-accent/25 hover:shadow-amber-light/30 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {LOADING_MESSAGES[loadingMsg]}
                  </span>
                ) : (
                  "Generate Notes & Flashcards →"
                )}
              </button>

              {/* Loading shimmer bar */}
              {loading && (
                <div className="h-1 rounded-full bg-amber-100 dark:bg-ink-700 overflow-hidden">
                  <div className="h-full shimmer rounded-full" />
                </div>
              )}
            </div>

            {/* Tips */}
            {!result && !loading && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/40 p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-amber-accent mb-2">Tips</p>
                <ul className="space-y-1.5 text-sm text-ink-700/80 dark:text-cream-200/60">
                  <li>💡 Good lighting makes text clearer</li>
                  <li>📐 Keep text in frame and readable</li>
                  <li>📱 Camera capture works great on mobile</li>
                  <li>🖼️ Works with screenshots too</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right panel — output */}
          <div className="lg:col-span-3">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 animate-fade-up">
                <p className="font-display text-lg text-red-700 dark:text-red-400 mb-2">Couldn't process image</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">{error}</p>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-700/60 dark:text-red-400/60 uppercase tracking-wide">Try:</p>
                  <ul className="text-xs text-red-600/70 dark:text-red-400/60 space-y-1">
                    <li>• Better lighting</li>
                    <li>• Getting closer to the material</li>
                    <li>• A clearer, less blurry shot</li>
                    <li>• Making sure text is fully in frame</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Results */}
            {r && (
              <div className="space-y-5 animate-fade-up">
                {/* Title */}
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-amber-accent mb-1">{r.subject}</p>
                  <h2 className="font-display text-2xl text-ink-900 dark:text-cream-50">{r.title}</h2>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-cream-100 dark:bg-ink-800/60 rounded-xl p-1 border border-amber-100 dark:border-ink-700">
                  {(["notes", "flashcards", "both"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        tab === t
                          ? "bg-amber-accent text-white shadow-sm shadow-amber-accent/30"
                          : "text-ink-700 dark:text-cream-200/70 hover:text-ink-900 dark:hover:text-cream-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                {(tab === "notes" || tab === "both") && r.notes && (
                  <NotesDisplay
                    notes={r.notes as Parameters<typeof NotesDisplay>[0]["notes"]}
                    subject={(r.subject as string) || ""}
                    title={(r.title as string) || ""}
                    difficulty_level={(r.difficulty_level as string) || "Intermediate"}
                    estimated_study_time={(r.estimated_study_time as string) || ""}
                  />
                )}

                {/* Flashcards */}
                {(tab === "flashcards" || tab === "both") && flashcards.length > 0 && (
                  <div className="space-y-4">
                    {tab === "both" && (
                      <div className="h-px bg-amber-100 dark:bg-ink-700 my-6" />
                    )}
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-sm font-semibold text-amber-accent uppercase tracking-widest">
                        Flashcards
                      </h3>
                      <button
                        onClick={shuffle}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-ink-700 hover:border-amber-accent text-ink-700 dark:text-cream-200 transition-all"
                      >
                        <Shuffle size={12} />
                        Shuffle
                      </button>
                    </div>

                    <FlashCard
                      key={cardIndex}
                      question={flashcards[cardIndex].question}
                      answer={flashcards[cardIndex].answer}
                      index={cardIndex}
                      total={flashcards.length}
                    />

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCardIndex((i) => Math.max(0, i - 1))}
                        disabled={cardIndex === 0}
                        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border border-amber-200 dark:border-ink-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-accent text-ink-700 dark:text-cream-200 transition-all"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <span className="text-xs text-ink-700/50 dark:text-cream-200/40 font-mono">
                        {cardIndex + 1} / {flashcards.length}
                      </span>
                      <button
                        onClick={() => setCardIndex((i) => Math.min(flashcards.length - 1, i + 1))}
                        disabled={cardIndex === flashcards.length - 1}
                        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border border-amber-200 dark:border-ink-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-accent text-ink-700 dark:text-cream-200 transition-all"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!result && !error && !loading && (
              <div className="h-full min-h-64 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-amber-100 dark:border-ink-800 rounded-2xl">
                <span className="text-5xl mb-4">📚</span>
                <p className="font-display text-lg text-ink-900/60 dark:text-cream-50/40">
                  Your notes will appear here
                </p>
                <p className="text-sm text-ink-700/40 dark:text-cream-200/30 mt-1">
                  Upload an image to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-amber-100 dark:border-ink-800 py-6 text-center">
        <p className="text-xs text-ink-700/40 dark:text-cream-200/30 font-mono">
          LectureSnap · Powered by Gemini 2.5 Flash · Built with Next.js
        </p>
      </footer>
    </div>
  );
}