/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Message, Channel, User, MessageType } from "../types";
import {
  Search,
  Pin,
  Megaphone,
  Video,
  Phone,
  Info,
  Smile,
  Mic,
  Paperclip,
  Send,
  Download,
  FileText,
  Play,
  Pause,
  CheckCheck,
  Check
} from "lucide-react";

interface MessagesProps {
  messages: Message[];
  channels: Channel[];
  users: User[];
  currentUser: User;
  onSendMessage: (channelId: string, content: string, type?: MessageType, fileName?: string, fileSize?: string) => void;
}

export default function MessagesView({
  messages,
  channels,
  users,
  currentUser,
  onSendMessage
}: MessagesProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string>("chan-sarah-m");
  const [chatSearch, setChatSearch] = useState("");
  const [typedMessage, setNewTypedMessage] = useState("");
  
  // Voice note simulator states
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when loaded or updated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChannelId]);

  // Voice note timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVoicePlaying) {
      timer = setInterval(() => {
        setVoiceSeconds((prev) => {
          if (prev >= 24) {
            setIsVoicePlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVoicePlaying]);

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.recipientId === selectedChannelId);

  // Identify recipient user or metadata
  const getRecipientInfo = (chan: Channel) => {
    if (chan.type === "direct") {
      const recipientId = chan.members.find((id) => id !== currentUser.id) || currentUser.id;
      return users.find((u) => u.id === recipientId) || users[0];
    }
    return {
      fullName: chan.name,
      avatar: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=256",
      status: "Online" as const
    };
  };

  const activeRecipient = getRecipientInfo(activeChannel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(selectedChannelId, typedMessage, "text");
    setNewTypedMessage("");
  };

  // Filter conversations
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden glass-card rounded-2xl border border-white/5 h-[calc(100vh-140px)] animate-fade-in relative z-10 w-full mb-12">
      
      {/* Sidebar Channels List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-slate-900/30 overflow-hidden">
        
        {/* Pinned Announcement Box */}
        <div className="p-4 border-b border-white/5 bg-indigo-500/[0.01]">
          <div className="flex items-center justify-between mb-3 text-xs font-mono font-semibold text-slate-500">
            <span className="uppercase tracking-widest flex items-center gap-1 font-bold">
              <Megaphone className="w-3.5 h-3.5 text-indigo-400" /> Broadcasts
            </span>
            <span className="text-[10px] text-indigo-400 uppercase font-black tracking-widest flex items-center gap-0.5">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          </div>

          <div
            onClick={() => setSelectedChannelId("chan-announcements")}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
              selectedChannelId === "chan-announcements"
                ? "bg-indigo-500/10 border-indigo-500/30"
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Megaphone className="w-4 h-4" />
              </div>
              <p className="font-label-md text-sm text-white group-hover:text-indigo-400 transition-colors font-bold">
                Announcement Channel
              </p>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Alex Nexora: New Q4 targets are live. Check the dashboard...
            </p>
          </div>
        </div>

        {/* Search bar input */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-950 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scrollable list of active threads */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
          {filteredChannels
            .filter((c) => c.id !== "chan-announcements")
            .map((chan) => {
              const recipient = getRecipientInfo(chan);
              const isActive = selectedChannelId === chan.id;
              
              // Simulate typing status for Sarah Mitchell
              const isTyping = chan.id === "chan-sarah-m" && !messages.some(m => m.id === "new-s5");

              return (
                <div
                  key={chan.id}
                  onClick={() => setSelectedChannelId(chan.id)}
                  className={`px-4 py-3.5 flex items-center gap-4 hover:bg-white/[0.04] cursor-pointer transition-colors relative ${
                    isActive ? "bg-indigo-500/[0.05]" : ""
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}

                  <div className="relative">
                    <img
                      src={recipient.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256"}
                      alt={recipient.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    {recipient.status === "Online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-label-md text-sm text-slate-200 truncate font-semibold">
                        {chan.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {chan.lastMessageTime}
                      </p>
                    </div>
                    {isTyping ? (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        </span>
                        <span>Typing...</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 truncate">
                        {chan.lastMessage}
                      </p>
                    )}
                  </div>

                  {chan.unreadCount && chan.unreadCount > 0 ? (
                    <span className="bg-indigo-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono">
                      {chan.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })}
        </div>
      </div>

      {/* Right side: Focused Workspace */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20">
        
        {/* Workspace Active Header */}
        <div className="h-16 px-6 border-b border-white/5 backdrop-blur-md flex items-center justify-between z-10 bg-slate-900/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeRecipient.avatar}
                alt={activeRecipient.fullName}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              {activeRecipient.status === "Online" && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900"></div>
              )}
            </div>
            <div>
              <h2 className="font-label-md text-sm text-white font-bold leading-none">
                {activeRecipient.fullName}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {activeRecipient.status === "Online" ? (
                  <span className="text-emerald-400">Online now</span>
                ) : (
                  <span>Offline</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Canvas Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/5"
        >
          {channelMessages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}
              >
                {!isSelf && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover mt-1 border border-white/5"
                  />
                )}

                <div className="space-y-1">
                  {/* Bubble text contents */}
                  {msg.type === "text" && (
                    <div
                      className={`p-4 rounded-2xl shadow-lg relative ${
                        isSelf
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/5"
                          : "glass-card text-slate-200 rounded-tl-none border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  )}

                  {/* Bubble voice note player */}
                  {msg.type === "voice" && (
                    <div className="p-3.5 rounded-2xl rounded-tl-none glass-card w-64 shadow-xl border-white/10">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (isVoicePlaying) {
                              setIsVoicePlaying(false);
                            } else {
                              setIsVoicePlaying(true);
                              setVoiceSeconds(0);
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 flex items-center justify-center transition-colors"
                        >
                          {isVoicePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-indigo-400" />}
                        </button>
                        <div className="flex-1 flex items-end gap-1 h-6 select-none leading-none">
                          {/* Simulated active wave pattern player */}
                          {Array.from({ length: 15 }).map((_, idx) => {
                            const heights = [8, 16, 24, 12, 20, 8, 18, 14, 22, 10, 16, 12, 18, 14, 8];
                            const height = heights[idx % heights.length];
                            const isFinished = (idx / 15) * 24 <= voiceSeconds;
                            return (
                              <div
                                key={idx}
                                style={{ height: `${height}px` }}
                                className={`w-1 rounded-full transition-all duration-300 ${
                                  isVoicePlaying && isFinished ? "bg-indigo-400" : "bg-indigo-400/20"
                                }`}
                              ></div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {isVoicePlaying
                            ? `0:${voiceSeconds.toString().padStart(2, "0")}`
                            : msg.playTime || "0:24"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* File Attachment / Lobby preview pdf card */}
                  {msg.type === "file" && (
                    <div className="group overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-900 w-72 cursor-pointer">
                      <div className="relative">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/20"></div>
                      </div>
                      <div className="p-3 bg-slate-950/60 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-none truncate w-40">
                              {msg.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">{msg.fileSize}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 hover:text-white" />
                      </div>
                    </div>
                  )}

                  {/* Time metadata stamp */}
                  <div className="flex items-center gap-1.5 pt-0.5 justify-end">
                    <span className="text-[9px] text-slate-500 tracking-wider font-mono">
                      {msg.timestamp}
                    </span>
                    {isSelf && (
                      <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat input console */}
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-3"
        >
          <div className="glass-card rounded-2xl p-2 flex items-center gap-2 shadow-2xl border-white/20">
            <button
              type="button"
              className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors select-none"
            >
              <Smile className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setNewTypedMessage(e.target.value)}
              placeholder={`Write message to ${activeRecipient.fullName.split(" ")[0]}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-500 mx-2"
            />
            <button
              type="button"
              className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="w-12 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 fill-white" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
