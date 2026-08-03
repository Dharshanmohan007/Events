// Lightweight date helpers — no external date library required.

export const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const DAY_LABELS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(d) {
  return isSameDay(d, new Date());
}

export function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function addMonths(d, n) {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + n);
  return copy;
}

// Returns array of 7 Dates, Sunday -> Saturday, for the week containing `d`.
export function getWeekDays(d) {
  const start = startOfDay(d);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Returns a 6x7 grid of Dates covering the full month view (including
// leading/trailing days from adjacent months).
export function getMonthGrid(d) {
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function formatMonthYear(d) {
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

// "09:00 AM" -> minutes since midnight
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = String(timeStr).trim().match(/(\d+):(\d+)\s*([AaPp][Mm])?/);
  if (!match) return 0;
  let [, h, m, ampm] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (ampm) {
    const isPM = ampm.toLowerCase() === "pm";
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
  }
  return h * 60 + m;
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime) return "";
  return endTime ? `${startTime} - ${endTime}` : startTime;
}

// Hourly slot labels for the day/week grid, e.g. 08:00 -> 18:00
export function getHourSlots(startHour = 8, endHour = 18) {
  const slots = [];
  for (let h = startHour; h <= endHour; h += 1) {
    const period = h < 12 ? "AM" : "PM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    slots.push({ hour: h, label: `${String(hour12).padStart(2, "0")}:00 ${period}` });
  }
  return slots;
}

export function toISODate(d) {
  const copy = new Date(d);
  const offset = copy.getTimezoneOffset();
  const local = new Date(copy.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
