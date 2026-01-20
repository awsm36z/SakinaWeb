// app/components/Navbar.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 md:px-10 lg:px-20 py-3">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2">
          {/* If you add a logo later, it can go here */}
          <span className="text-sm font-semibold tracking-[0.2em] text-green-700">
            SAKINA
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link
            href="/trips"
            className="hover:text-gray-900 transition-colors"
          >
            Trips
          </Link>

          <Link
            href="/media"
            className="hover:text-gray-900 transition-colors"
          >
            Media
          </Link>

          {user ? (
            <Link
              href="/account"
              className="px-4 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition"
            >
              My profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
