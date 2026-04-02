"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "./actions";
import AlertModal from "@/app/components/modal/alert-modal";

type EarnedBadge = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  category: string | null;
  awardedAt: string | null;
};

type CompletedTripCard = {
  tripId: string;
  title: string;
  timing: string;
  location: string;
  summary: string;
  image: string;
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

function fallbackGlyph(category: string | null) {
  switch ((category ?? "").toLowerCase()) {
    case "foundation":
      return "◌";
    case "skills":
      return "△";
    case "experience":
      return "⛰";
    case "overnight":
      return "☾";
    case "leadership":
      return "⌘";
    case "spiritual":
      return "✦";
    case "community":
      return "◍";
    default:
      return "✦";
  }
}

function formatMonthYear(dateValue: string | null) {
  if (!dateValue) return "Date TBA";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date TBA";

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export default function AccountPage() {
  const params = useParams();
  const profileId = String(params.profile_id ?? "");
  const [about, setAbout] = useState(
    "Outdoor enthusiast who loves grounding trips with reflection and community."
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [capacity, setCapacity] = useState("Member");
  const [emailAddress, setEmailAddress] = useState("Private");
  const [locationLabel, setLocationLabel] = useState("Pacific Northwest");
  const [isEditing, setIsEditing] = useState(false);
  const [draftAbout, setDraftAbout] = useState(about);
  const [draftFirstName, setDraftFirstName] = useState(firstName);
  const [draftLastName, setDraftLastName] = useState(lastName);
  const [draftMiddleInitial, setDraftMiddleInitial] = useState(middleInitial);
  const [draftCapacity, setDraftCapacity] = useState(capacity);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(null);
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canEditCapacity, setCanEditCapacity] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [completedTripCards, setCompletedTripCards] = useState<CompletedTripCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const displayName =
    [firstName, middleInitial ? `${middleInitial}.` : "", lastName]
      .filter(Boolean)
      .join(" ") || "Sakina Member";
  const heroImage = isEditing ? draftImageUrl : profileImageUrl;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const authedUserId = authData.user?.id ?? null;

      if (!isMounted) return;

      const isOwner = Boolean(authedUserId && authedUserId === profileId);
      if (isOwner) {
        setEmailAddress(authData.user?.email ?? "Private");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !data || !isMounted) {
        return;
      }

      setFirstName(data.name_first || "");
      setLastName(data.name_last || "");
      setMiddleInitial(data.name_middle || "");
      setCapacity(data.Capacity || "Member");
      setAbout(data.bio_text || "");
      setProfileImageUrl(data.avatar_url || null);
      setDraftImageUrl(data.avatar_url || null);
      setLocationLabel(data.region || data.location || "Pacific Northwest");
      setProfileLoaded(true);

      const { data: earnedBadgeRows } = await supabase
        .from("profile_badges")
        .select("badge_id, awarded_at")
        .eq("profile_id", profileId)
        .order("awarded_at", { ascending: false });

      const badgeIds = [...new Set((earnedBadgeRows ?? []).map((row) => String(row.badge_id)))];

      let nextEarnedBadges: EarnedBadge[] = [];
      if (badgeIds.length) {
        const { data: badgeRows } = await supabase
          .from("badges")
          .select("id, name, icon, color, category")
          .in("id", badgeIds);

        const awardedAtByBadgeId = new Map(
          (earnedBadgeRows ?? []).map((row) => [
            String(row.badge_id),
            row.awarded_at ? String(row.awarded_at) : null,
          ])
        );

        nextEarnedBadges = (badgeRows ?? [])
          .map((badge) => ({
            id: String(badge.id),
            name: String(badge.name ?? "Badge"),
            icon: badge.icon ? String(badge.icon) : null,
            color: badge.color ? String(badge.color) : null,
            category: badge.category ? String(badge.category) : null,
            awardedAt: awardedAtByBadgeId.get(String(badge.id)) ?? null,
          }))
          .sort((a, b) => {
            const aTime = a.awardedAt ? new Date(a.awardedAt).getTime() : 0;
            const bTime = b.awardedAt ? new Date(b.awardedAt).getTime() : 0;
            return bTime - aTime;
          });
      }

      if (isMounted) {
        setEarnedBadges(nextEarnedBadges);
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: applicationRows } = await supabase
        .from("trip_applications")
        .select("trip_id")
        .eq("camper_id", profileId)
        .eq("paid", true);

      const completedTripIds = [
        ...new Set(
          (applicationRows ?? [])
            .map((row) => String(row.trip_id ?? ""))
            .filter(Boolean)
        ),
      ];

      let nextCompletedTrips: CompletedTripCard[] = [];
      if (completedTripIds.length) {
        const { data: tripRows } = await supabase
          .from("trips")
          .select(
            "trip_id, title, dates, end_date, location, summary, banner_image"
          )
          .in("trip_id", completedTripIds)
          .lt("end_date", today)
          .order("end_date", { ascending: false });

        nextCompletedTrips = (tripRows ?? []).map((trip) => ({
          tripId: String(trip.trip_id),
          title: String(trip.title ?? "Trip"),
          timing: trip.dates
            ? String(trip.dates)
            : formatMonthYear(trip.end_date ? String(trip.end_date) : null),
          location: String(trip.location ?? "Location TBA"),
          summary: String(
            trip.summary ?? "A completed Sakina expedition from your journey."
          ),
          image: String(trip.banner_image ?? "/default-trip-banner.jpg"),
        }));
      }

      if (isMounted) {
        setCompletedTripCards(nextCompletedTrips);
      }

      if (authedUserId) {
        const { data: roleProfile } = await supabase
          .from("profiles")
          .select("Capacity")
          .eq("id", authedUserId)
          .single();
        const role = roleProfile?.Capacity?.toLowerCase?.() ?? "";
        const isAdmin = role === "admin" || role === "founder";
        setCanEditCapacity(isAdmin);
        setCanEdit(isOwner || isAdmin);
      } else {
        setCanEditCapacity(false);
        setCanEdit(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileLoaded) {
      return;
    }

    if (searchParams.get("edit") === "1") {
      queueMicrotask(() => {
        setDraftAbout(about);
        setDraftFirstName(firstName);
        setDraftLastName(lastName);
        setDraftMiddleInitial(middleInitial);
        setDraftCapacity(capacity);
        setDraftImageUrl(profileImageUrl);
        setIsEditing(true);
        setShowProfileReminder(true);
      });
    }
  }, [
    about,
    capacity,
    firstName,
    lastName,
    middleInitial,
    profileImageUrl,
    profileLoaded,
    searchParams,
  ]);

  const cancelEditing = () => {
    setDraftAbout(about);
    setDraftFirstName(firstName);
    setDraftLastName(lastName);
    setDraftMiddleInitial(middleInitial);
    setDraftCapacity(capacity);
    setDraftImageUrl(profileImageUrl);
    setDraftImageFile(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    setDraftAbout(about);
    setDraftFirstName(firstName);
    setDraftLastName(lastName);
    setDraftMiddleInitial(middleInitial);
    setDraftCapacity(capacity);
    setDraftImageUrl(profileImageUrl);
    setIsEditing(true);
  };

  const saveEdits = () => {
    setSaveError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setSaveError("You must be logged in to update your profile.");
        return;
      }

      let nextAvatarUrl: string | null | undefined;
      if (draftImageFile) {
        const filePath = `${authData.user.id}/${draftImageFile.name}`;
        const previousUrl = profileImageUrl;

        if (previousUrl) {
          try {
            const url = new URL(previousUrl);
            const marker = "/storage/v1/object/public/profiles/";
            const index = url.pathname.indexOf(marker);
            const objectPath =
              index >= 0 ? url.pathname.slice(index + marker.length) : null;

            if (objectPath && objectPath !== filePath) {
              await supabase.storage.from("profiles").remove([objectPath]);
            }
          } catch {
            // Ignore malformed URLs and proceed with upload.
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(filePath, draftImageFile, { upsert: true });

        if (uploadError) {
          setSaveError(uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("profiles")
          .getPublicUrl(filePath);
        nextAvatarUrl = publicUrlData.publicUrl;
      } else if (draftImageUrl === null && profileImageUrl) {
        try {
          const url = new URL(profileImageUrl);
          const marker = "/storage/v1/object/public/profiles/";
          const index = url.pathname.indexOf(marker);
          const objectPath =
            index >= 0 ? url.pathname.slice(index + marker.length) : null;

          if (objectPath) {
            await supabase.storage.from("profiles").remove([objectPath]);
          }
        } catch {
          // Ignore malformed URLs and continue resetting the avatar field.
        }

        nextAvatarUrl = null;
      }

      const result = await updateProfileAction(profileId, {
        bio_text: draftAbout,
        name_first: draftFirstName,
        name_last: draftLastName || null,
        name_middle: draftMiddleInitial || null,
        avatar_url: nextAvatarUrl,
        Capacity: canEditCapacity ? draftCapacity : undefined,
      });

      if (result?.error) {
        setSaveError(result.error);
        return;
      }

      setAbout(draftAbout);
      setFirstName(draftFirstName);
      setLastName(draftLastName);
      setMiddleInitial(draftMiddleInitial);
      setCapacity(draftCapacity);
      setProfileImageUrl(nextAvatarUrl ?? draftImageUrl);
      setDraftImageFile(null);
      setIsEditing(false);
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextUrl = URL.createObjectURL(file);
    setDraftImageUrl(nextUrl);
    setDraftImageFile(file);
  };

  const handleResetProfileImage = () => {
    setDraftImageUrl(null);
    setDraftImageFile(null);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <main className="brand-shell px-6 md:px-10 lg:px-20">
      <AlertModal
        isOpen={showProfileReminder}
        onClose={() => setShowProfileReminder(false)}
        title="Complete your profile"
        message="Make sure to add your name and upload a profile picture!"
        confirmLabel="Got it"
        onConfirm={() => setShowProfileReminder(false)}
      />

      <div className="mx-auto max-w-7xl">
        <section className="mb-24 grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="font-inter mb-4 block text-xs font-semibold tracking-[0.28em] text-[var(--brand-moss)]">
              ACCOUNT OVERVIEW
            </span>
            <h1 className="font-headline text-5xl leading-[1.08] text-[var(--brand-ink)] md:text-7xl">
              Your Sakina <span className="italic">Profile</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5f625b]">
              Welcome back, {firstName || "traveler"}. Here you can manage your
              naturalist journey, reflect on past expeditions, and prepare for
              your next connection with the earth.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={saveEdits}
                    disabled={isSaving}
                    className="brand-button px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save edits"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="brand-button-secondary px-5 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : canEdit ? (
                <button
                  type="button"
                  onClick={() => startEditing()}
                  className="brand-button-secondary px-5 py-2.5 text-sm"
                >
                  Edit profile
                </button>
              ) : null}

              {canEdit ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="brand-button-secondary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end lg:col-span-5">
            <div className="relative">
              <div className="relative h-80 w-64 translate-x-4 rotate-3 overflow-hidden rounded-xl shadow-2xl">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt="Profile portrait"
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                ) : (
                  <div className="h-full w-full bg-[rgba(216,198,165,0.42)]" />
                )}
              </div>

              <div className="absolute -bottom-6 -left-6 flex items-center gap-4 rounded-xl bg-white p-6 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(185,240,184,0.5)] text-[var(--brand-moss)]">
                  ⛰
                </div>
                <div>
                  <div className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                    Role
                  </div>
                  <div className="font-headline text-lg text-[var(--brand-ink)]">
                    {capacity}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--brand-moss)] shadow-lg backdrop-blur"
                  >
                    Change photo
                  </button>
                  {canEditCapacity && (profileImageUrl || draftImageUrl) ? (
                    <button
                      type="button"
                      onClick={handleResetProfileImage}
                      className="absolute -right-4 top-[4.5rem] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#9a3f41] shadow-lg backdrop-blur"
                    >
                      Reset photo
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <section className="rounded-xl bg-[rgba(240,243,255,0.82)] p-8 md:col-span-1 lg:row-span-2">
            <div>
              <h3 className="font-headline text-2xl text-[var(--brand-ink)]">
                Personal Info
              </h3>
              <div className="mt-8 space-y-6">
                <div>
                  <label className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="mt-3 grid gap-3">
                      <input
                        value={draftFirstName}
                        onChange={(e) => setDraftFirstName(e.target.value)}
                        placeholder="First name"
                        className="brand-input px-4 py-3 text-sm"
                      />
                      <div className="grid grid-cols-[0.8fr,1.2fr] gap-3">
                        <input
                          value={draftMiddleInitial}
                          onChange={(e) => setDraftMiddleInitial(e.target.value)}
                          maxLength={1}
                          placeholder="M"
                          className="brand-input px-4 py-3 text-sm"
                        />
                        <input
                          value={draftLastName}
                          onChange={(e) => setDraftLastName(e.target.value)}
                          placeholder="Last name"
                          className="brand-input px-4 py-3 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-lg font-medium text-[var(--brand-ink)]">
                      {displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                    Email Address
                  </label>
                  <p className="mt-2 text-lg font-medium text-[var(--brand-ink)]">
                    {emailAddress}
                  </p>
                </div>

                <div>
                  <label className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                    Location
                  </label>
                  <p className="mt-2 text-lg font-medium text-[var(--brand-ink)]">
                    {locationLabel}
                  </p>
                </div>

                <div>
                  <label className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                    Capacity
                  </label>
                  {canEditCapacity && isEditing ? (
                    <select
                      value={draftCapacity}
                      onChange={(e) => setDraftCapacity(e.target.value)}
                      className="brand-input mt-3 px-4 py-3 text-sm"
                    >
                      <option value="Member">Member</option>
                      <option value="Spiritual Leader">Spiritual Leader</option>
                      <option value="Wilderness Leader">Wilderness Leader</option>
                      <option value="Founder">Founder</option>
                      <option value="Leader in Training">Leader in Training</option>
                      <option value="Guest Expert">Guest Expert</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <p className="mt-2 text-lg font-medium text-[var(--brand-ink)]">
                      {capacity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {canEdit ? (
              <button
                type="button"
                onClick={() => (isEditing ? saveEdits() : startEditing())}
                disabled={isSaving}
                className="mt-12 inline-flex items-center gap-2 font-semibold text-[var(--brand-moss)] transition-all hover:gap-3 disabled:opacity-70"
              >
                {isEditing ? "Save your profile" : "Edit profile"}
                <span>→</span>
              </button>
            ) : null}
          </section>

          <section className="relative overflow-hidden rounded-xl bg-white p-10 md:col-span-2 lg:col-span-3">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-headline text-2xl text-[var(--brand-ink)]">
                  About Me
                </h3>
                <span className="font-inter text-[11px] uppercase tracking-[0.22em] text-[#72796f]">
                  {isEditing ? "Editing" : "Journal tone"}
                </span>
              </div>

              {isEditing ? (
                <textarea
                  value={draftAbout}
                  onChange={(e) => setDraftAbout(e.target.value)}
                  rows={6}
                  className="brand-input mt-6 px-5 py-4 text-base"
                />
              ) : (
                <p className="mt-6 max-w-3xl font-headline text-2xl italic leading-relaxed text-[#5f625b]">
                  &ldquo;
                  {about || "Your story with Sakina is still unfolding."}
                  &rdquo;
                </p>
              )}

              {saveError ? (
                <p className="mt-4 text-sm text-red-600">{saveError}</p>
              ) : null}
            </div>

            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
              <Image
                src="/tripBanners/horseShoeBasin.jpeg"
                alt="Tree rings texture"
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
          </section>

          <section className="rounded-xl bg-[rgba(226,232,248,0.9)] p-8 md:col-span-2">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h3 className="font-headline text-2xl text-[var(--brand-ink)]">
                Badges Earned
              </h3>
              <span className="rounded-full bg-[rgba(55,104,59,0.1)] px-3 py-1 font-inter text-xs uppercase tracking-[0.18em] text-[var(--brand-moss)]">
                {earnedBadges.length} Total
              </span>
            </div>

            {earnedBadges.length ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                {earnedBadges.map((badge) => {
                  const tint = badge.color ?? "#37683b";
                  const hasIconImage = isRenderableImageSrc(badge.icon);
                  const hasMaterialSymbol =
                    !hasIconImage && isMaterialSymbolName(badge.icon);

                  return (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110"
                        style={{ color: tint }}
                      >
                        {hasIconImage ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Image
                              src={badge.icon as string}
                              alt={badge.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : hasMaterialSymbol ? (
                          <span className="material-symbols-outlined badge-icon-symbol">
                            {badge.icon}
                          </span>
                        ) : (
                          <span className="text-3xl">{fallbackGlyph(badge.category)}</span>
                        )}
                      </div>
                      <span className="font-inter text-[10px] uppercase tracking-[0.18em] text-[#414940]">
                        {badge.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#c1c9bd] bg-white/55 px-4 py-10 text-center text-sm text-[#72796f]">
                No badges earned yet.
              </div>
            )}
          </section>

          <section className="mt-8 md:col-span-3 lg:col-span-4">
            <h3 className="font-headline text-3xl text-[var(--brand-ink)]">
              Completed <span className="italic text-[var(--brand-moss)]">Trips</span>
            </h3>

            {completedTripCards.length ? (
              <div className="mt-10 space-y-6">
                {completedTripCards.map((trip) => (
                  <Link
                    key={trip.tripId}
                    href={`/trips/${trip.tripId}`}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-[rgba(240,243,255,0.78)] transition-all hover:bg-[rgba(226,232,248,0.92)] md:flex-row"
                  >
                    <div className="h-48 overflow-hidden md:h-auto md:w-64">
                      <Image
                        src={trip.image}
                        alt={trip.title}
                        width={320}
                        height={192}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-center p-8">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h4 className="font-headline text-2xl text-[var(--brand-ink)]">
                          {trip.title}
                        </h4>
                        <span className="rounded-full bg-[rgba(55,104,59,0.1)] px-3 py-1 font-inter text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-moss)]">
                          Completed
                        </span>
                      </div>
                      <div className="mb-4 flex flex-wrap items-center gap-6 text-sm text-[#5f625b]">
                        <span>{trip.timing}</span>
                        <span>{trip.location}</span>
                      </div>
                      <p className="text-sm text-[#5f625b]">{trip.summary}</p>
                    </div>
                    <div className="flex items-center justify-center border-l border-[rgba(114,121,111,0.12)] px-8 text-3xl text-[var(--brand-moss)]">
                      ›
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-xl border border-dashed border-[#c1c9bd] bg-white/55 px-4 py-10 text-center text-sm text-[#72796f]">
                No completed trips yet.
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="mt-24 bg-[rgba(244,239,230,0.92)] px-8 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="font-headline text-xl text-[var(--brand-moss)]">
            Sakina Wilderness
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm tracking-wide">
            <Link
              href="/about-us"
              className="text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]"
            >
              Sustainability
            </Link>
            <Link
              href="/about-us"
              className="text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]"
            >
              Ethical Travel
            </Link>
            <Link
              href="/media"
              className="text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]"
            >
              Contact Us
            </Link>
            <Link
              href="/about-us"
              className="text-[#6d665b] transition-colors hover:text-[var(--brand-moss)]"
            >
              Privacy
            </Link>
          </div>
          <div className="text-center text-xs text-[#6d665b] md:text-right">
            © 2026 Sakina Wilderness. Guided by spirit, rooted in earth.
          </div>
        </div>
      </footer>
    </main>
  );
}
