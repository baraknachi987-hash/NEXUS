/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, UserRole, OrganizationSettings, AuditLog } from "../types";
import {
  Settings,
  Shield,
  HelpCircle,
  FolderLock,
  Workflow,
  Sparkles,
  RefreshCw,
  LogOut
} from "lucide-react";

interface SettingsViewProps {
  currentUser: User;
  users: User[];
  settings: OrganizationSettings;
  auditLogs: AuditLog[];
  onUpdateSettings: (settings: OrganizationSettings) => void;
  onSwitchUser: (userId: string) => void;
}

export default function SettingsView({
  currentUser,
  users,
  settings,
  auditLogs,
  onUpdateSettings,
  onSwitchUser
}: SettingsViewProps) {
  const [compName, setCompName] = useState(settings.companyName);
  const [welcomeMsg, setWelcomeMsg] = useState(settings.welcomeMessage);
  const [themeColor, setThemeColor] = useState(settings.brandColor);
  const [systemTheme, setSystemTheme] = useState(settings.theme);

  const hasBrandingAuthority = currentUser.role === UserRole.CEO;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBrandingAuthority) {
      alert("Unauthorized operational request. Only the CEO can alter organization brand settings.");
      return;
    }
    onUpdateSettings({
      companyName: compName,
      welcomeMessage: welcomeMsg,
      brandColor: themeColor,
      theme: systemTheme
    });
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-20">
      
      {/* Settings Header */}
      <section className="space-y-1">
        <h1 className="font-display-md text-3xl font-extrabold text-white tracking-tight">
          System Control & Customization
        </h1>
        <p className="text-slate-400 font-body-md text-sm">
          Customize brand experience parameters and audit recent operational promotions.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Company Settings Form */}
        <section className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white font-headline-md tracking-tight">
              Branding Configuration
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {!hasBrandingAuthority && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
                <Shield className="w-4 h-4" />
                <span>Branding modifications restricted. Only CEO can alter organization identity.</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                disabled={!hasBrandingAuthority}
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. Nexora Enterprise"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                Headline Welcome Message
              </label>
              <textarea
                disabled={!hasBrandingAuthority}
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                placeholder="Greetings shown at the top of the interface..."
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                  Brand Color Accent
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    disabled={!hasBrandingAuthority}
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 bg-transparent border border-white/10 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs font-mono text-slate-300 uppercase">{themeColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                  PWA Global Theme Mode
                </label>
                <select
                  disabled={!hasBrandingAuthority}
                  value={systemTheme}
                  onChange={(e) => setSystemTheme(e.target.value as "dark" | "light")}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="dark">Dark Cosmic (Recommended)</option>
                  <option value="light">Refined Light Mode</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!hasBrandingAuthority}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Brand Configurations
            </button>
          </form>
        </section>

        {/* User Simulation Role Switcher */}
        <section className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-headline-md tracking-tight">
                Simulate Role Identity
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Verify how navigation controls, Kanban queues, and summary boards automatically adapt based on distinct credential authorizations.
            </p>

            <div className="space-y-2">
              {users.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => onSwitchUser(usr.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    currentUser.id === usr.id
                      ? "bg-indigo-500/10 border-indigo-500/30 text-white font-semibold shadow-inner"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={usr.avatar} alt="Usr" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <div>
                      <p className="text-sm font-semibold truncate leading-none mb-1">{usr.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">{usr.role}</p>
                    </div>
                  </div>
                  {currentUser.id === usr.id && (
                    <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black uppercase font-mono">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-500 font-mono text-center">
              Secure Auth Handshake Active • Nexora OS v1.1
            </p>
          </div>
        </section>

      </div>

      {/* System Audit Logs List */}
      <section className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <FolderLock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white font-headline-md">
              System Audit Trails
            </h3>
          </div>
          <span className="text-xs text-indigo-400 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
            Durable Logging Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 font-mono uppercase text-xs">
                <th className="py-2.5 font-bold">Activity</th>
                <th className="py-2.5 font-bold">Target</th>
                <th className="py-2.5 font-bold">Timestamp</th>
                <th className="py-2.5 font-bold">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="text-slate-300 font-medium">
                  <td className="py-3">
                    <span className="font-bold text-white">{log.actorName}</span> {log.action}
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-200">
                    {log.targetName || log.details || "N/A"}
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-xs">{log.timestamp}</td>
                  <td className="py-3">
                    <span className="bg-white/5 text-indigo-300 text-[10px] px-2.5 py-0.5 font-mono uppercase font-bold rounded">
                      {log.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
