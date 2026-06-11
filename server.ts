import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Relational JSON Database Persistence ---
const DB_PATH = path.join(process.cwd(), "nexora_database.json");

interface DBState {
  users: any[];
  tasks: any[];
  messages: any[];
  announcements: any[];
  attendanceLogs: any[];
  leaveRequests: any[];
  auditLogs: any[];
  channels: any[];
  settings: any;
}

const defaultState: DBState = {
  users: [],
  tasks: [],
  messages: [],
  announcements: [],
  attendanceLogs: [],
  leaveRequests: [],
  auditLogs: [],
  channels: [
    {
      id: "chan-announcements",
      name: "Announcement Channel",
      type: "announcement",
      members: [],
      description: "Company-wide official announcements and updates."
    }
  ],
  settings: {
    companyName: "Nexora Enterprise",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop&q=80",
    brandColor: "#4f46e5",
    welcomeMessage: "Welcome to Nexora Enterprise",
    theme: "dark"
  }
};

function getDB(): DBState {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2));
    return defaultState;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database reading error, resetting to default state.", err);
    return defaultState;
  }
}

function saveDB(data: DBState) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Cryptographic HMAC Token and Password Hashing ---
const TOKEN_SECRET = process.env.TOKEN_SECRET || "nexora-secret-salt-2026-dynamic-auth-key-08316278";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const payloadStr = Buffer.from(payloadB64, "base64").toString("utf-8");
    const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadStr).digest("hex");
    if (hmac !== signature) return null;
    const parsed = JSON.parse(payloadStr);
    if (parsed.expiresAt < Date.now()) return null;
    return parsed.userId;
  } catch {
    return null;
  }
}

function getAuthUser(req: express.Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId) return null;
  const db = getDB();
  return db.users.find(u => u.id === userId) || null;
}

// Strip password hash from user instances before responding to frontend clients
function secureUser(user: any) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.password;
  return copy;
}

// --- Lazy-initialized GenAI Helper ---
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- Dynamic Consolidated App State ---
app.get("/api/state", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    res.status(401).json({ error: "Unauthorized session token." });
    return;
  }

  const db = getDB();
  
  // Clean channels: ensure current user is dynamically enrolled in the channels
  const secureChannels = db.channels.map(chan => {
    const updatedMembers = Array.from(new Set([...(chan.members || []), currentUser.id]));
    return { ...chan, members: updatedMembers };
  });

  res.json({
    users: db.users.map(u => secureUser(u)),
    channels: secureChannels,
    messages: db.messages,
    tasks: db.tasks,
    announcements: db.announcements,
    auditLogs: db.auditLogs,
    settings: db.settings,
    attendanceLogs: db.attendanceLogs,
    leaveRequests: db.leaveRequests,
    currentUser: secureUser(currentUser),
    isSessionActive: true
  });
});

// --- Authentication Endpoints ---

