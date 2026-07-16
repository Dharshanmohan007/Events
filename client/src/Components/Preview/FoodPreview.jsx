import React, { useState } from "react";
import { Calendar, Users, UtensilsCrossed, User, ClipboardList } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MEAL_KEYS = ["Breakfast", "Lunch", "Dinner"];

// ── Small presentational pieces ──────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-purple-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-white break-words">
          {value === "" || value === undefined || value === null ? "—" : value}
        </p>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs">
      {children}
    </span>
  );
}

function MealCard({ title, data }) {
  const rows = [
    { label: "Veg — Participants", value: data?.vegParticipants },
    { label: "Veg — Guest/VIP", value: data?.vegGuest },
    { label: "Non-Veg — Participants", value: data?.nonVegParticipants },
    { label: "Non-Veg — Guest/VIP", value: data?.nonVegGuest },
  ];
  return (
    <div className="bg-[#2a2a4a] border border-[#3b3b66] rounded-2xl p-5">
      <h4 className="text-purple-400 font-semibold text-sm mb-4">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs text-gray-400">{r.label}</p>
            <p className="text-sm text-white mt-0.5">
              {r.value === "" || r.value === undefined || r.value === null ? "0" : r.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffCard({ staff, index }) {
  return (
    <div className="bg-[#2a2a4a] border border-[#3b3b66] rounded-xl p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300 text-xs font-semibold flex-shrink-0">
        {index + 1}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-white truncate">{staff?.name || "—"}</p>
        <p className="text-xs text-gray-400">
          {staff?.mobile || staff?.mobileNumber || "—"}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#1f1f38] border border-[#32325a] rounded-2xl p-8 text-center">
      <p className="text-gray-400 text-sm">No food and refreshment details added.</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function FoodPreview({ foodData = [] }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!Array.isArray(foodData) || foodData.length === 0) {
    return <EmptyState />;
  }

  // Guard against an out-of-range index if data shrinks
  const safeIndex = Math.min(activeDay, foodData.length - 1);
  const day = foodData[safeIndex] || {};

  // FoodAndRefreshments.jsx stores an array of individual staff objects
  // ({ name, mobile }) under `staffList`. Form.jsx's default shape instead
  // has single `staffName` / `mobileNumber` fields — support both.
  const staffList =
    day.staffList && day.staffList.length > 0
      ? day.staffList
      : day.staffName
      ? [{ name: day.staffName, mobile: day.mobileNumber }]
      : [];

  const foodTypes = day.foodTypes || [];
  const mealTypes = MEAL_KEYS.filter((m) => foodTypes.includes(m));

  return (
    <div className="w-full">
      {/* ── Day Tabs ── */}
      {foodData.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {foodData.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDay(idx)}
              className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                safeIndex === idx
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-transparent border-[#3A3A5A] text-gray-300 hover:border-purple-500 hover:text-white"
              }`}
            >
              Day {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="bg-[#1f1f38] border border-[#32325a] rounded-2xl p-5 space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoRow icon={Calendar} label="Date" value={formatDate(day.date)} />
          <InfoRow
            icon={Users}
            label="Type of Resource Person"
            value={(day.resourcePersonType || []).join(", ")}
          />
          <InfoRow
            icon={Users}
            label="Total number of Resource Persons"
            value={day.resourcePersons}
          />
          <InfoRow
            icon={Users}
            label="Total number of Internal Accompanying Persons"
            value={day.internalCount}
          />
        </div>

        {/* Staff */}
        {staffList.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
              <User size={14} className="text-purple-400" /> Accompanying Staff
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffList.map((s, i) => (
                <StaffCard key={i} staff={s} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Food types */}
        <div>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
            <UtensilsCrossed size={14} className="text-purple-400" /> Food Type
          </p>
          <div className="flex flex-wrap gap-2">
            {foodTypes.length > 0 ? (
              foodTypes.map((t, i) => <Chip key={i}>{t}</Chip>)
            ) : (
              <span className="text-sm text-gray-500">—</span>
            )}
          </div>
        </div>

        {/* Meal breakdown — only shows meals actually selected in foodTypes */}
        {mealTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealTypes.map((meal) => (
              <MealCard key={meal} title={meal} data={day[meal.toLowerCase()]} />
            ))}
          </div>
        )}

        {/* Special requirements */}
        <div>
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
            <ClipboardList size={14} className="text-purple-400" /> Special Requirements
          </p>
          <div className="bg-[#2a2a4a] border border-[#3b3b66] rounded-xl p-4">
            <p className="text-sm text-white whitespace-pre-wrap">
              {day.specialRequirements?.trim() ? day.specialRequirements : "None"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}