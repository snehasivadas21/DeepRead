"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import WorkspaceList from "@/components/workspace/WorkspaceList";
import WorkspaceModal from "@/components/workspace/WorkspaceModal";
import ConfirmModal from "@/components/ConfirmModal";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Workspace } from "@/types/workspace";

export default function DashboardPage() {

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
  
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  function handleDeleteRequest(workspaceId: number) {
    setDeleteWorkspaceId(workspaceId); 
  }

  async function handleDeleteConfirm() {
    if (deleteWorkspaceId === null) {
       return; 
    } setDeleteLoading(true); 

    try { 
      await removeWorkspace(deleteWorkspaceId); 

      setMessage("Workspace deleted successfully."); 
      setDeleteWorkspaceId(null); 
    } catch (err) { 
      setMessage( 
        err instanceof Error ? err.message : "Failed to delete workspace." ); 
    } finally { 
      setDeleteLoading(false); 
    } }

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
                onDelete={handleDeleteRequest}
              />
            )}
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

      <ConfirmModal 
        isOpen={deleteWorkspaceId !== null} 
        title="Delete workspace?" 
        message="This action cannot be undone. The workspace and its related data may be permanently deleted." 
        onCancel={() => setDeleteWorkspaceId(null)} 
        onConfirm={handleDeleteConfirm} 
        loading={deleteLoading} />
    </div>
  );
}