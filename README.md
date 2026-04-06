# 🏛 CivicTrack — Local Issue Reporting & Priority System

A full-stack web application that lets citizens report local issues (potholes, streetlights, floods, etc.) and automatically assigns priority using keyword-based detection. Admins can manage and resolve issues from a dashboard.

---

## 📁 Project Structure

```
smart-issue-reporting-system/
│
├── frontend/
│   ├── static/
│   │   ├── css/style.css          # All styles (dark civic theme)
│   │   └── js/script.js           # Frontend JS (filtering, upload, AJAX)
│   └── templates/
│       ├── layout.html            # Base template (navbar, flash messages)
│       ├── index.html             # Home — issue card grid
│       ├── login.html             # Login form
│       ├── register.html          # Registration form
│       ├── report_issue.html      # Issue submission form
│       └── dashboard.html         # Admin dashboard with table + stats
│
├── backend/
│   ├── app.py                     # Flask app factory + home route
│   ├── config.py                  # Configuration (secret key, paths)
│   ├── models.py                  # SQLite schema + DB helpers
│   ├── routes/
│   │   ├── auth_routes.py         # /auth/register, /auth/login, /auth/logout
│   │   ├── issue_routes.py        # /report
│   │   └── admin_routes.py        # /admin/dashboard, /admin/update-status/<id>
│   ├── services/
│   │   └── priority_service.py    # Keyword-based priority detection
│   ├── database/
│   │   └── db.sqlite3             # Auto-created on first run
│   └── uploads/                   # User-uploaded images (auto-created)
│
├── devops/
│   ├── Dockerfile                 # Docker image definition
│   ├── docker-compose.yml         # Docker Compose for easy local run
│   └── github-actions.yml         # CI/CD pipeline (copy to .github/workflows/)
│
├── run.py                         # Entry point: python run.py
├── requirements.txt               # Python dependencies
├── .env                           # Environment variables (don't commit!)
├── .gitignore
└── README.md
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **User Auth** | Register, login, logout with hashed passwords (Werkzeug) |
| **Issue Reporting** | Title, description, location, image upload |
| **Auto Priority** | Keyword-based: High / Medium / Low |
| **Admin Dashboard** | Table view, stats cards, inline status update |
| **Filter** | Filter issues by priority (client-side, instant) |
| **Live Priority Preview** | See detected priority as you type the issue |
| **Responsive UI** | Dark civic theme, works on mobile |
| **Docker Ready** | Dockerfile + docker-compose included |
| **CI/CD** | GitHub Actions workflow included |

---

## 🚀 Run Locally (VS Code)

### Prerequisites
- Python 3.10+ installed
- VS Code with Python extension

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/smart-issue-reporting-system.git
cd smart-issue-reporting-system

# 2. Create and activate a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python run.py
```

Open your browser at **http://127.0.0.1:5000**

### Default Admin Account
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ Change this password immediately in production!

---

## 🐳 Run with Docker

### Option A — Docker only

```bash
# Build the image (from project root)
docker build -f devops/Dockerfile -t civictrack .

# Run the container
docker run -p 5000:5000 civictrack
```

### Option B — Docker Compose (recommended)

```bash
# Build and start (from project root)
docker-compose -f devops/docker-compose.yml up --build

# Stop
docker-compose -f devops/docker-compose.yml down

# Stop and remove volumes (wipes DB + uploads)
docker-compose -f devops/docker-compose.yml down -v
```

App runs at **http://localhost:5000**

---

## ⚙️ CI/CD (GitHub Actions)

1. Copy the workflow file into your repo:
   ```bash
   mkdir -p .github/workflows
   cp devops/github-actions.yml .github/workflows/ci.yml
   ```
2. Push to GitHub.
3. The pipeline runs automatically on every push to `main` or `develop`:
   - Lints Python with **flake8**
   - Runs **pytest** (if tests/ folder exists)
   - Builds the **Docker image**

---

## 🔑 Priority Detection Logic

Implemented in `backend/services/priority_service.py` as a pure Python function — no ML library required.

| Priority | Trigger Keywords |
|---|---|
| 🔴 **High** | accident, fire, flood, emergency, collapse, explosion, injury… |
| 🟡 **Medium** | garbage, traffic, streetlight, pothole, leak, sewage, broken… |
| 🟢 **Low** | suggestion, feedback, improvement, request, idea… |
| 🟢 **Low** (default) | No matching keywords |

---

## 🛠 API Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Home — all issues |
| GET/POST | `/auth/register` | Public | Register account |
| GET/POST | `/auth/login` | Public | Login |
| GET | `/auth/logout` | User | Logout |
| GET/POST | `/report` | User | Submit issue |
| GET | `/admin/dashboard` | Admin | Admin dashboard |
| POST | `/admin/update-status/<id>` | Admin | Update issue status (JSON) |
| GET | `/uploads/<filename>` | Public | Serve uploaded images |

---

## 🧰 Tech Stack

- **Backend**: Python 3.11, Flask 3.0
- **Database**: SQLite (via Python's built-in `sqlite3`)
- **Auth**: Werkzeug password hashing
- **Frontend**: HTML5, CSS3 (custom), Vanilla JS
- **Fonts**: Syne + DM Sans (Google Fonts)
- **DevOps**: Docker, Docker Compose, GitHub Actions

---

## 📝 Extending the Project

- **Real ML**: Replace `priority_service.py` with a `scikit-learn` text classifier
- **Email Alerts**: Use Flask-Mail to notify admins on High priority issues
- **Map View**: Add Leaflet.js to show issues on a map by location
- **Pagination**: Add pagination to the issue list for large datasets
- **User Profiles**: Add a "My Issues" page showing a user's own submissions
- **REST API**: Expose a JSON API for mobile app integration
