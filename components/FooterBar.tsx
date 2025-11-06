"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterBarProps {
  tripId?: string;
}

export default function FooterBar({ tripId }: FooterBarProps) {
  const pathname = usePathname();
  const [trips, setTrips] = useState<any[]>([]);
  const [openTripId, setOpenTripId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  }

  const tripSections = (id: number) => [
    { href: `/dashboard/trip/${id}/main`, label: "Main" },
    { href: `/dashboard/trip/${id}/budget`, label: "Budget" },
    { href: `/dashboard/trip/${id}/itinerary`, label: "Itinerary" },
    { href: `/dashboard/trip/${id}/reservations`, label: "Reservations" },
    { href: `/dashboard/trip/${id}/checklist`, label: "Checklist" },
    { href: `/dashboard/trip/${id}/expenses`, label: "Expenses" },
  ];

  return (
    <footer className="bg-[#0c454a] text-white py-10 px-6 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 🌍 Column 1: Branding */}
        <div>
          <Link href="/dashboard" className="text-2xl hover:text-[#DCC9A3] font-bold block mb-3">
            🧭 Wanderwise
          </Link>
          <p className="text-sm text-gray-300">
            Plan smart, travel wiser.
          </p>
          <p className="text-sm text-gray-300">Manage every aspect of your trip effortlessly.</p>
        </div>

        {/* 🧭 Column 2: Quick links */}
        <div>
          <h3 className="font-semibold text-lg mb-3">About</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-[#DCC9A3]">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#DCC9A3]">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-[#DCC9A3]">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#DCC9A3]">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* 🧳 Column 3: Inspiration */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Inspiration</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-[#DCC9A3]">Top Destinations 2025</Link></li>
            <li><Link href="#" className="hover:text-[#DCC9A3]">Travel Budget Tips</Link></li>
            <li><Link href="#" className="hover:text-[#DCC9A3]">AI Trip Planner</Link></li>
          </ul>
        </div>

        {/* ✈️ Column 4: User trips */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Your Trips</h3>
          {loading ? (
            <p className="text-gray-300 text-sm">Loading trips...</p>
          ) : trips.length === 0 ? (
            <p className="text-gray-300 text-sm">You have not created a Trip yet!</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <button
                    onClick={() =>
                      setOpenTripId(openTripId === trip.id ? null : trip.id)
                    }
                    className="w-full text-left font-medium hover:text-[#DCC9A3] transition flex justify-between items-center"
                  >
                    {trip.name}
                    <span className="ml-2">{openTripId === trip.id ? "▲" : "▼"}</span>
                  </button>
                  {openTripId === trip.id && (
                    <ul className="ml-4 mt-2 space-y-1 text-gray-300">
                      {tripSections(trip.id).map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`hover:text-[#DCC9A3] ${
                              pathname === link.href ? "text-[#DCC9A3]" : ""
                            }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 📍 Bottom bar */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} WanderWise Ltd — Plan your next adventure ✈️
      </div>
    </footer>
  );
}
