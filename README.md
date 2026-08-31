# QuickChat

A full-stack real-time chat application built with the MERN stack, featuring live messaging, WebRTC audio/video calling, group chats, and an integrated AI assistant.

**Live Demo:** [chat-app-kappa-azure.vercel.app](https://chat-app-kappa-azure.vercel.app/)

---

## Features

### Messaging
- Real-time 1:1 and group messaging via **Socket.io**
- Image and file sharing (Cloudinary-hosted)
- Message **replies** with quoted context, including swipe-to-reply on mobile
- **Emoji reactions** on any message, synced live across participants
- **Copy** message text or media links
- **Forward** any message to one or more contacts/groups
- Per-user and per-group **seen-status tracking** for accurate unread counts
- "Notes to Self" — a private chat with your own account
- Emoji picker for composing messages

### Groups
- Create groups with multiple members
- Add members to existing groups
- Leave groups (with automatic admin handoff)
- Group-specific unread counts and call history
- Group member contact info with shared media

### Audio & Video Calling
- **WebRTC**-based one-on-one and group audio/video calls
- Socket.io signaling for offer/answer/ICE candidate exchange
- Mesh topology for group calls
- Mute/unmute and camera on/off controls
- Persistent **call history** (duration, status, participants) stored per user and per group
- Missed/rejected/no-answer call tracking

### AI Assistant (Gemini)
- Dedicated "AI" chat for open-ended questions
- **Ask AI** panel available in any chat, grounded in that conversation's recent messages
- **Summarize conversation** — condenses recent messages into a short summary
- Automatic retry on transient AI service errors (overload/timeout)

### Other
- Online/offline presence indicators
- Responsive design — full desktop layout with a dedicated icon rail, and a mobile-optimized single-panel view with back navigation
- In-app image viewer (no external tabs)
- Profile editing with avatar upload

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Socket.io Client, Axios, React Hot Toast

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT Authentication, bcrypt

**Media & AI:** Cloudinary (image/file uploads), Google Gemini API (AI assistant)

**Real-Time Communication:** Socket.io (messaging, presence, call signaling), WebRTC (peer-to-peer audio/video)

---

## Project Structure

```
chat-app/
├── client/
│   ├── context/
│   │   ├── Authcontext.jsx      # Auth state, socket connection, online users
│   │   ├── ChatContext.jsx      # Messages, groups, AI chat, reactions, replies
│   │   └── CallContext.jsx      # WebRTC call state and signaling
│   ├── src/
│   │   ├── components/          # UI components (Sidebar, ChatContainer, calls, modals, etc.)
│   │   ├── pages/                # LoginPage, HomePage, ProfilePage
│   │   └── lib/                  # Utilities (perfStats, formatMessageTime)
│   └── ...
└── server/
    ├── models/                   # User, Message, Group, CallLog
    ├── controllers/               # Auth, message, group, AI, call logic
    ├── routes/                    # Express route definitions
    ├── middleware/                 # JWT auth middleware
    ├── lib/                        # DB connection, Cloudinary config, Gemini client
    └── server.js                   # Express app, Socket.io server, call signaling
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Bhargav-Sadineni/chat-app.git
   cd chat-app
   ```

2. Install dependencies
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. Configure environment variables

   **`server/.env`**
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```

   **`client/.env`**
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Run the app
   ```bash
   # Terminal 1 — backend
   cd server && npm run dev

   # Terminal 2 — frontend
   cd client && npm run dev
   ```

5. Open `http://localhost:5173` in your browser

---

## Performance

Measured in live testing across real network conditions:
- **Average message delivery latency:** ~194ms
- **Call connection setup:** typically under 7 seconds

Delivery latency was reduced by emitting messages to recipients immediately over Socket.io, with the database write happening in parallel rather than blocking the emit.

---

## Architecture Notes

- **Messaging:** REST endpoints handle persistence; Socket.io handles real-time delivery and presence.
- **Calling:** Signaling (who's calling whom, SDP offers/answers, ICE candidates) is relayed through Socket.io; actual audio/video flows peer-to-peer via WebRTC. Group calls use a mesh topology, where each participant connects directly to every other participant.
- **AI Assistant:** The backend builds a bounded, recent-message transcript for the relevant chat and sends it to the Gemini API alongside the user's question, so responses are grounded in real conversation context without unbounded prompt growth.

---

## License

This project is for personal/educational use.
