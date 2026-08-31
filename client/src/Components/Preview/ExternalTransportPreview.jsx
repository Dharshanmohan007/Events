import React, { Fragment } from "react";
import { User, Calendar, MapPin, AlignLeft, Flag } from "lucide-react";

function formatDate(date) {
  if (!date) return "--/--/----";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--/--/----";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-[#252C3F] rounded-xl px-5 py-4 w-full">
      {Icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-600/15 flex-shrink-0">
          <Icon size={16} className="text-purple-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] tracking-wide uppercase text-gray-400 mb-0.5 truncate">
          {label}
        </p>
        <p className="text-sm font-semibold text-white truncate">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function ExternalTransportPreview({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        // Fallback for ID if missing
        const entryKey = item.id || index;
        
        return (
          <div key={entryKey} className="bg-[#1C2133] rounded-2xl overflow-hidden border border-[#2D3348]">
            <div className="bg-[#212739] px-6 py-4 border-b border-[#2D3348]">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                External Transport Entry {index + 1}
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-medium ml-2">
                  {item.travelOption || "Unknown"}
                </span>
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBlock icon={Calendar} label="Travel Date" value={formatDate(item.travelDate)} />
                <InfoBlock icon={User} label="Passengers" value={item.totalPassengers} />
                <InfoBlock icon={MapPin} label="From" value={item.from} />
                <InfoBlock icon={Flag} label="To" value={item.to} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {item.travelOption === "Train" && (
                   <>
                     <InfoBlock icon={AlignLeft} label="Train Number" value={item.trainNumber} />
                     <InfoBlock icon={AlignLeft} label="Train Class" value={Array.isArray(item.classOrBerth) ? item.classOrBerth.join(", ") : item.classOrBerth} />
                   </>
                 )}
                 {item.travelOption === "Flight" && (
                   <>
                     <InfoBlock icon={AlignLeft} label="Flight Number" value={item.flightNumber} />
                     <InfoBlock icon={AlignLeft} label="Flight Class" value={item.classOrBerth} />
                   </>
                 )}
              </div>

              {item.passengers && item.passengers.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-4">Passenger Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.passengers.map((p, pIdx) => (
                      <div key={p.id || pIdx} className="bg-[#252C3F] border border-[#343C59] p-4 rounded-xl space-y-2">
                        <p className="text-sm font-semibold text-white truncate">{p.name || "-"}</p>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p><span className="text-gray-500">Phone:</span> {p.phone || "-"}</p>
                          <p><span className="text-gray-500">Email:</span> <span className="truncate inline-block max-w-[150px] align-bottom">{p.email || "-"}</span></p>
                          <p><span className="text-gray-500">Designation:</span> {p.designation || "-"}</p>
                          <p><span className="text-gray-500">Organization:</span> {p.organization || "-"}</p>
                          <p><span className="text-gray-500">Gender:</span> {p.gender || "-"} | <span className="text-gray-500">Age:</span> {p.age || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
