import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  getDoc 
} from "firebase/firestore";
import { 
  Member, 
  AuditLog, 
  AdminNotification, 
  AttendanceRecord, 
  WhatsAppReminder 
} from "./types";

// Firebase App Config
const firebaseConfig = {
  apiKey: "AIzaSyCNP7EgQtepB0MUZHwx_TfezXQlUadO0l0",
  authDomain: "gen-lang-client-0548484633.firebaseapp.com",
  projectId: "gen-lang-client-0548484633",
  storageBucket: "gen-lang-client-0548484633.firebasestorage.app",
  messagingSenderId: "17051297331",
  appId: "1:17051297331:web:cc39fa3e3a3cc442f8a546"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the exact dedicated database ID from the applet configuration
export const db = getFirestore(app, "ai-studio-ostpay-1a4c794b-652b-4618-b65b-6d0491074a7e");

// --- MEMBERS COLLECTIONS ---
export async function getMembers(): Promise<Member[]> {
  try {
    const q = query(collection(db, "members"));
    const querySnapshot = await getDocs(q);
    const list: Member[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Member);
    });
    return list;
  } catch (error) {
    console.error("Firebase load error for members:", error);
    // Fallback to local storage if firestore is blocked or offline
    const saved = localStorage.getItem("ost_pay_members");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveMember(member: Member): Promise<void> {
  try {
    const docRef = doc(db, "members", member.id);
    await setDoc(docRef, member, { merge: true });
    // Keep local storage synchronized for resilient offline operations
    const saved = localStorage.getItem("ost_pay_members");
    const list: Member[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      list[idx] = member;
    } else {
      list.push(member);
    }
    localStorage.setItem("ost_pay_members", JSON.stringify(list));
  } catch (error) {
    console.error("Firebase write error for member:", error);
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  try {
    const docRef = doc(db, "members", memberId);
    await deleteDoc(docRef);
    // Synchronize local storage
    const saved = localStorage.getItem("ost_pay_members");
    if (saved) {
      const list: Member[] = JSON.parse(saved);
      const filtered = list.filter(m => m.id !== memberId);
      localStorage.setItem("ost_pay_members", JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("Firebase delete error for member:", error);
  }
}

// --- AUDIT LOGS ---
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(150));
    const querySnapshot = await getDocs(q);
    const list: AuditLog[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AuditLog);
    });
    return list;
  } catch (error) {
    console.error("Firebase load error for logs:", error);
    const saved = localStorage.getItem("ost_pay_logs");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addAuditLog(log: AuditLog): Promise<void> {
  try {
    const docRef = doc(db, "logs", log.id);
    await setDoc(docRef, log);
    // Sync local
    const saved = localStorage.getItem("ost_pay_logs");
    const list: AuditLog[] = saved ? JSON.parse(saved) : [];
    list.unshift(log);
    localStorage.setItem("ost_pay_logs", JSON.stringify(list.slice(0, 150)));
  } catch (error) {
    console.error("Firebase write error for log:", error);
  }
}

// --- ADMIN NOTIFICATIONS ---
export async function getAdminNotifications(): Promise<AdminNotification[]> {
  try {
    const q = query(collection(db, "notifications"));
    const querySnapshot = await getDocs(q);
    const list: AdminNotification[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AdminNotification);
    });
    return list;
  } catch (error) {
    console.error("Firebase load error for notifications:", error);
    const saved = localStorage.getItem("ost_pay_admin_notifications");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveAdminNotification(notif: AdminNotification): Promise<void> {
  try {
    const docRef = doc(db, "notifications", notif.id);
    await setDoc(docRef, notif, { merge: true });
    // Sync local
    const saved = localStorage.getItem("ost_pay_admin_notifications");
    const list: AdminNotification[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex(n => n.id === notif.id);
    if (idx >= 0) {
      list[idx] = notif;
    } else {
      list.push(notif);
    }
    localStorage.setItem("ost_pay_admin_notifications", JSON.stringify(list));
  } catch (error) {
    console.error("Firebase write error for notification:", error);
  }
}

export async function deleteAdminNotification(id: string): Promise<void> {
  try {
    const docRef = doc(db, "notifications", id);
    await deleteDoc(docRef);
    // Sync local
    const saved = localStorage.getItem("ost_pay_admin_notifications");
    if (saved) {
      const list: AdminNotification[] = JSON.parse(saved);
      const filtered = list.filter(n => n.id !== id);
      localStorage.setItem("ost_pay_admin_notifications", JSON.stringify(filtered));
    }
  } catch (error) {
    console.error("Firebase delete error for notification:", error);
  }
}

// --- ATTENDANCE RECORDS ---
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const q = query(collection(db, "attendance_records"));
    const querySnapshot = await getDocs(q);
    const list: AttendanceRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AttendanceRecord);
    });
    return list;
  } catch (error) {
    console.error("Firebase load error for attendance:", error);
    const saved = localStorage.getItem("ost_attendance_records");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const docRef = doc(db, "attendance_records", record.id);
    await setDoc(docRef, record);
    // Sync local
    const saved = localStorage.getItem("ost_attendance_records");
    const list: AttendanceRecord[] = saved ? JSON.parse(saved) : [];
    list.unshift(record);
    localStorage.setItem("ost_attendance_records", JSON.stringify(list));
  } catch (error) {
    console.error("Firebase write error for attendance record:", error);
  }
}

