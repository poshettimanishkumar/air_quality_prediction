import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  isFirebaseConfigured,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
  updateProfile
} from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseLive: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'aqp_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            photoURL: fbUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local demo persistence
      try {
        const stored = localStorage.getItem(LOCAL_SESSION_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed reading local session', err);
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Demo authentication simulation
      const mockUser: UserProfile = {
        uid: `demo_user_${btoa(email).replace(/=/g, '').substring(0, 10)}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        createdAt: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isFirebaseConfigured && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
    } else {
      // Demo registration simulation
      const mockUser: UserProfile = {
        uid: `demo_user_${btoa(email).replace(/=/g, '').substring(0, 10)}`,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        createdAt: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      // Demo Google account sign-in
      const mockGoogleUser: UserProfile = {
        uid: 'demo_google_uid_9921',
        email: 'researcher@airquality.ai',
        displayName: 'Air Quality Researcher',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      };
      setUser(mockGoogleUser);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockGoogleUser));
    }
  };

  const signOut = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(null);
    }
  };

  const updateUserDisplayName = async (name: string): Promise<void> => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser(prev => prev ? { ...prev, displayName: name } : null);
    } else if (user) {
      const updated = { ...user, displayName: name };
      setUser(updated);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseLive: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        updateUserDisplayName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
