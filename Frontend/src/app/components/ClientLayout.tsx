"use client";

import { useState } from "react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { CreateEventModal } from "@/app/components/CreateEventModal";
import { ChatWidget } from "@/app/components/ChatWidget";
import { EventsProvider } from "@/context/EventsContext";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Admin logic removed - Admin Panel is now a separate app.

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
