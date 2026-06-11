/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus, User, CalendarEvent } from "../types";
import { TaskProgressVisual } from "./TaskProgressVisual";
import {
  Plus,
  Search,
  Calendar,
  Grid,
  Paperclip,
  MessageSquare,
  Clock,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FolderDot,
  CheckCircle,
  Mic,
  MicOff,
  X
} from "lucide-react";

interface TasksViewProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  calendarEvents: CalendarEvent[];
  onAddTask: (task: Omit<Task, "id" | "comments" | "attachments" | "progress">) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus, progress: number) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskComments?: (taskId: string, comments: any[]) => void;
}

export default function TasksView({
  tasks,
  users,
  currentUser,
  calendarEvents,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onUpdateTaskComments
}: TasksViewProps) {
  const [viewMode, setViewMode] = useState<"board" | "calendar">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newDeadline, setNewDeadline] = useState("2026-06-30");
  const [newAssignees, setNewAssignees] = useState<string[]>([]);

  // Speech-to-Text states for task description
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Task details drawer and comment thread speech-to-text states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isCommentListening, setIsCommentListening] = useState(false);
  const [commentRecognition, setCommentRecognition] = useState<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Safari, or another modern browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNewDesc((prev) => (prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()));
        }
      };

      rec.start();
      setRecognition(rec);
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.error("Error stopping recognition", e);
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Speech-to-Text handlers for Comments
  const startCommentListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Safari, or another modern browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsCommentListening(true);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error in comment thread", event);
        setIsCommentListening(false);
      };

      rec.onend = () => {
        setIsCommentListening(false);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCommentText((prev) => (prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()));
        }
      };

      rec.start();
      setCommentRecognition(rec);
    } catch (err) {
      console.error("Failed to start speech recognition in comment thread", err);
      setIsCommentListening(false);
    }
  };

  const stopCommentListening = () => {
    if (commentRecognition) {
      try {
        commentRecognition.stop();
      } catch (e) {
        console.error("Error stopping recognition in comment thread", e);
      }
    }
    setIsCommentListening(false);
  };

  const toggleCommentListening = () => {
    if (isCommentListening) {
      stopCommentListening();
    } else {
      startCommentListening();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedComments = [...(selectedTask.comments || []), newComment];

    // Trigger persistence callback
    onUpdateTaskComments?.(selectedTask.id, updatedComments);

    // Update locally selected detail model
    setSelectedTask({
      ...selectedTask,
      comments: updatedComments
    });

    setCommentText("");
    if (isCommentListening) {
      stopCommentListening();
    }
  };

  // Filter tasks by search query
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      deadline: newDeadline,
      status: TaskStatus.PENDING,
      assignedTo: newAssignees.length > 0 ? newAssignees : [users[0].id]
    });

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewPriority(TaskPriority.MEDIUM);
    setNewDeadline("2026-06-30");
    setNewAssignees([]);
    setShowAddModal(false);

    // Stop recording if active
    if (isListening) {
      stopListening();
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case TaskPriority.MEDIUM:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-20">
      
      {/* Header controls snapshot */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-md text-3xl font-extrabold text-white tracking-tight">
            Nexora Enterprise Board
          </h1>
          <p className="text-slate-400 font-body-sm text-sm">
            Global Project Synergy Phase II
          </p>
        </div>

        {/* Board vs Calendar Toggle switch */}
        <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setViewMode("board")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "board"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Board
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "calendar"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </section>

      {/* Filtering bar section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
          />
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Main interactive area */}
      {viewMode === "board" ? (
        <>
          {/* Kanban Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
            
            {/* Column Pending / To Do */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col bg-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <h3 className="font-label-md text-slate-200 text-sm font-bold uppercase tracking-wider">
                    To Do
                  </h3>
                  <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-xs">
                    {filteredTasks.filter((t) => t.status === TaskStatus.PENDING).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {filteredTasks
                  .filter((t) => t.status === TaskStatus.PENDING)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      badgeStyle={getPriorityBadge(task.priority)}
                      onMoveTask={(st, prg) => onUpdateTaskStatus(task.id, st, prg)}
                      onDelete={() => onDeleteTask(task.id)}
                      onSelect={() => setSelectedTask(task)}
                    />
                  ))}
                {filteredTasks.filter((t) => t.status === TaskStatus.PENDING).length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8">No tasks pending</p>
                )}
              </div>
            </div>

            {/* Column In Progress */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col bg-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h3 className="font-label-md text-slate-200 text-sm font-bold uppercase tracking-wider">
                    In Progress
                  </h3>
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs font-semibold">
                    {filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {filteredTasks
                  .filter((t) => t.status === TaskStatus.IN_PROGRESS)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      badgeStyle={getPriorityBadge(task.priority)}
                      onMoveTask={(st, prg) => onUpdateTaskStatus(task.id, st, prg)}
                      onDelete={() => onDeleteTask(task.id)}
                      onSelect={() => setSelectedTask(task)}
                    />
                  ))}
                {filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8">No active works</p>
                )}
              </div>
            </div>

            {/* Column Completed */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 flex flex-col bg-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-label-md text-slate-200 text-sm font-bold uppercase tracking-wider">
                    Completed
                  </h3>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold font-mono">
                    {filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {filteredTasks
                  .filter((t) => t.status === TaskStatus.COMPLETED)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      badgeStyle={getPriorityBadge(task.priority)}
                      onMoveTask={(st, prg) => onUpdateTaskStatus(task.id, st, prg)}
                      onDelete={() => onDeleteTask(task.id)}
                      onSelect={() => setSelectedTask(task)}
                    />
                  ))}
                {filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED).length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8 font-mono">Nothing completed yet</p>
                )}
              </div>
            </div>

          </div>
        </>
      ) : (
        /* Calendar view block listing official dates and tasks deadlines */
        <section className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Operational Calendar Actions
            </h3>
            <span className="text-xs text-slate-400">June 2026</span>
          </div>

          <div className="space-y-4">
            {/* Displaying static company holidays and due goals */}
            {[
              ...calendarEvents,
              ...filteredTasks.map(t => ({
                id: `cal-t-${t.id}`,
                title: `Task Deadline: ${t.title}`,
                start: t.deadline,
                end: t.deadline,
                type: "deadline" as const,
                description: t.description
              }))
            ].map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ev.type === "deadline"
                          ? "bg-rose-500"
                          : ev.type === "meeting"
                          ? "bg-sky-500"
                          : ev.type === "holiday"
                          ? "bg-indigo-400"
                          : "bg-emerald-400"
                      }`}
                    ></span>
                    <p className="text-sm font-bold text-white leading-none">{ev.title}</p>
                  </div>
                  <p className="text-xs text-slate-400">{ev.description}</p>
                </div>
                <span className="font-mono text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                  {ev.start.split("T")[0]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unified Add Task Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white font-headline-md mb-4 flex items-center gap-2">
              <FolderDot className="w-5 h-5 text-indigo-400" /> Dispatch New Core Task
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement WebGL Shader"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? "Stop listening" : "Transcribe description by speech"}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer select-none border min-h-[44px] min-w-[130px] justify-center ${
                      isListening
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse font-medium shadow-lg shadow-rose-500/5"
                        : "bg-slate-950/40 hover:bg-slate-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 text-rose-500" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Speech-to-Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe metrics, guidelines, or instructions..."
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={TaskPriority.LOW}>Low Priority</option>
                    <option value={TaskPriority.MEDIUM}>Medium Priority</option>
                    <option value={TaskPriority.HIGH}>High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                  Assign Board Members
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                  {users.map((usr) => {
                    const isSelected = newAssignees.includes(usr.id);
                    return (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewAssignees(newAssignees.filter((id) => id !== usr.id));
                          } else {
                            setNewAssignees([...newAssignees, usr.id]);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                          isSelected
                            ? "bg-indigo-500 text-white font-semibold"
                            : "bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        <img src={usr.avatar} alt="Usr" className="w-5 h-5 rounded-full object-cover" />
                        <span>{usr.fullName.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    if (isListening) {
                      stopListening();
                    }
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition-all"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details & Chronological Comments Modal Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative animate-scale-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10 bg-slate-950/20">
              <div className="space-y-1.5 flex-1 pr-6">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                    {selectedTask.status}
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded text-[10px] font-mono leading-none">
                    Progress: {selectedTask.status === TaskStatus.COMPLETED ? 100 : selectedTask.status === TaskStatus.PENDING ? 0 : selectedTask.progress}%
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  if (isCommentListening) {
                    stopCommentListening();
                  }
                }}
                className="text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Columns */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/10 p-6 gap-6">
              
              {/* Left Side: Task Attributes Metadata (2 Cols) */}
              <div className="md:col-span-2 space-y-6 pr-0 md:pr-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5 whitespace-pre-line font-medium">
                    {selectedTask.description || "No specific instructions or description details outlined for this task."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <h5 className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 leading-none">
                      Due Deadline
                    </h5>
                    <p className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" /> {selectedTask.deadline}
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1 leading-none">
                        Completion Status
                      </h5>
                      <p className="text-xs text-slate-300 font-semibold font-mono mt-1.5">
                        {selectedTask.status === TaskStatus.COMPLETED ? "Archived Done" : "Active Flow"}
                      </p>
                    </div>
                    <TaskProgressVisual progress={selectedTask.status === TaskStatus.COMPLETED ? 100 : selectedTask.status === TaskStatus.PENDING ? 0 : selectedTask.progress} status={selectedTask.status} />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400 mb-2">
                    Assignees Profile
                  </h4>
                  <div className="space-y-2">
                    {users.filter(u => selectedTask.assignedTo.includes(u.id)).map(usr => (
                      <div key={usr.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                        <img src={usr.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{usr.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{usr.role} • {usr.employeeId}</p>
                        </div>
                      </div>
                    ))}
                    {users.filter(u => selectedTask.assignedTo.includes(u.id)).length === 0 && (
                      <div className="text-xs text-slate-500 italic p-2 border border-dashed border-white/10 rounded-xl text-center">
                        No team member assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Real-Time Voice Comments thread (3 Cols) */}
              <div className="md:col-span-3 space-y-4 flex flex-col justify-between pt-6 md:pt-0 pl-0 md:pl-6 min-h-[350px]">
                
                {/* Comments Scroll Container */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  <h4 className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400 mb-1 leading-none sticky top-0 bg-slate-900 pb-2 z-10 flex justify-between items-center">
                    <span>Task Discussion Thread</span>
                    <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/10 font-mono px-2 py-0.5 rounded-full text-[9px] font-bold lowercase">
                      {selectedTask.comments?.length || 0} briefings
                    </span>
                  </h4>

                  {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/5 rounded-xl bg-slate-950/20">
                      <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400 font-medium">No updates posted yet on this task.</p>
                      <p className="text-[10px] text-slate-600 font-mono mt-1">Transcribing comments via Web Speech or text inputs is fully synchronized.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 pr-1">
                      {selectedTask.comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <img src={comment.userAvatar} alt="Commenter" className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-xs font-bold text-white">{comment.userName}</span>
                              {comment.userId === currentUser.id && (
                                <span className="text-[8px] bg-indigo-500/15 text-indigo-400 px-1 py-0.5 rounded font-bold font-mono uppercase tracking-wider leading-none">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(comment.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed break-words font-medium">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commentary Interactive Submission Form with Voice Notes microphone attachment */}
                <form onSubmit={handleAddComment} className="border-t border-white/10 pt-4 space-y-3 bg-slate-900">
                  <div className="relative group">
                    <textarea
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Comment on task instructions or document status..."
                      rows={2}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    
                    {/* Add Voice Note Mic Button aligned to Web Speech API */}
                    <button
                      type="button"
                      onClick={toggleCommentListening}
                      title={isCommentListening ? "Stop listening and attach voice translation" : "Add transcribed Voice Note"}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer border min-h-[44px] min-w-[130px] justify-center ${
                        isCommentListening
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse font-bold shadow-lg shadow-rose-500/5 select-none"
                          : "bg-slate-950/40 hover:bg-slate-950/60 border-slate-200/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isCommentListening ? (
                        <>
                          <MicOff className="w-4 h-4 text-rose-500" />
                          <span>Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-indigo-400" />
                          <span>Add Voice Note</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCommentText("");
                          if (isCommentListening) {
                            stopCommentListening();
                          }
                        }}
                        className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer min-h-[44px]"
                      >
                        Reset
                      </button>

                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-5 py-1.5 rounded-xl transition-all shadow-lg shadow-indigo-500/15 active:scale-95 cursor-pointer min-h-[44px]"
                      >
                        Post Comment
                      </button>
                    </div>

                  </div>
                </form>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  users: User[];
  badgeStyle: string;
  onMoveTask: (status: TaskStatus, progress: number) => void;
  onDelete: () => void;
  onSelect: () => void;
}

function TaskCard({ task, users, badgeStyle, onMoveTask, onDelete, onSelect }: TaskCardProps) {
  // Translate assignee IDs to real User objects
  const assignees = users.filter((u) => task.assignedTo.includes(u.id));

  return (
    <div 
      onClick={onSelect}
      className="glass-card p-5 rounded-xl space-y-4 flex flex-col cursor-pointer border border-white/5 transition-all duration-300 hover:-translate-y-1 relative group bg-indigo-950/[0.03]"
    >
      <div className="flex justify-between items-start">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${badgeStyle}`}>
          {task.priority}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== TaskStatus.PENDING && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(TaskStatus.PENDING, 0);
              }}
              title="Move left"
              className="text-slate-400 hover:text-white p-1"
            >
              ←
            </button>
          )}
          {task.status === TaskStatus.PENDING && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(TaskStatus.IN_PROGRESS, 25);
              }}
              title="Start Task"
              className="text-indigo-400 hover:text-white p-1"
            >
              Start
            </button>
          )}
          {task.status === TaskStatus.IN_PROGRESS && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(TaskStatus.COMPLETED, 100);
              }}
              title="Complete Task"
              className="text-emerald-400 hover:text-white p-1"
            >
              Done
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }} 
            title="Delete Task" 
            className="text-slate-500 hover:text-rose-400 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <h4
            className={`font-semibold text-white leading-tight ${
              task.status === TaskStatus.COMPLETED ? "line-through text-slate-500" : ""
            }`}
          >
            {task.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
        </div>
        <TaskProgressVisual progress={task.status === TaskStatus.COMPLETED ? 100 : task.status === TaskStatus.PENDING ? 0 : task.progress} status={task.status} />
      </div>

      {/* Progress slider if task is in progress */}
      {task.status === TaskStatus.IN_PROGRESS && (
        <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Progress</span>
            <span className="text-indigo-300 font-bold">{task.progress}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            step="5"
            value={task.progress}
            onChange={(e) => onMoveTask(TaskStatus.IN_PROGRESS, parseInt(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-900 h-1 rounded shadow-inner"
          />
        </div>
      )}

      {/* Completed indicator */}
      {task.status === TaskStatus.COMPLETED && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> Completed
        </div>
      )}

      {/* Card footnotes for assignees, commenting or attachment parameters */}
      <div className="flex justify-between items-center border-t border-white/5 pt-3">
        <div className="flex -space-x-1.5">
          {assignees.map((asg) => (
            <img
              key={asg.id}
              src={asg.avatar}
              alt={asg.fullName}
              title={asg.fullName}
              className="w-7 h-7 rounded-full object-cover border-2 border-slate-950"
            />
          ))}
          {assignees.length === 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-950">
              <UserPlus className="w-3 h-3 text-slate-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs font-mono">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> {task.attachments.length}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Clock className="w-3 h-3" /> {task.deadline.split("-")[1]}/{task.deadline.split("-")[2]}
          </span>
        </div>
      </div>
    </div>
  );
}
