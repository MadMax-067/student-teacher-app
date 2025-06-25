# 📚 Student-Teacher Appointment App

A web platform that allows **students** to book appointments with **teachers**, and for **teachers** to manage those requests easily. Built using **Next.js + Firebase**.

---

## 🎯 Purpose

This app bridges the communication gap between students and teachers by providing:
- A simple way for students to request appointments
- A dashboard for teachers to approve, cancel, or manage appointments
- Message exchange between students and teachers
- Admin control for managing teacher onboarding and student approvals

---

## 👥 User Roles

### 👩‍🎓 Student
- Register and wait for approval
- Browse available teachers
- Book appointments with teachers
- View status of appointment requests
- Send messages to teachers

### 👨‍🏫 Teacher
- Registered by the admin (or after admin approval)
- Log in and view appointment requests
- Approve or cancel appointment requests
- Receive and reply to student messages

### 🛡️ Admin
- Approves student registrations
- Manages teacher accounts (via internal panel or Firebase)
- Reviews teacher applications
- Has full database visibility

---

## 🔐 Auth & Access Control

- Firebase Authentication for user login/signup
- Firestore-based role access (`student`, `teacher`, `admin`)
- Protected routes for dashboards based on roles
- Students must be approved before accessing features

---

## 🚀 Tech Stack

| Layer        | Tech        |
|--------------|-------------|
| Frontend     | Next.js 14 (App Router) |
| Auth         | Firebase Auth |
| Database     | Firebase Firestore |
| Hosting      | Vercel or Firebase Hosting |
| Styling      | Tailwind CSS |
| Icons        | Lucide Icons |
| Logs         | Firestore `logs` collection |

---

## 🛠️ Features Implemented

- ✅ Student registration with approval workflow
- ✅ Admin-created teacher profiles
- ✅ Booking appointments with teachers
- ✅ Teacher dashboard with appointment management
- ✅ Messaging system between students & teachers
- ✅ Activity logging (`logs` collection)
- ✅ Protected role-based routing

---

## 📦 Folder Structure (Highlights)
```
student-teacher-app
├─ README.md
├─ app
│  ├─ api
│  │  └─ getUserRole
│  │     └─ route.js
│  ├─ dashboard
│  │  ├─ admin
│  │  │  └─ page.js
│  │  ├─ student
│  │  │  └─ page.js
│  │  └─ teacher
│  │     └─ page.js
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.js
│  ├─ login
│  │  └─ page.js
│  ├─ page.js
│  ├─ pending
│  │  └─ page.js
│  ├─ profile
│  │  └─ page.js
│  ├─ register
│  │  └─ page.js
│  ├─ setup
│  │  └─ page.js
│  └─ unauthorized
│     └─ page.js
├─ components
│  ├─ AuthForm.js
│  ├─ ChangePasswordForm.js
│  ├─ LoadingSpinner.js
│  ├─ Navbar.js
│  └─ ProtectedRoute.js
├─ jsconfig.json
├─ lib
│  ├─ auth.js
│  ├─ firebase.js
│  └─ logging.js
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
└─ public
   ├─ file.svg
   ├─ globe.svg
   ├─ next.svg
   ├─ vercel.svg
   └─ window.svg

```

## ✍️ Future Improvements

- 📩 Email notifications on booking/approval
- 🔔 Realtime appointment updates
- 📆 Google Calendar integration
- 📊 Admin analytics dashboard

---


## 💡 Author

Made with ❤️ by Manraj

