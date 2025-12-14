"use client";

// react-firebase-hooks does not provide a global provider. 
// We typically use useAuthState in individual components.
// For now, we will just render children to fix the build error.
// If a global user context is needed, we can implement it manually later.

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
