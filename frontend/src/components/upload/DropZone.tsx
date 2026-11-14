"use client";

import { useState, useCallback, useRef } from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResumeFile } from "@/types";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DropZoneProps {
  onFilesAdded: (files: ResumeFile[]) => void;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const accepted = Array.from(fileList).filter(
        (f) =>
          f.type === "application/pdf" ||
          f.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      const resumeFiles: ResumeFile[] = accepted.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
        status: "pending",
        progress: 0,
      }));
      onFilesAdded(resumeFiles);
    },
    [onFilesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-8 py-16 cursor-pointer transition-all",
        isDragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
        id="resume-file-input"
      />

      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
          isDragging ? "bg-indigo-100" : "bg-white border border-slate-200"
        )}
      >
        <UploadCloud
          className={cn(
            "w-8 h-8 transition-all",
            isDragging ? "text-indigo-600 scale-110" : "text-slate-400"
          )}
        />
      </div>

      <p className="text-base font-semibold text-slate-900 mb-1">
        {isDragging ? "Drop files here" : "Drag & drop resumes here"}
      </p>
      <p className="text-sm text-slate-500 mb-4">or click to browse files</p>

      <div className="flex items-center gap-3">
        {[
          { ext: "PDF", color: "bg-red-50 text-red-600 border-red-200" },
          { ext: "DOCX", color: "bg-blue-50 text-blue-600 border-blue-200" },
        ].map(({ ext, color }) => (
          <span
            key={ext}
            className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-medium ${color}`}
          >
            <File className="w-3 h-3" />
            {ext}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Max 10 files · 10 MB per file
      </p>
    </div>
  );
}

interface FileListProps {
  files: ResumeFile[];
  onRemove: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;
  return (
    <div className="space-y-2">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
              {f.status === "uploading" && (
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
              {f.status === "done" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Uploaded
                </span>
              )}
              {f.status === "error" && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3 h-3" /> Error
                </span>
              )}
            </div>
          </div>
          {f.status !== "done" && (
            <button
              onClick={() => onRemove(f.id)}
              className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              aria-label={`Remove ${f.name}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
