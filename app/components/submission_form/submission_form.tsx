"use client";

import type { FormEvent } from "react";

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "file";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string | number;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
};

type SubmissionFormProps = {
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
};

export default function SubmissionForm({
  title,
  description,
  fields,
  submitLabel = "Submit",
  onSubmit,
  className,
}: SubmissionFormProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${className ?? ""}`}
    >
      {title ? (
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {fields.map((field) => (
          <label key={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue as string | undefined}
                rows={5}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                required={field.required}
                defaultValue={field.defaultValue as string | undefined}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <option value="" disabled>
                  {field.placeholder ?? "Select an option"}
                </option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue as string | number | undefined}
                min={field.min}
                max={field.max}
                step={field.step}
                accept={field.accept}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            )}
            {field.helperText ? (
              <span className="mt-2 block text-xs text-gray-500">
                {field.helperText}
              </span>
            ) : null}
          </label>
        ))}

        <button
          type="submit"
          className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
