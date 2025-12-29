import { Button } from "@/app/components/ui/Button";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
                        We are <span className="text-[#f98109]">CornerClub.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                        Building the future of social event discovery. We believe in connecting people through shared experiences and meaningful conversations.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                            <Image
                                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000"
                                alt="Community gathering"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Our Mission</h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                CornerClub was born from a simple idea: meaningful connections happen when people come together over shared interests. In a digital-first world, we are bringing the focus back to real-world interactions.
                            </p>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Our platform isn&apos;t just about booking tickets. It&apos;s about bridging the gap between &quot;going&quot; and &quot;belonging&quot;. With features like pre-event community chats, we ensure you never walk into a room of strangers.
                            </p>
                            <Button size="lg">Join our Community</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section (Placeholder) */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-white">Meet the Creators</h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-zinc-800 bg-white mb-4">
                                    <Image
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Team${i}`}
                                        alt="Team Member"
                                        fill
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Team Member {i}</h3>
                                <p className="text-zinc-500">Co-Founder</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
