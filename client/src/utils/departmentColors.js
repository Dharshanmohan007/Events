// Keep this in sync with backend/controllers/calendarController.js

export const DEPARTMENTS = [
  {
    name: "CCE",
    key: "purple",
    dot: "bg-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "MECH",
    key: "cyan",
    dot: "bg-cyan-500",
    gradient: "from-cyan-400 to-sky-600",
  },
  {
    name: "AIML",
    key: "orange",
    dot: "bg-orange-500",
    gradient: "from-orange-400 to-amber-600",
  },
  {
    name: "CSE",
    key: "teal",
    dot: "bg-teal-500",
    gradient: "from-teal-400 to-emerald-600",
  },
  {
    name: "ECE",
    key: "green",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    name: "EEE",
    key: "blue",
    dot: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "AI&DS",
    key: "red",
    dot: "bg-red-500",
    gradient: "from-red-500 to-rose-600",
  },
  {
    name: "CFRD",
    key: "pink",
    dot: "bg-pink-500",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "IQAC",
    key: "indigo",
    dot: "bg-indigo-500",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "MATHS",
    key: "amber",
    dot: "bg-amber-500",
    gradient: "from-amber-400 to-yellow-600",
  },
  {
    name: "S&H",
    key: "lime",
    dot: "bg-lime-500",
    gradient: "from-lime-400 to-green-500",
  },
  {
    name: "IR",
    key: "sky",
    dot: "bg-sky-500",
    gradient: "from-sky-400 to-blue-500",
  },
  {
    name: "CSBS",
    key: "emerald",
    dot: "bg-green-500",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    name: "IT",
    key: "rose",
    dot: "bg-rose-500",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    name: "CYS",
    key: "fuchsia",
    dot: "bg-fuchsia-500",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    name: "PLACEMENT",
    key: "violet",
    dot: "bg-violet-600",
    gradient: "from-violet-600 to-indigo-700",
  },
  {
    name: "PD",
    key: "yellow",
    dot: "bg-yellow-500",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "INNOVATION",
    key: "stone",
    dot: "bg-olive-700",
    gradient: "from-olive-500 to-olive-600",
  },
  {
    name: "COE",
    key: "slate",
    dot: "bg-slate-500",
    gradient: "from-slate-500 to-slate-700",
  },
  {
    name: "HR",
    key: "zinc",
    dot: "bg-mauve-700",
    gradient: "from-mauve-500 to-mauve-700",
  },
];

const FALLBACK = {
  key: "slate",
  dot: "bg-slate-500",
  gradient: "from-slate-500 to-slate-700",
};

const byKey = Object.fromEntries(DEPARTMENTS.map((d) => [d.key, d]));

export function gradientForColorKey(colorKey) {
  return (byKey[colorKey] || FALLBACK).gradient;
}