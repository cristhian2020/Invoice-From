import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  employeeNumber: string;
  projects: string[];
  role: string;
  createdAt?: any;
}

export interface TimesheetData {
  employeeInfo: {
    name: string;
    operator: string;
    consultantId: string;
    rate: string;
  };
  projectInfo: {
    invoice: string;
    projectNumber: string;
    location: string;
  };
  weekData: any;
  totalHours: number;
  totalBillHours: number;
  totalAmount: number;
  submittedBy: string;
  submittedAt?: any;
}

/**
 * Saves or updates a user profile in Firestore
 */
export const saveUserProfile = async (uid: string, profile: Omit<UserProfile, "uid" | "createdAt">) => {
  try {
    const userRef = doc(db, "Users", uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Fetches a user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<{ profile: UserProfile | null; error: string | null }> => {
  try {
    const userRef = doc(db, "Users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { profile: { uid, ...docSnap.data() } as UserProfile, error: null };
    }
    return { profile: null, error: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { profile: null, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Queries a user profile by their employee number (consultant ID)
 */
export const getUserByEmployeeNumber = async (employeeNumber: string): Promise<{ profile: UserProfile | null; error: string | null }> => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("employeeNumber", "==", employeeNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      return { profile: { uid: firstDoc.id, ...firstDoc.data() } as UserProfile, error: null };
    }
    return { profile: null, error: null };
  } catch (error) {
    console.error("Error getting user by employee number:", error);
    return { profile: null, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Fetches all global projects from the Projects collection
 */
export const getAllProjects = async (): Promise<{ projects: string[]; error: string | null }> => {
  try {
    const projectsRef = collection(db, "Projects");
    const querySnapshot = await getDocs(projectsRef);
    const projects: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        projects.push(data.name);
      }
    });
    return { projects, error: null };
  } catch (error) {
    console.error("Error getting projects:", error);
    return { projects: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Saves a new timesheet document to the Timesheets collection
 */
export const saveTimesheet = async (timesheet: TimesheetData) => {
  try {
    const timesheetsRef = collection(db, "Timesheets");
    const docRef = await addDoc(timesheetsRef, {
      ...timesheet,
      submittedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error("Error saving timesheet:", error);
    return { id: null, error: error instanceof Error ? error.message : String(error) };
  }
};
