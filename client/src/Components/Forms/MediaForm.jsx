import React, { useState, useRef, useEffect } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";

const BASE_URL = 'https://sece-events.onrender.com';

const DISPLAY_OPTIONS = ["Flex", "A type Standee", "Website Banner", "TV Display", "Id Card", "Plug Card", "Momento Card", "Glass Sticker"];
const PRE_EVENT_OPTIONS = ["Coming Soon Video", "Promotional Video", "Invitation Video"];
const EVENT_COVERAGE_OPTIONS = ["Full Coverage", "Highlights", "Voice Over"];
const POST_EVENT_OPTIONS = ["Event Glimpse", "Post Event Video"];
const SPECIAL_VIDEO_OPTIONS = ["Chief Guest Event", "Testimonials"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const DESIGN_TYPE_OPTIONS = ["Poster", "Video", "Both"];

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ─── Build mediaRequirementDetails payload ────────────────────────────────────

function buildMediaPayload(mediaData) {
  const mediaRequirements = mediaData.map((day, dayIndex) => {
    const typeOfMedia = [];
    if (day.designType === "Poster" || day.designType === "Both") typeOfMedia.push("poster");
    if (day.designType === "Video" || day.designType === "Both") typeOfMedia.push("video");

    return {
      dayIndex,
      typeOfMedia,
      poster: {
        posterContent: day.poster?.contentPoster || "",
        certificateContent: day.poster?.contentCertificate || "",
        sizes: [
          ...(day.poster?.sizeForFlex ? [{ type: "Flex", value: day.poster.sizeForFlex }] : []),
          ...(day.poster?.sizeForGlass ? [{ type: "Glass Sticker", value: day.poster.sizeForGlass }] : []),
        ],
        referencePosterFiles: day.poster?.referencePoster ? [day.poster.referencePoster.name] : [],
        referenceCertificateFiles: day.poster?.referenceCertificate ? [day.poster.referenceCertificate.name] : [],
        displayNeeded: day.poster?.displayNeeded || [],
        deliveryDate: day.poster?.deliveryDate || "",
        priority: day.poster?.priority || "",
        specialRequirements: day.poster?.specialReq || "",
      },
      video: {
        videoContent: day.video?.contentVideo || "",
        preEventVideos: day.video?.preEvent || [],
        eventCoverage: day.video?.eventCoverage || [],
        postEventVideos: day.video?.postEvent || [],
        specialVideos: day.video?.specialVideos || [],
        referenceFiles: day.video?.referenceVideo ? [day.video.referenceVideo.name] : [],
        deliveryDate: day.video?.deliveryDate || "",
        priority: day.video?.priority || "",
        specialRequirements: day.video?.specialReq || "",
      },
    };
  });

  return { mediaRequirements };
}

function MultiSelectDropdown({ label, options, selected, onChange, error, labelBg = "#1E1E35" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item) => {
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);
  };

  const displayText = selected.length === 0 ? "" : selected.length <= 2 ? selected.join(" / ") : `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
        <div onClick={() => setOpen(!open)} className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"}`}>
          <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
            {displayText || "Select options..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div key={i} onClick={() => toggle(item)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"}`}>
                  <span>{item}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

function FileUpload({ label, value, onChange, labelBg = "#1E1E35" }) {
  const ref = useRef();
  const handleFile = (file) => { if (file) onChange(file); };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
        <div
          className="w-full bg-transparent border border-dashed border-[#3A3A5A] rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors duration-200 min-h-[56px]"
          onClick={() => ref.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        >
          <input ref={ref} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          {value ? (
            <span className="text-green-400 text-sm">📎 {value.name}</span>
          ) : (
            <span className="text-gray-500 text-sm">Drag and drop the files here or <span className="text-purple-400 underline cursor-pointer">choose file</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

function validatePoster(data) {
  const e = {};
  if (!data.contentPoster?.trim()) e.contentPoster = "Content for poster is required";
  if (!data.contentCertificate?.trim()) e.contentCertificate = "Content for certificate is required";
  if (!data.contentTrophy?.trim()) e.contentTrophy = "Content for trophy is required";
  if (!data.displayNeeded || data.displayNeeded.length === 0) e.displayNeeded = "Select at least one display option";
  if (data.displayNeeded?.includes("Flex") && !data.sizeForFlex?.trim()) e.sizeForFlex = "Size for Flex is required";
  if (data.displayNeeded?.includes("Glass Sticker") && !data.sizeForGlass?.trim()) e.sizeForGlass = "Size for Glass Sticker is required";
  if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
  if (!data.priority) e.priority = "Priority is required";
  return e;
}

function validateVideo(data) {
  const e = {};
  if (!data.contentVideo?.trim()) e.contentVideo = "Content for video is required";
  if (!data.preEvent || data.preEvent.length === 0) e.preEvent = "Select at least one option";
  if (!data.eventCoverage || data.eventCoverage.length === 0) e.eventCoverage = "Select at least one option";
  if (!data.postEvent || data.postEvent.length === 0) e.postEvent = "Select at least one option";
  if (!data.specialVideos || data.specialVideos.length === 0) e.specialVideos = "Select at least one option";
  if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
  if (!data.priority) e.priority = "Priority is required";
  return e;
}

function validateDay(data) {
  const e = {};
  if (!data.designType) { e.designType = "Please select a design type"; return e; }
  const showPoster = data.designType === "Poster" || data.designType === "Both";
  const showVideo = data.designType === "Video" || data.designType === "Both";
  if (showPoster) { const pe = validatePoster(data.poster || {}); if (Object.keys(pe).length > 0) e.poster = pe; }
  if (showVideo) { const ve = validateVideo(data.video || {}); if (Object.keys(ve).length > 0) e.video = ve; }
  return e;
}

function PosterSection({ data, onChange, errors = {} }) {
  const update = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const showFlex = data.displayNeeded?.includes("Flex");
  const showGlass = data.displayNeeded?.includes("Glass Sticker");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
        <h3 className="text-white text-base font-semibold">Poster</h3>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Poster *</span>
          <textarea value={data.contentPoster || ""} onChange={updateInput("contentPoster")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentPoster} />
      </div>

      <FileUpload label="Reference Poster (If any)" value={data.referencePoster} onChange={update("referencePoster")} />

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Certificate *</span>
          <textarea value={data.contentCertificate || ""} onChange={updateInput("contentCertificate")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentCertificate} />
      </div>

      <FileUpload label="Reference Certificate (If any)" value={data.referenceCertificate} onChange={update("referenceCertificate")} />

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Trophy *</span>
          <textarea value={data.contentTrophy || ""} onChange={updateInput("contentTrophy")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentTrophy} />
      </div>

      <div>
        <MultiSelectDropdown label="Display Needed *" options={DISPLAY_OPTIONS} selected={data.displayNeeded || []} onChange={update("displayNeeded")} error={errors.displayNeeded} />
      </div>

      {showFlex && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
          <CustomInput labelBg="#1a1a2e" label="Size for Flex *" value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
          <ErrorMsg msg={errors.sizeForFlex} />
        </div>
      )}

      {showGlass && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
          <CustomInput labelBg="#1a1a2e" label="Size for Glass Sticker *" value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
          <ErrorMsg msg={errors.sizeForGlass} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
          <ErrorMsg msg={errors.deliveryDate} />
        </div>
        <div>
          <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
          <ErrorMsg msg={errors.priority} />
        </div>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
          <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
        </div>
      </div>
    </div>
  );
}

function VideoSection({ data, onChange, errors = {} }) {
  const update = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
        <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        <h3 className="text-white text-base font-semibold">Video</h3>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Video *</span>
          <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentVideo} />
      </div>

      <div><MultiSelectDropdown label="Pre-Event Videos Needed *" options={PRE_EVENT_OPTIONS} selected={data.preEvent || []} onChange={update("preEvent")} error={errors.preEvent} /></div>
      <div><MultiSelectDropdown label="Event Coverage Needed *" options={EVENT_COVERAGE_OPTIONS} selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
      <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS} selected={data.postEvent || []} onChange={update("postEvent")} error={errors.postEvent} /></div>
      <div><MultiSelectDropdown label="Special Videos Needed *" options={SPECIAL_VIDEO_OPTIONS} selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

      <FileUpload label="Reference Video (If any)" value={data.referenceVideo} onChange={update("referenceVideo")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
          <ErrorMsg msg={errors.deliveryDate} />
        </div>
        <div>
          <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
          <ErrorMsg msg={errors.priority} />
        </div>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
          <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
        </div>
      </div>
    </div>
  );
}

function emptyDayData() {
  return {
    designType: "",
    poster: { contentPoster: "", referencePoster: null, contentCertificate: "", referenceCertificate: null, contentTrophy: "", displayNeeded: [], sizeForFlex: "", sizeForGlass: "", deliveryDate: "", priority: "", specialReq: "" },
    video: { contentVideo: "", preEvent: [], eventCoverage: [], postEvent: [], specialVideos: [], referenceVideo: null, deliveryDate: "", priority: "", specialReq: "" },
  };
}

export default function MediaForm({ nextStep, prevStep, eventDays = [], eventId }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [mediaData, setMediaData] = useState(() => eventDays.map(() => emptyDayData()));

  const currentDay = mediaData[currentDayIndex] || emptyDayData();
  const currentErrors = errors[currentDayIndex] || {};
  const showPoster = currentDay.designType === "Poster" || currentDay.designType === "Both";
  const showVideo = currentDay.designType === "Video" || currentDay.designType === "Both";
  const isLastDay = currentDayIndex === eventDays.length - 1;

  const updateDay = (patch) => {
    setMediaData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = { ...updated[currentDayIndex], ...patch };
      return updated;
    });
  };

  const handleDesignTypeChange = (val) => {
    updateDay({ designType: val });
    setErrors((prev) => {
      const copy = { ...prev };
      if (copy[currentDayIndex]) { const d = { ...copy[currentDayIndex] }; delete d.designType; copy[currentDayIndex] = d; }
      return copy;
    });
  };

  const handleNext = async () => {
    const dayErrors = validateDay(currentDay);
    const hasErrors = Object.keys(dayErrors).length > 0;
    setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
    if (hasErrors) return;

    const newCompleted = completedDays.includes(currentDayIndex)
      ? completedDays
      : [...completedDays, currentDayIndex];

    if (isLastDay) {
      // Save media details then auto-trigger submit
      setIsLoading(true);
      setApiError("");
      try {
        const payload = buildMediaPayload(mediaData);
        const formData = new FormData();
        formData.append('mediaRequirementDetails', JSON.stringify(payload));

        // Append files
        mediaData.forEach((day, dayIndex) => {
          if (day.poster?.referencePoster) {
            formData.append(`referencePoster_${dayIndex}`, day.poster.referencePoster);
          }
          if (day.poster?.referenceCertificate) {
            formData.append(`referenceCertificate_${dayIndex}`, day.poster.referenceCertificate);
          }
          if (day.video?.referenceVideo) {
            formData.append(`referenceVideo_${dayIndex}`, day.video.referenceVideo);
          }
        });

        const id = eventId || '';
        const saveRes = await fetch(`${BASE_URL}/api/events/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.message || `Server error: ${saveRes.status}`);

        setCompletedDays(newCompleted);
        nextStep(); // proceed to final submit step (or done page)
      } catch (err) {
        setApiError(err.message || "Failed to save media details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCompletedDays(newCompleted);
      setCurrentDayIndex((prev) => prev + 1);
    }
  };

  // ── Final Submit ────────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setApiError("");
    try {
      const id = eventId || '';
      const response = await fetch(`${BASE_URL}/api/events/${id}/submit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      setSubmitSuccess(true);
    } catch (err) {
      setApiError(err.message || "Failed to submit the event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentDayIndex > 0) setCurrentDayIndex((prev) => prev - 1);
    else prevStep();
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-full bg-green-600/20 border-2 border-green-500 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold">Event Submitted Successfully!</h2>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          Your event requisition has been submitted and is now pending HOD approval.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <DayTimeline days={eventDays} currentDayIndex={currentDayIndex} completedDays={completedDays} />

      <h2 className="text-white text-lg font-bold">
        Media Requirement Details – Day {currentDayIndex + 1}
      </h2>

      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6">
        <div>
          <CustomSelect labelBg="#1E1E35" label="Type of Design Required *" value={currentDay.designType || ""} onChange={handleDesignTypeChange} options={DESIGN_TYPE_OPTIONS} />
          <ErrorMsg msg={currentErrors.designType} />
        </div>
      </div>

      {showPoster && <PosterSection data={currentDay.poster || {}} onChange={(d) => updateDay({ poster: d })} errors={currentErrors.poster || {}} />}
      {showVideo && <VideoSection data={currentDay.video || {}} onChange={(d) => updateDay({ video: d })} errors={currentErrors.video || {}} />}

      <div className="flex justify-between pt-2">
        <button onClick={handleBack} className="border border-purple-600 px-6 py-2 rounded text-purple-600 hover:bg-purple-600/10 transition-colors">← Back</button>

        <div className="flex items-center gap-3">
          {/* Save & Next (or Save on last day) */}
          <button
            onClick={handleNext}
            disabled={isLoading || isSubmitting}
            className="bg-purple-600 px-6 py-2 rounded text-white hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving...
              </>
            ) : isLastDay ? "Save & Next →" : "Next Day →"}
          </button>

          {/* Final Submit — only shown on last day */}
          {isLastDay && (
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading || isSubmitting}
              className="bg-green-600 px-6 py-2 rounded text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </>
              ) : "Submit Event ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}