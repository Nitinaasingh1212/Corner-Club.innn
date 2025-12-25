import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

export default function RegisterPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-black border border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Join the community and start discovering events
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name</label>
                                <input type="text" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-[#f98109] focus:outline-none focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-900 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name</label>
                                <input type="text" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-[#f98109] focus:outline-none focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-900 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email address</label>
                            <input type="email" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-[#f98109] focus:outline-none focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-900 sm:text-sm" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            <input type="password" required className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 focus:border-[#f98109] focus:outline-none focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-900 sm:text-sm" placeholder="••••••••" />
                        </div>
                    </div>

                    <Button className="w-full" size="lg">Sign up</Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-zinc-500">Already have an account? </span>
                    <Link href="/login" className="font-medium text-[#f98109] hover:text-[#d66e06]">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
