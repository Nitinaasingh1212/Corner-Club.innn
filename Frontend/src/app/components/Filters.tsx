"use client";


import { CITIES, CATEGORIES } from "@/data/constants";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin } from "lucide-react";

interface FiltersProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    selectedCity: string;
    setSelectedCity: (city: string) => void;
    savedOnly: boolean;
    setSavedOnly: (saved: boolean) => void;
}

export function Filters({
    activeCategory,
    setActiveCategory,
    selectedCity,
    setSelectedCity,
    savedOnly,
    setSavedOnly
}: FiltersProps) {

    return (
        <div className="space-y-4 py-4 bg-white border-b border-zinc-100 -mx-4 px-4 sm:px-6 lg:px-8 mb-6">
            {/* Top Row: Search/City/Sort */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* City Selector */}
                <div className="relative inline-flex items-center">
                    <MapPin className="absolute left-3 h-4 w-4 text-zinc-500" />
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white pl-10 pr-8 text-sm font-medium text-zinc-900 focus:border-[#f98109] focus:ring-1 focus:ring-[#f98109] dark:border-zinc-800 dark:bg-black dark:text-white"
                    >
                        {CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 h-4 w-4 pointer-events-none text-zinc-500" />
                </div>

                {/* Right Actions: Sort + Saved */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={savedOnly}
                            onChange={(e) => setSavedOnly(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-[#f98109] focus:ring-[#f98109]"
                        />
                        Saved only
                    </label>

                    <div className="relative">
                        <select className="h-10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-4 pr-8 text-sm font-medium text-zinc-900 focus:border-[#f98109] focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white">
                            <option>Sort by: Date</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-zinc-500" />
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                            activeCategory === cat
                                ? "bg-[#f98109] text-white shadow-md font-semibold"
                                : "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-medium"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
