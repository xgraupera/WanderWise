"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavBarProps {
  tripId?: string;
  }

export default function NavBar({ tripId }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
    <nav
      className={`bg-[#001e42] text-white px-6 py-3 shadow-md flex justify-between items-center fixed top-0 left-0 w-full z-50 shadow`}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-bold hover:text-[#DCC9A3] transition"
      >
        <img src="/icon.png" alt="WanderWisely logo" className="w-6 h-6" />
        <span>WanderWisely</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-4 items-center">
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

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="absolute top-14 left-0 w-full bg-[#001e42] text-white p-4 flex flex-col gap-3 shadow-lg md:hidden z-50">
          {tripId &&
            tripLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-2 px-3 rounded hover:bg-[#DCC9A3] ${
                  pathname === link.href ? "font-bold underline" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}

          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="bg-[#025fd1] px-4 py-2 rounded-lg hover:bg-[#DCC9A3]"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
