# 🏙️ CivicTrack — Local Issue Reporting & Priority System

A full-stack web application that allows citizens to report local civic issues (potholes, water leaks, power outages, etc.), track their status, and enables admins to manage and resolve them.

---

## 📁 Project Structure

```
civictrack/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── .env                   # Environment variables (secrets)
│   ├── package.json
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema (name, email, password, role)
│   │   └── Issue.js           # Issue schema (title, category, status, etc.)
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   └── issueController.js # Full CRUD + upvote + stats
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   └── issueRoutes.js     # /api/issues/*
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + adminOnly
│   │   └── upload.js          # Multer image upload config
│   └── uploads/               # Saved issue images
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.js             # Router + Layout
        ├── App.css            # Global styles
        ├── index.js           # React entry point
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── utils/
        │   └── api.js         # Axios instance with JWT interceptor
        ├── components/
        │   ├── Navbar.js      # Navigation bar
        │   ├── IssueCard.js   # Issue display card
        │   ├── StatsCard.js   # Dashboard stat widget
        │   └── ProtectedRoute.js # Auth guard for routes
        └── pages/
            ├── LoginPage.js       # Sign in form
            ├── RegisterPage.js    # Sign up form
            ├── DashboardPage.js   # All issues + filters + stats
            ├── ReportIssuePage.js # Create new issue
            └── MyIssuesPage.js    # Current user's issues
```

---

## ⚙️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React.js 18 (hooks + context)     |
| Styling      | Custom CSS (DM Sans + Fraunces)   |
| HTTP Client  | Axios                             |
| Backend      | Node.js + Express.js              |
| Database     | MongoDB + Mongoose                |
| Auth         | JWT (jsonwebtoken + bcryptjs)     |
| File Upload  | Multer                            |
| Routing      | React Router v6                   |
| Deployment   | Netlify (Frontend), Render (Backend) |

---


## 🌐 Deployment

- **Frontend**: Deployed on Netlify  
- **Backend**: Deployed on Render  

### 🔗 Live Website  
👉 https://glittering-stroopwafel-f6d52c.netlify.app


---

## 🚀 Setup & Run Instructions

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster
- npm (comes with Node.js)

---

### Step 1 — Clone / Navigate to project

```bash
cd civictrack
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

#### Configure environment variables

Open `backend/.env` and update:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civictrack   # local MongoDB
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/civictrack
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
```

#### Start backend server

```bash
# Development mode (auto-restart on file change)
npm run dev

# OR production mode
npm start
```

Server will run at: **http://localhost:5000**

You'll see:
```
✅ MongoDB Connected: localhost
🚀 CivicTrack server running at http://localhost:5000
```

---

### Step 3 — Frontend Setup

Open a **new terminal window**:

```bash
cd civictrack/frontend
npm install
npm start
```

Frontend will run at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` forwards API calls automatically.

---

### Step 4 — Create an Admin Account

When registering at http://localhost:3000/register, select **"Admin (Demo)"** from the role dropdown to create an admin account.

Admins can:
- Change issue status (Pending → In Progress → Resolved)
- Delete any issue

Regular users can:
- Report issues
- Delete their own issues
- Upvote issues

---

## 🔗 API Endpoints Reference

### Authentication (`/api/auth`)

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | `/api/auth/register` | No  | Register new user        |
| POST   | `/api/auth/login`    | No  | Login + receive JWT      |
| GET    | `/api/auth/me`       | Yes | Get current user profile |

### Issues (`/api/issues`)

| Method | Endpoint                   | Auth  | Description                    |
|--------|----------------------------|-------|--------------------------------|
| GET    | `/api/issues`              | Yes   | Get all issues (with filters)  |
| POST   | `/api/issues`              | Yes   | Create issue (+ image upload)  |
| GET    | `/api/issues/stats`        | Yes   | Dashboard statistics           |
| GET    | `/api/issues/my`           | Yes   | Current user's issues          |
| GET    | `/api/issues/:id`          | Yes   | Single issue details           |
| PUT    | `/api/issues/:id`          | Yes   | Update issue (owner/admin)     |
| DELETE | `/api/issues/:id`          | Yes   | Delete issue (owner/admin)     |
| PUT    | `/api/issues/:id/status`   | Admin | Update issue status            |
| POST   | `/api/issues/:id/upvote`   | Yes   | Toggle upvote                  |

#### Query parameters for GET /api/issues:
- `?category=Road` — filter by category
- `?priority=High` — filter by priority
- `?status=Pending` — filter by status
- `?search=pothole` — text search in title/description/location

---

## 🎯 Features Summary

### 🔐 Authentication
- Secure register/login with bcrypt password hashing
- JWT token stored in localStorage
- Auto-redirect to login on token expiry
- Protected routes prevent unauthorized access

### 📝 Issue Reporting
- Title, Description, Location fields
- 7 categories: Road, Water, Electricity, Sanitation, Parks, Safety, Other
- 3 priority levels: Low, Medium, High
- Optional image upload (JPEG/PNG/GIF/WebP, max 5MB)

### 📊 Dashboard
- Live statistics: Total / Pending / In Progress / Resolved
- Filter by category, priority, status
- Full-text search
- Newest issues first

### 🛠️ Admin Features
- Dropdown to update issue status directly on the card
- Delete any issue
- Admin badge shown in navbar

### 👍 Community Features
- Upvote issues to signal importance
- See all community-reported issues

---

## 🧪 Testing the App

1. **Register** as admin at `/register`
2. **Report** 2–3 issues at `/report-issue`
3. **View dashboard** at `/dashboard`
4. **Filter** issues by category/priority/status
5. **Update status** using the dropdown (admin only)
6. **Register a second user** (regular) and test upvoting
7. **Check "My Issues"** page for personal issue history

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Admin routes are protected with `adminOnly` middleware
- File uploads restricted to image types, max 5MB
- CORS configured for localhost:3000 only
- In production: use HTTPS, rotate JWT_SECRET, use MongoDB Atlas

---

## 📦 Environment Variables Cheatsheet

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civictrack
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
```

---

Built with ❤️ for better communities.