// Real Register Endpoint
app.post("/api/auth/register", (req, res) => {
  try {
    const { fullName, username, email, password, phone, avatar } = req.body;
    if (!fullName || !username || !email || !password) {
      res.status(400).json({ error: "Missing required profile parameters." });
      return;
    }

    const db = getDB();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUser = username.trim().toLowerCase();

    // Check pre-existing username/email
    const exists = db.users.some(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUser);
    if (exists) {
      res.status(400).json({ error: "User profile with this email or username already exists on file." });
      return;
    }

    // CEO rule: First user who registers becomes CEO, others default to Agent role
    const isFirst = db.users.length === 0;
    const assignedRole = isFirst ? "CEO" : "Agent";

    const newUser = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      username: cleanUser,
      email: cleanEmail,
      password: hashPassword(password), // SHA256 hashed securely!
      phone: phone ? phone.trim() : undefined,
      avatar: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=facearea&facepad=2&w=256&h=256&q=80",
      employeeId: `NEX-00${db.users.length + 1}`,
      joinDate: new Date().toISOString().split("T")[0],
      status: "Online",
      lastActive: "Active Now",
      role: assignedRole,
      productivityScore: 85,
      taskCompletionRate: 90,
      rank: db.users.length + 1,
      provider: "email"
    };

    db.users.push(newUser);

    // Auto add to the general announcement channel members queue
    const announcementsChan = db.channels.find(c => c.id === "chan-announcements");
    if (announcementsChan) {
      announcementsChan.members = announcementsChan.members || [];
      announcementsChan.members.push(newUser.id);
    }

    // Dynamic Audit Log on Registration
    const newLog = {
      id: `log-${Date.now()}`,
      actorId: newUser.id,
      actorName: newUser.fullName,
      action: "registered",
      details: `Created new profile. Role: ${assignedRole} - ID: ${newUser.employeeId}`,
      timestamp: new Date().toISOString(),
      category: "System Updates" as const
    };
    db.auditLogs.unshift(newLog);

    saveDB(db);

    const token = generateToken(newUser.id);
    res.json({
      user: secureUser(newUser),
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Sign up transaction failure." });
  }
});

// Real Login Endpoint with Password Cryptography Verification
app.post("/api/auth/login", (req, res) => {
  try {
    const { emailOrUser, password } = req.body;
    if (!emailOrUser || !password) {
      res.status(400).json({ error: "Missing authentication parameters." });
      return;
    }

    const cleanInput = emailOrUser.trim().toLowerCase();
    const db = getDB();

    const matchUser = db.users.find(u => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput);
    if (!matchUser) {
      res.status(401).json({ error: "No profile matching credentials on files." });
      return;
    }

    // SHA256 Verification Comparison
    const inputHash = hashPassword(password);
    if (matchUser.password !== inputHash) {
      res.status(401).json({ error: "Invalid login key context." });
      return;
    }

    // Update status to Online
    matchUser.status = "Online";
    matchUser.lastActive = "Active Now";
    saveDB(db);

    const token = generateToken(matchUser.id);
    res.json({
      user: secureUser(matchUser),
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to finalize authentication session." });
  }
});

// Real Single Sign On OAuth (Google / Facebook) Creation & Login controller
app.post("/api/auth/oauth", (req, res) => {
  try {
    const { email, fullName, avatar, provider } = req.body;
    if (!email || !fullName || !provider) {
      res.status(400).json({ error: "Missing necessary OAuth parameters." });
      return;
    }

    const db = getDB();
    const cleanEmail = email.trim().toLowerCase();
    
    let matchUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchUser) {
      // First user becomes CEO, others Agent
      const isFirst = db.users.length === 0;
      const assignedRole = isFirst ? "CEO" : "Agent";

      matchUser = {
        id: `user-${Date.now()}`,
        fullName: fullName.trim(),
        username: cleanEmail.split("@")[0] + "_" + Math.floor(Math.random() * 899 + 100),
        email: cleanEmail,
        password: hashPassword(crypto.randomBytes(16).toString("hex")), // Private random hash lock
        avatar: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=facearea&facepad=2&w=256&h=256&q=80",
        employeeId: `NEX-00${db.users.length + 1}`,
        joinDate: new Date().toISOString().split("T")[0],
        status: "Online",
        lastActive: "Active Now",
        role: assignedRole,
        productivityScore: 85,
        taskCompletionRate: 90,
        rank: db.users.length + 1,
        provider: provider
      };

      db.users.push(matchUser);

      // Audit Log
      const newLog = {
        id: `log-${Date.now()}`,
        actorId: matchUser.id,
        actorName: matchUser.fullName,
        action: "registered",
        details: `Created new SSO profile using ${provider}. Role: ${assignedRole}`,
        timestamp: new Date().toISOString(),
        category: "System Updates" as const
      };
      db.auditLogs.unshift(newLog);
      
      saveDB(db);
    } else {
      // Existing user: mark online
      matchUser.status = "Online";
      matchUser.lastActive = "Active Now";
      saveDB(db);
    }

    const token = generateToken(matchUser.id);
    res.json({
      user: secureUser(matchUser),
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Oauth transaction failed." });
  }
});

// Reset Database completely to Empty State (Zero-Users System)
app.post("/api/auth/reset", (_req, res) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2));
    res.json({ success: true, message: "Corporate container reset to empty. Start registration afresh." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Tasks CRUD Endpoints ---
app.post("/api/tasks", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized access token." });

  const { title, description, priority, deadline, assignedTo } = req.body;
  if (!title || !priority || !deadline) return res.status(400).json({ error: "Task coordinates are required." });

  const db = getDB();
  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: description || "",
    priority,
    deadline,
    status: "To Do",
    progress: 0,
    attachments: [],
    comments: [],
    assignedTo: assignedTo || []
  };

  db.tasks.unshift(newTask);

  // Audit
  const newLog = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: "created",
    targetId: newTask.id,
    targetName: newTask.title,
    details: `Drafted enterprise roadmap task: ${newTask.title}`,
    timestamp: new Date().toISOString(),
    category: "Product Development" as const
  };
  db.auditLogs.unshift(newLog);

  saveDB(db);
  res.json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized access token." });

  const db = getDB();
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });

  const { status, progress, comments, attachments } = req.body;
  
  let auditDetails = "";

  if (status !== undefined) {
    auditDetails += `Moved status to ${status}. `;
    task.status = status;
  }
  if (progress !== undefined) {
    auditDetails += `Set progress coordinates to ${progress}%. `;
    task.progress = progress;
  }
  if (comments !== undefined) {
    auditDetails += `Added comment. `;
    task.comments = comments;
  }
  if (attachments !== undefined) {
    task.attachments = attachments;
  }

  // Audit
  const newLog = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: "updated",
    targetId: task.id,
    targetName: task.title,
    details: auditDetails || "Updated task details",
    timestamp: new Date().toISOString(),
    category: "Product Development" as const
  };
  db.auditLogs.unshift(newLog);

  saveDB(db);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized access token." });

  const db = getDB();
  const initialLen = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  
  if (db.tasks.length === initialLen) return res.status(404).json({ error: "Task not found." });

  saveDB(db);
  res.json({ success: true });
});

