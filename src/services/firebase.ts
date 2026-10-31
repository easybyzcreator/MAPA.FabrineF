import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5d71-kH8vIxQ0NHb-1l4sKw-LuTfB_Vo",
  authDomain: "mapa-fabrinef.firebaseapp.com",
  projectId: "mapa-fabrinef",
  storageBucket: "mapa-fabrinef.firebasestorage.app",
  messagingSenderId: "805749277309",
  appId: "1:805749277309:web:bddaf9bc38226bb1b7e714",
  measurementId: "G-ZT0RQ7E0XB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
export const db = getFirestore(app);

// Helper to generate a short ID
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Saves the white-label brand configuration.
 * Uses a short ID for generating compact sharing links, or a custom stable ID like 'default'.
 */
export const saveBrandConfig = async (brandSettings: any, configId?: string) => {
  try {
    const finalId = configId || generateShortId();
    await setDoc(doc(db, "configs", finalId), {
      ...brandSettings,
      createdAt: serverTimestamp()
    });
    return finalId;
  } catch (error) {
    console.error("Error saving brand config:", error);
    throw error;
  }
};

/**
 * Retrieves brand configuration by its ID.
 */
export const getBrandConfig = async (configId: string): Promise<any> => {
  try {
    const docRef = doc(db, "configs", configId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting brand config:", error);
    return null;
  }
};

/**
 * Retrieves a single student registration by its ID.
 */
export const getRegistrationById = async (registrationId: string): Promise<any> => {
  try {
    const docRef = doc(db, "registrations", registrationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting registration by id:", error);
    return null;
  }
};

/**
 * Saves a student registration form filled out by a parent.
 */
export const saveRegistration = async (registrationData: any) => {
  try {
    const docRef = await addDoc(collection(db, "registrations"), {
      ...registrationData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving student registration:", error);
    throw error;
  }
};

/**
 * Updates an existing student registration record (such as professional intervention checklist/observations).
 */
export const updateRegistration = async (registrationId: string, updateData: any): Promise<boolean> => {
  try {
    const docRef = doc(db, "registrations", registrationId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn("Direct updateDoc failed, attempting setDoc with merge:", error);
    try {
      const docRef = doc(db, "registrations", registrationId);
      await setDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err2) {
      console.error("Error updating registration:", err2);
      throw err2;
    }
  }
};

/**
 * Retrieves all registered students, sorted by newest first.
 */
export const getRegistrations = async () => {
  try {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const registrations: any[] = [];
    querySnapshot.forEach((docSnap) => {
      registrations.push({ id: docSnap.id, ...docSnap.data() });
    });
    return registrations;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    // Fallback if no index is built yet or if query fails
    try {
      const querySnapshot = await getDocs(collection(db, "registrations"));
      const registrations: any[] = [];
      querySnapshot.forEach((docSnap) => {
        registrations.push({ id: docSnap.id, ...docSnap.data() });
      });
      return registrations;
    } catch (e) {
      console.error("Fallback fetch also failed:", e);
      return [];
    }
  }
};

/**
 * Deletes a registered student record.
 */
export const deleteRegistration = async (registrationId: string) => {
  try {
    await deleteDoc(doc(db, "registrations", registrationId));
    return true;
  } catch (error) {
    console.error("Error deleting registration:", error);
    throw error;
  }
};

/**
 * Admin Panel Authentication: Retrieve or seed the password settings.
 */
export const getAdminPassword = async () => {
  try {
    const docRef = doc(db, "admin", "settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().password || "admin123";
    } else {
      // Seed default password if it doesn't exist
      await setDoc(docRef, { password: "admin123" });
      return "admin123";
    }
  } catch (error) {
    console.error("Error getting admin password:", error);
    return "admin123"; // fallback
  }
};

/**
 * Updates the Admin Panel password in Firestore.
 */
export const saveAdminPassword = async (newPassword: string) => {
  try {
    const docRef = doc(db, "admin", "settings");
    await setDoc(docRef, { password: newPassword });
    return true;
  } catch (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
};
