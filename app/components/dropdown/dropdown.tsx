"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  className,
}: DropdownProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalValue, setInternalValue] = useState<string | null>(null);

  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue) ?? null;

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return options;
    }
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(trimmed)
    );
  }, [options, query]);

  useEffect(() => {
    setQuery(selectedOption?.label ?? "");
  }, [selectedOption?.label]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    setInternalValue(option.value);
    onChange?.(option.value);
    setQuery(option.label);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={className}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
          {label}
        </p>
      ) : null}
      <div className="relative mt-2">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <button
          type="button"
          aria-label="Toggle options"
          onClick={() => setIsOpen((open) => !open)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 disabled:cursor-not-allowed"
        >
          <span className={`text-lg transition ${isOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {isOpen ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {filteredOptions.length ? (
              <ul className="max-h-56 overflow-y-auto py-1 text-sm text-gray-700">
                {filteredOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No matches found.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
