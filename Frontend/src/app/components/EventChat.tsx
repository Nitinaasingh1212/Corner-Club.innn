/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { subscribeToMessages, sendMessage } from "@/lib/firestore";

interface EventChatProps {
    eventId: string;
    user: any;
}

export default function EventChat({ eventId, user }: EventChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false); // Collapsible for mobile or initial state? Maybe inline?
    // Let's make it inline but maybe scrollable area.

    useEffect(() => {
        if (!eventId) return; // Wait for ID
        const unsubscribe = subscribeToMessages(eventId, (msgs) => {
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsubscribe();
    }, [eventId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await sendMessage(eventId, newMessage, user);
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (!user) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Join the event to chat with others!</p>
                {/* Actually, user needs to just be logged in? Or booked? Requirements said "chat at event level". Usually implies public or logged in. */}
                <p className="text-sm">Please log in to participate.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[400px] rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
                <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                    <MessageCircle className="h-5 w-5 text-[#f98109]" />
                    Live Event Chat
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                        <p>No messages yet.</p>
                        <p className="text-sm">Be the first to say hi!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user.uid;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {!isMe && (
                                            <>
                                                <img
                                                    src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`}
                                                    alt="Avatar"
                                                    className="h-6 w-6 rounded-full bg-zinc-100"
                                                />
                                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{msg.sender}</span>
                                            </>
                                        )}
                                        {isMe && <span className="text-xs text-zinc-400">You</span>}
                                    </div>
                                    <div
                                        className={`rounded-2xl px-4 py-2 text-sm ${isMe
                                            ? "bg-[#f98109] text-white rounded-br-none"
                                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="border-t border-zinc-100 p-3 dark:border-zinc-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-[#f98109] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f98109] text-white transition-colors hover:bg-[#e07000] disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
