import React from "react";
import { Settings as SettingsIcon, Shield, Bell, Key, Users } from "lucide-react";

export function Settings() {
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
    </div>
  );
}
