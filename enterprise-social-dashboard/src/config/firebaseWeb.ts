import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase Web SDK config shipped with the app (safe to commit for client apps).
 * Replace empty strings with values from Firebase Console → Project settings → Your apps → Web app.
 *
 * Netlify (or any host) does not need env vars if these fields are filled here.
 * Optional: `.env.local` can still override any field for local experiments (see `pick()` order).
 */
export const FIREBASE_WEB_EMBEDDED: FirebaseOptions = {
  apiKey: "",
  authDomain: "engagesphere-a06c3.firebaseapp.com",
  projectId: "engagesphere-a06c3",
  storageBucket: "engagesphere-a06c3.appspot.com",
  messagingSenderId: "",
  appId: "",
  databaseURL: "https://engagesphere-a06c3-default-rtdb.firebaseio.com",
};

/** Prefer embedded (repo) values; use Vite env only when embedded field is blank. */
function pick(embeddedVal: string | undefined, envVal: string | undefined): string {
  if (embeddedVal != null && String(embeddedVal).trim() !== "") return String(embeddedVal).trim();
  if (envVal != null && String(envVal).trim() !== "") return String(envVal).trim();
  return "";
}

export function resolveFirebaseWebOptions(): FirebaseOptions | null {
  const e = FIREBASE_WEB_EMBEDDED;
  const env = import.meta.env;

  const apiKey = pick(e.apiKey, env.VITE_FIREBASE_API_KEY);
  const projectId = pick(e.projectId, env.VITE_FIREBASE_PROJECT_ID);
  const appId = pick(e.appId, env.VITE_FIREBASE_APP_ID);
  const databaseURL = pick(e.databaseURL, env.VITE_FIREBASE_DATABASE_URL);
  const authDomain = pick(e.authDomain, env.VITE_FIREBASE_AUTH_DOMAIN);
  const storageBucket = pick(e.storageBucket, env.VITE_FIREBASE_STORAGE_BUCKET);
  const messagingEmbedded = e.messagingSenderId ? String(e.messagingSenderId).trim() : "";
  const messagingSenderId =
    pick(messagingEmbedded || undefined, env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "000000000000";

  if (!apiKey || !projectId || !appId || !databaseURL) return null;

  return {
    apiKey,
    authDomain: authDomain || undefined,
    projectId,
    storageBucket: storageBucket || undefined,
    messagingSenderId,
    appId,
    databaseURL,
  };
}

export function isFirebaseWebResolved(): boolean {
  return resolveFirebaseWebOptions() !== null;
}
