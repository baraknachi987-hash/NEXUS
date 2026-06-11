/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  CEO = "CEO",
  MANAGER = "Manager",
  ASSISTANT_MANAGER = "Assistant Manager",
  AGENT = "Agent"
}

export enum TaskPriority {
  LOW = "Low Priority",
  MEDIUM = "Medium Priority",
  HIGH = "High Priority"
}

export enum TaskStatus {
  PENDING = "To Do",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  OVERDUE = "Overdue"
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  avatar: string;
  employeeId: string;
  joinDate: string;
  status: "Online" | "Offline" | "Idle" | "Busy";
  lastActive: string;
  role: UserRole;
  productivityScore: number;
  taskCompletionRate: number;
  attendanceScore?: number;
  achievementScore?: number;
  rank: number;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  progress: number; // 0 to 100
  attachments: TaskAttachment[];
  comments: TaskComment[];
  assignedTo: string[]; // List of user IDs
}

export type MessageType = "text" | "image" | "voice" | "file";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string; // User ID, group ID, or channel ID
  content: string;
  timestamp: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  playTime?: string; // e.g. "0:24" for voice
}

export interface Channel {
  id: string;
  name: string;
  type: "direct" | "group" | "announcement";
  members: string[]; // User IDs
  description?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  deadline?: string;
  mediaUrl?: string;
  mediaType?: "image" | "pdf";
  mediaName?: string;
  unread?: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string; // e.g. "Promoted User", "Completed Task"
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
  category: "HR Operations" | "DevOps Team" | "Product Development" | "System Updates";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide or Material Symbols identifier
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  locked: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "deadline" | "meeting" | "event" | "holiday";
  description: string;
}

export interface OrganizationSettings {
  companyName: string;
  logoUrl?: string;
  brandColor: string;
  welcomeMessage: string;
  theme: "dark" | "light";
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  clockInTime: string;
  clockOutTime?: string;
  status: "Completed" | "Pending";
  date: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "PTO" | "Sick Leave" | "Remote Day" | "Personal";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Declined";
  createdAt: string;
}

