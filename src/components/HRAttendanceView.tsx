/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, UserRole, AttendanceLog, LeaveRequest, AuditLog } from "../types";
import {
  Clock,
  CalendarCheck,
  UserCheck,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldAlert,
  Users,
  Check,
  X,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Search,
  UserMinus,
  Briefcase
} from "lucide-react";

interface HRAttendanceViewProps {
  currentUser: User;
  users: User[];
  attendanceLogs: AttendanceLog[];
  leaveRequests: LeaveRequest[];
  onUpdateUsers: (updatedUsers: User[]) => void;
  onUpdateAttendance: (logs: AttendanceLog[]) => void;
  onUpdateLeaveRequests: (requests: LeaveRequest[]) => void;
  onAddAuditLog: (log: AuditLog) => void;
}

export default function HRAttendanceView({
  currentUser,
  users,
  attendanceLogs,
  leaveRequests,
  onUpdateUsers,
  onUpdateAttendance,
  onUpdateLeaveRequests,
  onAddAuditLog
}: HRAttendanceViewProps) {
  const [activeTab, setActiveTab] = useState<"timesheet" | "leaves" | "personnel" | "performance">("timesheet");
  const [searchQuery, setSearchQuery] = useState("");

  // Timesheet variables
  const [isClockedIn, setIsClockedIn] = useState(() => {
    // Find if current user has a pending clock in for today
    const today = new Date().toISOString().split("T")[0];
    return attendanceLogs.some(
      (log) => log.userId === currentUser.id && log.date === today && log.status === "Pending"
    );
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect for clocked-in sessions
  useEffect(() => {
    let timer: any;
    if (isClockedIn) {
      // Find today's clock-in log start time
      const today = new Date().toISOString().split("T")[0];
      const todayLog = attendanceLogs.find(
        (log) => log.userId === currentUser.id && log.date === today && log.status === "Pending"
      );

      if (todayLog) {
        const startTime = new Date(todayLog.clockInTime).getTime();
        timer = setInterval(() => {
          const diff = Math.floor((Date.now() - startTime) / 1000);
          setElapsedSeconds(diff > 0 ? diff : 0);
        }, 1000);
      } else {
        setElapsedSeconds(0);
      }
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, attendanceLogs, currentUser.id]);

  // Clock In handler
  const handleClockIn = () => {
    const today = new Date().toISOString().split("T")[0];
    const newLog: AttendanceLog = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      clockInTime: new Date().toISOString(),
      status: "Pending",
      date: today
    };

    onUpdateAttendance([newLog, ...attendanceLogs]);
    setIsClockedIn(true);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: "clocked_in",
      details: `Clocked in for work schedule`,
      timestamp: "Just now",
      category: "HR Operations"
    });
  };

  // Clock Out handler
  const handleClockOut = () => {
    const today = new Date().toISOString().split("T")[0];
    const updated = attendanceLogs.map((log) => {
      if (log.userId === currentUser.id && log.date === today && log.status === "Pending") {
        return {
          ...log,
          clockOutTime: new Date().toISOString(),
          status: "Completed" as const
        };
      }
      return log;
    });

    onUpdateAttendance(updated);
    setIsClockedIn(false);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: "clocked_out",
      details: `Clocked out of workspace. Active shift completed.`,
      timestamp: "Just now",
      category: "HR Operations"
    });
  };

  // Leave Form entries
  const [leaveType, setLeaveType] = useState<"PTO" | "Sick Leave" | "Remote Day" | "Personal">("PTO");
  const [startDate, setStartDate] = useState("2026-06-15");
  const [endDate, setEndDate] = useState("2026-06-18");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveFeedback, setLeaveFeedback] = useState<string | null>(null);

  // Submit Leave Request
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      type: leaveType,
      startDate,
      endDate,
      reason: leaveReason.trim(),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    onUpdateLeaveRequests([newRequest, ...leaveRequests]);
    setLeaveReason("");
    setLeaveFeedback("Leave request uploaded and routed to management.");
    setTimeout(() => setLeaveFeedback(null), 3000);

    onAddAuditLog({
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: "requested_leave",
      details: `Submitted ${leaveType} leave request from ${startDate} to ${endDate}`,
      timestamp: "Just now",
      category: "HR Operations"
    });
  };

  // Resolve Leave Request
  const handleResolveLeave = (requestId: string, approve: boolean) => {
    const updated = leaveRequests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: (approve ? "Approved" : "Declined") as any
        };
      }
      return req;
    });

    onUpdateLeaveRequests(updated);

    const targetReq = leaveRequests.find((r) => r.id === requestId);
    if (targetReq) {
      onAddAuditLog({
        id: `log-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: approve ? "approved_leave" : "declined_leave",
        targetId: targetReq.id,
        targetName: targetReq.userName,
        details: `${approve ? "Approved" : "Declined"} ${targetReq.type} request for ${targetReq.userName}`,
        timestamp: "Just now",
        category: "HR Operations"
      });
    }
  };

  // Admin users alterations (CEO only)
  const handlePromotionDemotion = (userId: string, newRole: UserRole) => {
    if (currentUser.role !== UserRole.CEO) {
      alert("Permission Denied: Only the Chief Executive Officer has authority to adjust personnel roles.");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    onUpdateUsers(updated);

    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      onAddAuditLog({
        id: `log-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: "role_modified",
        targetId: targetUser.id,
        targetName: targetUser.fullName,
        details: `Modified access tier of ${targetUser.fullName} to ${newRole}`,
        timestamp: "Just now",
        category: "HR Operations"
      });
    }
  };

  // Remove Employee
  const handleRemoveEmployee = (userId: string) => {
    if (currentUser.role !== UserRole.CEO) {
      alert("Unauthorized: Only the CEO can remove employees.");
      return;
    }

    if (userId === currentUser.id) {
      alert("Executive Safeguard: You cannot delete your own CEO profile.");
      return;
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (confirm(`Are you absolutely sure you want to remove ${targetUser.fullName} from the platform database?`)) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);

      onAddAuditLog({
        id: `log-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: "profile_removed",
        targetId: userId,
        targetName: targetUser.fullName,
        details: `Deleted employee profile for ${targetUser.fullName} (${targetUser.employeeId})`,
        timestamp: "Just now",
        category: "HR Operations"
      });
    }
  };

  // Format Elapsed Time Timer: hh:mm:ss
  const formatTimer = (totSeconds: number) => {
    const hrs = Math.floor(totSeconds / 3600);
    const mins = Math.floor((totSeconds % 3600) / 60);
    const secs = totSeconds % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };

  // Personnel authority conditions
  const hasManagementAuthority =
    currentUser.role === UserRole.CEO || currentUser.role === UserRole.MANAGER;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Leaderboard data calculations
  const leaderboardUsers = [...users].sort((a, b) => {
    const scoreA =
      a.productivityScore +
      a.taskCompletionRate +
      (a.attendanceScore || 90) +
      (a.achievementScore || 85);
    const scoreB =
      b.productivityScore +
      b.taskCompletionRate +
      (b.attendanceScore || 90) +
      (b.achievementScore || 85);
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-8 animate-fade-in relative z-10 w-full mb-12">
      
      {/* Title Header */}
      <section className="space-y-1">
        <h1 className="font-display-md text-3xl font-extrabold text-white tracking-tight">
          Personnel & Timesheet Hub
        </h1>
        <p className="text-slate-400 font-body-sm text-sm">
          Track clock in schedules, request leave, optimize personnel roles, and monitor performance indexes.
        </p>
      </section>

      {/* Navigation tabs */}
      <div className="flex border-b border-white/5 pb-0 overflow-x-auto gap-1 no-scrollbar">
        {[
          { id: "timesheet", label: "Work Timesheet", icon: Clock },
          { id: "leaves", label: "Leave Requests", icon: CalendarCheck },
          ...(currentUser.role !== UserRole.AGENT ? [{ id: "personnel", label: "Personnel Administration", icon: Users }] : []),
          { id: "performance", label: "Leaderboard & Stats", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap leading-none ${
                activeTab === tab.id
                  ? "border-indigo-500 text-white font-bold bg-indigo-500/5"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB content area */}
      <div className="pt-2">
        {activeTab === "timesheet" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Clock In Out action (5 Cols) */}
            <div className="md:col-span-5 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white font-headline-md tracking-tight">
                    Shift Recorder
                  </h3>
                </div>

                <div className="text-center space-y-4 py-4 bg-slate-950/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-xs text-slate-400 font-mono">
                    TODAY IS {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>

                  <div className="space-y-1">
                    <p className={`text-4xl font-extrabold font-mono transition-colors duration-300 ${isClockedIn ? "text-indigo-400" : "text-slate-500"}`}>
                      {isClockedIn ? formatTimer(elapsedSeconds) : "00:00:00"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">
                      {isClockedIn ? "Shift Active • Live Counter" : "Shift Inactive • Clock In Below"}
                    </p>
                  </div>

                  <div className="pt-2">
                    {isClockedIn ? (
                      <button
                        onClick={handleClockOut}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4 animate-spin" /> Clock Out Workday
                      </button>
                    ) : (
                      <button
                        onClick={handleClockIn}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" /> Establish Clock In
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                  ⚡ **Standard SLA Check-in**: Your clock-in location markers and timesheet telemetry logs are automatically processed to derive your cumulative **Attendance Score** in real-time.
                </div>
              </div>
            </div>

            {/* Right Column: Attendance Logs Feed (7 Cols) */}
            <div className="md:col-span-7 glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white font-headline-md">
                    Timesheet History Logs
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                  {attendanceLogs.length} logs
                </span>
              </div>

              <div className="overflow-y-auto max-h-[380px] pr-2 space-y-3 custom-scrollbar">
                {attendanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono ${log.status === "Pending" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                        {log.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{log.userName}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{log.date} • Clock In: {new Date(log.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {log.clockOutTime ? (
                        <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold uppercase text-[9px]">
                          Finished ({new Date(log.clockOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      ) : (
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded font-black uppercase text-[9px] animate-pulse">
                          Active In Shift
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {attendanceLogs.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-12">No attendance logs found in database history.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "leaves" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Leave Request Submission Form (5 Cols) */}
            <div className="md:col-span-5">
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white font-headline-md tracking-tight">
                    PTO / Leave Application
                  </h3>
                </div>

                <form onSubmit={handleRequestLeave} className="space-y-4">
                  {leaveFeedback && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold">
                      {leaveFeedback}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                      Absence Category
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="PTO">Paid Off-Duty Time (PTO)</option>
                      <option value="Sick Leave">Medical / Sick Leave</option>
                      <option value="Remote Day">Temporary Remote Protocol</option>
                      <option value="Personal">Personal Absence</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                      Reasoning Details
                    </label>
                    <textarea
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="Summarize reasons or context here..."
                      rows={3}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Leaves Requests Feed resolved/pending (7 Cols) */}
            <div className="md:col-span-7 glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white font-headline-md">
                    Corporate Leave Applications
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                  {hasManagementAuthority ? "All Enterprise requests" : "My requests"}
                </span>
              </div>

              <div className="overflow-y-auto max-h-[380px] pr-2 space-y-4 custom-scrollbar">
                {/* For regular users: Show only their requests. For managers and CEOs: Show all requests */}
                {leaveRequests
                  .filter((req) => hasManagementAuthority || req.userId === currentUser.id)
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-slate-950/20 border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <img src={req.userAvatar} alt="Avi" className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-slate-100">{req.userName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${
                          req.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : req.status === "Declined"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                        <p>Category: <strong className="text-slate-200">{req.type}</strong></p>
                        <p className="text-right">Timeline: <strong className="text-slate-200">{req.startDate.split("-")[1]}/{req.startDate.split("-")[2]} - {req.endDate.split("-")[1]}/{req.endDate.split("-")[2]}</strong></p>
                      </div>

                      <p className="text-xs text-slate-300 italic bg-white/[0.01] p-2.5 rounded border border-white/5">
                        "{req.reason}"
                      </p>

                      {/* Management Resolve buttons */}
                      {hasManagementAuthority && req.status === "Pending" && (
                        <div className="flex gap-2 pt-1 border-t border-white/5 justify-end">
                          <button
                            onClick={() => handleResolveLeave(req.id, false)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Decline Request
                          </button>
                          <button
                            onClick={() => handleResolveLeave(req.id, true)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                {leaveRequests.filter((req) => hasManagementAuthority || req.userId === currentUser.id).length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-12">No leave applications currently processed.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === "personnel" && currentUser.role !== UserRole.AGENT && (
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-headline-md">
                  Authorized Personnel Roster & Role Matrix
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter personnel..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[38px]"
                />
              </div>
            </div>

            {currentUser.role !== UserRole.CEO && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>You can view the roster, but adjusting user role access models is reserved exclusively for the Chief Executive Officer.</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500 font-mono uppercase text-[10px] tracking-wider pb-2">
                    <th className="py-2.5 font-bold">Employee ID</th>
                    <th className="py-2.5 font-bold">Profile</th>
                    <th className="py-2.5 font-bold text-center">Efficiency Base</th>
                    <th className="py-2.5 font-bold">Access Token Role</th>
                    <th className="py-2.5 font-bold text-right">Administrative Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="text-slate-300 font-medium">
                      <td className="py-3 font-mono text-xs">{usr.employeeId}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={usr.avatar} alt="Avi" className="w-7 h-7 rounded-full object-cover border border-white/5" />
                          <div>
                            <p className="font-bold text-white text-xs">{usr.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{usr.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-indigo-300 font-mono">{usr.productivityScore}%</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-wide">Productivity</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
                          {usr.role}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        {currentUser.role === UserRole.CEO ? (
                          <div className="flex items-center justify-end gap-2.5">
                            <select
                              value={usr.role}
                              onChange={(e) => handlePromotionDemotion(usr.id, e.target.value as any)}
                              className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                            >
                              <option value={UserRole.CEO}>CEO</option>
                              <option value={UserRole.MANAGER}>Manager</option>
                              <option value={UserRole.ASSISTANT_MANAGER}>Assistant Manager</option>
                              <option value={UserRole.AGENT}>Agent</option>
                            </select>

                            <button
                              onClick={() => handleRemoveEmployee(usr.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/5 transition-colors cursor-pointer"
                              title="Delete employee profile records completely"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px] italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            
            {/* Quick stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Apex Performer", val: leaderboardUsers[0]?.fullName || "N/A", desc: "Highest overall score", icon: Award, color: "text-amber-400 bg-amber-500/10" },
                { label: "Company Efficiency", val: "94.2%", desc: "Weighted target quotient", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
                { label: "Active Team Count", val: `${users.filter(u => u.status === "Online").length} Available`, desc: "Online check-ins", icon: UserCheck, color: "text-indigo-400 bg-indigo-500/10" },
                { label: "Completed Milestones", val: "148 Sprints", desc: "Corporate aggregate metric", icon: Briefcase, color: "text-sky-400 bg-sky-500/10" }
              ].map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={idx} className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">{st.label}</p>
                      <h4 className="text-base font-extrabold text-white leading-none mb-1.5">{st.val}</h4>
                      <p className="text-[10px] text-slate-500 leading-none">{st.desc}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${st.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Table Grid */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-headline-md">
                  Workforce Efficiency Metric Leaderboard
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 font-mono uppercase text-[9px] tracking-widest pb-2">
                      <th className="py-2.5 font-bold text-center w-12">Rank</th>
                      <th className="py-2.5 font-bold">Personnel</th>
                      <th className="py-2.5 font-bold">Role Access</th>
                      <th className="py-2.5 font-bold text-center">Productivity</th>
                      <th className="py-2.5 font-bold text-center">Completion Rate</th>
                      <th className="py-2.5 font-bold text-center">Attendance Score</th>
                      <th className="py-2.5 font-bold text-center">Achievement</th>
                      <th className="py-2.5 font-bold text-right">Composite Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                    {leaderboardUsers.map((usr, index) => {
                      const productivity = usr.productivityScore;
                      const taskRate = usr.taskCompletionRate;
                      const attScore = usr.attendanceScore || 94;
                      const achScore = usr.achievementScore || 90;
                      const composite = Math.round((productivity + taskRate + attScore + achScore) / 4);

                      return (
                        <tr key={usr.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 text-center">
                            {index === 0 ? (
                              <span className="flex items-center justify-center text-amber-300 font-black font-sans bg-amber-500/10 border border-amber-500/20 w-6 h-6 rounded-full mx-auto shadow-md">
                                1
                              </span>
                            ) : index === 1 ? (
                              <span className="flex items-center justify-center text-slate-300 font-black font-sans bg-slate-500/10 border border-slate-500/20 w-6 h-6 rounded-full mx-auto">
                                2
                              </span>
                            ) : index === 2 ? (
                              <span className="flex items-center justify-center text-amber-600 font-black font-sans bg-amber-700/10 border border-amber-800/20 w-6 h-6 rounded-full mx-auto">
                                3
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium font-sans">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-3 font-sans">
                            <div className="flex items-center gap-2.5">
                              <img src={usr.avatar} alt="Avi" className="w-6 h-6 rounded-full object-cover" />
                              <span className="font-bold text-white text-xs leading-none">{usr.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] text-indigo-400 capitalize font-bold font-sans">
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3 text-center text-indigo-300 font-bold">{productivity}%</td>
                          <td className="py-3 text-center text-sky-300 font-bold">{taskRate}%</td>
                          <td className="py-3 text-center text-emerald-300 font-bold">{attScore}%</td>
                          <td className="py-3 text-center text-amber-300 font-bold">{achScore}%</td>
                          <td className="py-3 text-right">
                            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold px-2.5 py-0.5 rounded text-xs select-none">
                              {composite}% Index
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
