import { AuthProvider } from "@/context/AuthContext";
import { EventsProvider } from "@/context/EventsContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <EventsProvider>
                <div className="min-h-screen bg-zinc-50 dark:bg-black">
                    <main>
                        {children}
                    </main>
                </div>
            </EventsProvider>
        </AuthProvider>
    );
}
