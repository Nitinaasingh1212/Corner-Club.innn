"use client";

import { Button } from "@/app/components/ui/Button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        Get in <span className="text-[#f98109]">Touch</span>
                    </h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                        Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f98109]/10 text-[#f98109]">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Our Office</h3>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    123 Innovation Tower, Gomti Nagar<br />
                                    Lucknow, Uttar Pradesh 226010
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f98109]/10 text-[#f98109]">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Email Us</h3>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    support@cornerclub.in<br />
                                    partners@cornerclub.in
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f98109]/10 text-[#f98109]">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Call Us</h3>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    +91 98765 43210<br />
                                    Mon-Fri from 8am to 5pm
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                                <input type="text" className="mt-1 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#f98109] focus:outline-none focus:ring-1 focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                                <input type="email" className="mt-1 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#f98109] focus:outline-none focus:ring-1 focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Message</label>
                                <textarea rows={4} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#f98109] focus:outline-none focus:ring-1 focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-800"></textarea>
                            </div>
                            <Button className="w-full" size="lg">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
