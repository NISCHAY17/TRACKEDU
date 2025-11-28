# 🚀 Deployment & Customization Guide for TrackEdu

This guide covers how to set up your own instance of TrackEdu, customize it to fit your brand, and deploy it to the web using Firebase Hosting.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js** (v16 or higher)
*   **npm** (comes with Node.js)
*   **Firebase CLI** (Install globally: `npm install -g firebase-tools`)
*   **Git**

---

## 🔥 1. Firebase Setup

TrackEdu relies on Firebase for its backend services. You need to create your own project to host the data.

### Step 1: Create a Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the prompts.

### Step 2: Enable Authentication
1.  In your project dashboard, go to **Build > Authentication**.
2.  Click **Get Started**.
3.  Select **Email/Password** as a sign-in provider and **Enable** it.

### Step 3: Enable Cloud Firestore
1.  Go to **Build > Firestore Database**.
2.  Click **Create Database**.
3.  Choose a location closest to your users.
4.  Start in **Test mode** (or Production mode, but ensure you set up rules later).
5.  **Crucial Configuration:**
    *   Go to the **Data** tab.
    *   Start a new collection named `config`.
    *   Add a document with the ID `studentIdScheme`.
    *   Add fields:
        *   `prefix`: (string) e.g., "STU-"
        *   `nextId`: (number) e.g., 101
        *   `useScheme`: (boolean) true

### Step 4: Enable Realtime Database
1.  Go to **Build > Realtime Database**.
2.  Click **Create Database** and follow the prompts.
3.  This is used to store student login credentials securely.

### Step 5: Connect Your App
1.  In Project Settings, scroll to **Your apps**.
2.  Click the web icon (`</>`) to register a new web app.
3.  Copy the `firebaseConfig` object provided.
4.  Open `src/firebase.ts` in your local code.
5.  Replace the placeholder config with your actual credentials.

---

## 🎨 2. Customization

Make TrackEdu your own by updating the branding and styles.

### Changing the Logo
1.  Replace the image files in `src/assets/` or `public/`.
2.  Update the references in components:
    *   **Login Page:** `src/components/Login.tsx`
    *   **Sidebar/Header:** `src/App.tsx` or `src/components/Dashboard.tsx` (depending on current layout).

### Changing Colors & Theme
TrackEdu uses **Mantine UI** for styling.
1.  Open `src/main.tsx`.
2.  You can customize the `MantineProvider` theme object to change primary colors, fonts, and more.
    ```typescript
    <MantineProvider theme={{ fontFamily: 'Open Sans, sans-serif', primaryColor: 'cyan' }}>
    ```

### Updating Text
*   **Headings & Labels:** Search for text strings in `src/components/` (e.g., "TrackEdu Admin") to change the app name.

---

## 🚀 3. Deployment

We use Firebase Hosting for a fast and secure deployment.

### Step 1: Login to Firebase
In your terminal, run:
```bash
firebase login
```

### Step 2: Initialize Hosting (If not already done)
The project is pre-configured with a `firebase.json`. If you need to re-initialize:
```bash
firebase init hosting
```
*   Select "Use an existing project" -> Choose your project.
*   **Public directory:** `dist` (Important: Vite builds to `dist`, not `build`).
*   **Configure as a single-page app:** Yes.
*   **Set up automatic builds and deploys with GitHub:** Optional.

### Step 3: Build the Application
Create the production-ready build files:
```bash
npm run build
```
This creates a `dist` folder with your compiled code.

### Step 4: Deploy
Push your build to the live web:
```bash
firebase deploy
```

You will receive a **Hosting URL** (e.g., `https://your-project-id.web.app`). Your app is now live!

---

## 🔄 Updating Your App

Whenever you make code changes:
1.  Save your files.
2.  Run `npm run build`.
3.  Run `firebase deploy`.
