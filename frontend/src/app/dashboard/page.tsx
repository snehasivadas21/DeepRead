"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import WorkspaceModal from "@/components/workspace/WorkspaceModal";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Workspace } from "@/types/workspace";

export default function DashboardPage() {
  const router = useRouter();

  const {
    workspaces,
    loading,
    error,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
  } = useWorkspaces();

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Workspace | null>(null);

  const [message, setMessage] = useState("");

  function handleCreate() {
    setSelectedWorkspace(null);
    setMessage("");
    setShowModal(true);
  }

  function handleEdit(workspace: Workspace) {
    setSelectedWorkspace(workspace);
    setMessage("");
    setShowModal(true);
  }

  async function handleSubmit(
    data: {
      name: string;
      description?: string | null;
    }
  ) {
    if (selectedWorkspace) {
      await editWorkspace(selectedWorkspace.id, {
        name: data.name,
        description: data.description,
      });

      setMessage("Workspace updated successfully.");
    } else {
      await addWorkspace({
        name: data.name,
        description: data.description,
      });

      setMessage("Workspace created successfully.");
    }
  }

  async function handleDelete(workspaceId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeWorkspace(workspaceId);
      setMessage("Workspace deleted successfully.");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to delete workspace."
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-8 py-5">
          <div>
            <h2 className="text-2xl font-semibold">
              Dashboard
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your research workspaces.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Create Workspace
          </button>
        </header>

        {/* Content */}
        <section className="p-8">
          {/* Messages */}
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Welcome */}
          <div className="mb-8 rounded-xl border bg-white p-6">
            <h3 className="text-xl font-semibold">
              Welcome to DeepRead 👋
            </h3>

            <p className="mt-2 max-w-2xl text-gray-600">
              Create a workspace, add your research sources,
              and use AI to understand and explore your
              documents.
            </p>
          </div>

          {/* Workspaces */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Recent Workspaces
              </h3>

              <span className="text-sm text-gray-500">
                {workspaces.length} workspace
                {workspaces.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
                Loading workspaces...
              </div>
            ) : (
              <WorkspaceList
                workspaces={workspaces}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-10">
            <h3 className="mb-4 text-lg font-semibold">
              Quick Actions
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={handleCreate}
                className="rounded-xl border bg-white p-5 text-left hover:shadow-sm"
              >
                <div className="mb-3 text-2xl">📁</div>

                <h4 className="font-medium">
                  New Workspace
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Start a new research project.
                </p>
              </button>

              <button
                onClick={() => router.push("/profile")}
                className="rounded-xl border bg-white p-5 text-left hover:shadow-sm"
              >
                <div className="mb-3 text-2xl">👤</div>

                <h4 className="font-medium">
                  Your Profile
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your account information.
                </p>
              </button>

              <button
                onClick={() => router.push("/research")}
                className="rounded-xl border bg-white p-5 text-left hover:shadow-sm"
              >
                <div className="mb-3 text-2xl">🔬</div>

                <h4 className="font-medium">
                  Research
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Explore your research.
                </p>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Create / Edit Workspace */}
      <WorkspaceModal
        open={showModal}
        workspace={selectedWorkspace}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}