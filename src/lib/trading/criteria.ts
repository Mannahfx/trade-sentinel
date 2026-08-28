import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_ENTRY_TRIGGERS,
  DEFAULT_GRADES,
  DEFAULT_INSTRUMENTS,
  DEFAULT_MISTAKE_TAGS,
  DEFAULT_TIMEFRAMES,
  DEFAULT_ZONE_TYPES,
} from "./types";

export type Criteria = {
  instruments: string[];
  zoneTypes: string[];
  timeframes: string[];
  entryTriggers: string[];
  grades: string[];
  mistakeTags: string[];
};

export const CRITERIA_LABELS: Record<keyof Criteria, string> = {
  instruments: "Instruments",
  zoneTypes: "Zone types",
  timeframes: "Timeframes",
  entryTriggers: "Entry triggers",
  grades: "Quality grades",
  mistakeTags: "Mistake tags",
};

export function defaultCriteria(): Criteria {
  return {
    instruments: [...DEFAULT_INSTRUMENTS],
    zoneTypes: [...DEFAULT_ZONE_TYPES],
    timeframes: [...DEFAULT_TIMEFRAMES],
    entryTriggers: [...DEFAULT_ENTRY_TRIGGERS],
    grades: [...DEFAULT_GRADES],
    mistakeTags: [...DEFAULT_MISTAKE_TAGS],
  };
}

const KEY = "td.criteria.v1";

export function useCriteria() {
  const [criteria, setCriteria] = useState<Criteria>(() => defaultCriteria());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Criteria>;
        setCriteria({ ...defaultCriteria(), ...parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const save = useCallback((next: Criteria) => {
    setCriteria(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => save(defaultCriteria()), [save]);

  return { criteria, save, reset };
}

/** Keeps a selected value valid when its option list changes. */
export function firstOr(list: string[], current: string, fallback = "") {
  if (list.includes(current)) return current;
  return list[0] ?? fallback;
}
