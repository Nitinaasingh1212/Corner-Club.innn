import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    onCreateClick?: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
    const { user, loading, signInWithGoogle, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
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

                    <Button size="sm" className="gap-2" onClick={onCreateClick}>
                        <Plus className="h-4 w-4" />
                        <span>Create Event</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
