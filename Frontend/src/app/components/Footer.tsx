import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
    const [backendStatus, setBackendStatus] = useState<string>("Checking...");

    useEffect(() => {
        // Use relative path so it goes through Next.js rewrite
        fetch("/api/events")
            .then(res => {
                if (res.ok) setBackendStatus("System Online");
                else setBackendStatus("Backend Connection Error");
            })
            .catch(() => setBackendStatus("Backend Offline"));
    }, []);

    return (
        <footer className="mt-auto border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 dark:border-zinc-800 md:flex-row">
                    <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link>
                        <Link href="/about" className="hover:text-black dark:hover:text-white">About</Link>
                        <Link href="/contact" className="hover:text-black dark:hover:text-white">Contact</Link>
                    </div>
                    <p className="text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} Corner Club. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${backendStatus.includes("success") ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className="text-xs text-zinc-500">{backendStatus}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
