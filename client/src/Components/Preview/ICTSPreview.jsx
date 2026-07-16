// import React,{useMemo} from "react";
// import { ClipboardList, PackageCheck, FileText } from "lucide-react";

// // ── Small presentational helpers ────────────────────────────────────────────

// function InfoRow({ label, value }) {
//   if (value === undefined || value === null || value === "") return null;
//   return (
//     <div className="flex items-center justify-between py-2 border-b border-[#2A2A45] last:border-b-0">
//       <span className="text-gray-400 text-sm">{label}</span>
//       <span className="text-white text-sm font-semibold">{value}</span>
//     </div>
//   );
// }

// function SectionCard({ icon, title, children, className = "" }) {
//   return (
//     <div className={`rounded-xl border border-[#2A2A45] bg-[#1E1E35] p-5 flex flex-col gap-1 ${className}`}>
//       <div className="flex items-center gap-2 mb-2">
//         {icon}
//         <h4 className="text-white text-sm font-semibold">{title}</h4>
//       </div>
//       <div className="flex flex-col">{children}</div>
//     </div>
//   );
// }

// // ── Main component ───────────────────────────────────────────────────────────

// export default function ICTSPreview({ ictsData = {}, venueData = [], eventDays = [] }) {
//   // Flatten ictsData (dayIndex -> venueName -> card) into a display-friendly list,
//   // ordered by day, then by the venue order from venueData when available.
//   const cards = useMemo(() => {
//     const result = [];

//     Object.entries(ictsData || {})
//         .sort(([a], [b]) => Number(a) - Number(b))
//         .forEach(([dayIndexStr, venues]) => {
//         const dayIndex = Number(dayIndexStr);

//         const orderedVenueNames =
//             venueData?.[dayIndex]?.selectedVenues?.length > 0
//             ? venueData[dayIndex].selectedVenues
//             : Object.keys(venues || {});

//         orderedVenueNames.forEach((venueName) => {
//             const card = venues?.[venueName];

//             if (card) {
//             result.push({
//                 dayIndex,
//                 venueName,
//                 card,
//             });
//             }
//         });
//         });

//     return result;
//     }, [ictsData, venueData]);

//   if (cards.length === 0) {
//     return (
//       <div className="flex flex-col gap-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-purple-400 text-xl font-bold">ICTS Details</h2>
//         </div>
//         <div className="rounded-xl border border-[#2A2A45] bg-[#1E1E35] p-6 text-center">
//           <p className="text-gray-400 text-sm">No ICTS details have been added yet.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       {/* ── Header ── */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h2 className="text-purple-400 text-xl font-bold">ICTS Details</h2>
//         </div>
//       </div>

//       {/* ── One block per (day, venue) ── */}
//       {cards.map(({ dayIndex, venueName, card }) => {
//         const equipmentRequired = card.equipmentRequired || [];
//         const hasDesktop = equipmentRequired.includes("Desktop");
//         const hasLaptop  = equipmentRequired.includes("Laptop");

//         return (
//           <div key={`${dayIndex}-${venueName}`} className="flex flex-col gap-3">
//             {eventDays?.length > 0 && (
//               <div className="flex items-center gap-2">
//                 <span className="text-purple-400 font-semibold text-sm">
//                   Day {dayIndex + 1} — {venueName}
//                 </span>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Basic Requirement */}
//               <SectionCard icon={<ClipboardList size={16} className="text-purple-400" />} title="Basic Requirement">
//                 <InfoRow label="Desktop" value={hasDesktop ? "Yes" : "No"} />
//                 {hasDesktop && <InfoRow label="Desktop Count" value={card.desktopCount || 0} />}
//                 <InfoRow label="Laptop" value={hasLaptop ? "Yes" : "No"} />
//                 {hasLaptop && <InfoRow label="Laptop Count" value={card.laptopCount || 0} />}
//                 <InfoRow label="Internet Facility" value={card.internetFacility || "-"} />
//                 <InfoRow label="Expected Internet Users" value={card.expectedInternetUsers ?? 0} />
//                 {card.proctorUsers !== undefined && card.proctorUsers !== "" && (
//                   <InfoRow label="Proctoring Users" value={card.proctorUsers} />
//                 )}
//                 <InfoRow label="Guest Wi-Fi Needed" value={card.guestWifi || "-"} />
//                 {card.guestWifi === "Yes" && (
//                   <InfoRow label="If Guest Wi-Fi Exceeds 5" value={card.guestWifiExceed5 || "-"} />
//                 )}
//                 {card.guestWifiExceed5 === "Yes" && (
//                   <InfoRow label="Total Number of Guest WIFI Count" value={card.totalGuestCount ?? 0} />
//                 )}
//               </SectionCard>

//               {/* Object Requirement */}
//               <SectionCard icon={<PackageCheck size={16} className="text-purple-400" />} title="Object Requirement">
//                 {(card.requirements || []).length === 0 ? (
//                   <p className="text-gray-500 text-sm py-1">No requirements selected.</p>
//                 ) : (
//                   <div className="flex flex-col gap-2 py-1">
//                     {card.requirements.map((req, i) => (
//                       <span key={i} className="text-white text-sm font-semibold">
//                         {req}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//                 {card.others && (
//                   <div className="mt-2 pt-2 border-t border-[#2A2A45]">
//                     <span className="text-gray-400 text-xs">Others</span>
//                     <p className="text-white text-sm mt-1">{card.others}</p>
//                   </div>
//                 )}
//               </SectionCard>
//             </div>

