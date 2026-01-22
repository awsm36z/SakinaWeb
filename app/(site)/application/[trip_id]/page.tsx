"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SubmissionForm, {
  type FormField,
} from "@/app/components/submission_form/submission_form";
import { submitTripApplication } from "./actions";

type Section = {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
};

const applicationForm: { version: number; sections: Section[] } = {
  version: 1,
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Basic info and background for this course application.",
      fields: [
        { name: "first_name", label: "First Name", type: "text", required: true },
        { name: "last_name", label: "Last Name", type: "text", required: true },
        {
          name: "date_of_birth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          placeholder: "Select gender",
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Prefer not to say", value: "na" },
          ],
        },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "text", required: true },
        { name: "address_line1", label: "Address", type: "text", required: true },
        { name: "city", label: "City", type: "text", required: true },
        { name: "state", label: "State", type: "text", required: true },
        { name: "zip", label: "Zip Code", type: "text", required: true },
        {
          name: "backpacking_experience",
          label: "Backpacking Experience (1–5)",
          type: "number",
          required: true,
          min: 1,
          max: 5,
          helperText:
            "How much backpacking experience do you have? 1 = first time, 5 = very experienced.",
        },
        {
          name: "heard_about_course",
          label: "How did you hear about this course?",
          type: "textarea",
          required: true,
        },
        {
          name: "interest_in_course",
          label: "Why are you interested in participating in this course?",
          type: "textarea",
          required: true,
        },
        {
          name: "leaders_should_know",
          label: "Is there anything important for your course leaders to know about you?",
          type: "textarea",
          required: false,
        },
        {
          name: "preparation_plan",
          label: "How do you plan on preparing for this course?",
          type: "textarea",
          required: true,
        },
        {
          name: "questions_or_concerns",
          label: "Do you have any questions or concerns about the course?",
          type: "textarea",
          required: false,
        },
      ],
    },
    {
      id: "medical",
      title: "Medical & Health Information",
      description: "This information helps us keep you safe during the trip.",
      fields: [
        {
          name: "respiratory_problems",
          label: "Respiratory problems or asthma?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "diabetes",
          label: "Diabetes?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "hepatitis_liver_disease",
          label: "Hepatitis or other liver disease?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "seizures",
          label: "Seizures or epilepsy?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "urinary_reproductive_disorders",
          label: "Disorders of the urinary or reproductive tract?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "cardiac_history",
          label: "Any history of cardiac illness or significant risk factors?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "systemic_allergies",
          label:
            "History of systemic allergic reactions (insects, bees/wasps, drugs, foods, etc.)?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "other_recent_surgeries",
          label: "Any surgeries in the past 2 years not mentioned above?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "gi_issues",
          label: "Gastrointestinal disturbances?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "bleeding_disorders",
          label: "Bleeding or blood disorders?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "dizziness_fainting",
          label: "Dizziness or fainting episodes?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "mental_health_recent",
          label:
            "Recent mental health condition (last 2 years) or under care of a mental health professional?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "orthopedic_history",
          label:
            "History of knee, hip, ankle, shoulder, arm or back injuries/operations?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "frostbite_or_altitude_history",
          label: "History of frostbite or acute mountain sickness?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "heat_stroke_history",
          label: "History of heat stroke or other heat-related illness?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "swimming_ability",
          label: "Swimming Ability",
          type: "select",
          required: true,
          options: [
            { label: "Non-swimmer", value: "non_swimmer" },
            { label: "Recreational", value: "recreational" },
            { label: "Competitive", value: "competitive" },
          ],
        },
        {
          name: "medical_history_details",
          label:
            "Medical history details (please explain any 'Yes' answers above)",
          type: "textarea",
          required: false,
        },
        {
          name: "dietary_restrictions",
          label: "Do you have any dietary restrictions or allergies?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "dietary_details",
          label: "If yes, please describe your dietary restrictions or allergies.",
          type: "textarea",
          required: false,
        },
        {
          name: "current_medications",
          label:
            "Are you currently taking, or have you been prescribed, any medications in the past two years?",
          type: "select",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        {
          name: "medication_history",
          label:
            "Medication history (name, condition, dosage, frequency, side effects)",
          type: "textarea",
          required: false,
        },
        {
          name: "emergency_contact_name",
          label: "Emergency contact full name",
          type: "text",
          required: true,
        },
        {
          name: "emergency_contact_relationship",
          label: "Relationship to participant",
          type: "text",
          required: true,
        },
        {
          name: "emergency_contact_phone",
          label: "Emergency contact phone number",
          type: "text",
          required: true,
        },
        {
          name: "emergency_contact_phone_backup",
          label: "Backup phone number",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: "rentals",
      title: "Rentals",
      description: "Let us know if you need gear from us.",
      fields: [
        {
          name: "needs_rental_gear",
          label: "Would you like rental gear?",
          type: "select",
          required: true,
          options: [
            {
              label:
                "Yes, I would like a backpack, sleeping bag, and/or sleeping pad for an additional fee.",
              value: "yes",
            },
            {
              label:
                "No, I have the required gear already or will be purchasing it myself.",
              value: "no",
            },
          ],
        },
      ],
    },
  ],
};

export default function ApplicationPage() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const params = useParams();
  const sections = applicationForm.sections;
  const currentSection = sections[step];
  const totalSteps = sections.length;
  const tripId = String(params.trip_id ?? "");
  const fieldsWithDefaults = useMemo(() => {
    return currentSection.fields.map((field) => ({
      ...field,
      defaultValue:
        responses[field.name] ??
        (field.defaultValue !== undefined ? field.defaultValue : undefined),
    }));
  }, [currentSection.fields, responses]);

  const progressLabel = useMemo(() => {
    return `Step ${step + 1} of ${totalSteps}`;
  }, [step, totalSteps]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-10 lg:px-20 py-12">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-green-700">
            APPLICATION
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Course Application
          </h1>
          <p className="mt-2 text-gray-600">
            Please complete all sections below. Your responses help us build a
            safe and meaningful experience.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-green-700">
            {progressLabel}
          </p>
        </header>

        <SubmissionForm
          title={currentSection.title}
          description={currentSection.description}
          fields={fieldsWithDefaults}
          submitLabel={step === totalSteps - 1 ? "Submit application" : "Continue"}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const nextResponses: Record<string, string> = {};

            for (const [key, value] of formData.entries()) {
              if (typeof value === "string") {
                nextResponses[key] = value;
              }
            }

            setResponses((prev) => ({ ...prev, ...nextResponses }));

            if (step < totalSteps - 1) {
              setStep((prev) => prev + 1);
              return;
            }

            const finalPayload = { ...responses, ...nextResponses };
            setIsSubmitting(true);
            setSubmitError(null);

            const submit = async () => {
              const { error } = await submitTripApplication(tripId, finalPayload);

              if (error) {
                setSubmitError(error);
                setIsSubmitting(false);
                return;
              }

              setIsSubmitting(false);
              console.log("Application submitted.");
            };

            submit();
          }}
        />

        {submitError ? (
          <p className="text-sm text-red-600 text-center">{submitError}</p>
        ) : null}

        {isSubmitting ? (
          <p className="text-sm text-gray-500 text-center">
            Submitting your application...
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
          <div className="text-xs text-gray-500">
            {currentSection.title}
          </div>
        </div>
      </div>
    </main>
  );
}
