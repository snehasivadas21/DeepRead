"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  Workspace,
  WorkspaceCreateData,
  WorkspaceUpdateData,
} from "@/types/workspace";

interface WorkspaceModalProps {
  open: boolean;
  workspace?: Workspace | null;
  onClose: () => void;
  onSubmit: (
    data: WorkspaceCreateData | WorkspaceUpdateData
  ) => Promise<void>;
}

export default function WorkspaceModal({
  open,
  workspace,
  onClose,
  onSubmit,
}: WorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!workspace;

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || "");
    } else {
      setName("");
      setDescription("");
    }

    setError("");
  }, [workspace, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditMode
              ? "Edit Workspace"
              : "Create Workspace"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-black"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Workspace Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. AI Research"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What is this workspace about?"
              rows={4}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}