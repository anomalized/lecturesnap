"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { RotateCw } from "lucide-react";

interface Props {
  question: string;
  answer: string;
  index: number;
  total: number;
}

export default function FlashCard({ question, answer, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-3">
      {/* Counter */}
      <div className="flex items-center justify-between text-sm text-ink-700/60 dark:text-cream-200/50 px-1">
        <span className="font-mono text-xs tracking-widest uppercase">
          Card {index + 1} of {total}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index
                  ? "bg-amber-accent w-4"
                  : "bg-amber-200 dark:bg-ink-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="flip-card w-full h-64 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flip-card-front noise-card relative bg-gradient-to-br from-cream-50 to-amber-50 dark:from-ink-800 dark:to-ink-700 border border-amber-200 dark:border-ink-600 flex flex-col items-center justify-center p-8 shadow-lg">
            <span className="absolute top-4 left-4 text-xs font-mono tracking-widest uppercase text-amber-accent/70">
              Question
            </span>
            <div className="text-center text-ink-900 dark:text-cream-50 font-display text-lg leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {question}
              </ReactMarkdown>
            </div>
            <span className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-amber-accent/60">
              <RotateCw size={12} /> Tap to flip
            </span>
          </div>

          {/* Back */}
          <div className="flip-card-back noise-card relative bg-gradient-to-br from-ink-900 to-ink-800 dark:from-amber-900/40 dark:to-ink-800 border border-ink-700 dark:border-amber-900/50 flex flex-col items-center justify-center p-8 shadow-lg">
            <span className="absolute top-4 left-4 text-xs font-mono tracking-widest uppercase text-amber-muted/70">
              Answer
            </span>
            <div className="text-center text-cream-50 dark:text-cream-100 font-body text-base leading-relaxed prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => (
                    <p className="text-cream-50 dark:text-cream-100">{children}</p>
                  ),
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
            <span className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-amber-muted/60">
              <RotateCw size={12} /> Tap to flip
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}