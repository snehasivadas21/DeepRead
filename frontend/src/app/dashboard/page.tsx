"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";
import Sidebar from "@/components/Sidebar";

type Workspace = {
  id: number;
  name: string;
  description?: string;
  updated_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleCreateWorkspace() {
    if (!workspaceName.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/workspaces", {
        method: "POST",
        body: JSON.stringify({
          name: workspaceName,
          description,
        }),
      });

      setWorkspaces((prev) => [data, ...prev]);

      setWorkspaceName("");
      setDescription("");
      setShowCreate(false);

      setMessage("Workspace created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  function openWorkspace(id: number) {
    router.push(`/workspace/${id}`);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      {/* Main content */}
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
            onClick={() => setShowCreate(true)}
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
              and use AI to understand and explore your documents.
            </p>
          </div>

          {/* Workspace section */}
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

            {workspaces.length === 0 ? (

              <div className="rounded-xl border border-dashed bg-white p-12 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                  +
                </div>

                <h4 className="text-lg font-semibold">
                  No workspaces yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Create your first workspace to start adding
                  research papers, PDFs, and other sources.
                </p>

                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-5 rounded-lg bg-black px-5 py-3 text-sm text-white"
                >
                  Create Your First Workspace
                </button>

              </div>

            ) : (

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {workspaces.map((workspace) => (

                  <button
                    key={workspace.id}
                    onClick={() => openWorkspace(workspace.id)}
                    className="rounded-xl border bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <div className="mb-4 flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        📚
                      </div>

                      <span className="text-xs text-gray-400">
                        #{workspace.id}
                      </span>

                    </div>

                    <h4 className="font-semibold">
                      {workspace.name}
                    </h4>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {workspace.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5 text-xs text-gray-400">
                      {workspace.updated_at
                        ? new Date(
                            workspace.updated_at
                          ).toLocaleDateString()
                        : "Recently created"}
                    </div>

                  </button>

                ))}

              </div>

            )}

          </div>

          {/* Quick actions */}
          <div className="mt-10">

            <h3 className="mb-4 text-lg font-semibold">
              Quick Actions
            </h3>

            <div className="grid gap-4 md:grid-cols-3">

              <button
                onClick={() => setShowCreate(true)}
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

      {/* Create Workspace Modal */}
      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-semibold">
                  Create Workspace
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Start a new research project.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="text-xl text-gray-400 hover:text-black"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Workspace Name
                </label>

                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) =>
                    setWorkspaceName(e.target.value)
                  }
                  placeholder="My Research Project"
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="What are you researching?"
                  rows={4}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border px-4 py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateWorkspace}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
                >
                  {loading
                    ? "Creating..."
                    : "Create Workspace"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}