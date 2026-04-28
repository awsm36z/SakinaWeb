"use client";

import { useMemo, useState } from "react";

export type BadgeOption = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

type Props = {
  options: BadgeOption[];
  initialBadgeIds: string[];
};

export default function BadgesOfferedEditor({
  options,
  initialBadgeIds,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialBadgeIds)
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((badge) =>
      badge.name.toLowerCase().includes(q) ||
      (badge.description?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <fieldset className="brand-subtle-block rounded-xl px-4 py-3">
      <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-moss)]">
        Badges offered
      </legend>
      <p className="mt-1 text-xs text-gray-500">
        Pick the badges attendees can earn for this trip. Mentioned in the
        confirmation email so guests are nudged to create a Sakina account
        and track their progress.
      </p>

      {/* Hidden inputs that the parent <form> action will receive. */}
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="badge_offered_ids" value={id} />
      ))}

      {options.length > 6 ? (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search badges…"
          className="brand-input mt-3 px-3 py-2 text-sm"
        />
      ) : null}

      {options.length === 0 ? (
        <p className="mt-3 text-xs text-gray-500">
          No badges have been created yet. Add some from the admin
          dashboard.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((badge) => {
            const isSelected = selected.has(badge.id);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => toggle(badge.id)}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-[var(--brand-moss)] bg-[rgba(47,93,80,0.08)]"
                    : "border-gray-200 bg-white hover:border-[var(--brand-moss)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[var(--brand-moss)] bg-[var(--brand-moss)]"
                      : "border-gray-300"
                  }`}
                  aria-hidden
                >
                  {isSelected ? (
                    <span className="text-[11px] text-white">✓</span>
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-900">
                    {badge.name}
                  </span>
                  {badge.description ? (
                    <span className="block text-xs text-gray-500 line-clamp-2">
                      {badge.description}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
