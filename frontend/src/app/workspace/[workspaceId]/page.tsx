"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/hooks/useWorkspace";
import { useSources } from "@/hooks/useSources";

import SourceUpload from "@/components/source/SourceUpload";
import SourceList from "@/components/source/SourceList";
import ChatPanel from "@/components/chat/ChatPanel";
import ConfirmModal from "@/components/ConfirmModal";

export default function WorkspacePage() {
  const params = useParams();

  const workspaceId = Number(params.workspaceId);

  const {
    workspace,
    loading,
    error,
  } = useWorkspace(workspaceId);

  const {
    sources,
    loading: sourcesLoading,
    uploading,
    error: sourcesError,
    uploadFile,
    removeSource,
  } = useSources(workspaceId);

  const [deleteSourceId, setDeleteSourceId] =
    useState<number | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  function handleDeleteRequest(sourceId: number) {
    setDeleteSourceId(sourceId);
  }

  async function handleDeleteConfirm() {
    if (deleteSourceId === null) {
      return;
    }

    try {
      setDeleteLoading(true);

      await removeSource(deleteSourceId);

      setDeleteSourceId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Loading workspace...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="rounded-xl border bg-white p-6">
          Workspace not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="shrink-0">
            <h1 className="text-xl font-bold leading-tight">
              DeepRead
            </h1>

            <p className="text-xs text-gray-500">
              AI Research Platform
            </p>
          </Link>

          <span className="h-8 w-px bg-gray-200" />

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold leading-tight">
              {workspace.name}
            </h2>

            <p className="truncate text-xs text-gray-500">
              {workspace.description || "No description"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Sources
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Upload and manage your research documents.
            </p>
          </div>

          <SourceUpload
            uploading={uploading}
            onUpload={async (file) => {
              await uploadFile(file);
            }}
          />

          <div className="mt-6">
            {sourcesLoading ? (
              <p className="text-sm text-gray-500">
                Loading sources...
              </p>
            ) : sourcesError ? (
              <p className="text-sm text-red-600">
                {sourcesError}
              </p>
            ) : (
              <SourceList
                sources={sources}
                onDelete={handleDeleteRequest}
              />
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <ChatPanel workspaceId={workspaceId} />
        </section>
      </div>

      <ConfirmModal
        isOpen={deleteSourceId !== null}
        title="Delete source?"
        message="This action cannot be undone. The source and its processed data may be permanently deleted."
        onCancel={() => setDeleteSourceId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </main>
  );
}
