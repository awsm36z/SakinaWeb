import { FormField } from "../components/submission_form/submission_form";

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
                "Yes, I would like to rent a backpack, sleeping bag, and sleeping pad for an additional fee. (+$150)",
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

export default applicationForm;