"use client";

import { useState, useEffect } from "react";

import { Hero } from "@/app/components/Hero";
import { Filters } from "@/app/components/Filters";
import { EventCard } from "@/app/components/EventCard";
import { useEvents } from "@/context/EventsContext";

export default function Home() {
  const { events, loadMore, hasMore, loading, refetch } = useEvents();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("Lucknow");
  const [savedOnly, setSavedOnly] = useState(false);

  // Trigger backend fetch when filters change
  useEffect(() => {
    // Debounce could be added here if needed, but for now direct call is fine
    refetch(selectedCity, activeCategory);
  }, [selectedCity, activeCategory, refetch]);

  // Client-side filtering for "Saved" events (since API doesn't filter favorites yet)
  // And also redundancy check if backend didn't filter perfectly or for smooth UI
  // Actually context events are already filtered by City/Category from backend.
  // So we only filter savedOnly here.
  const displayedEvents = events.filter((event) => {
    const matchesSaved = !savedOnly || event.isSaved;
    // Note: event.isSaved might be undefined if not joined. 
    // Assuming isSaved logic is handled elsewhere or data includes it.
    return matchesSaved;
  });

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <Filters
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          savedOnly={savedOnly}
          setSavedOnly={setSavedOnly}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500">
              {loading ? <p>Loading events...</p> : <p>No events found for these filters.</p>}
            </div>
          )}
        </div>

        {hasMore && !savedOnly && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => loadMore()}
              disabled={loading}
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              "Load More Events"
            </button>
          </div>
        )}
      </div>
    </>
  );
}
