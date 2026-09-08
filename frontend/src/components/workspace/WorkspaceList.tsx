"use client";

import WorkspaceCard from "./WorkspaceCard";
import { Workspace } from "@/types/workspace";

interface WorkspaceListProps {
  workspaces: Workspace[];
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspaceId: number) => void;
}

export default function WorkspaceList({
  workspaces,
  onEdit,
  onDelete,
}: WorkspaceListProps) {
  if (workspaces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h3 className="text-lg font-semibold">
          No workspaces yet
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Create your first workspace to start researching.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}