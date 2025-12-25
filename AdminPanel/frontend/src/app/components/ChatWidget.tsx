"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, subscribeToMessages } from "@/lib/firestore";

interface ChatMessage {
    id: string;
    sender: string;
    senderId: string;
    avatar?: string;
    text: string;
    createdAt: any;
}

export function ChatWidget() {
    const { user, signInWithGoogle } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const unsubscribe = subscribeToMessages((msgs) => {
            setMessages(msgs);
            // Auto scroll to bottom
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });
        return () => unsubscribe();
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await sendMessage(newMessage, user);
            setNewMessage("");
            // Scroll to bottom immediately
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#f98109] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#d66e06] focus:outline-none focus:ring-2 focus:ring-[#f98109] focus:ring-offset-2"
                aria-label="Open Chat"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 bg-[#f98109] px-4 py-3 text-white dark:border-zinc-800">
                        <div>
                            <h3 className="font-bold">Community Chat</h3>
                            <p className="text-xs text-white/90">Lucknow Events</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-900">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
                                <p className="text-sm">No messages yet.</p>
                                <p className="text-xs">Be the first to say hi!</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = user?.uid === msg.senderId;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                        {!isMe && (
                                            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-white">
                                                <Image
                                                    src={msg.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous"}
                                                    alt={msg.sender}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-[#f98109] text-white rounded-br-none" : "bg-zinc-100 text-zinc-800 shadow-sm rounded-bl-none dark:bg-zinc-800 dark:text-zinc-200"}`}>
                                            <p className="break-words">{msg.text}</p>
                                            {!isMe && <span className="mt-1 block text-[9px] text-zinc-400 font-medium opacity-70">{msg.sender}</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                        {user ? (
                            <form className="flex items-center gap-2" onSubmit={handleSend}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-[#f98109] focus:outline-none focus:ring-1 focus:ring-[#f98109] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button size="icon" className="h-9 w-9 rounded-full shrink-0" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p className="mb-2 text-xs text-zinc-500">Log in to join the conversation</p>
                                <Button size="sm" variant="outline" className="w-full" onClick={signInWithGoogle}>
                                    Login to Chat
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
