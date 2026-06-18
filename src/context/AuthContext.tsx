import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logout 
} from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  registerWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
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
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
