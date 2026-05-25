"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Download, Check, BookOpen, Clock, Zap } from "lucide-react";

interface KeyConcept {
  term: string;
  definition: string;
}

interface Notes {
  summary: string;
  key_concepts: KeyConcept[];
  detailed_notes: string;
  important_formulas: string[];
}

interface Props {
  notes: Notes;
  subject: string;
  title: string;
  difficulty_level: string;
  estimated_study_time: string;
}

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  Intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export default function NotesDisplay({ notes, subject, title, difficulty_level, estimated_study_time }: Props) {
  const [copied, setCopied] = useState(false);

  const buildMarkdown = () => {
    const keyConcepts = notes.key_concepts
      .map((k) => `**${k.term}**: ${k.definition}`)
      .join("\n");
    const formulas = notes.important_formulas?.length
      ? `\n## Important Formulas\n${notes.important_formulas.map((f) => `- ${f}`).join("\n")}`
      : "";
    return `# ${title}\n**Subject:** ${subject} | **Difficulty:** ${difficulty_level} | **Study Time:** ${estimated_study_time}\n\n## Summary\n${notes.summary}\n\n## Key Concepts\n${keyConcepts}${formulas}\n\n## Detailed Notes\n${notes.detailed_notes}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header badges */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${difficultyColor[difficulty_level] || difficultyColor["Intermediate"]}`}>
          <Zap size={11} className="inline mr-1" />
          {difficulty_level}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-700 bg-cream-100 dark:bg-ink-800 text-ink-700 dark:text-cream-200 font-medium">
          <Clock size={11} className="inline mr-1" />
          {estimated_study_time}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full border border-ink-200 dark:border-ink-700 bg-cream-100 dark:bg-ink-800 text-ink-700 dark:text-cream-200 font-medium">
          <BookOpen size={11} className="inline mr-1" />
          {subject}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-accent transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-accent transition-all"
          >
            <Download size={12} />
            .md
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-cream-100 dark:bg-ink-800/80 rounded-xl p-5 border border-amber-100 dark:border-ink-700">
        <h3 className="font-display text-sm font-semibold text-amber-accent uppercase tracking-widest mb-2">
          Overview
        </h3>
        <p className="text-ink-800 dark:text-cream-100 leading-relaxed text-sm">{notes.summary}</p>
      </div>

      {/* Key concepts */}
      {notes.key_concepts?.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold text-amber-accent uppercase tracking-widest mb-3">
            Key Concepts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.key_concepts.map((c, i) => (
              <div
                key={i}
                className="bg-cream-50 dark:bg-ink-800/60 rounded-xl p-4 border border-amber-100 dark:border-ink-700 hover:border-amber-accent/40 transition-colors"
              >
                <dt className="font-semibold text-ink-900 dark:text-cream-50 text-sm mb-1">{c.term}</dt>
                <dd className="text-ink-700/80 dark:text-cream-200/70 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {c.definition}
                  </ReactMarkdown>
                </dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulas */}
      {notes.important_formulas?.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-semibold text-amber-accent uppercase tracking-widest mb-3">
            Important Formulas
          </h3>
          <div className="flex flex-wrap gap-2">
            {notes.important_formulas.map((f, i) => (
              <div
                key={i}
                className="bg-ink-900 dark:bg-ink-800 text-cream-50 rounded-xl px-4 py-2.5 font-mono text-sm border border-ink-700"
              >
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {f}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed notes */}
      <div>
        <h3 className="font-display text-sm font-semibold text-amber-accent uppercase tracking-widest mb-3">
          Full Notes
        </h3>
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-ink-900 dark:prose-headings:text-cream-50 prose-a:text-amber-accent bg-cream-50 dark:bg-ink-800/40 rounded-xl p-6 border border-amber-100 dark:border-ink-700">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {notes.detailed_notes}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}