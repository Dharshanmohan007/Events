import React, { useState } from "react";
import { FileText } from "lucide-react";
import EventHeaderData from "../../Dashboards/EventHeaderData";

const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : String(value);
const EMPTY_AUDIOS = [];

const RequirementCard = ({ title, children }) => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
      <FileText size={17} />
      {title}
    </div>
    {children}
  </section>
);

const KeyValueList = ({ items }) => (
  <div>
    {items.map(([label, value]) => (
      <div
        key={label}
        className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0"
      >
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-medium text-[#E6E2F0]">{value}</span>
      </div>
    ))}
  </div>
);

const FacultyAudioDetailsPanel = ({
  audioDetails,
  eventData,
  eventSchedule = [],
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const audios = audioDetails?.audios ?? EMPTY_AUDIOS;
  const dayCount = Math.max(
    eventSchedule.length,
    ...audios.map((audio) => Number(audio.dayIndex) + 1),
    1,
  );
  const selectedDay = Math.min(activeDay, dayCount - 1);
  const dayAudios = audios.filter(
    (audio) => Number(audio.dayIndex) === selectedDay,
  );

  if (!audioDetails)
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No audio details are available.
      </p>
    );

  return (
    <div className="space-y-5">
      <EventHeaderData data={eventData?.requestDetails} />
      {dayCount > 1 && (
        <nav
          className="flex border-b border-[#374155]"
          aria-label="Audio event days"
        >
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${selectedDay === index ? "border-[#8B3DFF] text-[#9F68FF]" : "border-transparent text-[#CBC3D7]/75 hover:text-white"}`}
            >
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}

      {dayAudios.map((audio, index) => (
        <section
          key={`${audio.venueName}-${index}`}
          className="rounded-lg border border-[#374155] bg-[#232A3C] p-5"
        >
          <h3 className="text-lg font-medium text-[#8F5BFF]">
            {displayValue(audio.venueName)}
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <RequirementCard title="Object Requirement">
              <KeyValueList
                items={(audio.audioItems || []).map((item) => [
                  item.type || "Requirement",
                  displayValue(item.quantity),
                ])}
              />
            </RequirementCard>

            <RequirementCard title="Special Requirement">
              <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
                {displayValue(audio.specialRequirements)}
              </p>
            </RequirementCard>
          </div>
        </section>
      ))}

      {!dayAudios.length && (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">
          No audio requirements were submitted for Day {selectedDay + 1}.
        </p>
      )}
    </div>
  );
};

export default FacultyAudioDetailsPanel;
