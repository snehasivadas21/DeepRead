"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/hooks/useWorkspace";

export default function WorkspacePage() {
  const params = useParams();

  const workspaceId = Number(params.workspaceId);

  const {
    workspace,
    loading,
    error,
  } = useWorkspace(workspaceId);

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
    
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="border-b px-6 py-6">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            DeepRead
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            AI Research Platform
          </p>
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {workspace.name}
        </h1>

        <p className="mt-2 text-gray-600">
          {workspace.description || "No description"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">
            Sources
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload and manage your research documents.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">
            AI Chat
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Ask questions about your research.
          </p>
        </section>
      </div>
    </main>
  );
}