// --- Channels & Collaboration DMs ---
app.post("/api/messages", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized access token." });

  const { recipientId, content, type, fileName, fileSize, playTime } = req.body;
  if (!recipientId || !content) return res.status(400).json({ error: "Message missing content coordinates." });

  const db = getDB();
  const newMessage = {
    id: `msg-${Date.now()}`,
    senderId: caller.id,
    senderName: caller.fullName,
    senderAvatar: caller.avatar,
    recipientId,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: type || "text",
    fileName,
    fileSize,
    playTime
  };

  db.messages.push(newMessage);

  // Update channel preview
  const channel = db.channels.find(c => c.id === recipientId);
  if (channel) {
    channel.lastMessage = type === "text" ? content : `Sent an attachment: ${fileName}`;
    channel.lastMessageTime = newMessage.timestamp;
  } else {
    // If it's a direct message and direct channel doesn't exist, build it dynamically!
    // Direct message id usually matches recipientUserId. Find recipient name
    const recipientUser = db.users.find(u => u.id === recipientId);
    if (recipientUser) {
      db.channels.push({
        id: recipientId,
        name: recipientUser.fullName,
        type: "direct",
        members: [caller.id, recipientId],
        lastMessage: content,
        lastMessageTime: newMessage.timestamp
      });
    }
  }

  saveDB(db);
  res.json(newMessage);
});

// Get detailed DM recipients + dynamic channel lists back
app.get("/api/messages", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized." });
  const db = getDB();
  res.json(db.messages);
});

// --- Announcements ---
app.post("/api/announcements", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized." });
  
  const { title, content, deadline } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Required fields missing." });

  const db = getDB();
  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    authorId: caller.id,
    authorName: caller.fullName,
    authorAvatar: caller.avatar,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    deadline,
    unread: true
  };

  db.announcements.unshift(newAnn);

  // Audit
  const newLog = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: "announced",
    targetId: newAnn.id,
    targetName: newAnn.title,
    details: `Published corporate announcement: "${newAnn.title}"`,
    timestamp: new Date().toISOString(),
    category: "System Updates" as const
  };
  db.auditLogs.unshift(newLog);

  saveDB(db);
  res.json(newAnn);
});

