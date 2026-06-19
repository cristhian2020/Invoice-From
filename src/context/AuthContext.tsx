import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChanged, 
  // loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail as registerWithEmailBase, 
  logout,
  updateProfile
} from '../firebase/config';
import { saveUserProfile } from '../firebase/firestoreService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // loginWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  registerWithEmail: (
    email: string, 
    password: string, 
    name: string, 
    employeeNumber: string, 
    projects: string[]
  ) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Auto-profile initialization commented out since Google Auth is disabled
      /*
      if (currentUser) {
        getUserProfile(currentUser.uid).then(({ profile }) => {
          if (!profile) {
            saveUserProfile(currentUser.uid, {
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              employeeNumber: '',
              projects: [],
              role: 'employee'
            });
          }
        });
      }
      */
    });

    return unsubscribe;
  }, []);

  const handleRegisterWithEmail = async (
    email: string, 
    password: string, 
    name: string, 
    employeeNumber: string, 
    projects: string[]
  ) => {
    try {
      const { user: registeredUser, error } = await registerWithEmailBase(email, password);
      if (error) return { user: null, error };
      
      if (registeredUser) {
        // Update display name in Firebase Auth
        await updateProfile(registeredUser, { displayName: name });
        
        // Save extra details in Firestore
        const { error: dbError } = await saveUserProfile(registeredUser.uid, {
          name,
          email,
          employeeNumber,
          projects,
          role: 'employee'
        });
        
        if (dbError) {
          console.error("Failed to save profile to Firestore:", dbError);
          return { user: registeredUser, error: `Account created, but database profile setup failed: ${dbError}. Please check Firestore rules/connection.` };
        }
      }
      return { user: registeredUser, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, error: message };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    // loginWithGoogle,
    loginWithEmail,
    registerWithEmail: handleRegisterWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
