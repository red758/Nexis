## Project Overview

## Nexis is a **full‑stack SaaS workspace management tool** that lets organizations:

* ## Create and manage projects.

* ## Assign tasks to team members.

* ## Track progress with real‑time dashboards.

* ## Collaborate with clients via a read‑only view.

* ## Generate task lists automatically using **Google Gemini AI**.

## The codebase follows a **component‑based React architecture** and a clean **RBAC** model, allowing you to demonstrate best‑practice patterns during interviews.

## 

## 2\. Tech Stack

| Layer | Tech | Reason |
| :---- | :---- | :---- |
| Frontend | **React 18** \+ **Vite** \+ **Tailwind CSS** | Component‑driven UI, fast dev server, utility‑first styling. |
| Backend | **Node.js 20** \+ **Express** | Minimal HTTP API, easy to add middleware. |
| DB | **MongoDB** \+ **Mongoose** | JSON‑like documents fit the data model (users, orgs, tasks). |
| Auth | **JWT** (stored in localStorage) \+ **bcrypt** for password hashing. |  |
| Real‑time | **Socket.io** | Simple rooms for organization‑wide broadcasting. |
| AI | **Google Gemini API** (via backend route) | Demonstrates LLM integration without exposing keys. |

## 

## 

## 3\. Architecture & Folder Layout

nexis/  
├─ backend/  
│   ├─ models/  
│   │   ├─ User.js  
│   │   ├─ Organization.js  
│   │   └─ Task.js  
│   ├─ routes/  
│   │   ├─ userRoutes.js  
│   │   ├─ taskRoutes.js  
│   │   ├─ queryRoutes.js  
│   │   └─ aiRoutes.js  
│   ├─ middleware/  
│   │   └─ auth.js               \# JWT verification  
│   └─ server.js                  \# Express \+ Socket.io entry point  
│  
├─ frontend/  
│   ├─ src/  
│   │   ├─ components/  
│   │   │   ├─ Navbar.jsx  
│   │   │   ├─ TabBar.jsx  
│   │   │   ├─ AiCopilot.jsx  
│   │   │   ├─ ProjectHealth.jsx  
│   │   │   ├─ ActivityFeed.jsx  
│   │   │   ├─ TasksTab.jsx  
│   │   │   ├─ OverviewTab.jsx  
│   │   │   ├─ DocumentsTab.jsx  
│   │   │   ├─ ProjectBrief.jsx  
│   │   │   ├─ ProjectAssets.jsx  
│   │   │   ├─ ChatTab.jsx  
│   │   │   ├─ RoleGuard.jsx  
│   │   │   ├─ ProtectedRoute.jsx  
│   │   │   └─ … (other UI pieces)  
│   │   ├─ pages/  
│   │   │   ├─ DashboardPage.jsx  
│   │   │   └─ AuthPage.jsx  
│   │   ├─ context/  
│   │   │   └─ AuthContext.jsx  
│   │   ├─ hooks/  
│   │   │   └─ useRole.js     
│   │   ├─ App.jsx  
│   │   └─ main.jsx  
│   └─ vite.config.js  
└─ README.md   ← you are reading it now

## 4\. Getting Started (Local)

### Prerequisites

* Node ≥ 20 (use nvm if you need multiple versions)  
* MongoDB server (local or Atlas)  
* Google Gemini API key (optional – only needed for AI copilot)

### 

### Install

\# Clone  
git clone https://github.com/your‑username/nexis.git  
cd nexis  
\# Backend  
cd backend  
\# Frontend  
cd ../frontend

### Environment

Create backend/.env:  
dotenv  
PORT=5000  
MONGODB\_URI=mongodb://localhost:27017/nexis   \# or your Atlas URI  
JWT\_SECRET=your\_secret\_key  
GEMINI\_API\_KEY=YOUR\_KEY   \# only if you plan to use AI

### 

### Run

\# Terminal 1 – backend  
cd backend  
npm run dev     \# http://localhost:5000

\# Terminal 2 – frontend  
cd ../frontend  
npm run dev     \# http://localhost:5173

Open the frontend URL; you’ll be redirected to /login if no token exists.  
---

## 5\. Authentication

*Login* → /api/users/login → returns JWT → stored in localStorage (nexis\_token).  
**Axios interceptor** automatically adds Authorization: Bearer \<token\> to every request.  
AuthContext loads the user on app start (GET /api/users/me) and makes currentUser available to the whole tree.  
---

## 6\. Role‑Based Access Control (RBAC)

### useRole hook (src/hooks/useRole.js)

const { isAdmin, isDeveloper, isClient, isTeamMember } \= useRole();  
Provides boolean flags derived from currentUser.role.

### RoleGuard component (src/components/RoleGuard.jsx)

\<RoleGuard allow\={\['admin', 'developer'\]} fallback\={\<p\>No access.\</p\>}\>  
 {/\* children → rendered only if role matches \*/}  
 \<button\>Delete task\</button\>  
\</RoleGuard\>

* allow – array of roles permitted to see the children.  
* fallback – optional UI shown to disallowed users.

**Where it’s used**

| Component | Guarded UI |
| :---- | :---- |
| AiCopilot | Prompt form (admin + developer) |
| TasksTab | Add‑task form (admin + developer), Delete button (admin only) |
| ProjectBrief / ProjectAssets | Edit / upload controls (admin + developer) |
| DashboardPage → ProtectedRoute | Whole page requires an authenticated user. |

The pattern keeps role checks in one place; UI components stay focused on rendering.  
---

## 7\. Real‑time Updates (Socket.io)

1. After login, the client emits join\_workspace with its organizationId.  
2. Server adds the socket to a room named after that ID.  
3. Any task mutation (POST /tasks,  PUT /tasks/:id,  DELETE /tasks/:id) emits an event (task\_added, task\_updated, task\_deleted) to that room.  
4. Clients listening (ActivityFeed.jsx) prepend a notification and re‑fetch the task list.

Result: every user sees task changes instantly without refreshing.  
---

## 8\. AI Copilot 

1. Write a goal in the **AiCopilot** panel.  
2. Frontend POSTs /api/ai/generate with the prompt.  
3. Backend forwards the prompt to **Google Gemini**, receives a list of subtasks, inserts them into the tasks collection, and emits task\_added events.

If you don’t have a Gemini key, simply hide the component or leave the API key empty; the rest of the app works unchanged.

