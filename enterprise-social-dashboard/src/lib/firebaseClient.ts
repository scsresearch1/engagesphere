import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { isFirebaseWebResolved, resolveFirebaseWebOptions } from "../config/firebaseWeb";

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function isFirebaseRtdbConfigured(): boolean {
  return isFirebaseWebResolved();
}

export function getFirebaseDatabase(): Database | null {
  if (!isFirebaseWebResolved()) return null;
  if (db) return db;
  const options = resolveFirebaseWebOptions();
  if (!options) return null;
  app = initializeApp(options);
  db = getDatabase(app);
  return db;
}

/** For UI: project + DB URL from resolved config (embedded or env fallback). */
export function getFirebaseWebDisplayInfo(): {
  projectId: string;
  databaseURL: string;
  configured: boolean;
} {
  const o = resolveFirebaseWebOptions();
  if (!o) {
    return {
      projectId: "—",
      databaseURL: "—",
      configured: false,
    };
  }
  return {
    projectId: o.projectId ?? "—",
    databaseURL: o.databaseURL ?? "—",
    configured: true,
  };
}
