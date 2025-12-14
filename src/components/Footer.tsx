import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 py-12 dark:border-zinc-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#f98109]">cornerclub.in</span>
                        <p className="text-sm text-zinc-500">© 2024. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="#" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Privacy</Link>
                        <Link href="#" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Terms</Link>
                        <Link href="#" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Twitter</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
