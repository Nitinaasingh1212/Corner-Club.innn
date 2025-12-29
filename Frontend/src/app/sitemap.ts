import { MetadataRoute } from 'next';
import { getAllEvents } from '@/lib/firestore'; // Assuming getAllEvents handles fetching all events, if not I might need to adapt.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL
    const baseUrl = 'http://localhost:3000'; // TODO: Update with production URL

    // Static routes
    const routes = [
        '',
        '/login',
        '/register',
        '/profile',
        '/create-event',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Dynamic routes
    // Note: generateSitemap should ideally fetch *all* events. 
    // If getAllEvents fetches everything, we are good. If it handles pagination, we might miss some.
    // For sitemap we generally want everything.
    let events = [];
    try {
        events = await getAllEvents();
    } catch (e) {
        console.error("Failed to fetch events for sitemap", e);
    }

    const eventRoutes = events.map((event: any) => ({
        url: `${baseUrl}/event-details?id=${event.id}`,
        lastModified: new Date(event.date), // Or updated_at if available
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...eventRoutes];
}
