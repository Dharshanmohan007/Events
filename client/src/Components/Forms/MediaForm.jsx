// import React, { useState, useRef, useEffect, useCallback } from "react";
// import CustomInput from "../CustomInput";
// import CustomSelect from "../CustomSelect";
// import { DayTimeline } from "./VenueForm";

// const DISPLAY_OPTIONS = ["Flex", "A type Standee", "Website Banner", "TV Display", "Id Card", "Plug Card", "Momento Card", "Glass Sticker"];
// const PRE_EVENT_OPTIONS = ["Coming Soon Video", "Promotional Video", "Invitation Video"];
// const EVENT_COVERAGE_OPTIONS = ["Full Coverage", "Highlights", "Voice Over"];
// const POST_EVENT_OPTIONS = ["Event Glimpse", "Post Event Video"];
// const SPECIAL_VIDEO_OPTIONS = ["Chief Guest Event", "Testimonials"];
// const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
// const DESIGN_TYPE_OPTIONS = ["Poster", "Video", "Both"];

// const ErrorMsg = ({ msg }) =>
//   msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// // ─── Build mediaRequirementDetails payload ────────────────────────────────────

// function buildMediaPayload(mediaData) {
//   const mediaRequirements = mediaData.map((day, dayIndex) => {
//     const typeOfMedia = [];
//     if (day.designType === "Poster" || day.designType === "Both") typeOfMedia.push("poster");
//     if (day.designType === "Video" || day.designType === "Both") typeOfMedia.push("video");

//     // Build sizes array: each display option that has a size value
//     const sizes = [];
//     if (day.poster?.displayNeeded?.includes("Flex") && day.poster?.sizeForFlex?.trim()) {
//       sizes.push({ type: "Flex", value: day.poster.sizeForFlex.trim() });
//     }
//     if (day.poster?.displayNeeded?.includes("Glass Sticker") && day.poster?.sizeForGlass?.trim()) {
//       sizes.push({ type: "Glass Sticker", value: day.poster.sizeForGlass.trim() });
//     }

//     return {
//       dayIndex,
//       typeOfMedia,
//       poster: {
//         posterContent: day.poster?.contentPoster || "",
//         // Files are sent separately via FormData; keep arrays empty here
//         referencePosterFiles: [],
//         certificateContent: day.poster?.contentCertificate || "",
//         referenceCertificateFiles: [],
//         trophyContent: day.poster?.contentTrophy || "",
//         displayNeeded: day.poster?.displayNeeded || [],
//         sizes,
//         deliveryDate: day.poster?.deliveryDate
//           ? new Date(day.poster.deliveryDate).toISOString()
//           : "",
//         priority: day.poster?.priority || "",
//         specialRequirements: day.poster?.specialReq || "",
//       },
//       video: {
//         videoContent: day.video?.contentVideo || "",
//         preEventVideos: day.video?.preEvent || [],
//         eventCoverage: day.video?.eventCoverage || [],
//         postEventVideos: day.video?.postEvent || [],
//         specialVideos: day.video?.specialVideos || [],
//         // Files are sent separately via FormData; keep array empty here
//         referenceFiles: [],
//         deliveryDate: day.video?.deliveryDate
//           ? new Date(day.video.deliveryDate).toISOString()
//           : "",
//         priority: day.video?.priority || "",
//         specialRequirements: day.video?.specialReq || "",
//       },
//     };
//   });

//   return { mediaRequirements };
// }

// // ─── Build files payload for FormData ────────────────────────────────────────
// // Returns a flat object of { fieldKey: File } to be appended to FormData by Form.jsx

// export function buildMediaFiles(mediaData) {
//   const files = {};
//   mediaData.forEach((day) => {
//     if (day.poster?.referencePoster) {
//       files["referencePosterFiles"] = day.poster.referencePoster;
//     }
//     if (day.poster?.referenceCertificate) {
//       files["referenceCertificateFiles"] = day.poster.referenceCertificate;
//     }
//     if (day.video?.referenceVideo) {
//       files["referenceFiles"] = day.video.referenceVideo;
//     }
//   });
//   return files;
// }

// export { buildMediaPayload };

// function MultiSelectDropdown({ label, options, selected, onChange, error, labelBg = "#1E1E35" }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const toggle = (item) => {
//     onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);
//   };

//   const displayText = selected.length === 0 ? "" : selected.length <= 2 ? selected.join(" / ") : `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

//   return (
//     <div className="w-full" ref={ref}>
//       <div className="relative w-full">
//         <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
//         <div onClick={() => setOpen(!open)} className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"}`}>
//           <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
//             {displayText || "Select options..."}
//           </span>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
//             <polyline points="6 9 12 15 18 9" />
//           </svg>
//         </div>
//         {open && (
//           <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
//             {options.map((item, i) => {
//               const isSelected = selected.includes(item);
//               return (
//                 <div key={i} onClick={() => toggle(item)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"}`}>
//                   <span>{item}</span>
//                   {isSelected && (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//                       <polyline points="20 6 9 17 4 12" />
//                     </svg>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//       <ErrorMsg msg={error} />
//     </div>
//   );
// }

// function FileUpload({ label, value, onChange, labelBg = "#1E1E35" }) {
//   const ref = useRef();
//   const handleFile = (file) => { if (file) onChange(file); };

//   return (
//     <div className="w-full">
//       <div className="relative w-full">
//         <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
//         <div
//           className="w-full bg-transparent border border-dashed border-[#3A3A5A] rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors duration-200 min-h-[56px]"
//           onClick={() => ref.current.click()}
//           onDragOver={(e) => e.preventDefault()}
//           onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
//         >
//           <input ref={ref} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
//           {value ? (
//             <span className="text-green-400 text-sm">📎 {value.name}</span>
//           ) : (
//             <span className="text-gray-500 text-sm">Drag and drop the files here or <span className="text-purple-400 underline cursor-pointer">choose file</span></span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function validatePoster(data) {
//   const e = {};
//   if (!data.contentPoster?.trim()) e.contentPoster = "Content for poster is required";
//   if (!data.contentCertificate?.trim()) e.contentCertificate = "Content for certificate is required";
//   if (!data.contentTrophy?.trim()) e.contentTrophy = "Content for trophy is required";
//   if (!data.displayNeeded || data.displayNeeded.length === 0) e.displayNeeded = "Select at least one display option";
//   if (data.displayNeeded?.includes("Flex") && !data.sizeForFlex?.trim()) e.sizeForFlex = "Size for Flex is required";
//   if (data.displayNeeded?.includes("Glass Sticker") && !data.sizeForGlass?.trim()) e.sizeForGlass = "Size for Glass Sticker is required";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority) e.priority = "Priority is required";
//   return e;
// }

