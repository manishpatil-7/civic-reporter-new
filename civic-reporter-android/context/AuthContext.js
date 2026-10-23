import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getUserProfile, saveUserProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Firestore user doc with server-proxy fallback for adblocker resilience
  const fetchUserData = async (firebaseUser) => {
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        return;
      }
    } catch (firestoreErr) {
      console.warn('Direct Firestore fetch failed, trying backend profile proxy:', firestoreErr?.message);
      try {
        const proxyRes = await getUserProfile(firebaseUser.uid);
        if (proxyRes.data) {
          setUserData(proxyRes.data);
          return;
        }
      } catch (proxyErr) {
        console.warn('Backend profile proxy also failed:', proxyErr?.message);
      }
    }

    // Default fallback
    setUserData({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || 'User',
      role: 'citizen',
    });
  };

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Signup
  const signup = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const data = {
      uid: cred.user.uid,
      name,
      email,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), data);
    } catch (e) {
      console.warn('Firestore setDoc failed:', e);
    }

    setUserData(data);
    return data;
  };

  // Helper to get current Firebase ID token
  const getIdToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  };

  // Expose a method to refresh user data from Firestore
  const refreshUserData = async () => {
    if (auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  // Login
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(cred.user);
    return cred.user;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const value = {
    user,
    userData,
    loading,
    signup,
    login,
    logout,
    getIdToken,
    refreshUserData,
    isAdmin: userData?.role === 'admin',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
