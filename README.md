# 🏠 Roommate Finder App

A full-stack roommate matching platform built with **Spring Boot** (Java) for the backend and **Vue.js** for the frontend. The system allows students to register,
log in, complete lifestyle quizzes, and find compatible roommates based on behavior and preferences.

---

## 📌 Features

### ✅ General
- Responsive Vue.js frontend and Spring Boot backend
- RESTful API architecture with secure endpoints
- Clean modular structure for scalability

### 👤 User Functionality
- Student signup & login
- JWT-based authentication for frontend
- Lifestyle quiz for roommate compatibility
- Match recommendation system
- Profile creation and editing
- Image upload with AWS S3

### 🔐 Admin Functionality
- Admin login (Thymeleaf UI)
- Role-based access control (Spring Security)
- User management: view, edit, delete students
- Match overview and approvals (optional)

---

## 🛠️ Tech Stack

| Layer       | Technology                         |
|------------|-------------------------------------|
| Frontend   | Vue.js, Vue Router, Axios, Bootstrap/Tailwind |
| Backend    | Spring Boot, Spring Security, JWT   |
| Database   | PostgreSQL                          |
| File Upload| AWS S3 Bucket                       |
| Build Tool | Maven                               |
| Auth       | Spring Security (JWT & Session-based) |
| UI (Admin) | Thymeleaf                           |

---

## 🗂️ Project Structure

### Backend (`/backend`)
- `controller/` — REST APIs
- `service/` — business logic
- `repository/` — JPA repositories
- `model/` — JPA entities
- `config/` — security & CORS config

### Frontend (`/frontend`)
- `src/views/` — Login, Quiz, Match List, Profile
- `src/components/` — UI components
- `src/router/` — Vue Router setup
- `src/services/` — API communication with backend
