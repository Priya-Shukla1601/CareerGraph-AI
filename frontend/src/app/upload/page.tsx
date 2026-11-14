

"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DropZone, FileList } from "@/components/upload/DropZone";
import type { ResumeFile } from "@/types";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { uploadResumes, type ParsedResume } from "@/lib/api";

export default function UploadPage() {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedResume[]>([]);
  const [uploadError, setUploadError] = useState("");

  const handleFilesAdded = (newFiles: ResumeFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setDone(false);
    setParsedResults([]);
    setUploadError("");
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleClear = () => {
    setFiles([]);
    setParsedResults([]);
    setDone(false);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setDone(false);
    setUploadError("");
    setParsedResults([]);

    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        status: "uploading",
        progress: 0,
      }))
    );

    try {
      const result = await uploadResumes(
        files.map((file) => file.file)
      );

      if (result.error || !result.data) {
        throw new Error(result.error || "Resume upload failed.");
      }

      setParsedResults(result.data.results);
      setDone(true);

      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "done",
          progress: 100,
        }))
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setUploadError(message);

      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "error",
          progress: 0,
        }))
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Upload Resumes
          </h1>
          <p className="mt-2 text-slate-500">
            Upload candidate resumes to extract information and analyze skills.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <DropZone onFilesAdded={handleFilesAdded} />

          {files.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Selected Files ({files.length})
                </h2>

                <button
                  onClick={handleClear}
                  disabled={uploading}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              <FileList
                files={files}
                onRemove={handleRemove}
              />
            </div>
          )}

          {uploadError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              {uploadError}
            </div>
          )}

          {done && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 size={20} />
              Successfully uploaded and extracted {parsedResults.length} resume(s)!
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="flex items-center rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={18} className="mr-2" />
              {uploading ? "Processing..." : "Upload & Extract"}
            </button>
          </div>
        </div>

        {/* Actual extracted resume information */}
        {parsedResults.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Extracted Resume Information
            </h2>

            {parsedResults.map((resume, index) => (
              <div
                key={`${resume.filename}-${index}`}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {resume.filename}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {resume.email || "Not found"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {resume.phone || "Not found"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-slate-900">
                    Extracted Skills
                  </h4>

                  {resume.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No skills detected.
                    </p>
                  )}
                </div>

                <details className="rounded-lg border border-slate-200 p-4">
                  <summary className="cursor-pointer font-medium text-slate-800">
                    View Complete Extracted Resume Text
                  </summary>

                  <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm text-slate-600">
                    {resume.extracted_text || "No text extracted."}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
