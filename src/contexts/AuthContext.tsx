"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  nome: string;
  telefone: string;
  role: "owner" | "tenant";
  email: string;
  photoURL?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, nome: string, telefone: string, role: "owner" | "tenant") => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerEmail = async (
    email: string,
    password: string,
    nome: string,
    telefone: string,
    role: "owner" | "tenant"
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nome });
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      nome,
      telefone,
      role,
      email,
      verified: false,
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    setProfile(userProfile);
  };

  const loginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure we don't have pending operations
      const cred = await signInWithPopup(auth, provider);
      const docRef = doc(db, "users", cred.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const userProfile: UserProfile = {
          uid: cred.user.uid,
          nome: cred.user.displayName || "",
          telefone: "",
          role: "tenant", // Default to tenant on social login
          email: cred.user.email || "",
          photoURL: cred.user.photoURL || "",
          verified: false,
        };
        await setDoc(docRef, userProfile);
        setProfile(userProfile);
      } else {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return; // Ignore common popup errors
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginEmail, registerEmail, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