// --- Attendance Logs ---
app.post("/api/attendance/clock", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized session token." });

  const db = getDB();
  const dateStr = new Date().toISOString().split("T")[0];

  // Find active clock-in for today
  const activeLog = db.attendanceLogs.find(l => l.userId === caller.id && l.date === dateStr && l.status === "Pending");

  if (activeLog) {
    // Clock out procedure
    activeLog.clockOutTime = new Date().toISOString();
    activeLog.status = "Completed";

    const logAudit = {
      id: `log-${Date.now()}`,
      actorId: caller.id,
      actorName: caller.fullName,
      action: "clockedout",
      details: "Clocked out from workforce command station.",
      timestamp: new Date().toISOString(),
      category: "HR Operations" as const
    };
    db.auditLogs.unshift(logAudit);

    saveDB(db);
    res.json({ success: true, log: activeLog });
  } else {
    // Clock in procedure
    const newClockLog = {
      id: `att-${Date.now()}`,
      userId: caller.id,
      userName: caller.fullName,
      clockInTime: new Date().toISOString(),
      status: "Pending" as const,
      date: dateStr
    };

    db.attendanceLogs.unshift(newClockLog);

    const logAudit = {
      id: `log-${Date.now()}`,
      actorId: caller.id,
      actorName: caller.fullName,
      action: "clockedin",
      details: "Clocked in at workforce command station.",
      timestamp: new Date().toISOString(),
      category: "HR Operations" as const
    };
    db.auditLogs.unshift(logAudit);

    saveDB(db);
    res.json({ success: true, log: newClockLog });
  }
});

// --- Leave Requests ---
app.post("/api/leaves", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized tracker." });

  const { type, startDate, endDate, reason } = req.body;
  if (!type || !startDate || !endDate || !reason) return res.status(400).json({ error: "Missing leaf coordinates details." });

  const db = getDB();
  const newLeave = {
    id: `leave-${Date.now()}`,
    userId: caller.id,
    userName: caller.fullName,
    userAvatar: caller.avatar,
    type,
    startDate,
    endDate,
    reason,
    status: "Pending" as const,
    createdAt: new Date().toISOString()
  };

  db.leaveRequests.unshift(newLeave);

  // Audit
  const logAudit = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: "requestedleave",
    details: `Filed ${type} request starting ${startDate} through ${endDate}.`,
    timestamp: new Date().toISOString(),
    category: "HR Operations" as const
  };
  db.auditLogs.unshift(logAudit);

  saveDB(db);
  res.json(newLeave);
});

app.put("/api/leaves/:id", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized access token." });

  const db = getDB();
  const leave = db.leaveRequests.find(l => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: "No leave matching registration id." });

  // Only CEO and Managers can decide leaves status
  if (caller.role !== "CEO" && caller.role !== "Manager") {
    return res.status(403).json({ error: "Access denied: managers authorization required." });
  }

  const { status } = req.body;
  if (status !== "Approved" && status !== "Declined") {
    return res.status(400).json({ error: "Illegal status transition coordinate." });
  }

  leave.status = status;

  // Audit
  const logAudit = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: status.toLowerCase() === "approved" ? "approvedleave" : "declinedleave",
    details: `${status} ${leave.type} request on behalf of employee ${leave.userName}.`,
    timestamp: new Date().toISOString(),
    category: "HR Operations" as const
  };
  db.auditLogs.unshift(logAudit);

  saveDB(db);
  res.json(leave);
});

// --- Organization Settings ---
app.put("/api/settings", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized." });

  // Only CEO can update organization configurations
  if (caller.role !== "CEO") return res.status(403).json({ error: "Access restricted strictly to the CEO Nexora." });

  const db = getDB();
  const { companyName, logoUrl, brandColor, welcomeMessage, theme } = req.body;

  if (companyName) db.settings.companyName = companyName;
  if (logoUrl !== undefined) db.settings.logoUrl = logoUrl;
  if (brandColor) db.settings.brandColor = brandColor;
  if (welcomeMessage) db.settings.welcomeMessage = welcomeMessage;
  if (theme) db.settings.theme = theme;

  const logAudit = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action: "updatedsettings",
    details: "Modified global organization workspace settings parameters.",
    timestamp: new Date().toISOString(),
    category: "System Updates" as const
  };
  db.auditLogs.unshift(logAudit);

  saveDB(db);
  res.json(db.settings);
});

