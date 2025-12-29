import { Suspense } from "react";
import EventDetailsClient from "./EventDetailsClient";
import { getEventById } from "@/lib/firestore";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
    searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata(
    { searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await searchParams;

    if (!id) {
        return {
            title: "Event Not Found",
        };
    }

    try {
        const event = await getEventById(id);
        if (!event) {
            return {
                title: "Event Not Found",
            };
        }

        const previousImages = (await parent).openGraph?.images || [];

        return {
            title: event.title,
            description: event.description.substring(0, 160), // Truncate description for meta tag
            openGraph: {
                title: event.title,
                description: event.description,
                images: [event.image || "", ...previousImages],
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: "Error Loading Event",
        };
    }
}

export default async function EventDetailsPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;

    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#f98109]"></div>
            </div>
        }>
            <EventDetailsClient id={id || null} />
        </Suspense>
    );
}
