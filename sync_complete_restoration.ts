import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, Timestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = initializeApp(firebaseConfig);
const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
const auth = getAuth(app);

async function runSync() {
  console.log("Authenticating as Admin...");
  await signInWithEmailAndPassword(auth, "admin@workflowpro.com", "adminadmin");
  console.log("Authenticated successfully!");

  const finRecords = JSON.parse(fs.readFileSync("restored_financial_records.json", "utf8"));
  console.log(`Writing ${finRecords.length} financial records with full metadata...`);

  // Write all records with exact fields
  let batchCount = 0;
  for (const rec of finRecords) {
    const docId = rec.customId || rec.id;
    await setDoc(doc(db, "financialRecords", docId), {
      ...rec,
      id: docId,
      projectId: rec.referenceId || "",
      updatedAt: Timestamp.now()
    }, { merge: true });

    batchCount++;
    if (batchCount % 100 === 0) {
      console.log(`Written ${batchCount}/${finRecords.length} financial records...`);
    }
  }

  console.log(`Successfully written all ${finRecords.length} financial records to Firestore!`);
}

runSync().then(() => {
  console.log("Restoration sync finished!");
  process.exit(0);
}).catch(err => {
  console.error("Restoration sync error:", err);
  process.exit(1);
});
