"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "./actions";

const badges = ["Trail Ready", "Community Builder", "Prayer Leader"];
const completedTrips = ["Goat Rocks Weekend", "Alpine Lakes Reflection", "Olympic Coast Trek"];

export default function AccountPage() {
  const [about, setAbout] = useState(
    "Outdoor enthusiast who loves grounding trips with reflection and community."
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [capacity] = useState("Member");
  const [isEditing, setIsEditing] = useState(false);
  const [draftAbout, setDraftAbout] = useState(about);
  const [draftFirstName, setDraftFirstName] = useState(firstName);
  const [draftLastName, setDraftLastName] = useState(lastName);
  const [draftMiddleInitial, setDraftMiddleInitial] = useState(middleInitial);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [draftImageUrl, setDraftImageUrl] = useState(profileImageUrl);
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user || !isMounted) {
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (error || !data || !isMounted) {
        return;
      }

      setFirstName(data.name_first || "");
      setLastName(data.name_last || "");
      setMiddleInitial(data.name_middle || "");
      setAbout(data.bio_text || "");
      setProfileImageUrl(data.avatar_url || null);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const startEditing = () => {
    setDraftAbout(about);
    setDraftFirstName(firstName);
    setDraftLastName(lastName);
    setDraftMiddleInitial(middleInitial);
    setDraftImageUrl(profileImageUrl);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftAbout(about);
    setDraftFirstName(firstName);
    setDraftLastName(lastName);
    setDraftMiddleInitial(middleInitial);
    setDraftImageUrl(profileImageUrl);
    setDraftImageFile(null);
    setIsEditing(false);
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
              index >= 0
                ? url.pathname.slice(index + marker.length)
                : null;

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
      }

      const result = await updateProfileAction({
        bio_text: draftAbout,
        name_first: draftFirstName,
        name_last: draftLastName || null,
        name_middle: draftMiddleInitial || null,
        avatar_url: nextAvatarUrl,
      });
      if (result?.error) {
        setSaveError(result.error);
        return;
      }

      setAbout(draftAbout);
      setFirstName(draftFirstName);
      setLastName(draftLastName);
      setMiddleInitial(draftMiddleInitial);
      if (nextAvatarUrl) {
        setProfileImageUrl(nextAvatarUrl);
      } else {
        setProfileImageUrl(draftImageUrl);
      }
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
              MY ACCOUNT
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              Your Sakina profile
            </h1>
            <p className="mt-2 text-gray-600">
              Keep your profile fresh and track your journey with the community.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={saveEdits}
                  disabled={isSaving}
                  className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save edits"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Edit profile
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.7fr,1.3fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
                {(isEditing ? draftImageUrl : profileImageUrl) ? (
                  <Image
                    src={(isEditing ? draftImageUrl : profileImageUrl) as string}
                    alt="Profile portrait"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {firstName} {middleInitial ? `${middleInitial}. ` : ""}{lastName}
                </h2>
                <p className="text-sm text-gray-600">Welcome back to Sakina.</p>
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
                      className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      Change photo
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                    First name
                  </p>
                  {isEditing ? (
                    <input
                      value={draftFirstName}
                      onChange={(e) => setDraftFirstName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                    />
                  ) : (
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {firstName}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                    Middle initial
                  </p>
                  {isEditing ? (
                    <input
                      value={draftMiddleInitial}
                      onChange={(e) => setDraftMiddleInitial(e.target.value)}
                      maxLength={1}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                    />
                  ) : (
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {middleInitial || "—"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                    Last name
                  </p>
                  {isEditing ? (
                    <input
                      value={draftLastName}
                      onChange={(e) => setDraftLastName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                    />
                  ) : (
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Capacity
                </p>
                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{capacity}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Capacity is managed by admins.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  Active member in good standing
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">About me</h2>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Editable
                </span>
              </div>
              {isEditing ? (
                <textarea
                  value={draftAbout}
                  onChange={(e) => setDraftAbout(e.target.value)}
                  rows={5}
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              ) : (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {about}
                </p>
              )}
              {saveError ? (
                <p className="mt-3 text-sm text-red-600">{saveError}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges</h2>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-500">
                Under construction
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Completed trips
              </h2>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm font-medium text-gray-500">
                Under construction
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
