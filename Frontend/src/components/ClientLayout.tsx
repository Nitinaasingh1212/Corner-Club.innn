"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreateEventModal } from "@/components/CreateEventModal";
import { ChatWidget } from "@/components/ChatWidget";
import { EventsProvider } from "@/context/EventsContext";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <AuthProvider>
            <EventsProvider>
                <div className="flex min-h-screen flex-col">
                    <Header onCreateClick={() => setIsCreateModalOpen(true)} />

                    <main className="flex-1">
                        {children}
                    </main>

                    <Footer />

                    <CreateEventModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                    <ChatWidget />
                </div>
            </EventsProvider>
        </AuthProvider>
    );
}
