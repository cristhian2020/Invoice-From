import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  orderBy,
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

export interface Project {
  id: string;
  name: string;
  number: string;
  location: string;
  status: "active" | "completed" | "on-hold";
  createdAt?: any;
}

export interface TimesheetData {
  id?: string;
  employeeInfo: {
    name: string;
    operator: string;
    consultantId: string;
  };
  projectInfo: {
    invoice: string;
    projectNumber: string;
    location: string;
  };
  weekData: any;
  totalHours: number;
  submittedBy: string;
  submittedAt?: any;
}

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// PROJECTS (Simple list — backward compatible)
// ─────────────────────────────────────────────

/**
 * Fetches all global projects from the Projects collection (names only)
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

// ─────────────────────────────────────────────
// PROJECTS (Full CRUD — Admin)
// ─────────────────────────────────────────────

/**
 * Fetches all projects as full objects
 */
export const getAllProjectsFull = async (): Promise<{ projects: Project[]; error: string | null }> => {
  try {
    const projectsRef = collection(db, "Projects");
    const querySnapshot = await getDocs(projectsRef);
    const projects: Project[] = [];
    querySnapshot.forEach((docSnap) => {
      projects.push({ id: docSnap.id, ...docSnap.data() } as Project);
    });
    return { projects, error: null };
  } catch (error) {
    console.error("Error getting full projects:", error);
    return { projects: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Adds a new project
 */
export const addProject = async (project: Omit<Project, "id" | "createdAt">) => {
  try {
    const projectsRef = collection(db, "Projects");
    const docRef = await addDoc(projectsRef, {
      ...project,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error("Error adding project:", error);
    return { id: null, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Updates an existing project
 */
export const updateProject = async (id: string, data: Partial<Omit<Project, "id">>) => {
  try {
    const projectRef = doc(db, "Projects", id);
    await updateDoc(projectRef, data);
    return { error: null };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Deletes a project
 */
export const deleteProject = async (id: string) => {
  try {
    const projectRef = doc(db, "Projects", id);
    await deleteDoc(projectRef);
    return { error: null };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

// ─────────────────────────────────────────────
// TIMESHEETS
// ─────────────────────────────────────────────

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

/**
 * Fetches all timesheets (Admin), ordered by submission date descending
 */
export const getAllTimesheets = async (): Promise<{ timesheets: TimesheetData[]; error: string | null }> => {
  try {
    const timesheetsRef = collection(db, "Timesheets");
    const q = query(timesheetsRef, orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const timesheets: TimesheetData[] = [];
    querySnapshot.forEach((docSnap) => {
      timesheets.push({ id: docSnap.id, ...docSnap.data() } as TimesheetData);
    });
    return { timesheets, error: null };
  } catch (error) {
    console.error("Error getting timesheets:", error);
    return { timesheets: [], error: error instanceof Error ? error.message : String(error) };
  }
};

// ─────────────────────────────────────────────
// USERS (Admin)
// ─────────────────────────────────────────────

/**
 * Fetches all user profiles (Admin)
 */
export const getAllUsers = async (): Promise<{ users: UserProfile[]; error: string | null }> => {
  try {
    const usersRef = collection(db, "Users");
    const querySnapshot = await getDocs(usersRef);
    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
    });
    return { users, error: null };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { users: [], error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Updates a user's role (Admin)
 */
export const updateUserRole = async (uid: string, role: string) => {
  try {
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { role });
    return { error: null };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

