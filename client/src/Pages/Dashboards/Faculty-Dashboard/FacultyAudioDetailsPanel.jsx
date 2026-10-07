import React, { useMemo, useState } from "react";
import { FileText, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import EventHeaderData from "../../Dashboards/EventHeaderData";
import Modal from "../../../Components/Modal";
import audioStaffData from "../../../data/audioStaffData";
import { useAuth } from "../../../Components/AuthContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const EMPTY_AUDIOS = [];

const RequirementCard = ({ title, children, className = "" }) => (
  <section className={`rounded-lg border border-[#374155] bg-[#232A3B] p-5 ${className}`}>
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

const getAllocatedStaff = (audio) =>
  audio.allocatedStaff ||
  audio.staffAllocation?.staff ||
  (audio.staff?.name ? audio.staff : null);

const normalizeStaff = (staff) =>
  staff
    ? {
        name: staff.name || staff.NAME || "",
        email: staff.email || staff["MAIL ID"] || "",
        phone: String(staff.phone || staff["PH NO"] || ""),
        empId: staff.empId || staff["STAFF ID"] || "",
        designation: staff.designation || staff.DESIG || "",
      }
    : null;

const AudioVenueCard = ({ audio, dayIndex, allocationId }) => {
  const { user } = useAuth();
  const canAllocate = user?.role?.toLowerCase() === "head" && user?.department?.toLowerCase() === "audio";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(() =>
    normalizeStaff(getAllocatedStaff(audio))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allocatedStaff = selectedStaff || normalizeStaff(getAllocatedStaff(audio));
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredStaff = useMemo(() => {
    if (!normalizedSearchTerm) return [];
    const matched = audioStaffData.filter(
      (s) =>
        s.NAME.toLowerCase().includes(normalizedSearchTerm) ||
        s["MAIL ID"].toLowerCase().includes(normalizedSearchTerm) ||
        s["STAFF ID"].toLowerCase().includes(normalizedSearchTerm)
    );
    return matched.filter(
      (s, i, arr) =>
        i ===
        arr.findIndex(
          (c) =>
            c.NAME === s.NAME &&
            c["MAIL ID"] === s["MAIL ID"] &&
            c["STAFF ID"] === s["STAFF ID"]
        )
    );
  }, [normalizedSearchTerm]);

  const openModal = () => {
    setSearchTerm("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    if (!allocationId) {
      toast.error("Unable to identify this event for staff allocation");
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/audio-staff-allocation/${allocationId}/allocate-audio-staff`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            venueName: audio.venueName,
            dayIndex,
            staff: selectedStaff,
          }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Failed to allocate staff");
      setIsModalOpen(false);
      toast.success("Audio staff allocated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to allocate staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const audioItemRows = (audio.audioItems || []).map((item) => [
    item.type || "Requirement",
    displayValue(item.quantity),
  ]);

  const flagRows = [
    audio.isEbRequired !== undefined && ["EB Required", audio.isEbRequired ? "Yes" : "No"],
    audio.noOfSystems !== undefined && ["No. of Systems", displayValue(audio.noOfSystems)],
    audio.ledWallRequired !== undefined && [
      "LED Wall Required",
      audio.ledWallRequired ? "Yes" : "No",
    ],
    audio.acRequired !== undefined && ["AC Required", audio.acRequired ? "Yes" : "No"],
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-5 items-center">
          <h3 className="text-lg font-medium text-[#8F5BFF]">{displayValue(audio.venueName)}</h3>
          {allocatedStaff && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
              Allocated
            </span>
          )}
        </div>
        {canAllocate && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openModal}
              className="rounded-md border border-[#59647d] px-3 py-2 text-sm text-white transition hover:border-[#8F5BFF] hover:text-[#D0BCFF]"
            >
              {allocatedStaff ? "Edit Allocated Staff" : "Allocate Staff"}
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Audio Staff">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor={`audio-staff-search-${dayIndex}-${audio.venueName}`}
              className="mb-2 block text-sm text-[#CBC3D7]"
            >
              Search staff
            </label>
            <div className="flex items-center rounded-md border border-[#39445d] bg-[#10182a] px-3 focus-within:border-[#8F5BFF]">
              <Search size={16} className="text-[#CBC3D7]/70" />
              <input
                id={`audio-staff-search-${dayIndex}-${audio.venueName}`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedStaff(null);
                }}
                placeholder="Search by name, email, or staff ID"
                className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-[#CBC3D7]/45"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStaff(null);
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} className="text-[#CBC3D7]/70" />
                </button>
              )}
            </div>
            {normalizedSearchTerm && (
              <div className="mt-1 max-h-48 overflow-auto rounded-md border border-[#39445d] bg-[#182237]">
                {filteredStaff.length ? (
                  filteredStaff.map((s) => (
                    <button
                      type="button"
                      key={s["STAFF ID"]}
                      onClick={() => {
                        setSelectedStaff(normalizeStaff(s));
                        setSearchTerm(s.NAME);
                      }}
                      className="block w-full border-b border-[#39445d]/60 px-3 py-2 text-left last:border-b-0 hover:bg-[#263452]"
                    >
                      <span className="block text-sm text-white">{s.NAME}</span>
                      <span className="block text-xs text-[#CBC3D7]/70">
                        {s["MAIL ID"]} | {s["STAFF ID"]}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-sm text-[#CBC3D7]/70">No staff found.</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-md border border-[#39445d] bg-[#10182a] p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-[#CBC3D7]/60">Chosen staff</p>
            {selectedStaff ? (
              <div className="space-y-1 text-sm text-[#E6E2F0]">
                <p className="font-medium text-white">{selectedStaff.name}</p>
                <p>{selectedStaff.email}</p>
                <p>{selectedStaff.phone}</p>
                <p>
                  {selectedStaff.designation} | {selectedStaff.empId}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#CBC3D7]/70">
                Choose a staff member from the search results.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-md border border-[#59647d] px-4 py-2 text-sm text-[#E6E2F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStaff || isSubmitting}
              className="rounded-md bg-[#8F5BFF] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : allocatedStaff ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.75fr_1.2fr]">
        <RequirementCard
          title="Audio Items"
          className={allocatedStaff ? "lg:row-span-2" : ""}
        >
          {audioItemRows.length ? (
            <KeyValueList items={audioItemRows} />
          ) : (
            <p className="text-sm text-[#CBC3D7]/75">-</p>
          )}
        </RequirementCard>

        <RequirementCard
          title="Setup Flags"
          className={allocatedStaff ? "lg:row-span-2" : ""}
        >
          {flagRows.length ? (
            <KeyValueList items={flagRows} />
          ) : (
            <p className="text-sm text-[#CBC3D7]/75">-</p>
          )}
        </RequirementCard>

        {allocatedStaff ? (
          <RequirementCard title="Allocated Staff" className="lg:col-start-3">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              <div>
                <p className="text-xs text-[#CBC3D7]/65">Name</p>
                <p className="mt-1 text-sm font-medium text-[#E6E2F0]">
                  {displayValue(allocatedStaff.name)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#CBC3D7]/65">Employee ID / Designation</p>
                <p className="mt-1 text-sm font-medium text-[#E6E2F0]">
                  {displayValue(allocatedStaff.empId)} / {displayValue(allocatedStaff.designation)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#CBC3D7]/65">Email</p>
                <p className="mt-1 wrap-break-word text-sm font-medium text-[#E6E2F0]">
                  {displayValue(allocatedStaff.email)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#CBC3D7]/65">Phone</p>
                <p className="mt-1 text-sm font-medium text-[#E6E2F0]">
                  {displayValue(allocatedStaff.phone)}
                </p>
              </div>
            </div>
          </RequirementCard>
        ) : null}

        <RequirementCard title="Special Requirement">
          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
            {displayValue(audio.specialRequirements)}
          </p>
        </RequirementCard>
      </div>

      {audio.otherRequirements ? (
        <RequirementCard title="Other Requirements">
          <p className="text-sm leading-7 text-[#E6E2F0]">
            {displayValue(audio.otherRequirements)}
          </p>
        </RequirementCard>
      ) : null}
    </div>
  );
};

const FacultyAudioDetailsPanel = ({
  audioDetails,
  eventData,
  eventSchedule = [],
  allocationId,
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const audios = audioDetails?.audios ?? EMPTY_AUDIOS;

  if (!audioDetails)
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No audio details are available.
      </p>
    );

  const dayCount = Math.max(
    eventSchedule.length,
    ...audios.map((audio) => Number(audio.dayIndex) + 1),
    1,
  );
  const selectedDay = Math.min(activeDay, dayCount - 1);
  const dayAudios = audios.filter((audio) => Number(audio.dayIndex) === selectedDay);

  return (
    <div className="space-y-5">
      <EventHeaderData data={eventData?.requestDetails} />

      {dayCount > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="Audio event days">
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${
                selectedDay === index
                  ? "border-[#8B3DFF] text-[#9F68FF]"
                  : "border-transparent text-[#CBC3D7]/75 hover:text-white"
              }`}
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
          <AudioVenueCard audio={audio} dayIndex={selectedDay} allocationId={allocationId} />
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

