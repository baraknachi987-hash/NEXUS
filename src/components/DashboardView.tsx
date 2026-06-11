/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { User, AuditLog, UserRole, Task } from "../types";
import {
  Users,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  Download,
  Check
} from "lucide-react";

interface DashboardViewProps {
  currentUser: User;
  users: User[];
  auditLogs: AuditLog[];
  tasks: Task[];
  onExecuteRecommendation: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({
  currentUser,
  users,
  auditLogs,
  tasks,
  onExecuteRecommendation,
  onNavigateToTab
}: DashboardViewProps) {
  // Counters states matching screenshot load animations
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [productivity, setProductivity] = useState(0);

  useEffect(() => {
    // Total users animation up to 1018
    const usersTarget = 1018;
    const activeTarget = 842;
    const prodTarget = 94;

    let usersStart = 0;
    let activeStart = 0;
    let prodStart = 0;

    const timer = setInterval(() => {
      let updated = false;
      if (usersStart < usersTarget) {
        usersStart += Math.min(25, usersTarget - usersStart);
        setTotalUsers(usersStart);
        updated = true;
      }
      if (activeStart < activeTarget) {
        activeStart += Math.min(20, activeTarget - activeStart);
        setActiveUsers(activeStart);
        updated = true;
      }
      if (prodStart < prodTarget) {
        prodStart += 1;
        setProductivity(prodStart);
        updated = true;
      }

      if (!updated) {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  // State for report generation
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleDownloadCSV = () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Mimic background compiling for premium responsive feedback
    setTimeout(() => {
      try {
        let csv = "NEXORA ENTERPRISE - SYSTEMS METRICS REPORT\n";
        csv += `Generated At:${new Date().toISOString()}\n`;
        csv += `Report Level:${currentUser.role}\n`;
        csv += `System Status:ONLINE\n\n`;

        csv += "--- PERSONNEL PRODUCTIVITY DATA ---\n";
        csv += "Employee ID,Full Name,Role,Productivity Score,Task Completion Rate,Daily Status,Last Active\n";
        
        users.forEach((u) => {
          const escapedName = `"${u.fullName.replace(/"/g, '""')}"`;
          const escapedRole = `"${u.role.replace(/"/g, '""')}"`;
          csv += `${u.employeeId},${escapedName},${escapedRole},${u.productivityScore}%,${u.taskCompletionRate}%,${u.status},${u.lastActive}\n`;
        });

        csv += "\n--- TASK STATUS & COMPLETION DATA ---\n";
        csv += "Task ID,Title,Priority,Status,Progress,Deadline,Assigned Employees\n";

        tasks.forEach((t) => {
          const escapedTitle = `"${t.title.replace(/"/g, '""')}"`;
          const escapedPriority = `"${t.priority.replace(/"/g, '""')}"`;
          const escapedStatus = `"${t.status.replace(/"/g, '""')}"`;
          
          const assignedNames = t.assignedTo
            .map((id) => {
              const u = users.find((user) => user.id === id);
              return u ? u.fullName : "Unknown";
            })
            .join(" | ");
          const escapedAssignees = `"${assignedNames.replace(/"/g, '""')}"`;

          csv += `${t.id},${escapedTitle},${escapedPriority},${escapedStatus},${t.progress}%,${t.deadline},${escapedAssignees}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Nexora_Metrics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to generate and download report", err);
        setIsExporting(false);
        alert("Could not generate report. Please try again.");
      }
    }, 1000);
  };

  // Filter logs for display
  const recentLogs = auditLogs.slice(0, 3);

  // Return standard icon matching log category
  const getLogIcon = (category: string) => {
    switch (category) {
      case "HR Operations":
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        );
      case "DevOps Team":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case "Product Development":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      
      {/* Header operations snapshot with mobile-optimized Action button */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display-md text-3xl lg:text-4xl text-white font-extrabold tracking-tight">
            Morning, {currentUser.fullName.split(" ")[0]}
          </h1>
          <p className="text-slate-400 font-body-md text-sm lg:text-base">
            Here is your operational snapshot for Nexora Enterprise today.
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border select-none min-h-[44px] ${
              exportSuccess
                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10"
                : isExporting
                ? "bg-slate-800 border-slate-700 text-slate-400 animate-pulse"
                : "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500"
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Report Saved!
              </>
            ) : isExporting ? (
              <>
                <Download className="w-4 h-4 animate-bounce" />
                Compiling...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </button>
        </div>
      </section>

      {/* Stats Bento Grid with 3D and floating effect */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users card option */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Total Users
          </p>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display-md text-4xl lg:text-5xl font-extrabold text-indigo-300">
                {totalUsers.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5 mb-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
          </div>
          <div className="mt-4 w-full h-1 bg-slate-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Active Now widget card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-16 h-16 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Active Now
          </p>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display-md text-4xl lg:text-5xl font-extrabold text-emerald-400">
                {activeUsers}
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium flex items-center gap-1.5 ml-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-1 items-end h-8">
            <div className="w-1.5 h-3 bg-emerald-500/20 rounded-t-sm"></div>
            <div className="w-1.5 h-5 bg-emerald-500/40 rounded-t-sm"></div>
            <div className="w-1.5 h-7 bg-emerald-500 rounded-t-sm animate-pulse"></div>
            <div className="w-1.5 h-4 bg-emerald-500/30 rounded-t-sm"></div>
            <div className="w-1.5 h-6 bg-emerald-500/60 rounded-t-sm animate-pulse"></div>
            <div className="w-1.5 h-8 bg-emerald-400 rounded-t-sm"></div>
          </div>
        </div>

        {/* Productivity Score card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Brain className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Productivity Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-display-md text-4xl lg:text-5xl font-extrabold text-amber-300">
              {productivity}
            </span>
            <span className="font-display-md text-3xl font-extrabold text-amber-300">%</span>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1">
              Efficiency Peak
            </span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded font-mono uppercase text-[10px]">
              Optimal
            </span>
          </div>
        </div>

      </section>

      {/* AI Assistant Insights block banner */}
      <section className="glass-card rounded-2xl p-1 overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-sky-500/10 opacity-70 animate-pulse pointer-events-none"></div>
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/10">
                <Brain className="w-5 h-5 text-indigo-300" />
              </div>
              <h2 className="text-lg font-bold text-white font-headline-md tracking-tight">
                AI Assistant Insights
              </h2>
            </div>
            <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
              Gemini Integrated
            </span>
          </div>
          <div className="bg-slate-900/40 rounded-xl p-5 border border-white/5 relative">
            <p className="text-base text-slate-200 leading-relaxed italic pr-4">
              "Optimize task allocation for Team Alpha to improve completion rates by 12% based on last week's velocity."
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <button
                onClick={onExecuteRecommendation}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-label-md text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Execute Recommendation <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToTab("ai")}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-label-md text-sm px-5 py-3 rounded-full transition-all active:scale-95"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg lg:text-xl font-bold text-white font-headline-md">
            Live Activity
          </h2>
          <button
            onClick={() => onNavigateToTab("tasks")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View All Board Activity
          </button>
        </div>

        <div className="glass-card rounded-2xl divide-y divide-white/5 overflow-hidden">
          {recentLogs.map((log) => {
            const actor = users.find((u) => u.id === log.actorId) || {
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256"
            };
            return (
              <div
                key={log.id}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {log.category === "HR Operations" || log.category === "Product Development" ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                      <img src={actor.avatar} alt="Actor" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    getLogIcon(log.category)
                  )}

                  <div>
                    <p className="font-label-md text-slate-200 text-sm">
                      {log.category === "HR Operations" ? (
                        <>
                          <span className="font-bold text-white">{log.actorName}</span> promoted to{" "}
                          <span className="text-emerald-400 font-bold">{log.details.split("promoted to ")[1]}</span>
                        </>
                      ) : log.category === "Product Development" ? (
                        <>
                          <span className="font-bold text-white">{log.actorName}</span> deployed{" "}
                          <span className="text-sky-400 font-mono font-bold">{log.details.split("deployed ")[1]}</span>
                        </>
                      ) : (
                        <>
                          Task Completed: <span className="text-emerald-400 font-bold">{log.targetName}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {log.timestamp} • <span className="text-indigo-400/80 font-medium">{log.category}</span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
