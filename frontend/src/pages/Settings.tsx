import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Shield, Bell, Key, Users, AlertTriangle } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../lib/store/auth";
import { useWorkspaceStore } from "../lib/store/workspace";
import { Button } from "../components/ui/Button";

export function Settings() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete ${activeWorkspace.name}? This action cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError("");
    try {
      await api.delete("/workspaces/details");
      setActiveWorkspace(null);
      localStorage.removeItem("activeWorkspaceId");
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete workspace. You may not have permission.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden divide-y divide-gray-100">
        
        {/* Profile Settings */}
        <div className="p-6 flex gap-6 items-start hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">General Settings</h3>
            <p className="text-sm text-gray-500 mt-1">Update organization details, timezone, and currency.</p>
          </div>
        </div>

        {/* Security */}
        <div className="p-6 flex gap-6 items-start hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Security & Privacy</h3>
            <p className="text-sm text-gray-500 mt-1">Manage passwords, 2FA, and access logs.</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="p-6 flex gap-6 items-start hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-500 mt-1">Invite colleagues and manage their permissions.</p>
          </div>
        </div>

        {/* API Keys */}
        <div className="p-6 flex gap-6 items-start hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">API & Integrations</h3>
            <p className="text-sm text-gray-500 mt-1">Manage API keys and external integrations.</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 flex gap-6 items-start hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">Configure email and push notification preferences.</p>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="mt-8 border border-red-200 bg-red-50/50 rounded-xl overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-900">Delete Workspace</h3>
              <p className="text-sm text-red-700/80 mt-1">
                Permanently delete <strong>{activeWorkspace?.name}</strong> and all of its data. This action is not reversible.
              </p>
              {error && <p className="text-xs text-red-600 font-medium mt-2">{error}</p>}
            </div>
          </div>
          <Button 
            variant="danger" 
            onClick={handleDeleteWorkspace} 
            isLoading={isDeleting}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
