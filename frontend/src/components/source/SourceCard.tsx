"use client";

import { Source } from "@/types/source";

interface SourceCardProps {
  source: Source;
  onDelete: (sourceId: number) => void;
}

export default function SourceCard({
  source,
  onDelete,
}: SourceCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          📄
        </div>

        <div>
          <h3 className="font-medium">
            {source.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {source.source_type.toUpperCase()} ·{" "}
            {source.status}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(source.id)}
        className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}