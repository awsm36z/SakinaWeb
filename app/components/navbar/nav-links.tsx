"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function NavLinks({ userId, userIsAdmin }: Props) {
  const pathname = usePathname();

  const isTrips = pathname === "/trips" || pathname.startsWith("/trips/");
  const isAbout = pathname === "/about-us";
  const isMedia = pathname === "/media";
  const isBadges = pathname === "/badges";
  const isContact = pathname === "/contact-us";
  const isProfile =
    Boolean(userId) &&
    (pathname === `/account/${userId}` ||
      (userIsAdmin && pathname === "/admin"));

  return (
    <div className="hidden items-center gap-8 md:flex">
      <Link href="/trips" className={getLinkClasses(isTrips)}>
        Trips
      </Link>

      <Link href="/about-us" className={getLinkClasses(isAbout)}>
        Our Philosophy
      </Link>

      <Link href="/media" className={getLinkClasses(isMedia)}>
        Stories
      </Link>

      <Link href="/badges" className={getLinkClasses(isBadges)}>
        Badges
      </Link>

      <Link href="/contact-us" className={getLinkClasses(isContact)}>
        Contact us
      </Link>

      {userId ? (
        <Link
          href={userIsAdmin ? "/admin" : `/account/${userId}`}
          className={getLinkClasses(isProfile)}
        >
          {userIsAdmin ? "Admin Dashboard" : "My profile"}
        </Link>
      ) : null}
    </div>
  );
}