// function validateVideo(data) {
//   const e = {};
//   if (!data.contentVideo?.trim()) e.contentVideo = "Content for video is required";
//   if (!data.preEvent || data.preEvent.length === 0) e.preEvent = "Select at least one option";
//   if (!data.eventCoverage || data.eventCoverage.length === 0) e.eventCoverage = "Select at least one option";
//   if (!data.postEvent || data.postEvent.length === 0) e.postEvent = "Select at least one option";
//   if (!data.specialVideos || data.specialVideos.length === 0) e.specialVideos = "Select at least one option";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority) e.priority = "Priority is required";
//   return e;
// }

// function validateDay(data) {
//   const e = {};
//   if (!data.designType) { e.designType = "Please select a design type"; return e; }
//   const showPoster = data.designType === "Poster" || data.designType === "Both";
//   const showVideo = data.designType === "Video" || data.designType === "Both";
//   if (showPoster) { const pe = validatePoster(data.poster || {}); if (Object.keys(pe).length > 0) e.poster = pe; }
//   if (showVideo) { const ve = validateVideo(data.video || {}); if (Object.keys(ve).length > 0) e.video = ve; }
//   return e;
// }

// function PosterSection({ data, onChange, errors = {} }) {
//   const update = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });
//   const showFlex = data.displayNeeded?.includes("Flex");
//   const showGlass = data.displayNeeded?.includes("Glass Sticker");

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
//         <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
//         <h3 className="text-white text-base font-semibold">Poster</h3>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Poster *</span>
//           <textarea value={data.contentPoster || ""} onChange={updateInput("contentPoster")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentPoster} />
//       </div>

//       <FileUpload label="Reference Poster (If any)" value={data.referencePoster} onChange={update("referencePoster")} />

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Certificate *</span>
//           <textarea value={data.contentCertificate || ""} onChange={updateInput("contentCertificate")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentCertificate} />
//       </div>

//       <FileUpload label="Reference Certificate (If any)" value={data.referenceCertificate} onChange={update("referenceCertificate")} />

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Trophy *</span>
//           <textarea value={data.contentTrophy || ""} onChange={updateInput("contentTrophy")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentTrophy} />
//       </div>

//       <div>
//         <MultiSelectDropdown label="Display Needed *" options={DISPLAY_OPTIONS} selected={data.displayNeeded || []} onChange={update("displayNeeded")} error={errors.displayNeeded} />
//       </div>

//       {showFlex && (
//         <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
//           <CustomInput labelBg="#1a1a2e" label="Size for Flex *" value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
//           <ErrorMsg msg={errors.sizeForFlex} />
//         </div>
//       )}

