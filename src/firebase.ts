import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence internal Firestore SDK retry and backoff logs to keep console clean
try {
  setLogLevel('silent');
} catch (_) {}

const app = initializeApp(firebaseConfig);

// Clean up any stale offline mutation queue in browser IndexedDB that keeps retrying rejected writes
if (typeof window !== "undefined" && window.indexedDB && window.indexedDB.databases) {
  try {
    window.indexedDB.databases().then((dbs) => {
      dbs.forEach((dbInfo) => {
        if (dbInfo.name && dbInfo.name.includes("firestore")) {
          try {
            window.indexedDB.deleteDatabase(dbInfo.name);
          } catch (_) {}
        }
      });
    }).catch(() => {});
  } catch (_) {}
}

// Initialize Firestore with memory cache so stale offline mutations are not retried against exhausted quota
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? initializeFirestore(app, { localCache: memoryLocalCache() }, (firebaseConfig as any).firestoreDatabaseId)
  : initializeFirestore(app, { localCache: memoryLocalCache() });

export const auth = getAuth();
