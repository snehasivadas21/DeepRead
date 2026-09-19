import { CitationModalProps } from "@/types/citation";

export default function CitationModal({preview,loading,onClose,}: CitationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold">
              {preview?.source_name ?? "Citation"}
            </h3>

            {preview && (
              <p className="mt-1 text-xs text-gray-500">
                Page {preview.page_number}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading evidence...
            </p>
          ) : preview ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {preview.text}
            </p>
          ) : (
            <p className="text-sm text-red-600">
              Failed to load citation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}