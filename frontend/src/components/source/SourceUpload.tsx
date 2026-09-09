"use client";

import {
  ChangeEvent,
  DragEvent,
  useState,
} from "react";

interface SourceUploadProps {
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export default function SourceUpload({
  uploading,
  onUpload,
}: SourceUploadProps) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function validateFile(file: File) {
    setError("");

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Only PDF files are allowed.");
      return false;
    }

    setSelectedFile(file);
    return true;
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    validateFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!uploading) {
      setDragging(true);
    }
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile || uploading) {
      return;
    }

    try {
      setError("");
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload file."
      );
    }
  }

  function clearFile() {
    setSelectedFile(null);
    setError("");
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? "border-black bg-gray-50"
            : "border-gray-300"
        } ${
          uploading
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        <div className="text-3xl">📄</div>

        <p className="mt-3 font-medium">
          Drop your PDF here
        </p>

        <p className="mt-1 text-sm text-gray-500">
          or choose a file from your computer
        </p>

        <label className="mt-4 inline-block cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Choose PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between rounded-lg border bg-gray-50 p-4">
          <div>
            <p className="text-sm font-medium">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          {!uploading && (
            <button
              type="button"
              onClick={clearFile}
              className="text-sm text-gray-500 hover:text-black"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="mt-4 w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Uploading PDF..." : "Upload PDF"}
      </button>
    </div>
  );
}