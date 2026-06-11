/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, UserRole } from "../types";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  MessageSquare,
  Bot,
  Settings,
  ShieldCheck,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
  unresolvedChats: number;
  onLogout: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  companyName,
  unresolvedChats,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teams", label: "HR & Timesheet", icon: Users },
    { id: "tasks", label: "Tasks", icon: KanbanSquare },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unresolvedChats },
    { id: "ai", label: "AI Advisor", icon: Bot, isGlow: true },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col h-full py-6 fixed left-0 top-0 w-72 bg-slate-900 border-r border-slate-800 shadow-sm z-50 justify-between">
      <div>
        {/* Brand System */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <span className="font-display-md text-xl font-black text-white">N</span>
          </div>
          <div>
            <span className="font-display-md text-xl tracking-tight text-white font-extrabold block">
              {companyName}
            </span>
            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black leading-none flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CORE SYSTEM
            </span>
          </div>
        </div>

        {/* User profile capsule card */}
        <div className="px-4 mb-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 relative group overflow-hidden">
            <div className="absolute inset-0 bg-slate-850 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/20"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="min-w-0">
                <p className="font-label-md text-xs text-white font-bold truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main core navigation items */}
        <nav className="space-y-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-body-md text-sm transition-all duration-150 group relative ${
                  isActive
                    ? "text-white bg-indigo-600 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-slate-800 text-white border border-slate-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Organization Meta and Logout option */}
      <div className="px-4 pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2 animate-fade-in">
          <span>ACCESS TIERS</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase font-bold text-[9px]">
            {currentUser.role === UserRole.CEO ? "root_ceo" : "worker_tier"}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-rose-400 hover:text-rose-100 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" /> EXIT Nexora OS
        </button>
      </div>
    </aside>
  );
}
