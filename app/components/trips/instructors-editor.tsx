"use client";

import { useMemo, useState } from "react";
import CustomDropdown, {
  type DropdownOption,
} from "@/app/components/dropdown/dropdown";

type InstructorOption = DropdownOption & {
  avatar_url?: string | null;
  capacity?: string | null;
};

type Assignment = {
  instructor_id: string;
  instructor_role: string | null;
};

type Props = {
  options: InstructorOption[];
  initialAssignments: Assignment[];
};

const roleOptions: DropdownOption[] = [
  { label: "Trip Lead", value: "Trip Lead" },
  { label: "Assistant Trip Lead", value: "Assistant Trip Lead" },
  { label: "Spiritual Guide", value: "Spiritual Guide" },
  { label: "Guest Expert", value: "Guest Expert" },
];

export default function InstructorsEditor({ options, initialAssignments }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments
  );

  const optionMap = useMemo(() => {
    return new Map(options.map((option) => [option.value, option]));
  }, [options]);

  const addInstructor = (id: string) => {
    if (!id) return;
    if (assignments.some((item) => item.instructor_id === id)) {
      return;
    }
    setAssignments((prev) => [
      ...prev,
      { instructor_id: id, instructor_role: null },
    ]);
  };

  const updateRole = (id: string, role: string) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.instructor_id === id
          ? { ...item, instructor_role: role }
          : item
      )
    );
  };

  const removeInstructor = (id: string) => {
    setAssignments((prev) =>
      prev.filter((item) => item.instructor_id !== id)
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Trip Instructors
      </h2>

      <CustomDropdown
        label="Add instructor"
        options={options}
        onChange={addInstructor}
        placeholder="Search instructors..."
      />

      <div className="mt-6 space-y-4">
        {assignments.length ? (
          assignments.map((assignment) => {
            const option = optionMap.get(assignment.instructor_id);
            const name = option?.label ?? "Instructor";
            return (
              <div
                key={assignment.instructor_id}
                className="group relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-200" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    {option?.capacity ? (
                      <p className="text-xs text-gray-600">{option.capacity}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 sm:max-w-xs">
                  <CustomDropdown
                    label="Role"
                    options={roleOptions}
                    value={assignment.instructor_role ?? ""}
                    onChange={(value) => updateRole(assignment.instructor_id, value)}
                    placeholder="Select role"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeInstructor(assignment.instructor_id)}
                  className="absolute right-3 top-3 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600 opacity-0 transition group-hover:opacity-100"
                >
                  ×
                </button>

                <input
                  type="hidden"
                  name="instructor_ids"
                  value={assignment.instructor_id}
                />
                <input
                  type="hidden"
                  name="instructor_roles"
                  value={assignment.instructor_role ?? ""}
                />
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No instructors added yet.</p>
        )}
      </div>
    </div>
  );
}
