import express from "express";
import admin from "firebase-admin";

const router = express.Router();

router.post("/auth/signup", async (req, res) => {
  try {
    const { email, fullName, idToken } = req.body;

    // Verify the token first
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Store additional admin info in Firestore
    await admin.firestore().collection("admins").doc(uid).set({
      email,
      fullName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      uid: uid,
    });
  } catch (error) {
    res.status(400).json({ error: "Signup failed", details: error.message });
  }
});

export default router;
