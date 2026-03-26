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
      className={`brand-card-soft rounded-[1.75rem] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(67,49,31,0.14)] ${className ?? ""}`}
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
                className="brand-input mt-2 px-4 py-3 text-sm"
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                required={field.required}
                defaultValue={field.defaultValue as string | undefined}
                className="brand-input mt-2 px-4 py-3 text-sm"
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
                className="brand-input mt-2 px-4 py-3 text-sm"
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
          className="brand-button w-full rounded-xl px-4 py-3 text-sm"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
