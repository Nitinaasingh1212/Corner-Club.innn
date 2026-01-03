export interface Event {
    id: string;
    title: string;
    description: string;
    date: string; // ISO string
    time: string;
    location: string;
    city: string;
    category: "Music" | "Food" | "Comedy" | "Fitness" | "Art" | "Tech" | "Social" | "All";
    price: number;
    currency: string;
    image: string;
    creator: {
        name: string;
        avatar: string;
    };
    capacity: number;
    attendees: number;
    isSaved?: boolean;
    status?: string;
}
