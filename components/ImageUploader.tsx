"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Camera, X, AlertTriangle } from "lucide-react";

interface Props {
  onImageSelected: (base64: string, mimeType: string, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

const MAX_SIZE_MB = 10;

export default function ImageUploader({ onImageSelected, preview, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setSizeError(false);
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setSizeError(true);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        const mime = file.type || "image/jpeg";
        onImageSelected(base64, mime, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 dark:border-amber-900 shadow-lg">
        <img
          src={preview}
          alt="Preview"
          className="w-full max-h-80 object-contain bg-cream-100 dark:bg-ink-800"
        />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 bg-ink-900/80 hover:bg-ink-900 text-cream-50 rounded-full p-1.5 transition-all"
          aria-label="Remove image"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${dragging
            ? "border-amber-accent bg-amber-50 dark:bg-amber-900/10 scale-[1.01]"
            : "border-amber-200 dark:border-ink-700 hover:border-amber-accent dark:hover:border-amber-accent bg-cream-50 dark:bg-ink-800/50"
          }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Upload size={24} className="text-amber-accent" />
          </div>
          <div>
            <p className="font-display text-lg text-ink-800 dark:text-cream-100">
              Drop your study material here
            </p>
            <p className="text-sm text-ink-700/60 dark:text-cream-200/50 mt-1">
              JPG, PNG, WEBP, HEIC · Max {MAX_SIZE_MB}MB
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-accent/10 text-amber-accent font-medium border border-amber-accent/20">
            Click to browse
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* Camera capture */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
          border border-amber-200 dark:border-ink-700 bg-cream-50 dark:bg-ink-800/50
          hover:border-amber-accent hover:bg-amber-50 dark:hover:bg-amber-900/10
          text-ink-800 dark:text-cream-100 font-medium transition-all duration-200"
      >
        <Camera size={18} className="text-amber-accent" />
        <span>Take a Photo</span>
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />

      {sizeError && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-200 dark:border-red-800">
          <AlertTriangle size={16} />
          <span>File exceeds {MAX_SIZE_MB}MB. Please use a smaller image.</span>
        </div>
      )}
    </div>
  );
}