//             {/* Special Requirement */}
//             {card.specialRequirements && (
//               <SectionCard icon={<FileText size={16} className="text-purple-400" />} title="Special Requirement">
//                 <p className="text-gray-300 text-sm leading-relaxed">{card.specialRequirements}</p>
//               </SectionCard>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }


import React, { useState, useMemo } from "react";
import { ClipboardList, PackageCheck, FileText } from "lucide-react";

// ── Small presentational helpers ────────────────────────────────────────────

function InfoRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#2A2A45] last:border-b-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  );
}

function SectionCard({ icon, title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[#2A2A45] bg-[#1E1E35] p-5 flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-white text-sm font-semibold">{title}</h4>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ICTSPreview({ ictsData = {}, venueData = [], eventDays = [] }) {
  const [activeDay, setActiveDay] = useState(0);

  // Group cards by dayIndex -> [{ venueName, card }]
  const cardsByDay = useMemo(() => {
    const grouped = {};

    Object.entries(ictsData || {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([dayIndexStr, venues]) => {
        const dayIndex = Number(dayIndexStr);

        const orderedVenueNames =
          venueData?.[dayIndex]?.selectedVenues?.length > 0
            ? venueData[dayIndex].selectedVenues
            : Object.keys(venues || {});

        const dayCards = [];
        orderedVenueNames.forEach((venueName) => {
          const card = venues?.[venueName];
          if (card) dayCards.push({ venueName, card });
        });

        if (dayCards.length > 0) grouped[dayIndex] = dayCards;
      });

    return grouped;
  }, [ictsData, venueData]);

  // Total number of day tabs — prefer venueData length (mirrors VenuePreview),
  // fall back to the day indices actually present in ictsData.
  const dayCount =
    venueData?.length > 0
      ? venueData.length
      : Object.keys(cardsByDay).length > 0
      ? Math.max(...Object.keys(cardsByDay).map(Number)) + 1
      : 0;

  const dayIndices = Array.from({ length: dayCount }, (_, i) => i);
  const activeCards = cardsByDay[activeDay] || [];

  if (dayCount === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-purple-400 text-xl font-bold">ICTS Details</h2>
        </div>
        <div className="rounded-xl border border-[#2A2A45] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">No ICTS details have been added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-purple-400 text-xl font-bold">ICTS Details</h2>
        </div>
      </div>

      {/* ── Day tabs ── */}
      {dayCount > 1 && (
        <div className="flex items-center gap-6 border-b border-[#2A2A45]">
          {dayIndices.map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDay(idx)}
              className={`relative pb-2 text-sm font-medium transition-colors ${
                activeDay === idx ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Day {idx + 1}
              {activeDay === idx && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-purple-500 rounded" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Venue blocks for the active day ── */}
      {activeCards.length === 0 ? (
        <div className="rounded-xl border border-[#2A2A45] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">No ICTS details for this day.</p>
        </div>
      ) : (
        activeCards.map(({ venueName, card }) => {
          const equipmentRequired = card.equipmentRequired || [];
          const hasDesktop = equipmentRequired.includes("Desktop");
          const hasLaptop = equipmentRequired.includes("Laptop");

          return (
            <div key={`${activeDay}-${venueName}`} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-semibold text-sm">{venueName}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Requirement */}
                <SectionCard icon={<ClipboardList size={16} className="text-purple-400" />} title="Basic Requirement">
                  <InfoRow label="Desktop" value={hasDesktop ? "Yes" : "No"} />
                  {hasDesktop && <InfoRow label="Desktop Count" value={card.desktopCount || 0} />}
                  <InfoRow label="Laptop" value={hasLaptop ? "Yes" : "No"} />
                  {hasLaptop && <InfoRow label="Laptop Count" value={card.laptopCount || 0} />}
                  <InfoRow label="Internet Facility" value={card.internetFacility || "-"} />
                  <InfoRow label="Expected Internet Users" value={card.expectedInternetUsers ?? 0} />
                  {card.proctorUsers !== undefined && card.proctorUsers !== "" && (
                    <InfoRow label="Proctoring Users" value={card.proctorUsers} />
                  )}
                  <InfoRow label="Guest Wi-Fi Needed" value={card.guestWifi || "-"} />
                  {card.guestWifi === "Yes" && (
                    <InfoRow label="If Guest Wi-Fi Exceeds 5" value={card.guestWifiExceed5 || "-"} />
                  )}
                  {card.guestWifiExceed5 === "Yes" && (
                    <InfoRow label="Total Number of Guest WIFI Count" value={card.totalGuestCount ?? 0} />
                  )}
                </SectionCard>

                {/* Object Requirement */}
                <SectionCard icon={<PackageCheck size={16} className="text-purple-400" />} title="Object Requirement">
                  {(card.requirements || []).length === 0 ? (
                    <p className="text-gray-500 text-sm py-1">No requirements selected.</p>
                  ) : (
                    <div className="flex flex-col gap-2 py-1">
                      {card.requirements.map((req, i) => (
                        <span key={i} className="text-white text-sm font-semibold">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                  {card.others && (
                    <div className="mt-2 pt-2 border-t border-[#2A2A45]">
                      <span className="text-gray-400 text-xs">Others</span>
                      <p className="text-white text-sm mt-1">{card.others}</p>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Special Requirement */}
              {card.specialRequirements && (
                <SectionCard icon={<FileText size={16} className="text-purple-400" />} title="Special Requirement">
                  <p className="text-gray-300 text-sm leading-relaxed">{card.specialRequirements}</p>
                </SectionCard>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}