"use client";

import { useState } from "react";
import CustomDropdown from "./dropdown";

type StatusFieldProps = {
  name: string;
  defaultValue: "open" | "waitlist" | "full" | "closed";
};

export default function StatusField({ name, defaultValue }: StatusFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <CustomDropdown
        label="Status"
        options={[
          { label: "Open", value: "open" },
          { label: "Waitlist", value: "waitlist" },
          { label: "Full", value: "full" },
          { label: "Closed", value: "closed" },
        ]}
        value={value}
        onChange={setValue}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
