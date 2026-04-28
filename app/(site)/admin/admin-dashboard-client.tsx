"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/modal/modal";
import { awardBadgeAction, createBadgeAction } from "./actions";

type ProfileSummary = {
  id: string;
  name_first: string | null;
  name_last: string | null;
  avatar_url: string | null;
  Capacity: string | null;
};

type BadgeSummary = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

type Props = {
  profiles: ProfileSummary[];
  badges: BadgeSummary[];
};

function isRenderableImageSrc(src: string | null) {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  try {
    const parsed = new URL(src);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isMaterialSymbolName(src: string | null) {
  if (!src) return false;
  return /^[a-z0-9_]+$/i.test(src);
}

export default function AdminDashboardClient({ profiles, badges }: Props) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [awardError, setAwardError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return profiles;
    }

    return profiles.filter((profile) => {
      const fullName = [profile.name_first, profile.name_last]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const role = profile.Capacity?.toLowerCase() ?? "";
      return (
        fullName.includes(normalized) ||
        role.includes(normalized) ||
        profile.id.toLowerCase().includes(normalized)
      );
    });
  }, [profiles, query]);

  const handleCreateBadge = (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await createBadgeAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    });
  };

  const handleAwardBadge = (formData: FormData) => {
    setAwardError(null);

    startTransition(async () => {
      const result = await awardBadgeAction(formData);
      if (result.error) {
        setAwardError(result.error);
        return;
      }

      setSelectedBadgeId("");
      setSelectedProfileId(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="font-inter mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-moss)]">
              Admin Dashboard
            </p>
            <h1 className="font-headline text-5xl leading-[1.08] text-[var(--brand-ink)] md:text-6xl">
              Manage members and shape the badge system.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#5f625b]">
              Search profiles, monitor community roles, and add new earned
              badges without leaving the dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-[rgba(240,243,255,0.82)] p-8">
              <p className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                Badge Controls
              </p>
              <h2 className="mt-3 font-headline text-2xl text-[var(--brand-ink)]">
                Create a new badge
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5f625b]">
                Add a badge name, write the short description members will see,
                and upload the icon used in profiles and award views.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="brand-button mt-6 px-5 py-2.5 text-sm"
              >
                Create badge
              </button>
            </div>

            <div className="rounded-xl bg-[rgba(240,243,255,0.82)] p-8">
              <p className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                Guest profiles
              </p>
              <h2 className="mt-3 font-headline text-2xl text-[var(--brand-ink)]">
                Add a leader profile
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5f625b]">
                For guests who won&apos;t register themselves (e.g. spiritual
                leaders). Adds them to the trip-instructors picker.
              </p>
              <Link
                href="/admin/guest-profiles/new"
                className="brand-button mt-6 inline-block px-5 py-2.5 text-sm"
              >
                Add profile
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-xl bg-white p-8 shadow-[0_18px_50px_rgba(67,49,31,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-headline text-3xl text-[var(--brand-ink)]">
                  Search Users
                </h2>
                <p className="mt-2 text-sm text-[#5f625b]">
                  Search by name, role, or profile ID.
                </p>
              </div>
              <div className="w-full max-w-md">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search users..."
                  className="brand-input px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {filteredProfiles.length ? (
                filteredProfiles.map((profile) => {
                  const displayName =
                    [profile.name_first, profile.name_last]
                      .filter(Boolean)
                      .join(" ") || "Unnamed profile";

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setSelectedProfileId(profile.id);
                        setAwardError(null);
                        setSelectedBadgeId("");
                      }}
                      className="flex w-full flex-col gap-4 rounded-xl bg-[rgba(240,243,255,0.78)] p-5 text-left transition-colors hover:bg-[rgba(226,232,248,0.92)] md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[rgba(216,198,165,0.42)]">
                          {profile.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={displayName}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--brand-ink)]">
                            {displayName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[rgba(55,104,59,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-moss)]">
                          {profile.Capacity ?? "Member"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border-soft)] bg-[rgba(255,250,241,0.72)] px-4 py-10 text-center text-sm text-[#72796f]">
                  No users matched that search.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[rgba(240,243,255,0.82)] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-3xl text-[var(--brand-ink)]">
                  Existing Badges
                </h2>
                <p className="mt-2 text-sm text-[#5f625b]">
                  Current badge definitions available to award.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-moss)]">
                {badges.length}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {badges.length ? (
                badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[rgba(185,240,184,0.45)]">
                      {isRenderableImageSrc(badge.icon) ? (
                        <Image
                          src={badge.icon as string}
                          alt={badge.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : isMaterialSymbolName(badge.icon) ? (
                        <span className="material-symbols-outlined badge-icon-symbol">
                          {badge.icon}
                        </span>
                      ) : (
                        <span className="text-xl text-[var(--brand-moss)]">✦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--brand-ink)]">
                        {badge.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#5f625b]">
                        {badge.description ?? "No description yet."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border-soft)] bg-[rgba(255,250,241,0.72)] px-4 py-10 text-center text-sm text-[#72796f]">
                  No badges found yet. Create the first one from this dashboard.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedProfile)}
        onClose={() => {
          if (!isPending) {
            setSelectedProfileId(null);
            setSelectedBadgeId("");
            setAwardError(null);
          }
        }}
        title={selectedProfile ? "Quick actions" : undefined}
      >
        {selectedProfile ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[rgba(216,198,165,0.42)]">
                {selectedProfile.avatar_url ? (
                  <Image
                    src={selectedProfile.avatar_url}
                    alt={
                      [selectedProfile.name_first, selectedProfile.name_last]
                        .filter(Boolean)
                        .join(" ") || "Profile"
                    }
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-[var(--brand-ink)]">
                  {[selectedProfile.name_first, selectedProfile.name_last]
                    .filter(Boolean)
                    .join(" ") || "Unnamed profile"}
                </p>
                <p className="text-sm text-[#5f625b]">
                  {selectedProfile.Capacity ?? "Member"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/account/${selectedProfile.id}`}
                className="brand-button-secondary px-4 py-2 text-sm"
              >
                View profile
              </Link>
            </div>

            <form action={handleAwardBadge} className="space-y-4">
              <input type="hidden" name="profile_id" value={selectedProfile.id} />

              <label className="block text-sm font-medium text-gray-700">
                Reward a badge
                <select
                  name="badge_id"
                  required
                  value={selectedBadgeId}
                  onChange={(event) => setSelectedBadgeId(event.target.value)}
                  className="brand-input mt-2 px-4 py-3 text-sm"
                >
                  <option value="">Select a badge</option>
                  {badges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
              </label>

              {awardError ? (
                <p className="text-sm text-red-600">{awardError}</p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:opacity-70"
              >
                {isPending ? "Rewarding..." : "Reward badge"}
              </button>
            </form>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isPending) {
            setIsModalOpen(false);
            setError(null);
          }
        }}
        title="Create badge"
      >
        <form action={handleCreateBadge} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Badge name
            <input
              type="text"
              name="name"
              required
              placeholder="Trailblazer"
              className="brand-input mt-2 px-4 py-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Description
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Awarded for completing a foundational Sakina wilderness trip."
              className="brand-input mt-2 px-4 py-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Icon upload
            <input
              type="file"
              name="icon"
              accept="image/*"
              className="brand-input mt-2 px-4 py-3 text-sm"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="brand-button w-full rounded-xl px-4 py-3 text-sm disabled:opacity-70"
          >
            {isPending ? "Creating badge..." : "Create badge"}
          </button>
        </form>
      </Modal>
    </>
  );
}
