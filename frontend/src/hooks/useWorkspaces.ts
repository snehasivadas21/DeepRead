"use client";

import { useCallback, useEffect, useState } from "react";

import {createWorkspace,getWorkspaces,updateWorkspace,deleteWorkspace,} from "@/services/workspace.service";

import {Workspace,WorkspaceCreateData,WorkspaceUpdateData,} from "@/types/workspace";

import { useAuth } from "@/context/AuthContext";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {accessToken} = useAuth();

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspaces(accessToken);
      setWorkspaces(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workspaces."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkspace = async (data: WorkspaceCreateData) => {
    const newWorkspace = await createWorkspace(data,accessToken);

    setWorkspaces((current) => [
      newWorkspace,
      ...current,
    ]);

    return newWorkspace;
  };

  const editWorkspace = async (
    workspaceId: number,
    data: WorkspaceUpdateData
  ) => {
    const updatedWorkspace = await updateWorkspace(
      workspaceId,
      data,
      accessToken
    );

    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId
          ? updatedWorkspace
          : workspace
      )
    );

    return updatedWorkspace;
  };

  const removeWorkspace = async (workspaceId: number) => {
    await deleteWorkspace(workspaceId,accessToken);

    setWorkspaces((current) =>
      current.filter(
        (workspace) => workspace.id !== workspaceId
      )
    );
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
  };
}