// --- Dynamic HR Permissions / User Promotion ---
app.put("/api/users/:id", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized." });

  const db = getDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const { role, productivityScore, lastActive, status } = req.body;

  let detailsLog = "";

  if (role && role !== user.role) {
    if (caller.role !== "CEO") {
      return res.status(403).json({ error: "Only the CEO can modify role permissions." });
    }
    detailsLog += `Promoted role to ${role}. `;
    user.role = role;
  }

  if (productivityScore !== undefined) {
    user.productivityScore = productivityScore;
  }
  if (lastActive) {
    user.lastActive = lastActive;
  }
  if (status) {
    user.status = status;
  }

  if (detailsLog) {
    const logAudit = {
      id: `log-${Date.now()}`,
      actorId: caller.id,
      actorName: caller.fullName,
      action: "promoted",
      targetId: user.id,
      targetName: user.fullName,
      details: detailsLog,
      timestamp: new Date().toISOString(),
      category: "HR Operations" as const
    };
    db.auditLogs.unshift(logAudit);
  }

  saveDB(db);
  res.json(secureUser(user));
});

// --- Audit logs insert endpoint ---
app.post("/api/audit-logs", (req, res) => {
  const caller = getAuthUser(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized tracker." });

  const { action, details, category, targetId, targetName } = req.body;
  if (!action || !details) return res.status(400).json({ error: "Coordinate details missing." });

  const db = getDB();
  const newLog = {
    id: `log-${Date.now()}`,
    actorId: caller.id,
    actorName: caller.fullName,
    action,
    targetId,
    targetName,
    details,
    timestamp: new Date().toISOString(),
    category: category || "System Updates"
  };
  db.auditLogs.unshift(newLog);

  saveDB(db);
  res.json(newLog);
});

// --- AI Chat groundings dynamically based on live persistent state ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const db = getDB();

    let ai;
    try {
      ai = getAIClient();
    } catch {
      console.warn("No GEMINI_API_KEY found, running simulated responses.");
      const replies = [
        "Based on real database telemetry: we have exactly " + db.users.length + " team members on record. All stats reflect live transactions.",
        "Analyzing active dashboard: " + db.tasks.filter(t => t.status === "To Do").length + " tasks remain in preparation status.",
        "HR audit check: " + db.leaveRequests.filter(l => l.status === "Pending").length + " holiday leaves are pending permission sync."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setTimeout(() => {
        res.json({ reply: `[Grounding Simulation Mode] ${randomReply}` });
      }, 800);
      return;
    }

    // Call real Gemini API grounded in actual live data on server
    const systemPrompt = `You are Nexora, a highly sophisticated Enterprise AI Management Advisor.
You help managers guide teams, manage tasks on the Kanban board, and recommend HR optimizations.
Real live database metrics currently parsed:
- Total Users registered: ${db.users.length}
- Total tasks on board: ${db.tasks.length}
- Completed tasks: ${db.tasks.filter(t => t.status === "Completed").length}
- Pending tasks: ${db.tasks.filter(t => t.status === "To Do").length}
- Attendance records today: ${db.attendanceLogs.length}
- Leave requests pending: ${db.leaveRequests.filter(l => l.status === "Pending").length}

User accounts on file:
${db.users.length > 0 ? db.users.map(u => `- ${u.fullName} (${u.role}) - Email: ${u.email}`).join("\n") : "No users are registered yet."}

Rule constraints:
- Refer to actual registered users of the company in responses.
- Refer to live counts in metrics. Never mention fake pre-filled statistics if those users are not in the list!
- Keep responses objective, helpful, clear, and focused on SaaS / enterprise telemetry metrics.
- Keep output concise (1-3 scannable paragraphs max).`;

    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const response = await chatInstance.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred in AI analysis." });
  }
});

// App initialization & serve middleware config
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexora grounded full-stack backend listening on port ${PORT}`);
  });
}

startServer();
