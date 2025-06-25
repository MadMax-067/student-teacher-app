import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export async function logAction(userId, action) {
  await addDoc(collection(db, "logs"), {
    userId,
    action,
    timestamp: new Date().toISOString(),
  });

  console.log(`[LOG] ${action} by ${userId}`);
}