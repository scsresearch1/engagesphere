/**
 * Seeds Realtime Database at `engageApp` from bundled demo data.
 *
 * Usage (PowerShell):
 *   $env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\serviceAccount.json"
 *   $env:FIREBASE_DATABASE_URL="https://engagesphere-a06c3-default-rtdb.firebaseio.com"
 *   npm run seed:rtdb
 *
 * Never commit the service account JSON.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import admin from "firebase-admin";
import { initialData } from "../../src/data/seed";
import { RTDB_APP_ROOT, appDataToTree } from "../../src/services/rtdbAppTree";

const databaseURL =
  process.env.FIREBASE_DATABASE_URL ?? "https://engagesphere-a06c3-default-rtdb.firebaseio.com";
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!keyPath) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_PATH (absolute path to service account JSON).");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(resolve(keyPath), "utf8")) as admin.ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
}

const tree = appDataToTree(initialData);
await admin.database().ref(RTDB_APP_ROOT).set(tree);
console.log(`Wrote /${RTDB_APP_ROOT} on ${databaseURL}`);
