/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Achievement, Task, TaskStatus } from "../types";
import {
  Brain,
  Bot,
  Send,
  Sparkles,
  Award,
  Lock,
  History,
  Activity,
  Zap,
  CheckCircle,
  BarChart4
} from "lucide-react";

interface AIAdvisorViewProps {
  currentUser: User;
  achievements: Achievement[];
  tasks: Task[];
}

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  time: string;
}

export default function AIAdvisorView({
  currentUser,
  achievements,
  tasks
}: AIAdvisorViewProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello Alex. I've analyzed your team's velocity. We are currently 12% ahead of the Q3 roadmap. Would you like me to draft the weekly performance report?",
      time: "10:42 AM"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const triggerGeminiChat = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Append User Message
    const userMsg: ChatMessage = {
      sender: "user",
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptText })
      });
      const data = await response.json();
      
      const aiReply: ChatMessage = {
        sender: "ai",
        text: data.reply || "I analyzed your queue, but encountered an error compiling response.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      console.error(e);
      const errorReply: ChatMessage = {
        sender: "ai",
        text: "Apologies, I had an unexpected error proxying the Gemini Core processor. Please ensure the GEMINI_API_KEY is defined.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userTxt = inputText;
    setInputText("");
    triggerGeminiChat(userTxt);
  };

  const quickPrompts = [
    { label: "Generate Weekly Report", query: "Can you analyze recent team velocity and generate the weekly performance report?" },
    { label: "Detect Overdue Tasks", query: "Highlight any overdue tasks on our Kanban board and recommend recovery actions." },
    { label: "Risk Analysis", query: "Analyze our task queue and assess our primary delivery risks for Q3." }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-20">
      
      {/* Header controls snapshots */}
      <section className="space-y-1">
        <h1 className="font-display-md text-3xl font-extrabold text-white tracking-tight">
          AI Insights Control Center
        </h1>
        <p className="text-slate-400 font-body-md text-sm">
          Optimize operations and gather predictive insights through the Google Gemini API.
        </p>
      </section>

      {/* Main Grid: Chat Assistant & Team heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gemini Chat assistant console */}
        <section className="lg:col-span-7 glass-card rounded-2xl flex flex-col h-[520px] overflow-hidden border-indigo-500/20 shadow-xl shadow-indigo-500/[0.02]">
          
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-indigo-500/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse text-white shadow shadow-indigo-500/30">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-label-md text-sm text-indigo-300 font-bold block">
                Nexora AI Agent
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              System Optimized
            </span>
          </div>

          {/* Conversation stream */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-slate-950/5">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                    msg.sender === "user"
                      ? "bg-indigo-500 text-white border-indigo-500/10"
                      : "bg-slate-900 border-white/10 text-indigo-400"
                  }`}
                >
                  {msg.sender === "user" ? <Sparkles className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl shadow-lg ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "glass-card text-slate-200 rounded-tl-none border-white/15"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider ml-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/40 p-3.5 rounded-2xl flex gap-1 items-center border border-white/5">
                  <div className="w-2.5 h-2.5 bg-indigo-500/50 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick options and Input controller */}
          <div className="p-4 space-y-4 bg-slate-950/45 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerGeminiChat(p.query)}
                  className="bg-slate-900 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/20 px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-indigo-300 transition-all active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Nexora about productivity analysis..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-500 pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg hover:scale-105 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Team Performance bar metrics charts */}
        <section className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-headline-md tracking-tight mb-2">
              Team Performance
            </h3>
            <p className="text-xs text-slate-400 mb-6">Efficiency metrics per division</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-slate-300">Engineering</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">94%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-slate-300">Design</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">82%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 shadow-[0_0_8px_#0066FF] rounded-full" style={{ width: "82%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-slate-300">Marketing</span>
                  <span className="text-xs font-mono font-bold text-orange-400">68%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 shadow-[0_0_8px_#f97316] rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-slate-300">Sales Ops</span>
                  <span className="text-xs font-mono font-bold text-sky-400">75%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 shadow-[0_0_8px_#38bdf8] rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Global trend layout block */}
          <div className="mt-8 relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/60 p-6 flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none"></div>
            <span className="text-5xl font-extrabold text-indigo-400 font-display-md tracking-tighter mb-1">
              +18.4%
            </span>
            <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
              Global Output Trend
            </span>
          </div>
        </section>

      </div>

      {/* Task Trends & Milestones column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Custom workload bar representation */}
        <section className="lg:col-span-8 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold text-white font-headline-md tracking-tight">
                Task Trends
              </h3>
              <p className="text-xs text-slate-400">Velocity vs Workload (Last 30 Days)</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Velocity
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Completion
              </span>
            </div>
          </div>

          <div className="h-44 w-full flex items-end gap-3 px-2 mb-4">
            {/* Week 1 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[40%] hover:bg-indigo-500/40 transition-all" title="Velocity W1"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[35%] hover:bg-emerald-500/65 transition-all" title="Completion W1"></div>
            </div>
            {/* Week 2 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[58%] hover:bg-indigo-500/40 transition-all" title="Velocity W2"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[52%] hover:bg-emerald-500/65 transition-all" title="Completion W2"></div>
            </div>
            {/* Week 3 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[48%] hover:bg-indigo-500/40 transition-all" title="Velocity W3"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[44%] hover:bg-emerald-500/65 transition-all" title="Completion W3"></div>
            </div>
            {/* Week 4 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[75%] hover:bg-indigo-500/40 transition-all" title="Velocity W4"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[71%] hover:bg-emerald-500/65 transition-all" title="Completion W4"></div>
            </div>
            {/* Week 5 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[63%] hover:bg-indigo-500/40 transition-all" title="Velocity W5"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[58%] hover:bg-emerald-500/65 transition-all" title="Completion W5"></div>
            </div>
            {/* Week 6 */}
            <div className="flex-1 flex gap-1 h-full items-end justify-center">
              <div className="w-3 bg-indigo-500/20 rounded-t h-[82%] hover:bg-indigo-500/40 transition-all" title="Velocity W6"></div>
              <div className="w-3 bg-emerald-500/40 rounded-t h-[78%] hover:bg-emerald-500/65 transition-all" title="Completion W6"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold px-2">
            <span>Wk 1</span>
            <span>Wk 2</span>
            <span>Wk 3</span>
            <span>Wk 4</span>
            <span>Wk 5</span>
            <span>Wk 6</span>
          </div>
        </section>

        {/* Gamified Achievements milestones */}
        <section className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-headline-md mb-6">
              Achievements
            </h3>
            <div className="space-y-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border transition-all ${
                    ach.locked
                      ? "border-white/5 opacity-50"
                      : "border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border ${
                      ach.locked
                        ? "bg-slate-900 border-white/5 text-slate-400"
                        : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-500/5"
                    }`}
                  >
                    {ach.locked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-slate-200 text-sm font-semibold truncate hover:text-white transition-colors">
                      {ach.title}
                    </p>
                    {ach.locked && ach.progress ? (
                      <div className="mt-1.5 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400"
                          style={{ width: `${(ach.progress / (ach.maxProgress || 1)) * 100}%` }}
                        ></div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 truncate">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-6 py-2.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 font-label-md font-bold text-xs uppercase tracking-wider transition-colors">
            View All Badges
          </button>
        </section>

      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-indigo-500/20 transition-all bg-indigo-950/[0.03]">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <BarChart4 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest leading-none">
              Velocity Score
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">88.4</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-emerald-500/20 transition-all bg-emerald-950/[0.03]">
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest leading-none">
              Active Tasks
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length +
                tasks.filter((t) => t.status === TaskStatus.PENDING).length}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-indigo-500/20 transition-all bg-indigo-950/[0.03]">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <History className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest leading-none">
              Last Update
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">2m ago</p>
          </div>
        </div>
      </section>

    </div>
  );
}
