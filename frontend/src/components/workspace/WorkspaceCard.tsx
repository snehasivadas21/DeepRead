"use client";

import Link from "next/link";
import { Workspace } from "@/types/workspace";

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspaceId: number) => void;
}

export default function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {workspace.name}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {workspace.description || "No description"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/workspace/${workspace.id}`}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Open
        </Link>

        <button
          onClick={() => onEdit(workspace)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(workspace.id)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}