//       {showGlass && (
//         <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
//           <CustomInput labelBg="#1a1a2e" label="Size for Glass Sticker *" value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
//           <ErrorMsg msg={errors.sizeForGlass} />
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function VideoSection({ data, onChange, errors = {} }) {
//   const update = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
//         <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
//         <h3 className="text-white text-base font-semibold">Video</h3>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Video *</span>
//           <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentVideo} />
//       </div>

//       <div><MultiSelectDropdown label="Pre-Event Videos Needed *" options={PRE_EVENT_OPTIONS} selected={data.preEvent || []} onChange={update("preEvent")} error={errors.preEvent} /></div>
//       <div><MultiSelectDropdown label="Event Coverage Needed *" options={EVENT_COVERAGE_OPTIONS} selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
//       <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS} selected={data.postEvent || []} onChange={update("postEvent")} error={errors.postEvent} /></div>
//       <div><MultiSelectDropdown label="Special Videos Needed *" options={SPECIAL_VIDEO_OPTIONS} selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

//       <FileUpload label="Reference Video (If any)" value={data.referenceVideo} onChange={update("referenceVideo")} />

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function emptyDayData() {
//   return {
//     designType: "",
//     poster: { contentPoster: "", referencePoster: null, contentCertificate: "", referenceCertificate: null, contentTrophy: "", displayNeeded: [], sizeForFlex: "", sizeForGlass: "", deliveryDate: "", priority: "", specialReq: "" },
//     video: { contentVideo: "", preEvent: [], eventCoverage: [], postEvent: [], specialVideos: [], referenceVideo: null, deliveryDate: "", priority: "", specialReq: "" },
//   };
// }

// // ─── Props from Form.jsx ──────────────────────────────────────────────────────
// // mediaData         – array of per-day data owned by Form.jsx (source of truth)
// // onMediaDataChange – syncs changes back up to Form.jsx
// // onSave            – Form.jsx's saveSection("media",...) — the ONLY API call
// // eventDays         – event day objects for DayTimeline labels
// // nextStep / prevStep / registerChildNavigation – parent nav wiring

// export default function MediaForm({
//   nextStep,
//   prevStep,
//   registerChildNavigation,
//   eventDays = [],
//   mediaData: externalMediaData,
//   onMediaDataChange,
//   onSave,
//   errors: externalErrors = {},
// }) {
//   const [currentDayIndex, setCurrentDayIndex] = useState(0);
//   const [completedDays, setCompletedDays]     = useState([]);
//   const [errors, setErrors]                   = useState({});
//   const [isLoading, setIsLoading]             = useState(false);
//   const [apiError, setApiError]               = useState("");

//   // ── Local media data — seed from Form.jsx, keep in sync via onMediaDataChange
//   const [mediaData, setMediaData] = useState(() => {
//     if (externalMediaData && externalMediaData.length > 0) return externalMediaData;
//     return eventDays.map(() => emptyDayData());
//   });

//   const currentDay   = mediaData[currentDayIndex] || emptyDayData();
//   const currentErrors = errors[currentDayIndex] || {};
//   const showPoster   = currentDay.designType === "Poster" || currentDay.designType === "Both";
//   const showVideo    = currentDay.designType === "Video"  || currentDay.designType === "Both";
//   const isLastDay    = currentDayIndex === eventDays.length - 1;

//   // ── Always-fresh ref so stable callbacks never read stale closures ────────
//   const stateRef = useRef({});
//   stateRef.current = { mediaData, currentDayIndex, completedDays, isLastDay, onSave, nextStep, prevStep };

//   // ── Sync local mediaData up to Form.jsx whenever it changes ─────────────
//   // Must be outside setMediaData updater — calling setState of another
//   // component inside a setState updater causes "setState during render".
//   useEffect(() => {
//     if (onMediaDataChange) onMediaDataChange(mediaData);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mediaData]); // onMediaDataChange intentionally omitted — it's a stable callback

//   // ── Update local state only — sync handled by the effect above ───────────
//   const updateDay = (patch) => {
//     setMediaData((prev) => {
//       const updated = [...prev];
//       updated[currentDayIndex] = { ...updated[currentDayIndex], ...patch };
//       return updated;
//     });
//   };

//   const handleDesignTypeChange = (val) => {
//     updateDay({ designType: val });
//     setErrors((prev) => {
//       const copy = { ...prev };
//       if (copy[currentDayIndex]) {
//         const d = { ...copy[currentDayIndex] };
//         delete d.designType;
//         copy[currentDayIndex] = d;
//       }
//       return copy;
//     });
//     // Also clear apiError on new input
//     setApiError("");
//   };

//   // ── Stable handleNext — reads fresh state via stateRef ───────────────────
//   const handleNext = useCallback(async () => {
//     const { mediaData, currentDayIndex, completedDays, isLastDay, onSave } = stateRef.current;
//     const currentDay = mediaData[currentDayIndex] || emptyDayData();

//     // Validate current day
//     const dayErrors = validateDay(currentDay);
//     const hasErrors = Object.keys(dayErrors).length > 0;
//     setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
//     if (hasErrors) return;

//     const newCompleted = completedDays.includes(currentDayIndex)
//       ? completedDays
//       : [...completedDays, currentDayIndex];
//     setCompletedDays(newCompleted);

//     if (!isLastDay) {
//       // Just advance the day — no API call yet
//       setCurrentDayIndex((prev) => prev + 1);
//       return;
//     }

//     // On the last day: validate ALL days before saving
//     const allErrors = {};
//     mediaData.forEach((day, idx) => {
//       const e = validateDay(day);
//       if (Object.keys(e).length > 0) allErrors[idx] = e;
//     });
//     if (Object.keys(allErrors).length > 0) {
//       setErrors(allErrors);
//       // Jump to the first failing day so the user sees the errors
//       setCurrentDayIndex(parseInt(Object.keys(allErrors)[0]));
//       return;
//     }

//     // Delegate the actual API call to Form.jsx's onSave — no fetch here
//     setIsLoading(true);
//     setApiError("");
//     try {
//       if (onSave) await onSave();
//       // Form.jsx's saveSection advances the step on success
//     } catch (err) {
//       setApiError(err?.message || "Failed to save. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // stable forever — reads live state via stateRef

//   // ── Stable handleBack ─────────────────────────────────────────────────────
//   const handleBack = useCallback(() => {
//     const { currentDayIndex, prevStep } = stateRef.current;
//     if (currentDayIndex > 0) setCurrentDayIndex((prev) => prev - 1);
//     else if (prevStep) prevStep();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // stable forever

//   // ── Register with parent once on mount ───────────────────────────────────
//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     registerChildNavigation({ next: handleNext, prev: handleBack, isLoading: false });
//     return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
//   }, [registerChildNavigation, handleNext, handleBack]);

//   // Sync isLoading so parent "Save & Next" button shows "Saving..."
//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     registerChildNavigation({ next: handleNext, prev: handleBack, isLoading });
//   }, [isLoading, registerChildNavigation, handleNext, handleBack]);

//   return (
//     <div className="flex flex-col gap-6 pb-6">
//       <DayTimeline days={eventDays} currentDayIndex={currentDayIndex} completedDays={completedDays} />

//       <h2 className="text-white text-lg font-bold">
//         Media Requirement Details – Day {currentDayIndex + 1}
//       </h2>

//       {apiError && (
//         <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
//           <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//           <p className="text-red-400 text-sm">{apiError}</p>
//         </div>
//       )}

//       <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6">
//         <div>
//           <CustomSelect
//             labelBg="#1E1E35"
//             label="Type of Design Required *"
//             value={currentDay.designType || ""}
//             onChange={handleDesignTypeChange}
//             options={DESIGN_TYPE_OPTIONS}
//           />
//           <ErrorMsg msg={currentErrors.designType} />
//         </div>
//       </div>

//       {showPoster && (
//         <PosterSection
//           data={currentDay.poster || {}}
//           onChange={(d) => updateDay({ poster: d })}
//           errors={currentErrors.poster || {}}
//         />
//       )}
//       {showVideo && (
//         <VideoSection
//           data={currentDay.video || {}}
//           onChange={(d) => updateDay({ video: d })}
//           errors={currentErrors.video || {}}
//         />
//       )}
//     </div>
//   );
// }


// import React, { useState, useRef, useEffect, useCallback } from "react";
// import CustomInput from "../CustomInput";
// import CustomSelect from "../CustomSelect";
// import { DayTimeline } from "./VenueForm";

// const DISPLAY_OPTIONS = ["Flex", "A type Standee", "Website Banner", "TV Display", "Id Card", "Plug Card", "Momento Card", "Glass Sticker"];
// const PRE_EVENT_OPTIONS = ["Coming Soon Video", "Promotional Video", "Invitation Video"];
// const EVENT_COVERAGE_OPTIONS = ["Full Coverage", "Highlights", "Voice Over"];
// const POST_EVENT_OPTIONS = ["Event Glimpse", "Post Event Video"];
// const SPECIAL_VIDEO_OPTIONS = ["Chief Guest Event", "Testimonials"];
// const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
// const DESIGN_TYPE_OPTIONS = ["Poster", "Video", "Both"];

// const ErrorMsg = ({ msg }) =>
//   msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// // ─── Build mediaRequirementDetails payload ────────────────────────────────────

// function buildMediaPayload(mediaData) {
//   const mediaRequirements = mediaData.map((day, dayIndex) => {
//     const typeOfMedia = [];
//     if (day.designType === "Poster" || day.designType === "Both") typeOfMedia.push("poster");
//     if (day.designType === "Video" || day.designType === "Both") typeOfMedia.push("video");

//     // Build sizes array: each display option that has a size value
//     const sizes = [];
//     if (day.poster?.displayNeeded?.includes("Flex") && day.poster?.sizeForFlex?.trim()) {
//       sizes.push({ type: "Flex", value: day.poster.sizeForFlex.trim() });
//     }
//     if (day.poster?.displayNeeded?.includes("Glass Sticker") && day.poster?.sizeForGlass?.trim()) {
//       sizes.push({ type: "Glass Sticker", value: day.poster.sizeForGlass.trim() });
//     }

//     return {
//       dayIndex,
//       typeOfMedia,
//       poster: {
//         posterContent: day.poster?.contentPoster || "",
//         // Files are sent separately via FormData; keep arrays empty here
//         referencePosterFiles: [],
//         certificateContent: day.poster?.contentCertificate || "",
//         referenceCertificateFiles: [],
//         trophyContent: day.poster?.contentTrophy || "",
//         displayNeeded: day.poster?.displayNeeded || [],
//         sizes,
//         deliveryDate: day.poster?.deliveryDate
//           ? new Date(day.poster.deliveryDate).toISOString()
//           : "",
//         priority: day.poster?.priority || "",
//         specialRequirements: day.poster?.specialReq || "",
//       },
//       video: {
//         videoContent: day.video?.contentVideo || "",
//         preEventVideos: day.video?.preEvent || [],
//         eventCoverage: day.video?.eventCoverage || [],
//         postEventVideos: day.video?.postEvent || [],
//         specialVideos: day.video?.specialVideos || [],
//         // Files are sent separately via FormData; keep array empty here
//         referenceFiles: [],
//         deliveryDate: day.video?.deliveryDate
//           ? new Date(day.video.deliveryDate).toISOString()
//           : "",
//         priority: day.video?.priority || "",
//         specialRequirements: day.video?.specialReq || "",
//       },
//     };
//   });

//   return { mediaRequirements };
// }

// // ─── Build files payload for FormData ────────────────────────────────────────
// // Returns a flat object of { fieldKey: File } to be appended to FormData by Form.jsx

// export function buildMediaFiles(mediaData) {
//   const files = {};
//   mediaData.forEach((day) => {
//     if (day.poster?.referencePoster) {
//       files["referencePosterFiles"] = day.poster.referencePoster;
//     }
//     if (day.poster?.referenceCertificate) {
//       files["referenceCertificateFiles"] = day.poster.referenceCertificate;
//     }
//     if (day.video?.referenceVideo) {
//       files["referenceFiles"] = day.video.referenceVideo;
//     }
//   });
//   return files;
// }

// export { buildMediaPayload };

// function MultiSelectDropdown({ label, options, selected, onChange, error, labelBg = "#1E1E35" }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const toggle = (item) => {
//     onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);
//   };

//   const displayText = selected.length === 0 ? "" : selected.length <= 2 ? selected.join(" / ") : `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

//   return (
//     <div className="w-full" ref={ref}>
//       <div className="relative w-full">
//         <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
//         <div onClick={() => setOpen(!open)} className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"}`}>
//           <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
//             {displayText || "Select options..."}
//           </span>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
//             <polyline points="6 9 12 15 18 9" />
//           </svg>
//         </div>
//         {open && (
//           <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
//             {options.map((item, i) => {
//               const isSelected = selected.includes(item);
//               return (
//                 <div key={i} onClick={() => toggle(item)} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"}`}>
//                   <span>{item}</span>
//                   {isSelected && (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//                       <polyline points="20 6 9 17 4 12" />
//                     </svg>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//       <ErrorMsg msg={error} />
//     </div>
//   );
// }

// function FileUpload({ label, value, onChange, labelBg = "#1E1E35" }) {
//   const ref = useRef();
//   const handleFile = (file) => { if (file) onChange(file); };

//   return (
//     <div className="w-full">
//       <div className="relative w-full">
//         <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none" style={{ backgroundColor: labelBg }}>{label}</span>
//         <div
//           className="w-full bg-transparent border border-dashed border-[#3A3A5A] rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors duration-200 min-h-[56px]"
//           onClick={() => ref.current.click()}
//           onDragOver={(e) => e.preventDefault()}
//           onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
//         >
//           <input ref={ref} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
//           {value ? (
//             <span className="text-green-400 text-sm">📎 {value.name}</span>
//           ) : (
//             <span className="text-gray-500 text-sm">Drag and drop the files here or <span className="text-purple-400 underline cursor-pointer">choose file</span></span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function validatePoster(data) {
//   const e = {};
//   if (!data.contentPoster?.trim()) e.contentPoster = "Content for poster is required";
//   if (!data.contentCertificate?.trim()) e.contentCertificate = "Content for certificate is required";
//   if (!data.contentTrophy?.trim()) e.contentTrophy = "Content for trophy is required";
//   if (!data.displayNeeded || data.displayNeeded.length === 0) e.displayNeeded = "Select at least one display option";
//   if (data.displayNeeded?.includes("Flex") && !data.sizeForFlex?.trim()) e.sizeForFlex = "Size for Flex is required";
//   if (data.displayNeeded?.includes("Glass Sticker") && !data.sizeForGlass?.trim()) e.sizeForGlass = "Size for Glass Sticker is required";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority) e.priority = "Priority is required";
//   return e;
// }

// function validateVideo(data) {
//   const e = {};
//   if (!data.contentVideo?.trim()) e.contentVideo = "Content for video is required";
//   if (!data.preEvent || data.preEvent.length === 0) e.preEvent = "Select at least one option";
//   if (!data.eventCoverage || data.eventCoverage.length === 0) e.eventCoverage = "Select at least one option";
//   if (!data.postEvent || data.postEvent.length === 0) e.postEvent = "Select at least one option";
//   if (!data.specialVideos || data.specialVideos.length === 0) e.specialVideos = "Select at least one option";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority) e.priority = "Priority is required";
//   return e;
// }

// function validateDay(data) {
//   const e = {};
//   if (!data.designType) { e.designType = "Please select a design type"; return e; }
//   const showPoster = data.designType === "Poster" || data.designType === "Both";
//   const showVideo = data.designType === "Video" || data.designType === "Both";
//   if (showPoster) { const pe = validatePoster(data.poster || {}); if (Object.keys(pe).length > 0) e.poster = pe; }
//   if (showVideo) { const ve = validateVideo(data.video || {}); if (Object.keys(ve).length > 0) e.video = ve; }
//   return e;
// }

// function PosterSection({ data, onChange, errors = {} }) {
//   const update = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });
//   const showFlex = data.displayNeeded?.includes("Flex");
//   const showGlass = data.displayNeeded?.includes("Glass Sticker");

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
//         <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
//         <h3 className="text-white text-base font-semibold">Poster</h3>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Poster *</span>
//           <textarea value={data.contentPoster || ""} onChange={updateInput("contentPoster")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentPoster} />
//       </div>

//       <FileUpload label="Reference Poster (If any)" value={data.referencePoster} onChange={update("referencePoster")} />

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Certificate *</span>
//           <textarea value={data.contentCertificate || ""} onChange={updateInput("contentCertificate")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentCertificate} />
//       </div>

//       <FileUpload label="Reference Certificate (If any)" value={data.referenceCertificate} onChange={update("referenceCertificate")} />

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Trophy *</span>
//           <textarea value={data.contentTrophy || ""} onChange={updateInput("contentTrophy")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentTrophy} />
//       </div>

//       <div>
//         <MultiSelectDropdown label="Display Needed *" options={DISPLAY_OPTIONS} selected={data.displayNeeded || []} onChange={update("displayNeeded")} error={errors.displayNeeded} />
//       </div>

//       {showFlex && (
//         <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
//           <CustomInput labelBg="#1a1a2e" label="Size for Flex *" value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
//           <ErrorMsg msg={errors.sizeForFlex} />
//         </div>
//       )}

//       {showGlass && (
//         <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
//           <CustomInput labelBg="#1a1a2e" label="Size for Glass Sticker *" value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
//           <ErrorMsg msg={errors.sizeForGlass} />
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function VideoSection({ data, onChange, errors = {} }) {
//   const update = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e) => onChange({ ...data, [field]: e.target.value });

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
//         <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
//         <h3 className="text-white text-base font-semibold">Video</h3>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Video *</span>
//           <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content" className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentVideo} />
//       </div>

//       <div><MultiSelectDropdown label="Pre-Event Videos Needed *" options={PRE_EVENT_OPTIONS} selected={data.preEvent || []} onChange={update("preEvent")} error={errors.preEvent} /></div>
//       <div><MultiSelectDropdown label="Event Coverage Needed *" options={EVENT_COVERAGE_OPTIONS} selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
//       <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS} selected={data.postEvent || []} onChange={update("postEvent")} error={errors.postEvent} /></div>
//       <div><MultiSelectDropdown label="Special Videos Needed *" options={SPECIAL_VIDEO_OPTIONS} selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

//       <FileUpload label="Reference Video (If any)" value={data.referenceVideo} onChange={update("referenceVideo")} />

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date" value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""} onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes" className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function emptyDayData() {
//   return {
//     designType: "",
//     poster: { contentPoster: "", referencePoster: null, contentCertificate: "", referenceCertificate: null, contentTrophy: "", displayNeeded: [], sizeForFlex: "", sizeForGlass: "", deliveryDate: "", priority: "", specialReq: "" },
//     video: { contentVideo: "", preEvent: [], eventCoverage: [], postEvent: [], specialVideos: [], referenceVideo: null, deliveryDate: "", priority: "", specialReq: "" },
//   };
// }

// // ─── Props from Form.jsx ──────────────────────────────────────────────────────
// // mediaData         – array of per-day data owned by Form.jsx (source of truth)
// // onMediaDataChange – syncs changes back up to Form.jsx
// // onSave            – Form.jsx's saveSection("media",...) — the ONLY API call
// // eventDays         – event day objects for DayTimeline labels
// // nextStep / prevStep / registerChildNavigation – parent nav wiring

// export default function MediaForm({
//   nextStep,
//   prevStep,
//   registerChildNavigation,
//   eventDays = [],
//   mediaData: externalMediaData,
//   onMediaDataChange,
//   onSave,
//   errors: externalErrors = {},
// }) {
//   const [currentDayIndex, setCurrentDayIndex] = useState(0);
//   const [completedDays, setCompletedDays]     = useState([]);
//   const [errors, setErrors]                   = useState({});
//   const [isLoading, setIsLoading]             = useState(false);
//   const [apiError, setApiError]               = useState("");

//   // ── Local media data — seed from Form.jsx, keep in sync via onMediaDataChange
//   const [mediaData, setMediaData] = useState(() => {
//     if (externalMediaData && externalMediaData.length > 0) return externalMediaData;
//     return eventDays.map(() => emptyDayData());
//   });

//   const currentDay   = mediaData[currentDayIndex] || emptyDayData();
//   const currentErrors = errors[currentDayIndex] || {};
//   const showPoster   = currentDay.designType === "Poster" || currentDay.designType === "Both";
//   const showVideo    = currentDay.designType === "Video"  || currentDay.designType === "Both";
//   const isLastDay    = currentDayIndex === eventDays.length - 1;

//   // ── Always-fresh ref so stable callbacks never read stale closures ────────
//   const stateRef = useRef({});
//   stateRef.current = { mediaData, currentDayIndex, completedDays, isLastDay, onSave, nextStep, prevStep };

//   // ── Sync local mediaData up to Form.jsx whenever it changes ─────────────
//   // Must be outside setMediaData updater — calling setState of another
//   // component inside a setState updater causes "setState during render".
//   useEffect(() => {
//     if (onMediaDataChange) onMediaDataChange(mediaData);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mediaData]); // onMediaDataChange intentionally omitted — it's a stable callback

//   // ── Update local state only — sync handled by the effect above ───────────
//   const updateDay = (patch) => {
//     setMediaData((prev) => {
//       const updated = [...prev];
//       updated[currentDayIndex] = { ...updated[currentDayIndex], ...patch };
//       return updated;
//     });
//   };

//   const handleDesignTypeChange = (val) => {
//     updateDay({ designType: val });
//     setErrors((prev) => {
//       const copy = { ...prev };
//       if (copy[currentDayIndex]) {
//         const d = { ...copy[currentDayIndex] };
//         delete d.designType;
//         copy[currentDayIndex] = d;
//       }
//       return copy;
//     });
//     // Also clear apiError on new input
//     setApiError("");
//   };

//   // ── Stable handleNext — reads fresh state via stateRef ───────────────────
//   const handleNext = useCallback(async () => {
//     const { mediaData, currentDayIndex, completedDays, isLastDay, onSave } = stateRef.current;
//     const currentDay = mediaData[currentDayIndex] || emptyDayData();

//     // Validate current day
//     const dayErrors = validateDay(currentDay);
//     const hasErrors = Object.keys(dayErrors).length > 0;
//     setErrors((prev) => ({ ...prev, [currentDayIndex]: dayErrors }));
//     if (hasErrors) return;

//     const newCompleted = completedDays.includes(currentDayIndex)
//       ? completedDays
//       : [...completedDays, currentDayIndex];
//     setCompletedDays(newCompleted);

//     if (!isLastDay) {
//       // Just advance the day — no API call yet
//       setCurrentDayIndex((prev) => prev + 1);
//       return;
//     }

//     // On the last day: validate ALL days before saving
//     const allErrors = {};
//     mediaData.forEach((day, idx) => {
//       const e = validateDay(day);
//       if (Object.keys(e).length > 0) allErrors[idx] = e;
//     });
//     if (Object.keys(allErrors).length > 0) {
//       setErrors(allErrors);
//       // Jump to the first failing day so the user sees the errors
//       setCurrentDayIndex(parseInt(Object.keys(allErrors)[0]));
//       return;
//     }

//     // Delegate the actual API call to Form.jsx's onSave — no fetch here
//     setIsLoading(true);
//     setApiError("");
//     try {
//       if (onSave) await onSave();
//       // Form.jsx's saveSection advances the step on success
//     } catch (err) {
//       setApiError(err?.message || "Failed to save. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // stable forever — reads live state via stateRef

//   // ── Stable handleBack ─────────────────────────────────────────────────────
//   const handleBack = useCallback(() => {
//     const { currentDayIndex, prevStep } = stateRef.current;
//     if (currentDayIndex > 0) setCurrentDayIndex((prev) => prev - 1);
//     else if (prevStep) prevStep();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // stable forever

//   // ── Register with parent once on mount ───────────────────────────────────
//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     registerChildNavigation({ next: handleNext, prev: handleBack, isLoading: false });
//     return () => registerChildNavigation({ next: null, prev: null, isLoading: false });
//   }, [registerChildNavigation, handleNext, handleBack]);

//   // Sync isLoading so parent "Save & Next" button shows "Saving..."
//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     registerChildNavigation({ next: handleNext, prev: handleBack, isLoading });
//   }, [isLoading, registerChildNavigation, handleNext, handleBack]);

//   return (
//     <div className="flex flex-col gap-6 pb-6">
//       <DayTimeline days={eventDays} currentDayIndex={currentDayIndex} completedDays={completedDays} />

//       <h2 className="text-white text-lg font-bold">
//         Media Requirement Details – Day {currentDayIndex + 1}
//       </h2>

//       {apiError && (
//         <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
//           <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//           <p className="text-red-400 text-sm">{apiError}</p>
//         </div>
//       )}

//       <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6">
//         <div>
//           <CustomSelect
//             labelBg="#1E1E35"
//             label="Type of Design Required *"
//             value={currentDay.designType || ""}
//             onChange={handleDesignTypeChange}
//             options={DESIGN_TYPE_OPTIONS}
//           />
//           <ErrorMsg msg={currentErrors.designType} />
//         </div>
//       </div>

//       {showPoster && (
//         <PosterSection
//           data={currentDay.poster || {}}
//           onChange={(d) => updateDay({ poster: d })}
//           errors={currentErrors.poster || {}}
//         />
//       )}
//       {showVideo && (
//         <VideoSection
//           data={currentDay.video || {}}
//           onChange={(d) => updateDay({ video: d })}
//           errors={currentErrors.video || {}}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useRef, useEffect, useCallback } from "react";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { DayTimeline } from "./VenueForm";

const DISPLAY_OPTIONS        = ["Flex", "A type Standee", "Website Banner", "TV Display", "Id Card", "Plug Card", "Momento Card", "Glass Sticker"];
const PRE_EVENT_OPTIONS      = ["Coming Soon Video", "Promotional Video", "Invitation Video"];
const EVENT_COVERAGE_OPTIONS = ["Full Coverage", "Highlights", "Voice Over"];
const POST_EVENT_OPTIONS     = ["Event Glimpse", "Post Event Video"];
const SPECIAL_VIDEO_OPTIONS  = ["Chief Guest Event", "Testimonials"];
const PRIORITY_OPTIONS       = ["High", "Medium", "Low"];
const DESIGN_TYPE_OPTIONS    = ["Poster", "Video", "Both"];

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ── Empty factories ───────────────────────────────────────────────────────────

function emptyPoster() {
  return {
    contentPoster: "", referencePoster: null,
    contentCertificate: "", referenceCertificate: null,
    contentTrophy: "", displayNeeded: [],
    sizeForFlex: "", sizeForGlass: "",
    deliveryDate: "", priority: "", specialReq: "",
  };
}

function emptyVideo() {
  return {
    contentVideo: "", preEvent: [], eventCoverage: [],
    postEvent: [], specialVideos: [], referenceVideo: null,
    deliveryDate: "", priority: "", specialReq: "",
  };
}

function emptyDayData() {
  return { designType: "", poster: emptyPoster(), video: emptyVideo() };
}

// ── Validators ────────────────────────────────────────────────────────────────

function validatePoster(data) {
  const e = {};
  if (!data.contentPoster?.trim())      e.contentPoster      = "Content for poster is required";
  if (!data.contentCertificate?.trim()) e.contentCertificate = "Content for certificate is required";
  if (!data.contentTrophy?.trim())      e.contentTrophy      = "Content for trophy is required";
  if (!data.displayNeeded || data.displayNeeded.length === 0)
    e.displayNeeded = "Select at least one display option";
  if (data.displayNeeded?.includes("Flex")          && !data.sizeForFlex?.trim())  e.sizeForFlex  = "Size for Flex is required";
  if (data.displayNeeded?.includes("Glass Sticker") && !data.sizeForGlass?.trim()) e.sizeForGlass = "Size for Glass Sticker is required";
  if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
  if (!data.priority)     e.priority     = "Priority is required";
  return e;
}

function validateVideo(data) {
  const e = {};
  if (!data.contentVideo?.trim())                              e.contentVideo  = "Content for video is required";
  if (!data.preEvent      || data.preEvent.length === 0)       e.preEvent      = "Select at least one option";
  if (!data.eventCoverage || data.eventCoverage.length === 0)  e.eventCoverage = "Select at least one option";
  if (!data.postEvent     || data.postEvent.length === 0)      e.postEvent     = "Select at least one option";
  if (!data.specialVideos || data.specialVideos.length === 0)  e.specialVideos = "Select at least one option";
  if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
  if (!data.priority)     e.priority     = "Priority is required";
  return e;
}

function validateDay(data) {
  const e = {};
  if (!data.designType) { e.designType = "Please select a design type"; return e; }
  if (data.designType === "Poster" || data.designType === "Both") {
    const pe = validatePoster(data.poster || {});
    if (Object.keys(pe).length > 0) e.poster = pe;
  }
  if (data.designType === "Video" || data.designType === "Both") {
    const ve = validateVideo(data.video || {});
    if (Object.keys(ve).length > 0) e.video = ve;
  }
  return e;
}

// ── Build FormData for submission (includes File objects) ─────────────────────
//
// Serialises all media days into multipart/form-data so File objects are
// transmitted instead of being silently dropped by JSON.stringify.
//
// Keys:
//   mediaData                    → JSON string (files replaced with null)
//   day_0_referencePoster        → File | absent
//   day_0_referenceCertificate   → File | absent
//   day_0_referenceVideo         → File | absent
//   day_1_… etc.

export function buildMediaFormData(mediaData) {
  const fd = new FormData();

  const jsonSafe = mediaData.map((day) => ({
    ...day,
    poster: day.poster
      ? { ...day.poster, referencePoster: null, referenceCertificate: null }
      : day.poster,
    video: day.video
      ? { ...day.video, referenceVideo: null }
      : day.video,
  }));

  fd.append("mediaData", JSON.stringify(jsonSafe));

  mediaData.forEach((day, i) => {
    if (day.poster?.referencePoster      instanceof File) fd.append(`day_${i}_referencePoster`,      day.poster.referencePoster);
    if (day.poster?.referenceCertificate instanceof File) fd.append(`day_${i}_referenceCertificate`, day.poster.referenceCertificate);
    if (day.video?.referenceVideo        instanceof File) fd.append(`day_${i}_referenceVideo`,        day.video.referenceVideo);
  });

  return fd;
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────

function MultiSelectDropdown({ label, options, selected, onChange, error, labelBg = "#1E1E35" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (item) =>
    onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);

  const displayText =
    selected.length === 0 ? "" :
    selected.length <= 2  ? selected.join(" / ") :
    `${selected[0]} / ${selected[1]} +${selected.length - 2} more`;

  return (
    <div className="w-full" ref={ref}>
      <div className="relative w-full">
        <span
          className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}
        >
          {label}
        </span>
        <div
          onClick={() => setOpen(!open)}
          className={`w-full bg-transparent border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors duration-200 ${
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span className={`text-sm truncate max-w-[85%] ${selected.length ? "text-white" : "text-gray-500"}`}>
            {displayText || "Select options..."}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((item, i) => {
              const isSelected = selected.includes(item);
              return (
                <div key={i} onClick={() => toggle(item)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
                  }`}>
                  <span>{item}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round">
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

// ── FileUpload ────────────────────────────────────────────────────────────────

function FileUpload({ label, value, onChange, labelBg = "#1E1E35" }) {
  const inputRef = useRef();
  const handleFile = (file) => { if (file) onChange(file); };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <span className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
          style={{ backgroundColor: labelBg }}>{label}</span>
        <div
          className="w-full bg-transparent border border-dashed border-[#3A3A5A] rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors duration-200 min-h-[56px]"
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          {value ? (
            <span className="text-green-400 text-sm">📎 {value.name}</span>
          ) : (
            <span className="text-gray-500 text-sm">
              Drag and drop the files here or{" "}
              <span className="text-purple-400 underline cursor-pointer">choose file</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PosterSection ─────────────────────────────────────────────────────────────

function PosterSection({ data, onChange, errors = {} }) {
  const update      = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });
  const showFlex  = data.displayNeeded?.includes("Flex");
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
          <textarea value={data.contentPoster || ""} onChange={updateInput("contentPoster")} rows={3} placeholder="content"
            className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentPoster} />
      </div>

      <FileUpload label="Reference Poster (If any)" value={data.referencePoster} onChange={update("referencePoster")} />

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Certificate *</span>
          <textarea value={data.contentCertificate || ""} onChange={updateInput("contentCertificate")} rows={3} placeholder="content"
            className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentCertificate} />
      </div>

      <FileUpload label="Reference Certificate (If any)" value={data.referenceCertificate} onChange={update("referenceCertificate")} />

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Trophy *</span>
          <textarea value={data.contentTrophy || ""} onChange={updateInput("contentTrophy")} rows={3} placeholder="content"
            className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentTrophy} />
      </div>

      <div>
        <MultiSelectDropdown label="Display Needed *" options={DISPLAY_OPTIONS}
          selected={data.displayNeeded || []} onChange={update("displayNeeded")} error={errors.displayNeeded} />
      </div>

      {showFlex && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
          <CustomInput labelBg="#1a1a2e" label="Size for Flex *"
            value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
          <ErrorMsg msg={errors.sizeForFlex} />
        </div>
      )}

      {showGlass && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-600/5 p-4">
          <CustomInput labelBg="#1a1a2e" label="Size for Glass Sticker *"
            value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
          <ErrorMsg msg={errors.sizeForGlass} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date"
            value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
          <ErrorMsg msg={errors.deliveryDate} />
        </div>
        <div>
          <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""}
            onChange={update("priority")} options={PRIORITY_OPTIONS} />
          <ErrorMsg msg={errors.priority} />
        </div>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
          <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes"
            className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
        </div>
      </div>
    </div>
  );
}

// ── VideoSection ──────────────────────────────────────────────────────────────

function VideoSection({ data, onChange, errors = {} }) {
  const update      = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-[#3A3A5A]">
        <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        <h3 className="text-white text-base font-semibold">Video</h3>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Content for Video *</span>
          <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content"
            className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentVideo} />
      </div>

      <div><MultiSelectDropdown label="Pre-Event Videos Needed *"  options={PRE_EVENT_OPTIONS}       selected={data.preEvent      || []} onChange={update("preEvent")}      error={errors.preEvent}      /></div>
      <div><MultiSelectDropdown label="Event Coverage Needed *"    options={EVENT_COVERAGE_OPTIONS}  selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
      <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS}      selected={data.postEvent     || []} onChange={update("postEvent")}     error={errors.postEvent}     /></div>
      <div><MultiSelectDropdown label="Special Videos Needed *"    options={SPECIAL_VIDEO_OPTIONS}   selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

      <FileUpload label="Reference Video (If any)" value={data.referenceVideo} onChange={update("referenceVideo")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date"
            value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
          <ErrorMsg msg={errors.deliveryDate} />
        </div>
        <div>
          <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""}
            onChange={update("priority")} options={PRIORITY_OPTIONS} />
          <ErrorMsg msg={errors.priority} />
        </div>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">Special Requirements, If any</span>
          <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes"
            className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
        </div>
      </div>
    </div>
  );
}

