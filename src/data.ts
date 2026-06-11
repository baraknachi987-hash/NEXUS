import {
  User,
  UserRole,
  Task,
  TaskPriority,
  TaskStatus,
  Channel,
  Message,
  Announcement,
  AuditLog,
  Achievement,
  CalendarEvent,
  OrganizationSettings,
  AttendanceLog,
  LeaveRequest
} from "./types";

// START WITH 100% EMPTY SYSTEM PER USER INSTRUCTIONS
export const SEED_USERS: User[] = [];
export const SEED_CHANNELS: Channel[] = [];
export const SEED_MESSAGES: Message[] = [];
export const SEED_TASKS: Task[] = [];
export const SEED_ANNOUNCEMENTS: Announcement[] = [];
export const SEED_AUDIT_LOGS: AuditLog[] = [];
export const SEED_ATTENDANCE_LOGS: AttendanceLog[] = [];
export const SEED_LEAVE_REQUESTS: LeaveRequest[] = [];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "Nexora Elite",
    description: "Complete your first task in the Kanban portal",
    icon: "workspace_premium",
    locked: true
  },
  {
    id: "ach-2",
    title: "Corporate Navigator",
    description: "Successfully submit attendance clock records",
    icon: "military_tech",
    locked: true
  }
];

export const SEED_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "ev-holiday",
    title: "Summer Solstice (Company Holiday)",
    start: "2026-06-21T00:00:00Z",
    end: "2026-06-21T23:59:59Z",
    type: "holiday",
    description: "Company closed for rest hours."
  }
];

export const SEED_SETTINGS: OrganizationSettings = {
  companyName: "Nexora Enterprise",
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop&q=80",
  brandColor: "#4f46e5",
  welcomeMessage: "Welcome to Nexora Enterprise OS.",
  theme: "dark"
};

// Base Client State Manager
export class StateManager {
  private static STORAGE_KEY = "NEXORA_STATE";

  static getOrInitialize() {
    try {
      const stored = localStorage.getItem(StateManager.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("LocalStorage active error", e);
    }

    const defaultState = {
      users: [],
      channels: [],
      messages: [],
      tasks: [],
      announcements: [],
      auditLogs: [],
      achievements: SEED_ACHIEVEMENTS,
      calendarEvents: SEED_CALENDAR_EVENTS,
      settings: SEED_SETTINGS,
      attendanceLogs: [],
      leaveRequests: [],
      currentUser: null,
    };

    StateManager.save(defaultState);
    return defaultState;
  }

  static save(state: any) {
    try {
      localStorage.setItem(StateManager.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Save state mismatch", e);
    }
  }

  static clear() {
    try {
      localStorage.removeItem(StateManager.STORAGE_KEY);
      localStorage.removeItem("NEXORA_TOKEN");
    } catch (e) {
      console.error(e);
    }
  }
}
