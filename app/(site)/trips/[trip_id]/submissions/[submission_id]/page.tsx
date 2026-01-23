import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/roles";
import { getTripApplicationById, isTripInstructor } from "@/lib/trips";

type Props = {
  params: Promise<{ trip_id: string; submission_id: string }>;
};

export default async function TripSubmissionDetailPage({ params }: Props) {
  const { trip_id: tripId, submission_id: submission_id } = await params;
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();


  if (authError || !authData.user) {
    redirect("/login");
  }

  const canView =
    (await isAdmin(authData.user.id)) ||
    (await isTripInstructor(tripId, authData.user.id));

  if (!canView) {
    redirect(`/trips/${tripId}`);
  }

  const application = await getTripApplicationById(tripId, submission_id);

  if (!application) {
    redirect(`/trips/${tripId}/submissions`);
  }

  const { data: camperProfiles } = await supabase
    .from("profiles")
    .select("id, name_first, name_last")
    .eq("id", application.camper_id);
  const camperName =
    camperProfiles?.[0]
      ? [camperProfiles[0].name_first, camperProfiles[0].name_last]
          .filter(Boolean)
          .join(" ")
      : application.camper_id;

  const formatLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  const sectionFields = {
    personal: [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "email",
      "phone",
      "address_line1",
      "city",
      "state",
      "zip",
      "backpacking_experience",
      "heard_about_course",
      "interest_in_course",
      "leaders_should_know",
      "preparation_plan",
      "questions_or_concerns",
    ],
    medical: [
      "respiratory_problems",
      "diabetes",
      "hepatitis_liver_disease",
      "seizures",
      "urinary_reproductive_disorders",
      "cardiac_history",
      "systemic_allergies",
      "other_recent_surgeries",
      "gi_issues",
      "bleeding_disorders",
      "dizziness_fainting",
      "mental_health_recent",
      "orthopedic_history",
      "frostbite_or_altitude_history",
      "heat_stroke_history",
      "swimming_ability",
      "medical_history_details",
      "dietary_restrictions",
      "dietary_details",
      "current_medications",
      "medication_history",
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      "emergency_contact_phone_backup",
    ],
    rentals: ["needs_rental_gear"],
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
            APPLICATION
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Submission Details
          </h1>
          <p className="mt-2 text-gray-600">
            Review the full application for this camper.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Camper: {camperName}
              </p>
              <p className="text-xs text-gray-500">
                Submitted {new Date(application.created_at).toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {application.paid ? "Paid" : "Unpaid"}
            </span>
          </div>

          <div className="mt-5 space-y-6">
            {[
              { id: "personal", title: "Personal Info" },
              { id: "medical", title: "Medical Info" },
              { id: "rentals", title: "Rentals" },
            ].map((section) => {
              const keys = sectionFields[section.id as keyof typeof sectionFields];
              const entries = keys
                .map((key) => [key, application.submission?.[key] ?? ""] as const)
                .filter(([, value]) => value !== "");

              return (
                <div key={section.id}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h3>
                  {entries.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {entries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                            {formatLabel(key)}
                          </p>
                          <p className="mt-2 text-sm text-gray-900">
                            {value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No responses in this section.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
