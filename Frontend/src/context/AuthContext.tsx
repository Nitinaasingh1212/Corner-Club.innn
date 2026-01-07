"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, serverTimestamp } from "firebase/firestore"; // remove setDoc
import { auth, db } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // Determine if this is a new user or existing one by checking Firestore
                // We always update 'lastLogin'
                try {
                    // Use backend API to store user data (centralized logic)
                    await updateUserProfile(currentUser.uid, {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        // lastLogin: new Date().toISOString() // server handles timestamps potentially, or we pass it
                    });
                    console.log("User profile synced via Backend API");
                } catch (error) {
                    console.error("Error syncing user profile:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            // Ignore popup closed by user or duplicate request
            if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                console.warn("Login popup closed or cancelled.");
                return;
            }
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