// ── Main MediaForm ────────────────────────────────────────────────────────────
//
// Props:
//   nextStep                – advanceStep from Form.jsx
//   prevStep                – goBackStep from Form.jsx (raw step decrement)
//   registerChildNavigation – wires next / prev / isLoading / isOnLastDay /
//                             nextDayLabel into Form.jsx's button bar
//   eventDays               – array of event-day objects for DayTimeline labels
//   mediaData               – per-day array owned by Form.jsx
//   onMediaDataChange       – syncs local state back up to Form.jsx
//
// NAV CONTRACT with Form.jsx
//   registerChildNavigation receives:
//     { next, prev, isLoading, isOnLastDay, nextDayLabel }
//
//   Form.jsx reads isOnLastDay + nextDayLabel to decide what its "Save & Next"
//   button says.  When isOnLastDay is false the button shows nextDayLabel
//   (e.g. "Day 2 →").  When true the button shows "Save & Next" / "Submit"
//   depending on whether this is the last parent step.

export default function MediaForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  eventDays = [],
  mediaData: externalMediaData,
  onMediaDataChange,
  onSave,
  errors: externalErrors = {},
}) {
  const dayCount = eventDays.length;

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedDays,   setCompletedDays]   = useState([]);
  const [errors,          setErrors]          = useState({});
  const [isLoading,       setIsLoading]       = useState(false);
  const [apiError,        setApiError]        = useState("");

  const [mediaData, setMediaData] = useState(() =>
    Array.from({ length: Math.max(dayCount, 0) }, (_, i) =>
      externalMediaData?.[i] ?? emptyDayData()
    )
  );

  // Always-fresh refs ─────────────────────────────────────────────────────────
  const mediaDataRef   = useRef(mediaData);
  const onSaveRef      = useRef(onSave);
  const prevStepRef    = useRef(prevStep);
  const dayCountRef    = useRef(dayCount);
  const currentIdxRef  = useRef(currentDayIndex);
  const registerNavRef = useRef(registerChildNavigation);

  useEffect(() => { mediaDataRef.current   = mediaData;              }, [mediaData]);
  useEffect(() => { onSaveRef.current      = onSave;                 }, [onSave]);
  useEffect(() => { prevStepRef.current    = prevStep;               }, [prevStep]);
  useEffect(() => { dayCountRef.current    = dayCount;               }, [dayCount]);
  useEffect(() => { currentIdxRef.current  = currentDayIndex;        }, [currentDayIndex]);
  useEffect(() => { registerNavRef.current = registerChildNavigation; }, [registerChildNavigation]);

  // Sync local → parent ───────────────────────────────────────────────────────
  useEffect(() => {
    if (onMediaDataChange) onMediaDataChange(mediaData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaData]);

  // Resize array when dayCount changes ────────────────────────────────────────
  useEffect(() => {
    if (dayCount === 0) return;
    setMediaData((prev) => {
      if (prev.length === dayCount) return prev;
      return Array.from({ length: dayCount }, (_, i) => prev[i] ?? emptyDayData());
    });
  }, [dayCount]);

  // Clamp index when dayCount shrinks ─────────────────────────────────────────
  useEffect(() => {
    if (dayCount > 0 && currentDayIndex >= dayCount) setCurrentDayIndex(dayCount - 1);
  }, [dayCount, currentDayIndex]);

  const currentDay    = mediaData[currentDayIndex] ?? emptyDayData();
  const currentErrors = errors[currentDayIndex] || {};
  const showPoster    = currentDay.designType === "Poster" || currentDay.designType === "Both";
  const showVideo     = currentDay.designType === "Video"  || currentDay.designType === "Both";

  const updateDay = (patch) => {
    setMediaData((prev) => {
      const updated = [...prev];
      updated[currentDayIndex] = { ...(updated[currentDayIndex] ?? emptyDayData()), ...patch };
      return updated;
    });
  };

  const handleDesignTypeChange = (val) => {
    updateDay({ designType: val });
    setErrors((prev) => {
      const copy = { ...prev };
      if (copy[currentDayIndex]) {
        const d = { ...copy[currentDayIndex] };
        delete d.designType;
        copy[currentDayIndex] = d;
      }
      return copy;
    });
    setApiError("");
  };

  // ── Helper: push current nav state up to Form.jsx ──────────────────────────
  // Called whenever currentDayIndex or isLoading changes so the button bar
  // always reflects the correct label.
  const pushNavState = useCallback((overrideIdx, overrideLoading) => {
    if (!registerNavRef.current) return;
    const idx     = overrideIdx     ?? currentIdxRef.current;
    const loading = overrideLoading ?? false;
    const total   = dayCountRef.current;
    const onLast  = total > 0 && idx === total - 1;
    registerNavRef.current({
      next:        (...args) => navRef.current.next(...args),
      prev:        (...args) => navRef.current.prev(...args),
      isLoading:   loading,
      // KEY: these two fields tell Form.jsx what the forward button should say
      isOnLastDay: onLast,
      nextDayLabel: onLast ? "Save & Next" : `Day ${idx + 2} →`,
    });
  }, []); // stable — only uses refs

  // ── handleNext ─────────────────────────────────────────────────────────────
  // Non-last day: validate → advance day tab → push updated state to Form.jsx.
  // Last day:     validate all → build FormData (with files) → call onSave.
  const handleNext = useCallback(async () => {
    const latestData = mediaDataRef.current;
    const idx        = currentIdxRef.current;
    const total      = dayCountRef.current;

    if (total === 0) return;

    const isLast = idx === total - 1; // read from ref, never stale

    // Validate current day
    const dayErrors = validateDay(latestData[idx] ?? emptyDayData());
    if (Object.keys(dayErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [idx]: dayErrors }));
      return;
    }

    // Mark complete
    setCompletedDays((prev) => prev.includes(idx) ? prev : [...prev, idx]);
    setErrors((prev) => ({ ...prev, [idx]: {} }));

    // ── NOT last day ────────────────────────────────────────────────────────
    if (!isLast) {
      const nextIdx = idx + 1;
      setCurrentDayIndex(nextIdx);
      setErrors((prev) => ({ ...prev, [nextIdx]: {} }));
      // Tell Form.jsx the new day index so its button label updates
      pushNavState(nextIdx, false);
      return; // CRITICAL: do NOT fall through to onSave
    }

    // ── Last day: validate ALL ──────────────────────────────────────────────
    const allErrors = {};
    latestData.forEach((day, i) => {
      const e = validateDay(day);
      if (Object.keys(e).length > 0) allErrors[i] = e;
    });
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentDayIndex(parseInt(Object.keys(allErrors)[0]));
      return;
    }

    // ── Build FormData (files included) → save ──────────────────────────────
    setIsLoading(true);
    pushNavState(idx, true);
    setApiError("");
    try {
      const formData = buildMediaFormData(latestData);
      // onSave receives FormData — Form.jsx must send it as multipart (no JSON.stringify,
      // no manual Content-Type header — browser sets it with the correct boundary).
      if (onSaveRef.current) await onSaveRef.current(formData);
      // Form.jsx advances the step — deregister so its own buttons take over
      if (registerNavRef.current) {
        registerNavRef.current({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
      }
    } catch (err) {
      setApiError(err?.message || "Failed to save media details. Please try again.");
    } finally {
      setIsLoading(false);
      pushNavState(idx, false);
    }
  }, []); // stable — uses refs only

  // ── handleBack ─────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    const idx = currentIdxRef.current;
    if (idx > 0) {
      const prevIdx = idx - 1;
      setErrors((prev) => ({ ...prev, [idx]: {} }));
      setCurrentDayIndex(prevIdx);
      pushNavState(prevIdx, false);
    } else {
      if (prevStepRef.current) prevStepRef.current();
    }
  }, []); // stable

  // ── Stable nav wrapper ref ─────────────────────────────────────────────────
  const navRef = useRef({ next: handleNext, prev: handleBack });
  navRef.current = { next: handleNext, prev: handleBack };

  // ── Register on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    const onLast     = dayCount <= 1;
    registerChildNavigation({
      next:        stableNext,
      prev:        stablePrev,
      isLoading:   false,
      isOnLastDay: onLast,
      nextDayLabel: onLast ? "Save & Next" : "Day 2 →",
    });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  // ── Keep isLoading in sync with Form.jsx button ────────────────────────────
  useEffect(() => {
    pushNavState(currentDayIndex, isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, currentDayIndex]);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (dayCount === 0) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
          <p className="text-gray-400 text-sm">
            No event days found. Please go back and add event days first.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  // No navigation buttons here — all buttons live in Form.jsx's sticky footer.
  return (
    <div className="flex flex-col gap-6 pb-6">
      <DayTimeline
        days={eventDays.slice(0, dayCount)}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        Media Requirement Details – Day {currentDayIndex + 1}
        {dayCount > 1 && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({currentDayIndex + 1} of {dayCount})
          </span>
        )}
      </h2>

      {/* Day progress bar */}
      {dayCount > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: dayCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                completedDays.includes(i)
                  ? "bg-purple-500"
                  : i === currentDayIndex
                  ? "bg-purple-400/60"
                  : "bg-[#3A3A5A]"
              }`}
            />
          ))}
        </div>
      )}

      {apiError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6">
        <CustomSelect
          labelBg="#1E1E35"
          label="Type of Design Required *"
          value={currentDay.designType || ""}
          onChange={handleDesignTypeChange}
          options={DESIGN_TYPE_OPTIONS}
        />
        <ErrorMsg msg={currentErrors.designType} />
      </div>

      {showPoster && (
        <PosterSection
          data={currentDay.poster || emptyPoster()}
          onChange={(d) => updateDay({ poster: d })}
          errors={currentErrors.poster || {}}
        />
      )}

      {showVideo && (
        <VideoSection
          data={currentDay.video || emptyVideo()}
          onChange={(d) => updateDay({ video: d })}
          errors={currentErrors.video || {}}
        />
      )}
    </div>
  );
}