# Firebase Setup for Highland PetVibes

## Prerequisites

- Node.js
- npm or yarn
- Firebase Account

## Installation Steps

1. Install Firebase CLI

bash
npm install -g firebase-tools

2. Login to Firebase

bash
firebase login

3. Initialize Firebase in your project

bash
firebase init

- Select Firestore, Authentication, and Hosting
- Choose an existing project or create a new one

4. Set up environment variables
   Create a `.env` file in your project root with the following:

REACT_APP_FIREBASE_API_KEY=AIzaSyBdMcEt1Dif0IKzu-XUoeD_Za12u7aNWmU
REACT_APP_FIREBASE_AUTH_DOMAIN=highland-petvibes-ph.firebaseapp.com
