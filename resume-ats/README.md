# 🚀 Resumify — MERN Resume Builder & ATS Checker

A full-stack MERN application to build professional resumes and check their ATS (Applicant Tracking System) compatibility against any job description.

---

## 📁 Project Structure

```
resume-ats/
├── client/          # React frontend
│   └── src/
│       ├── components/     # Navbar
│       ├── context/        # Auth context
│       ├── pages/          # Landing, Auth, Dashboard, Builder, ATS
│       └── utils/          # Axios API instance
└── server/          # Express + MongoDB backend
    ├── models/             # User, Resume schemas
    ├── routes/             # Auth, Resume, ATS routes
    ├── middleware/         # JWT auth middleware
    └── utils/              # ATS score calculator
```

---

## ⚙️ Setup & Installation

### 1. Clone / Extract this project

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

### 4. Make sure MongoDB is running locally (or use MongoDB Atlas)

---

## 🌐 Environment Variables (server/.env)

```
MONGO_URI=mongodb://localhost:27017/resume-ats
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT-based Register/Login |
| 📝 Resume Builder | 6-section guided builder (Personal, Experience, Education, Skills, Projects, Certs) |
| 🎯 ATS Checker | Keyword matching against job descriptions with a score out of 100 |
| 📊 Score Breakdown | 5-category scoring: Keywords, Sections, Contact, Experience Quality, Skills |
| 💡 Suggestions | Actionable tips to improve your ATS score |
| 🗂️ Dashboard | Manage all your resumes with ATS scores displayed |

---

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6, Axios, react-hot-toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Styling**: Custom CSS with CSS Modules + Google Fonts (Sora)

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (protected)

### Resume
- `GET /api/resume` — Get all user resumes (protected)
- `POST /api/resume` — Create resume (protected)
- `PUT /api/resume/:id` — Update resume (protected)
- `DELETE /api/resume/:id` — Delete resume (protected)

### ATS
- `POST /api/ats/check` — Check resume vs job description (protected)
- `POST /api/ats/quick` — Quick check without auth

---

## 🎨 Design System

- **Dark theme** with `#0a0b0f` background
- **Accent color**: `#6c63ff` (purple)
- **Font**: Sora (Google Fonts)
- **CSS Variables** for full design consistency
