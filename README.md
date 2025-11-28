<img src="public/flag-orpheus-top.png" width="300" alt="Flag" />

# TrackEdu 🧠

<img src="public/LOGOPROB.png" width="500" alt="Logo" />

**An open-source student management & tracking platform.**

TrackEdu is a modern, single-tenant web application designed to help tutors and educational institutions manage their students, classes, and teachers with ease. It provides a centralized dashboard for administration and is built to be simple, fast, and reliable.

---

## 🎮 Try the Demo

Want to see it in action? Check out the live demo!

🔗 **Website:** [https://trackedu-f8110.web.app/login](https://trackedu-f8110.web.app/login)

**Demo Credentials:**
*   **Email / ID:** `demo@trackedu.demo`
*   **Password:** `demo@trackedu.demo`

---

## 🚀 Key Features

### 🔐 Authentication & Security
*   **Admin Login:** Secure authentication using Firebase Auth.
*   **Student Accounts:** Admins can create and manage student login credentials (username/password) stored securely.
*   **Role-Based Access:** Clear separation between admin capabilities and future student access.

### 🎓 Student Management
*   **Comprehensive Profiles:** Store detailed student info including contact details, DOB, and class enrollment.
*   **Dynamic ID Generation:** Configurable, auto-incrementing student ID scheme (e.g., STU-101) or manual entry.
*   **Search & Filter:** Easily find students within the system.
*   **Account Management:** Direct link to create/update student portal credentials.

### 🏫 Class & Teacher Management
*   **Class Organization:** Create and manage classes/batches.
*   **Teacher Assignments:** Assign teachers to specific classes.
*   **Interactive Stream:** A "Google Classroom"-style stream for posting announcements to a class.
*   **Enrollment Tracking:** View all students enrolled in a specific class at a glance.

### 📊 Dashboard
*   **At-a-Glance Metrics:** Real-time counters for Total Students, Total Classes, and Total Teachers.
*   **Quick Navigation:** Easy access to all management modules via a responsive sidebar.

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **UI Framework:** Mantine v7 (Hooks, Form, Dates, Notifications, Modals)
*   **Backend & Database:**
    *   **Firebase Authentication:** Identity management.
    *   **Cloud Firestore:** Primary NoSQL database for structured data (Students, Classes, Teachers).
    *   **Firebase Realtime Database:** Low-latency storage for specific user credentials.
*   **Icons:** Tabler Icons

---

## 🗺️ Roadmap & Future Features

We are actively working on the following features:

- [ ] **Student Portal:** A dedicated interface for students to log in, view their profile, and check announcements.
- [ ] **Attendance Tracking:** A module to mark and view daily attendance for students.
- [ ] **Fee Management:** Track fee payments, generate receipts, and view outstanding balances.
- [ ] **Advanced Reporting:** Graphical insights into attendance trends and fee collection.
- [ ] **Payment Integration:** Online fee payments via Razorpay.

---

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NISCHAY17/TRACKEDU.git
    cd TRACKEDU
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Authentication** (Email/Password).
    *   Enable **Firestore Database** and **Realtime Database**.
    *   Copy your web app configuration.
    *   Update `src/firebase.ts` with your credentials.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🪪 License

MIT License © 2025 Nischay / NIDAL
