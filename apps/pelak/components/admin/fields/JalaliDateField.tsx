"use client";

import {
  parseJalaliInput,
  todayIsoIran,
} from "@nextgen-cms/core/platform/datetime";
import dayjs from "dayjs";
import jalaliday from "jalaliday";
import { useMemo, useState } from "react";

dayjs.extend(jalaliday);

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

type JalaliDateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  /** Anchor for form feedback scroll (`data-field`). Defaults to `id`. */
  fieldKey?: string;
};

function isoToJalaliParts(iso: string) {
  const source = iso?.slice(0, 10) || todayIsoIran();
  const d = dayjs(source).calendar("jalali");
  return {
    year: d.year(),
    month: d.month() + 1,
    day: d.date(),
  };
}

function jalaliPartsToIso(year: number, month: number, day: number) {
  return parseJalaliInput(`${year}/${month}/${day}`);
}

export function JalaliDateField({
  id,
  label,
  value,
  onChange,
  required,
  fieldKey,
}: JalaliDateFieldProps) {
  const initial = useMemo(() => isoToJalaliParts(value), [value]);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  const years = useMemo(() => {
    const current = dayjs().calendar("jalali").year();
    return Array.from({ length: 20 }, (_, i) => current - 10 + i);
  }, []);

  function updateParts(nextYear: number, nextMonth: number, nextDay: number) {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
    try {
      onChange(jalaliPartsToIso(nextYear, nextMonth, nextDay));
    } catch {
      // invalid combo — keep UI state
    }
  }

  return (
    <div className="space-y-1.5" data-field={fieldKey ?? id}>
      <label
        htmlFor={`${id}-year`}
        className="block text-sm font-medium text-ink"
      >
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          id={`${id}-year`}
          value={year}
          onChange={(e) => updateParts(Number(e.target.value), month, day)}
          className="rounded border border-rule bg-paper px-2 py-2 text-sm text-ink"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => updateParts(year, Number(e.target.value), day)}
          className="rounded border border-rule bg-paper px-2 py-2 text-sm text-ink"
        >
          {PERSIAN_MONTHS.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={day}
          onChange={(e) => updateParts(year, month, Number(e.target.value))}
          className="rounded border border-rule bg-paper px-2 py-2 text-sm text-ink"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
