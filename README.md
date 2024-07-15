# Firechat

Firechat is a Firebase-React Chat Application

This project is a chat application built using React for the frontend and Firebase Firestore for authentication and database management. The app includes functionalities such as real-time chat, read receipts, image sending, and user blocking.

## Live Demo
Loom Video : [click here](https://www.loom.com/share/d17f83e4af704640bc84421c5834a7bb?sid=feb7d899-246d-47cf-87d2-86997a000825)

## Live Link

### Firebase : [click here](https://fir-chat-reactv1.web.app)
### Vercel : [click here](https://firechatbyvenki.vercel.app)

## Functionalities

- **Real-time Chat**: Users can send and receive messages in real-time.
- **Read Receipts**: Users can see when their messages have been read.
- **Send Images**: Users can send image files in the chat.
- **Block User**: Users can block other users from sending them messages.

## Setup

### Prerequisites

- Node.js and npm should be installed on your system.

### Steps to Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Venki1402/Firechat
   cd Firechat
   ```

2. **Install dependencies:**
   ```bash
   npm i
   ```

3. **Firebase Console Setup:**

   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or select an existing project.
   - In the project overview page, add a web app.
   - Register your app and copy the Firebase SDK config.
   - Go to the Firestore Database section and create a new database.
   - Set up Firebase Authentication and enable the Email/Password authentication method.

4. **Environment Variables:**

   Create a `.env` file in the root directory of the project and add your Firebase API Key:
   ```env
   VITE_FIREBASE_API_KEY=Your_Firebase_API_Key
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

## Reference

To build this I have referred to a [YouTube tutorial](https://www.youtube.com/watch?v=domt_Sx-wTY&t=50s) by [lama dev](https://www.youtube.com/@LamaDev).
