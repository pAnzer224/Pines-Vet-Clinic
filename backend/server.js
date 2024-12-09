import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

const rawdata = fs.readFileSync("serviceAccountKey.json");
const serviceAccountKey = JSON.parse(rawdata);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
}

const auth = admin.auth();
const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.post("/api/admin/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    const adminDoc = await db.collection("admins").doc(userRecord.uid).get();
    if (adminDoc.exists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    await db.collection("admins").doc(userRecord.uid).set({
      email: userRecord.email,
      fullName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("Admin Signup Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// server.js (login route)
app.post("/api/admin/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await auth.signInWithEmailAndPassword(email, password); // Server-side login
    const user = auth.currentUser; // Get the currently logged-in admin

    // No need for custom tokens for direct login. Use session cookies:
    res.cookie("adminSession", user.uid, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 8000,
    });
    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(401).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
