import React, { useState, useEffect } from "react";
import {
  User,
  UserRole,
  Task,
  TaskStatus,
  TaskPriority,
  Message,
  Channel,
  Announcement,
  AuditLog,
  Achievement,
  CalendarEvent,
  OrganizationSettings,
  MessageType,
  TaskComment,
  AttendanceLog,
  LeaveRequest
} from "./types";
import { StateManager } from "./data";
import Sidebar from "./components/Sidebar";
import BottomBar from "./components/BottomBar";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import MessagesView from "./components/MessagesView";
import AIAdvisorView from "./components/AIAdvisorView";
import SettingsView from "./components/SettingsView";
import HRAttendanceView from "./components/HRAttendanceView";
import LiquidBackground from "./components/LiquidBackground";
import YetiLogin from "./components/YetiLogin";
import {
  Bell,
  Menu,
  ShieldCheck,
  PlaySquare,
  Users2
} from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("NEXORA_TOKEN"));
  const [loading, setLoading] = useState<boolean>(true);
  
  // Base client container initial state representation fallback
  const [state, setState] = useState(() => StateManager.getOrInitialize());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync loaded state to localStorage locally for resilience
  useEffect(() => {
    if (state) {
      StateManager.save(state);
    }
  }, [state]);

  // Synchronize state fetcher routine from the backend API directly
  const syncState = (secretToken = token) => {
    if (!secretToken) return;
    fetch("/api/state", {
      headers: { "Authorization": `Bearer ${secretToken}` }
    })
    .then(r => {
      if (!r.ok) {
        throw new Error("Stale authentication credentials.");
      }
      return r.json();
    })
    .then(data => {
      setState(data);
    })
    .catch(err => {
      console.error("State synchronization error", err);
      handleLogout();
    });
  };

  // On mount or token coordinate adjustments, perform full fetch check
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/state", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => {
      if (!r.ok) {
        throw new Error("Expired session.");
      }
      return r.json();
    })
    .then(data => {
      setState(data);
    })
    .catch(() => {
      localStorage.removeItem("NEXORA_TOKEN");
      setToken(null);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token]);

  const {
    users = [],
    channels = [],
    messages = [],
    tasks = [],
    announcements = [],
    auditLogs = [],
    achievements = [],
    calendarEvents = [],
    settings = {
      companyName: "Nexora Enterprise",
      logoUrl: "",
      brandColor: "#4f46e5",
      welcomeMessage: "Welcome to Nexora Enterprise",
      theme: "dark"
    },
    currentUser = null,
    attendanceLogs = [],
    leaveRequests = []
  } = state || {};

  const totalUnread = (channels || []).reduce((acc: number, c: Channel) => acc + (c.unreadCount || 0), 0);

  // --- REST Fulfilled Event Mutation Controllers ---

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus, progress: number) => {
    if (!token) return;
    try {
      const resp = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, progress })
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (taskData: Omit<Task, "id" | "comments" | "attachments" | "progress">) => {
    if (!token) return;
    try {
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    try {
      const resp = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (
    channelId: string,
    content: string,
    type: MessageType = "text",
    fileName?: string,
    fileSize?: string
  ) => {
    if (!token) return;
    try {
      const resp = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: channelId, content, type, fileName, fileSize })
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskComments = async (taskId: string, comments: TaskComment[]) => {
    if (!token) return;
    try {
      const resp = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comments })
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (newSettings: OrganizationSettings) => {
    if (!token) return;
    try {
      const resp = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchUser = (userId: string) => {
    const selectedUser = users.find((u: User) => u.id === userId);
    if (!selectedUser) return;
    alert(`Please Log Out and authenticate directly using coordinates for ${selectedUser.fullName}. Simulated switching is disabled to protect workspace integrity.`);
  };

  const handleLoginSuccess = (user: User, returnedToken: string) => {
    localStorage.setItem("NEXORA_TOKEN", returnedToken);
    setToken(returnedToken);
    setState((prev: any) => ({
      ...prev,
      currentUser: user,
      isSessionActive: true
    }));
    syncState(returnedToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("NEXORA_TOKEN");
    setToken(null);
    setState((prev: any) => ({
      ...prev,
      currentUser: null,
      isSessionActive: false
    }));
  };

  // Dynamic HR Updates syncers
  const handleUpdateUsers = async (updatedUsers: User[]) => {
    if (!token) return;
    for (const u of updatedUsers) {
      const original = users.find((o: User) => o.id === u.id);
      if (original && (original.role !== u.role || original.productivityScore !== u.productivityScore)) {
        try {
          await fetch(`/api/users/${u.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ role: u.role, productivityScore: u.productivityScore })
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
    syncState();
  };

  const handleUpdateAttendance = async (logs: AttendanceLog[]) => {
    if (!token) return;
    try {
      const resp = await fetch("/api/attendance/clock", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeaveRequests = async (requests: LeaveRequest[]) => {
    if (!token) return;
    for (const req of requests) {
      const original = leaveRequests.find((o: LeaveRequest) => o.id === req.id);
      if (original && original.status !== req.status) {
        try {
          await fetch(`/api/leaves/${req.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: req.status })
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
    syncState();
  };

  const handleAddAuditLog = async (log: AuditLog) => {
    if (!token) return;
    try {
      const resp = await fetch("/api/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(log)
      });
      if (resp.ok) {
        syncState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = () => {
    handleLogout();
  };

  const handleExecuteAIRecommendation = () => {
    handleAddTask({
      title: "Optimized Workflow Sprint Backlog",
      description: "Gemini Recommended: Adjust tasks workloads across Engineering developers to increase delivery velocity by 12%.",
      priority: TaskPriority.HIGH,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: TaskStatus.PENDING,
      assignedTo: []
    });
    alert("AI Recommendation Executed! A sprint optimization backlog task has been drafted and allocated on your Kanban board.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-indigo-400 flex flex-col items-center justify-center font-sans space-y-4">
        <LiquidBackground />
        <div className="relative z-10 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest font-mono font-bold animate-pulse text-slate-400">
            Establishing Nexora OS Connection...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return (
      <div
        className={`min-h-screen relative overflow-hidden font-sans select-none flex items-center justify-center bg-[#070b12] text-slate-100 dark`}
      >
        <LiquidBackground />
        <YetiLogin
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onResetDatabase={handleResetDatabase}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex relative overflow-hidden font-sans select-none pb-24 lg:pb-0 ${
        settings.theme === "light"
          ? "light bg-slate-50 text-slate-900"
          : "dark bg-[#0b0f17] text-slate-100"
      }`}
    >
      <LiquidBackground />

      {/* Unified Desktop Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyName={settings.companyName}
        unresolvedChats={totalUnread}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen md:min-h-0 relative z-10">
        
        {/* Floating Top App Navigation Header */}
        <header className={`sticky top-0 w-full z-45 flex justify-between items-center px-6 h-16 border-b transition-colors duration-200 ${
          settings.theme === "light"
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#0c1222]/80 backdrop-blur-xl border-white/5 text-white"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-indigo-400 hover:bg-white/10 rounded-full p-2 transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded leading-none flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Nexora OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
              {unouncementsCount(announcements) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-950 animate-pulse"></span>
              )}
            </div>
            
            {/* Quick action profile marker display */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-indigo-400/20 shadow"
              />
              <span className="text-xs text-slate-300 font-bold hidden sm:inline">
                {currentUser.fullName} ({currentUser.role})
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Flyout Sidebar Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-45 lg:hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-72 bg-slate-950 h-full p-6 border-r border-white/10 flex flex-col justify-between"
            >
              <div>
                <h1 className="text-xl font-bold font-display-md text-white mb-8">Nexora Control</h1>
                <nav className="space-y-2">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "teams", label: "HR Hub & Attendance" },
                    { id: "tasks", label: "Tasks Kanban" },
                    { id: "messages", label: "Live Chat" },
                    { id: "ai", label: "AI Advisor" },
                    { id: "settings", label: "Settings" }
                  ].map((it) => (
                    <button
                      key={it.id}
                      onClick={() => {
                        setActiveTab(it.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === it.id
                          ? "bg-indigo-500/10 text-white border-l-4 border-indigo-500 pl-3"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-mono text-slate-600">Nexora Enterprise v1.1.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Tab Render Switcher */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full pt-8 h-full overflow-y-auto no-scrollbar">
          {activeTab === "dashboard" && (
            <DashboardView
              currentUser={currentUser}
              users={users}
              auditLogs={auditLogs}
              tasks={tasks}
              onExecuteRecommendation={handleExecuteAIRecommendation}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === "teams" && (
            <HRAttendanceView
              currentUser={currentUser}
              users={users}
              attendanceLogs={attendanceLogs}
              leaveRequests={leaveRequests}
              onUpdateUsers={handleUpdateUsers}
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateLeaveRequests={handleUpdateLeaveRequests}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeTab === "tasks" && (
            <TasksView
              tasks={tasks}
              users={users}
              currentUser={currentUser}
              calendarEvents={calendarEvents}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleTaskStatusChange}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskComments={handleUpdateTaskComments}
            />
          )}

          {activeTab === "messages" && (
            <MessagesView
              messages={messages}
              channels={channels}
              users={users}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === "ai" && (
            <AIAdvisorView
              currentUser={currentUser}
              achievements={achievements}
              tasks={tasks}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              currentUser={currentUser}
              users={users}
              settings={settings}
              auditLogs={auditLogs}
              onUpdateSettings={handleUpdateSettings}
              onSwitchUser={handleSwitchUser}
            />
          )}
        </main>

        {/* Global mobile responsive Bottom Navigator */}
        <BottomBar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unresolvedChats={totalUnread}
          onQuickAction={() => setActiveTab("tasks")}
        />

      </div>
    </div>
  );
}

function unouncementsCount(ann: Announcement[]) {
  return (ann || []).filter((a) => a.unread).length;
}
