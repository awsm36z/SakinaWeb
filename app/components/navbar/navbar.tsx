// app/components/Navbar.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import NavLinks from "./nav-links";

export default async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const userIsAdmin = user ? await isAdmin(user.id) : false;

  return (
    <header className="fixed inset-x-0 top-5 z-50 px-4 md:px-6">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/45 bg-[rgba(255,251,245,0.72)] px-6 py-3 shadow-[0_20px_50px_rgba(21,28,39,0.06)] backdrop-blur-xl md:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-headline text-xl italic text-[var(--brand-moss)] md:text-2xl">
            Sakina Wilderness
          </span>
        </Link>

        {/* Nav links */}
        <NavLinks userId={user?.id ?? null} userIsAdmin={userIsAdmin} />

        <Link
          href={user ? `/account/${user.id}` : "/signup"}
          className="brand-button px-5 py-2.5 font-inter text-sm"
        >
          {user ? "My profile" : "Join us"}
        </Link>
      </nav>
    </header>
  );
}
