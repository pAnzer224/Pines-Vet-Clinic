import admin from "firebase-admin";
import serviceAccountKey from "./serviceAccountKey.json";

const serviceAccount = {
  type: "service_account",
  project_id: serviceAccountKey.project_id,
  private_key_id: serviceAccountKey.private_key_id,
  private_key: serviceAccountKey.private_key.replace(/\\n/g, "\n"),
  client_email: serviceAccountKey.client_email,
  client_id: serviceAccountKey.client_id,
  auth_uri: serviceAccountKey.auth_uri,
  token_uri: serviceAccountKey.token_uri,
  auth_provider_x509_cert_url: serviceAccountKey.auth_provider_x509_cert_url,
  client_x509_cert_url: serviceAccountKey.client_x509_cert_url,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
export const db = admin.firestore();
