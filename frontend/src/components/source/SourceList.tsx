"use client";

import { Source } from "@/types/source";
import SourceCard from "@/components/source/SourceCard";

interface SourceListProps {
  sources: Source[];
  onDelete: (sourceId: number) => void;
}

export default function SourceList({
  sources,
  onDelete,
}: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          No sources uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}