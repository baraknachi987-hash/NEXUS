/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, UserRole } from "../types";
import {
  Home,
  Users,
  KanbanSquare,
  MessageSquare,
  Bot,
  Plus
} from "lucide-react";

interface BottomBarProps {
  currentUser?: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedChats: number;
  onQuickAction: () => void;
}

export default function BottomBar({
  currentUser,
  activeTab,
  setActiveTab,
  unresolvedChats,
  onQuickAction
}: BottomBarProps) {
  const isAgent = currentUser?.role === UserRole.AGENT;
  
  const tabs = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "teams", label: "HR Hub", icon: Users },
    { id: "tasks", label: "Tasks", icon: KanbanSquare },
    { id: "messages", label: "Chats", icon: MessageSquare, badge: unresolvedChats },
    { id: "ai", label: "AI Advisor", icon: Bot }
  ];

  // Dynamically slice depending on length to balance the floating middle button perfectly
  const splitIndex = Math.ceil(tabs.length / 2);
  const leftTabs = tabs.slice(0, splitIndex);
  const rightTabs = tabs.slice(splitIndex);

  return (
    <nav className="fixed bottom-0 w-full lg:hidden bg-slate-950/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] flex justify-around items-center h-20 px-4 pb-safe z-50">
      {leftTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-all relative ${
              isActive ? "text-indigo-400 scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            {isActive && (
              <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow"></span>
            )}
          </button>
        );
      })}

      {/* Floating Action Center Button */}
      <div className="flex items-center justify-center -mt-10 mx-2 relative z-50">
        <button
          onClick={onQuickAction}
          className="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-90 animate-pulse"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {rightTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-all relative ${
              isActive ? "text-indigo-400 scale-105" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-2 right-4 bg-indigo-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            ) : null}
            {isActive && (
              <span className="absolute top-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
