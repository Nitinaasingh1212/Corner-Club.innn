import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Plus, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";

interface HeaderProps {
    onCreateClick?: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
    const { user, loading, signInWithGoogle, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // const [userProfile, setUserProfile] = useState<any>(null); // Removed stale state
    const router = useRouter();

    // Removed useEffect that caused stale data

    const [isChecking, setIsChecking] = useState(false);

    const handleHostEventClick = async () => {
        if (isChecking) return;
        setIsChecking(true);

        try {
            if (!user) {
                await signInWithGoogle();
                // Don't return here, if login succeeds we might want to continue or let the effect handle it?
                // Actually, if login succeeds, the component might re-render. 
                // Let's just stop checking for now.
                setIsChecking(false);
                return;
            }

            // Fetch fresh profile data on every click
            const profile = await getUserProfile(user.uid);

            if (!profile || !profile.phone) {
                // Use a more subtle toast in strict production, but alert works for now
                if (confirm("You need to complete your profile (add phone number) to host events. Go to Profile?")) {
                    router.push("/profile");
                }
                setIsChecking(false);
                return;
            }

            onCreateClick?.();
        } catch (error) {
            console.error("Failed to check profile:", error);
            // On error, let them try (fallback to modal validation)
            onCreateClick?.();
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <header className="sticky top-0 z-[100] w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-[#f98109]">cornerclub.in</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                        Home
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                        Contact
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    ) : user ? (
                        <Link href="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                            <span className="hidden text-sm font-medium sm:block">{user.displayName}</span>
                            <img
                                src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                alt="User"
                                className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800"
                            />
                        </Link>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={signInWithGoogle}>Login</Button>
                    )}

                    <Button size="sm" className="hidden sm:flex gap-2" onClick={handleHostEventClick} disabled={isChecking}>
                        {isChecking ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        <span>{isChecking ? "Checking..." : "Host Event"}</span>
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="p-2 md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                        ) : (
                            <Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black md:hidden">
                    <div className="flex flex-col space-y-4">
                        <Link
                            href="/"
                            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        {user && (
                            <Link
                                href="/profile"
                                className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                My Profile
                            </Link>
                        )}
                        <Button
                            className="w-full justify-center gap-2"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleHostEventClick();
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Host Event</span>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
