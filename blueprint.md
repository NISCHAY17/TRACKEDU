# TrackEdu Application Blueprint

## 1. Overview

TrackEdu is a modern, easy-to-use Student Management application designed for tutors and small educational institutions. It provides a simple interface to manage student information, track progress, and streamline administrative tasks. The application is built using React, Firebase, and the Mantine UI component library.

## 2. Implemented Features (as of July 11, 2025)

### Core Functionality
- **Firebase Authentication:** Secure user login for tutors/admins.
- **Firestore Database:** Real-time data storage for all student and class information, scoped to the logged-in user.
- **Student Management (CRUD):**
  - **Create:** Add new students to the system via a modal form.
  - **Read:** View a list of all students in a real-time updating table.
  - **Update:** Edit existing student information (Name, Student ID, Class, Phone, Email, Date of Birth) through a modal.
  - **Delete:** Remove students from the system.
- **Class Management:**
  - Dynamic fetching of available classes from Firestore.
  - Ability to assign a student to a class during creation/editing.

### User Interface & Design
- **Component Library:** Built with Mantine for a consistent and modern UI.
- **Styling:**
  - Core styles provided by `@mantine/core`.
  - Date picker styles from `@mantine/dates`.
- **Notifications:** Real-time feedback for actions (add, update, delete) using `@mantine/notifications`.
- **Forms:** Robust form handling and validation with `@mantine/form`.

### Technical Implementation
- **Framework:** React with Vite.
- **Routing:** `react-router-dom` for navigation (currently minimal).
- **State Management:** React hooks (`useState`, `useEffect`) for component-level state.
- **Error Handling:** Type safety via TypeScript and fixes for UI rendering issues (e.g., date picker styling and portal).

## 3. Current Plan: Implement In-Depth Student View

### Objective
To create a dedicated page for each student, providing a comprehensive view of their details and laying the foundation for future features like fee and attendance tracking.

### Action Steps
1.  **Set up Dynamic Routing:**
    - Create a new route in `App.tsx` with the path `/students/:id`.
    - This route will render the new `StudentDetailView` component.
2.  **Create `StudentDetailView` Page:**
    - Create a new file: `src/pages/StudentDetailView.tsx`.
    - This component will use `useParams` from `react-router-dom` to get the student's ID from the URL.
    - It will fetch the specific student's data from Firestore.
    - It will display the student's information in a rich, detailed layout using Mantine components.
3.  **Update `StudentManagement.tsx`:**
    - Change the existing "Edit" button to a "View Details" button.
    - This button will navigate the user to the corresponding student's detail page.
    - The "Add Student" functionality will remain, opening a modal as it does now.
