"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/hooks/useWorkspace";
import { useSources } from "@/hooks/useSources";

import SourceUpload from "@/components/source/SourceUpload";
import SourceList from "@/components/source/SourceList";
import ChatPanel from "@/components/chat/ChatPanel";
import EvaluationPanel from "@/components/evaluation/EvaluationPanel";
import ConfirmModal from "@/components/ConfirmModal";
import DeepResearchPanel from "@/components/research/DeepResearchPanel";

type WorkspaceTab = "chat" | "research" | "evaluation";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const { workspace, loading, error } = useWorkspace(workspaceId);

  const {
    sources,
    loading: sourcesLoading,
    uploading,
    error: sourcesError,
    uploadFile,
    removeSource,
  } = useSources(workspaceId);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [deleteSourceId, setDeleteSourceId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function handleDeleteRequest(sourceId: number) {
    setDeleteSourceId(sourceId);
  }

  async function handleDeleteConfirm() {
    if (deleteSourceId === null) return;

    try {
      setDeleteLoading(true);
      await removeSource(deleteSourceId);
      setDeleteSourceId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return <main className="p-8 text-gray-500">Loading workspace...</main>;
  }

  if (error) {
    return (
      <main className="p-8 text-red-700">
        {error}
      </main>
    );
  }

  if (!workspace) {
    return <main className="p-8">Workspace not found.</main>;
  }

  const tabs: { id: WorkspaceTab; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "research", label: "Deep Research" },
    { id: "evaluation", label: "Evaluation" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="shrink-0">
            <h1 className="text-xl font-bold">DeepRead</h1>
            <p className="text-xs text-gray-500">AI Research Platform</p>
          </Link>

          <span className="h-8 w-px bg-gray-200" />

          <div className="min-w-0">
            <h2 className="truncate font-semibold">{workspace.name}</h2>
            <p className="truncate text-xs text-gray-500">
              {workspace.description || "No description"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Persistent source sidebar */}
        <aside className="border-b bg-white p-5 md:border-b-0 md:border-r">
          <h2 className="text-lg font-semibold">Sources</h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">
            Manage documents for this workspace.
          </p>

          <SourceUpload
            uploading={uploading}
            onUpload={async (file) => {
              await uploadFile(file);
            }}
          />

          <div className="mt-5">
            {sourcesLoading ? (
              <p className="text-sm text-gray-500">Loading sources...</p>
            ) : sourcesError ? (
              <p className="text-sm text-red-600">{sourcesError}</p>
            ) : (
              <SourceList
                sources={sources}
                onDelete={handleDeleteRequest}
              />
            )}
          </div>
        </aside>

        {/* Main workspace */}
        <section className="min-w-0 p-4 md:p-6">
          <nav className="mb-5 flex flex-wrap gap-2 border-b pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "chat" && (
            <div className="rounded-xl border bg-white p-4 md:p-6">
              <ChatPanel workspaceId={workspaceId} />
            </div>
          )}

          {activeTab === "research" && (
            <div className="rounded-xl border bg-white p-6">
              <DeepResearchPanel workspaceId={workspaceId}/>
            </div>
          )}

          {activeTab === "evaluation" && (
            <div className="rounded-xl border bg-white p-6">
              <EvaluationPanel workspaceId={Number(workspaceId)}/>
            </div>
          )}
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
