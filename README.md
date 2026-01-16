# JaagrMind - Student Mental Wellness Platform

A multi-tenant SaaS platform for gamified student mental wellness assessments.

## 🧠 Overview

JaagrMind is a comprehensive MERN stack application featuring three distinct user portals:
- **Company Admin**: Global assessment management, school registration, and analytics
- **School Admin**: Student/class management, test assignments, and conditional analytics
- **Student Portal**: Gamified assessment experience with access ID login

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
npm run seed    # Seeds default admin and 32-question assessment
npm run dev     # Starts server on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts app on http://localhost:5173
```

## 🔐 Default Login Credentials

### School Admin
- Login with School ID and password (auto-generated when admin registers a school)

### Student
- Login with unique Access ID (generated when school adds students)

## 🎨 Features

### Admin Dashboard
- ✅ Register schools with auto-generated credentials
- ✅ Upload school logos
- ✅ Control data visibility per school
- ✅ View interactive analytics (pie charts, bar charts)
- ✅ Export data to Excel

### School Dashboard
- ✅ Add students manually or via Excel import
- ✅ Unique Access ID generation
- ✅ Class/section management
- ✅ Test assignment and tracking
- ✅ Reset student tests
- ✅ Copy shareable assessment links
- ✅ Export Access IDs

### Student Portal
- ✅ Gamified UI with animations
- ✅ 30-second timer per question
- ✅ Level-up celebrations (every 8 questions)
- ✅ 4 sections × 8 questions = 32 total
- ✅ No scores shown to students
- ✅ Thank you screen with confetti

## 📊 32-Question Assessment

Divided into 4 sections:
1. **Focus & Attention** (8 questions)
2. **Self-Esteem & Inner Confidence** (8 questions)
3. **Social Confidence & Interaction** (8 questions)
4. **Digital Hygiene & Self-Control** (8 questions)

### Scoring Buckets (per section)
- **8-14**: Skill Stable ✅
- **15-22**: Skill Emerging ⚠️
- **23-32**: Skill Support Needed ❗

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS with CSS Variables |

## 📁 Project Structure

```
JaagrMind/
├── backend/
│   ├── config/         # Database config
│   ├── middleware/     # Auth & RBAC
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── seeds/          # Default data
│   ├── utils/          # Helpers
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── context/    # Auth & Theme
│   │   ├── pages/      # Admin/School/Student
│   │   ├── services/   # API client
│   │   └── styles/     # Global CSS
│   └── index.html
│
└── README.md
```

## 🎨 Design System

- **Primary**: White (#FFFFFF) + Light Purple (#B993E9)
- **Gradient**: `linear-gradient(135deg, #B993E9, #D4BFFF)`
- **Font**: Inter (Google Fonts)
- **Dark Mode**: Supported via CSS variables

## 📝 API Endpoints

### Admin Routes (`/api/admin`)
- `POST /login` - Admin authentication
- `GET /dashboard` - Overview stats
- `GET/POST /schools` - School management
- `GET/POST /assessments` - Assessment CRUD
- `GET /analytics` - Filtered analytics
- `GET /export` - Excel export

### School Routes (`/api/school`)
- `POST /login` - School authentication
- `GET /dashboard` - School overview
- `GET/POST /students` - Student management
- `POST /students/import` - Excel import
- `PUT /students/:id/reset` - Reset test
- `GET /export-ids` - Export Access IDs

### Student Routes (`/api/student`)
- `POST /login` - Access ID login
- `GET /tests` - Available tests
- `GET /assessment/:id` - Get questions
- `POST /submit` - Submit answers

## 📄 License

MIT License - JaagrMind 2026
