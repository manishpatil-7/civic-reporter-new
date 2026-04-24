import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [userData, setUserData] = useState(null); // Firestore user doc { name, email, role, uid }
  const [loading, setLoading] = useState(true);

  // Fetch Firestore user doc
  const fetchUserData = async (firebaseUser) => {
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        // Fallback if doc doesn't exist yet
        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: 'user',
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserData({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        role: 'user',
      });
    }
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
    // Set displayName on Firebase Auth
    await updateProfile(cred.user, { displayName: name });
    
    // Create Firestore user doc FORCING role to 'citizen' (default)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    });
    
    // Update local state
    const data = { uid: cred.user.uid, name, email, role: 'citizen' };
    setUserData(data);
    return data;
  };

  // Helper to get current Firebase ID token
  const getIdToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true); // true forces refresh to get latest claims
    }
    return null;
  };
  
  // Expose a method to refresh user data from Firestore (useful after role changes)
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
