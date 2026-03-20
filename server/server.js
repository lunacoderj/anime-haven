import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  }
});

dotenv.config();

if (process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const userMessageTracker = new Map();

function checkCooldown(userId) {
  if (!userMessageTracker.has(userId)) {
    userMessageTracker.set(userId, { messages: [], cooldownUntil: null });
  }
  
  const tracker = userMessageTracker.get(userId);
  const now = Date.now();

  if (tracker.cooldownUntil && now < tracker.cooldownUntil) {
    return { allowed: false, waitSeconds: Math.ceil((tracker.cooldownUntil - now) / 1000) };
  }

  tracker.messages = tracker.messages.filter(t => now - t < 120000);

  if (tracker.messages.length >= 3) {
    tracker.cooldownUntil = now + 180000;
    tracker.messages = [];
    return { allowed: false, waitSeconds: 180 };
  }

  tracker.messages.push(now);
  return { allowed: true, count: tracker.messages.length };
}

// MIDDLEWARE
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:8081",
      "http://localhost:5173",
      "https://anime-haven.vercel.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", limiter);

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// SCHEMAS

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: String,
  displayName: String,
  email: String,
  photoURL: String,
  bio: { type: String, default: "" },
  googleAuth: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const bookmarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaId: { type: Number, required: true },
  mediaType: { type: String, enum: ["ANIME", "MANGA"], required: true },
  title: String,
  coverImage: String,
  status: { 
    type: String, 
    enum: ["watching", "completed", "plan_to_watch", "dropped", "on_hold"],
    default: "plan_to_watch"
  },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
bookmarkSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mediaId: { type: Number, required: true },
  mediaType: { type: String, enum: ["ANIME", "MANGA"] },
  title: String,
  coverImage: String,
  episodeOrChapter: { type: Number, default: 1 },
  watchedAt: { type: Date, default: Date.now }
});
historySchema.index({ userId: 1, mediaId: 1 });

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: String,
  displayName: String,
  photoURL: String,
  mediaId: { type: Number, required: true },
  mediaType: { type: String, enum: ["ANIME", "MANGA"] },
  text: { type: String, required: true, maxlength: 1000 },
  likes: [{ type: String }],
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: String,
  displayName: String,
  photoURL: String,
  room: { type: String, required: true },
  text: { type: String, required: true, maxlength: 500 },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  mentions: [{ type: String }], // Array of usernames mentioned
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["comment_reply", "comment_like", "system", "new_feature"]
  },
  message: String,
  link: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const featureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  description: String,
  updatedAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  targetUserId: String,
  targetCommentId: String,
  reason: String,
  status: { 
    type: String, 
    enum: ["pending", "reviewed", "dismissed"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

const supportChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [{
    sender: { type: String, enum: ["user", "ai", "admin"] },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ["open", "handoff", "closed"], default: "open" },
  createdAt: { type: Date, default: Date.now }
});

const releaseNoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
  version: String,
  emojis: {
    type: Map,
    of: Number,
    default: { "🚀": 0, "❤️": 0, "🔥": 0, "🎉": 0 }
  },
  comments: [{
    username: String,
    displayName: String,
    photoURL: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const History = mongoose.model("History", historySchema);
const Comment = mongoose.model("Comment", commentSchema);
const Message = mongoose.model("Message", messageSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const FeatureFlag = mongoose.model("FeatureFlag", featureFlagSchema);
const Report = mongoose.model("Report", reportSchema);
const ReleaseNote = mongoose.model("ReleaseNote", releaseNoteSchema);
const SupportChat = mongoose.model("SupportChat", supportChatSchema);

// Tracker for active users in rooms
let activeUsersInRooms = new Map(); // roomId -> Set(userIds)

// REST API ROUTES

// USER ROUTES

app.post("/api/users", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, googleAuth } = req.body;
    let user = await User.findOne({ uid });
    if (user) {
      user.lastLogin = Date.now();
      await user.save();
    } else {
      user = new User({
        uid,
        email,
        displayName,
        photoURL,
        googleAuth
      });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid }).select("-email -isAdmin");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    // Note: Assuming authentication wrapper checks if requester is self.
    const { displayName, bio, username } = req.body;
    const user = await User.findOneAndUpdate(
      { uid },
      { displayName, bio, username },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users/:uid/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const { uid } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "anime-haven/avatars",
          public_id: `avatar_${uid}`,
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    await User.findOneAndUpdate(
      { uid },
      { photoURL: result.secure_url }
    );

    res.json({ photoURL: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// BOOKMARK ROUTES

app.get("/api/bookmarks/:userId", async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/bookmarks", async (req, res) => {
  try {
    const { userId, mediaId, mediaType, title, coverImage, status, progress } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId, mediaId },
      { userId, mediaId, mediaType, title, coverImage, status, progress, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/bookmarks/:userId/:mediaId", async (req, res) => {
  try {
    const { userId, mediaId } = req.params;
    await Bookmark.findOneAndDelete({ userId, mediaId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// HISTORY ROUTES

app.get("/api/history/:userId", async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId }).sort({ watchedAt: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/history", async (req, res) => {
  try {
    const { userId, mediaId, mediaType, title, coverImage, episodeOrChapter } = req.body;
    const history = await History.findOneAndUpdate(
      { userId, mediaId },
      { userId, mediaId, mediaType, title, coverImage, episodeOrChapter, watchedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/history/:userId", async (req, res) => {
  try {
    await History.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// COMMENT ROUTES

app.get("/api/comments/:mediaId", async (req, res) => {
  try {
    // top-level comments (no parentId)
    const comments = await Comment.aggregate([
      { $match: { mediaId: Number(req.params.mediaId), parentId: null } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "parentId",
          as: "replies"
        }
      },
      {
        $addFields: {
          replyCount: { $size: "$replies" }
        }
      },
      { $project: { replies: 0 } }
    ]);
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/comments/:mediaId/replies/:parentId", async (req, res) => {
  try {
    const replies = await Comment.find({ 
      mediaId: req.params.mediaId, 
      parentId: req.params.parentId 
    }).sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { userId, username, displayName, photoURL, mediaId, mediaType, text, parentId } = req.body;
    const comment = new Comment({
      userId, username, displayName, photoURL, mediaId, mediaType, text, parentId
    });
    await comment.save();

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment && parentComment.userId !== userId) {
        const notification = new Notification({
          userId: parentComment.userId,
          type: "comment_reply",
          message: `${displayName || username || 'Someone'} replied to your comment.`,
          link: `/details/${mediaId}` 
        });
        await notification.save();
      }
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/comments/:commentId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/comments/:commentId", async (req, res) => {
  try {
    // Note: User verification would ideally check if requester == comment.userId
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.isDeleted = true;
    comment.text = "";
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// NOTIFICATION ROUTES

app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/notifications/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN ROUTES

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("uid email displayName username googleAuth isAdmin isBanned createdAt lastLogin")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/admin/users/:uid/ban", async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { isBanned, banReason },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/users/:uid/reset-password", async (req, res) => {
  try {
    // This route triggers a password reset - frontend uses Firebase
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/features", async (req, res) => {
  try {
    let features = await FeatureFlag.find({});
    if (features.length === 0) {
      const defaults = [
        { name: "search", enabled: true, description: "Anime search" },
        { name: "chat", enabled: true, description: "Community chat" },
        { name: "comments", enabled: true, description: "Comments section" },
        { name: "ai_assistant", enabled: true, description: "AI Assistant" },
        { name: "image_analyzer", enabled: true, description: "Image Analyzer" },
        { name: "new_registrations", enabled: true, description: "New signups" },
        { name: "maintenance_mode", enabled: false, description: "Maintenance" }
      ];
      features = await FeatureFlag.insertMany(defaults);
    }
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/admin/features/:name", async (req, res) => {
  try {
    const { enabled } = req.body;
    const feature = await FeatureFlag.findOneAndUpdate(
      { name: req.params.name },
      { enabled, updatedAt: Date.now() },
      { new: true }
    );
    if (!feature) return res.status(404).json({ error: "Feature not found" });
    res.json(feature);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/reports", async (req, res) => {
  try {
    const reports = await Report.find({ status: "pending" });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/admin/reports/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



// AI ASSISTANT ROUTE

app.post("/api/ai", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Using fetch to call Gemini API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: message }] 
          }
        ],
        systemInstruction: { 
          parts: [{ text: "You are AnimeBot, a helpful AI assistant specialized in anime and manga. Help users discover anime, answer questions about series, characters, and recommend shows based on their preferences. Be friendly and enthusiastic about anime culture." }] 
        }
      })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "Failed to communicate with AI service" });
  }
});

app.get("/api/support/chat/:userId", async (req, res) => {
  try {
    let chat = await SupportChat.findOne({ userId: req.params.userId, status: { $ne: "closed" } });
    if (!chat) {
       chat = new SupportChat({ userId: req.params.userId, messages: [] });
       chat.messages.push({ role: "ai", text: "Konnichiwa! I'm Luna, your personal anime guide. How can I help you today? ^_^" });
       await chat.save();
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/support/chat", async (req, res) => {
  try {
    const { userId, text } = req.body;
    let chat = await SupportChat.findOne({ userId, status: { $ne: "closed" } });
    if (!chat) {
      chat = new SupportChat({ userId, messages: [] });
    }
    
    // 1. Save User Message
    chat.messages.push({ role: "user", text });
    
    // 2. Check for Handoff (Admin Needed)
    const needsAdmin = text.toLowerCase().includes("admin") || text.toLowerCase().includes("human") || text.toLowerCase().includes("help");
    if (needsAdmin) {
        chat.status = "handoff";
        await User.findOneAndUpdate({ uid: userId }, { isAdminRequested: true, isSupportNeeded: true });
    }

    // 3. AI Response if not and admin hasnt taken over
    if (chat.status === "open" || chat.status === "handoff") {
        try {
            const systemPrompt = "You are Luna, a cute and helpful anime guide assistant for Anime Haven. Answer concise and friendly. If help needed with technical issues, include 'ACTION_HANDOFF'. Site features: /chat (Community), /profile (Settings), /home (Trending). Never reveal credentials.";
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { 
                  parts: [{ text: systemPrompt }] 
                },
                contents: [
                    { role: "user", parts: [{ text }] }
                ]
              })
            });
            const data = await response.json();
            
            if (data.error) {
                console.error("Gemini API Error:", data.error);
                // Fallback to pro if flash fails or isn't supported
                throw new Error(data.error.message);
            }

            const lunaReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening! But I'm having a small glitch. Can you ask again? ^_^";
            
            if (lunaReply.includes("ACTION_HANDOFF")) {
                chat.status = "handoff";
                await User.findOneAndUpdate({ uid: userId }, { isAdminRequested: true, isSupportNeeded: true });
            }
            
            chat.messages.push({ role: "ai", text: lunaReply.replace("ACTION_HANDOFF", "").trim() });
        } catch (aiErr) {
            console.error("AI Error in Support Chat:", aiErr);
            // Fallback request using gemini-pro if flash fails
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: `System: Luna (Cute, Helpful). Question: ${text}` }] }]
                    })
                });
                const data = await response.json();
                const lunaReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening! ^_^";
                chat.messages.push({ role: "ai", text: lunaReply });
            } catch (innerErr) {
                chat.messages.push({ role: "ai", text: "Konnichiwa! I'm having a bit of trouble thinking right now. Please try again or ask for an admin! ^_^" });
            }
        }
    }

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error("Support Chat Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/support-chats", async (req, res) => {
  try {
    const chats = await SupportChat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// RELEASE NOTES ROUTES

app.get("/api/release-notes", async (req, res) => {
  try {
    const notes = await ReleaseNote.find().sort({ date: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/release-notes", async (req, res) => {
  try {
    const { title, content, version } = req.body;
    const note = new ReleaseNote({ title, content, version });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/release-notes/:id/comments", async (req, res) => {
  try {
    const { username, displayName, photoURL, text } = req.body;
    const note = await ReleaseNote.findById(req.params.id);
    note.comments.push({ username, displayName, photoURL, text });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/release-notes/:id/emoji", async (req, res) => {
  try {
    const { emoji } = req.body;
    const note = await ReleaseNote.findById(req.params.id);
    const current = note.emojis.get(emoji) || 0;
    note.emojis.set(emoji, current + 1);
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// HEALTH CHECK

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState });
});

// SOCKET.IO CHAT

io.on("connection", (socket) => {
  
  socket.on("join_room", async ({ room, userId, username }) => {
    socket.join(room);
    
    // Update active users tracker
    if (!activeUsersInRooms.has(room)) activeUsersInRooms.set(room, new Set());
    activeUsersInRooms.get(room).add(userId);
    socket.userId = userId;
    socket.room = room;

    socket.to(room).emit("user_joined", { username, room });

    // Send chat history
    try {
      const history = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("replyTo", "username text");
      socket.emit("load_history", history.reverse());
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  });

  socket.on("leave_room", ({ room, userId, username }) => {
    socket.leave(room);
    if (activeUsersInRooms.has(room)) {
      activeUsersInRooms.get(room).delete(userId);
    }
    socket.to(room).emit("user_left", { username, room });
  });

  socket.on("send_message", async ({ room, userId, username, displayName, photoURL, text, replyToId }) => {
    const cooldownResult = checkCooldown(userId);
    
    if (!cooldownResult.allowed) {
      socket.emit("cooldown_active", { 
        waitSeconds: cooldownResult.waitSeconds,
        message: `Cooldown active. Wait ${cooldownResult.waitSeconds} seconds.`
      });
      return;
    }

    try {
      // Parse mentions
      const mentionRegex = /@(\w+)/g;
      const mentionUsernames = [...new Set([...text.matchAll(mentionRegex)].map(m => m[1]))];
      
      const message = new Message({ 
        userId, username, displayName, photoURL, room, text, 
        replyTo: replyToId || null,
        mentions: mentionUsernames
      });
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("replyTo", "username text");

      io.to(room).emit("receive_message", {
        ...populatedMessage.toObject(),
        messageCount: cooldownResult.count
      });

      // Notification Logic
      const activeInRoom = activeUsersInRooms.get(room) || new Set();

      // 1. Notify Reply Target
      if (replyToId) {
        const originalMsg = await Message.findById(replyToId);
        if (originalMsg && originalMsg.userId !== userId && !activeInRoom.has(originalMsg.userId)) {
          const notification = new Notification({
            userId: originalMsg.userId,
            type: "comment_reply", // Reuse existing type for simplicity
            message: `${displayName || username} replied to your message in #${room}`,
            link: `/chat`
          });
          await notification.save();
        }
      }

      // 2. Notify Mentions
      for (const mUsername of mentionUsernames) {
        if (mUsername === username) continue;
        const targetUser = await User.findOne({ username: mUsername });
        if (targetUser && !activeInRoom.has(targetUser.uid)) {
          const notification = new Notification({
            userId: targetUser.uid,
            type: "comment_reply",
            message: `${displayName || username} mentioned you in #${room}`,
            link: `/chat`
          });
          await notification.save();
        }
      }

      // 3. Luna Bot Check
      if (text.toLowerCase().includes("@luna") || room === "luna") {
        try {
            const question = text.replace(/@luna/gi, "").trim();
            const systemPrompt = "You are Luna, a cute and helpful anime guide assistant for Anime Haven. Answer questions about anime/manga and site features (/chat, /profile). Keep responses concise and friendly. If help needed, include 'ACTION_HANDOFF'. Never reveal credentials.";
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { 
                  parts: [{ text: systemPrompt }] 
                },
                contents: [
                    { role: "user", parts: [{ text: question }] }
                ]
              })
            });
            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message);

            const lunaReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening! ^_~";
            
            const lunaMsg = new Message({
              userId: "luna_bot",
              username: "Luna",
              displayName: "Luna (AI)",
              photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
              room,
              text: lunaReply.replace("ACTION_HANDOFF", "").trim(),
              replyTo: message._id
            });
            await lunaMsg.save();
            io.to(room).emit("receive_message", { ...lunaMsg.toObject() });
        } catch (lunaErr) {
            console.error("Luna AI Error:", lunaErr);
            // Fallback for socket
            const lunaMsg = new Message({
              userId: "luna_bot",
              username: "Luna",
              displayName: "Luna (AI)",
              photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
              room,
              text: "Konnichiwa! I'm having a brain freeze. Try asking again! ^_^",
              replyTo: message._id
            });
            await lunaMsg.save();
            io.to(room).emit("receive_message", { ...lunaMsg.toObject() });
        }
      }

    } catch (err) {
      console.error("Chat error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("user_typing", { username });
  });

  socket.on("stop_typing", ({ room, username }) => {
    socket.to(room).emit("user_stop_typing", { username });
  });

  socket.on("disconnect", () => {
    if (socket.room && socket.userId) {
      if (activeUsersInRooms.has(socket.room)) {
        activeUsersInRooms.get(socket.room).delete(socket.userId);
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
