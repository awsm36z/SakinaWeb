"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 md:px-10 lg:px-20">
      <div className="brand-panel max-w-md w-full rounded-[1.75rem] p-8 text-center">
        <p className="brand-kicker">
          SAKINA
        </p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Wrong page
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Redirecting you back home...
        </p>
      </div>
    </main>
  );
}
