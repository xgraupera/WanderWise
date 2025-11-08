// components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavBarProps {
  tripId?: string;
}

export default function NavBar({ tripId }: NavBarProps) {
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";

  const tripLinks = tripId
    ? [
        { href: `/dashboard/trip/${tripId}/main`, label: "Main" },
        { href: `/dashboard/trip/${tripId}/budget`, label: "Budget" },
        { href: `/dashboard/trip/${tripId}/itinerary`, label: "Itinerary" },
        { href: `/dashboard/trip/${tripId}/reservations`, label: "Reservations" },
        { href: `/dashboard/trip/${tripId}/checklist`, label: "Checklist" },
        { href: `/dashboard/trip/${tripId}/expenses`, label: "Expenses" }
      ]
    : [];

  return (
    <nav className="shadow-md bg-[#001e42] text-white px-6 py-3 flex justify-between items-center shadow-lg">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold hover:text-[#DCC9A3] transition">
    <img
      src="/icon.png"
      alt="WanderWisely logo"
      className="w-6 h-6"
    />
    <span>WanderWisely</span>
  </Link>

      <div className="flex gap-4 items-center">
        {tripId &&
          tripLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-[#DCC9A3] transition ${
                pathname === link.href ? "font-bold underline" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-[#025fd1] px-3 py-1 rounded-lg hover:bg-[#DCC9A3] transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
