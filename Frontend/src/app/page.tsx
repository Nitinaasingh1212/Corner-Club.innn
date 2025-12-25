"use client";

import { useState } from "react";

import { Hero } from "@/app/components/Hero";
import { Filters } from "@/app/components/Filters";
import { EventCard } from "@/app/components/EventCard";
import { useEvents } from "@/context/EventsContext";

export default function Home() {
  const { events } = useEvents();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("Lucknow");
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  const filteredEvents = events.filter((event) => {
    const matchesCity = event.city === selectedCity;
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const matchesSaved = !savedOnly || event.isSaved;

    // Debugging why new events might not show
    // console.log(`Checking event: ${event.title}, City: ${event.city}==${selectedCity}, Cat: ${event.category}==${activeCategory}`);

    return matchesCity && matchesCategory && matchesSaved;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log("Total Events:", events.length, "Visible Events:", filteredEvents.length, "Filters:", { selectedCity, activeCategory });

  const visibleEvents = filteredEvents.slice(0, visibleCount);

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
          {visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500">
              <p>No events found for these filters.</p>
            </div>
          )}
        </div>

        {visibleCount < filteredEvents.length && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              Load More Events
            </button>
          </div>
        )}
      </div>
    </>
  );
}
