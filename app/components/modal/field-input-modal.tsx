"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/modal/modal";

export type FieldInputConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "password" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
};

type FieldInputModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  fields: FieldInputConfig[];
  confirmLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
};

export default function FieldInputModal({
  isOpen,
  onClose,
  title = "Add details",
  description,
  fields,
  confirmLabel = "Confirm",
  onSubmit,
}: FieldInputModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const initialValues = fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {});
    setValues(initialValues);
  }, [fields, isOpen]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {description ? (
        <p className="text-sm text-gray-600">{description}</p>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className={description ? "mt-4 space-y-4" : "space-y-4"}
      >
        {fields.map((field) => (
          <label key={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => handleChange(field.name, event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => handleChange(field.name, event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            )}
          </label>
        ))}

        <button
          type="submit"
          className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 transition"
        >
          {confirmLabel}
        </button>
      </form>
    </Modal>
  );
}