// --- WHATSAPP REMINDERS ---
export async function getWhatsAppReminders(): Promise<WhatsAppReminder[]> {
  try {
    const q = query(collection(db, "whatsapp_reminders"));
    const querySnapshot = await getDocs(q);
    const list: WhatsAppReminder[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WhatsAppReminder);
    });
    return list;
  } catch (error) {
    console.error("Firebase load error for whatsapp reminders:", error);
    const saved = localStorage.getItem("ost_whatsapp_reminders");
    return saved ? JSON.parse(saved) : [];
  }
}

export async function saveWhatsAppReminder(reminder: WhatsAppReminder): Promise<void> {
  try {
    const docRef = doc(db, "whatsapp_reminders", reminder.id);
    await setDoc(docRef, reminder, { merge: true });
    // Sync local
    const saved = localStorage.getItem("ost_whatsapp_reminders");
    const list: WhatsAppReminder[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      list[idx] = reminder;
    } else {
      list.push(reminder);
    }
    localStorage.setItem("ost_whatsapp_reminders", JSON.stringify(list));
  } catch (error) {
    console.error("Firebase write error for whatsapp reminder:", error);
  }
}

// --- SETTINGS DOCUMENTS (SMTP, WORSHIP STATS) ---
export async function getSettingsDoc(docId: string, fallbackKey: string): Promise<any> {
  try {
    const docRef = doc(db, "settings", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error(`Firebase settings read error for ${docId}:`, error);
  }
  // Local fallback
  const saved = localStorage.getItem(fallbackKey);
  return saved ? JSON.parse(saved) : null;
}

export async function saveSettingsDoc(docId: string, data: any, fallbackKey: string): Promise<void> {
  try {
    const docRef = doc(db, "settings", docId);
    await setDoc(docRef, data, { merge: true });
    // Sync local
    localStorage.setItem(fallbackKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Firebase settings write error for ${docId}:`, error);
  }
}

// --- BULK WIPE SYSTEM DATABASE (CLEAN SLATE MIGRATION) ---
export async function clearAllSystemCollections(): Promise<void> {
  try {
    // Clear Firestore cache or docs locally
    localStorage.removeItem("ost_pay_members");
    localStorage.removeItem("ost_pay_logs");
    localStorage.removeItem("ost_pay_admin_notifications");
    localStorage.removeItem("ost_attendance_records");
    localStorage.removeItem("ost_whatsapp_reminders");
    localStorage.removeItem("ost_worship_stats");
    localStorage.removeItem("ost_pay_admin_authorized");
    
    // Clear Firestore documents from collections
    const collectionsToClear = ["members", "logs", "notifications", "attendance_records", "whatsapp_reminders"];
    for (const collName of collectionsToClear) {
      const q = query(collection(db, collName));
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, collName, docSnap.id));
      }
    }
  } catch (err) {
    console.error("Wipe database helper err:", err);
  }
}
