"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  userId: string | null;
  userIsAdmin: boolean;
};

function getLinkClasses(isActive: boolean) {
  if (isActive) {
    return "border-b-2 border-[rgba(47,93,80,0.2)] pb-1 font-inter text-sm font-semibold tracking-wide text-[var(--brand-moss)] transition-colors";
  }

  return "font-inter text-sm tracking-wide text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]";
}

function getMobileLinkClasses(isActive: boolean) {
  if (isActive) {
    return "block rounded-xl bg-[rgba(47,93,80,0.08)] px-4 py-3 font-inter text-base font-semibold text-[var(--brand-moss)]";
  }

  return "block rounded-xl px-4 py-3 font-inter text-base text-[#6d665b] transition-colors hover:bg-[rgba(47,93,80,0.05)] hover:text-[var(--brand-moss)]";
}

export default function NavLinks({ userId, userIsAdmin }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isTrips = pathname === "/trips" || pathname.startsWith("/trips/");
  const isDayEvents = pathname === "/day-events" || pathname.startsWith("/day-events/");
  const isAbout = pathname === "/about-us";
  const isMedia = pathname === "/media";
  const isBadges = pathname === "/badges";
  const isContact = pathname === "/contact-us";
  const isProfile =
    Boolean(userId) &&
    (pathname === `/account/${userId}` ||
      (userIsAdmin && pathname === "/admin"));

  const navLinks = [
    { href: "/trips", label: "Trips", isActive: isTrips },
    { href: "/day-events", label: "Day Events", isActive: isDayEvents },
    { href: "/about-us", label: "Our Philosophy", isActive: isAbout },
    { href: "/media", label: "Stories", isActive: isMedia },
    { href: "/badges", label: "Badges", isActive: isBadges },
    { href: "/contact-us", label: "Contact us", isActive: isContact },
  ];

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden items-center gap-8 md:flex">
        {navLinks.map(({ href, label, isActive }) => (
          <Link key={href} href={href} className={getLinkClasses(isActive)}>
            {label}
          </Link>
        ))}
        {userId ? (
          <Link
            href={userIsAdmin ? "/admin" : `/account/${userId}`}
            className={getLinkClasses(isProfile)}
          >
            {userIsAdmin ? "Admin Dashboard" : "My profile"}
          </Link>
        ) : null}
      </div>

      {/* Hamburger button — mobile only */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        className="flex flex-col items-center justify-center gap-[5px] p-2 md:hidden"
      >
        <span
          className={`block h-[2px] w-6 rounded-full bg-[var(--brand-moss)] transition-transform duration-200 ${
            mobileOpen ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 rounded-full bg-[var(--brand-moss)] transition-opacity duration-200 ${
            mobileOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 rounded-full bg-[var(--brand-moss)] transition-transform duration-200 ${
            mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Mobile menu panel */}
      {mobileOpen ? (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[76px] z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu panel */}
          <div className="fixed inset-x-4 top-[84px] z-50 md:hidden">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/50 bg-[rgba(255,251,245,0.97)] p-4 shadow-[0_24px_60px_rgba(21,28,39,0.14)] backdrop-blur-xl">
              <nav className="flex flex-col gap-1">
                {navLinks.map(({ href, label, isActive }) => (
                  <Link
                    key={href}
                    href={href}
                    className={getMobileLinkClasses(isActive)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                {userId ? (
                  <Link
                    href={userIsAdmin ? "/admin" : `/account/${userId}`}
                    className={getMobileLinkClasses(isProfile)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {userIsAdmin ? "Admin Dashboard" : "My profile"}
                  </Link>
                ) : null}
              </nav>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
