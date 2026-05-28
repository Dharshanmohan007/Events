// import React, { useState, useRef, useEffect, useCallback } from "react";
// import CustomInput from "../CustomInput";
// import CustomSelect from "../CustomSelect";
// import { DayTimeline } from "./VenueForm";

// const DISPLAY_OPTIONS        = ["Flex", "A type Standee", "Website Banner", "TV Display", "Id Card", "Plug Card", "Momento Card", "Glass Sticker"];
// const PRE_EVENT_OPTIONS      = ["Coming Soon Video", "Promotional Video", "Invitation Video"];
// const EVENT_COVERAGE_OPTIONS = ["Full Coverage", "Highlights", "Voice Over"];
// const POST_EVENT_OPTIONS     = ["Event Glimpse", "Post Event Video"];
// const SPECIAL_VIDEO_OPTIONS  = ["Chief Guest Event", "Testimonials"];
// const PRIORITY_OPTIONS       = ["High", "Medium", "Low"];
// const DESIGN_TYPE_OPTIONS    = ["Poster", "Video", "Both"];

// const ACCEPTED_FILE_TYPES    = "image/*,application/pdf";
// const ACCEPTED_VIDEO_TYPES   = "video/mp4";
// const MAX_FILE_SIZE_MB       = 10;
// const MAX_FILE_SIZE_BYTES    = MAX_FILE_SIZE_MB * 1024 * 1024;

// const ErrorMsg = ({ msg }) =>
//   msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// // ── Empty factories ───────────────────────────────────────────────────────────

// function emptyPoster() {
//   return {
//     contentPoster: "", referencePoster: [],
//     contentCertificate: "", referenceCertificate: [],
//     contentTrophy: "", displayNeeded: [],
//     sizeForFlex: "", sizeForGlass: "",
//     deliveryDate: "", priority: "", specialReq: "",
//   };
// }

// function emptyVideo() {
//   return {
//     contentVideo: "", preEvent: [], eventCoverage: [],
//     postEvent: [], specialVideos: [], referenceVideo: [],
//     deliveryDate: "", priority: "", specialReq: "",
//   };
// }

// function emptyDayData() {
//   return { designType: "", poster: emptyPoster(), video: emptyVideo() };
// }

// // ── Validators ────────────────────────────────────────────────────────────────

// function validatePoster(data, showCertificate = false) {
//   const e = {};
//   if (!data.contentPoster?.trim())  e.contentPoster = "Content for poster is required";
//   if (showCertificate && !data.contentCertificate?.trim())
//     e.contentCertificate = "Content for certificate is required";
//   if (!data.contentTrophy?.trim())  e.contentTrophy = "Content for trophy is required";
//   if (!data.displayNeeded || data.displayNeeded.length === 0)
//     e.displayNeeded = "Select at least one display option";
//   if (data.displayNeeded?.includes("Flex")          && !data.sizeForFlex?.trim())  e.sizeForFlex  = "Size for Flex is required";
//   if (data.displayNeeded?.includes("Glass Sticker") && !data.sizeForGlass?.trim()) e.sizeForGlass = "Size for Glass Sticker is required";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority)     e.priority     = "Priority is required";
//   return e;
// }

// function validateVideo(data) {
//   const e = {};
//   if (!data.contentVideo?.trim())                              e.contentVideo  = "Content for video is required";
//   if (!data.preEvent      || data.preEvent.length === 0)       e.preEvent      = "Select at least one option";
//   if (!data.eventCoverage || data.eventCoverage.length === 0)  e.eventCoverage = "Select at least one option";
//   if (!data.postEvent     || data.postEvent.length === 0)      e.postEvent     = "Select at least one option";
//   if (!data.specialVideos || data.specialVideos.length === 0)  e.specialVideos = "Select at least one option";
//   if (!data.deliveryDate) e.deliveryDate = "Delivery date is required";
//   if (!data.priority)     e.priority     = "Priority is required";
//   return e;
// }

// function validateDay(data, showCertificate = false) {
//   const e = {};
//   if (!data.designType) { e.designType = "Please select a design type"; return e; }
//   if (data.designType === "Poster" || data.designType === "Both") {
//     const pe = validatePoster(data.poster || {}, showCertificate);
//     if (Object.keys(pe).length > 0) e.poster = pe;
//   }
//   if (data.designType === "Video" || data.designType === "Both") {
//     const ve = validateVideo(data.video || {});
//     if (Object.keys(ve).length > 0) e.video = ve;
//   }
//   return e;
// }

// // ── Build FormData for submission (includes File objects) ─────────────────────

// export function buildMediaFormData(mediaData) {
//   const fd = new FormData();

//   const jsonSafe = mediaData.map((day, i) => {
//     const posterFiles      = [];
//     const certFiles        = [];
//     const videoFiles       = [];

//     (day.poster?.referencePoster || []).forEach((f, fi) => {
//       if (f instanceof File) posterFiles.push(`day_${i}_referencePoster_${fi}`);
//     });
//     (day.poster?.referenceCertificate || []).forEach((f, fi) => {
//       if (f instanceof File) certFiles.push(`day_${i}_referenceCertificate_${fi}`);
//     });
//     (day.video?.referenceVideo || []).forEach((f, fi) => {
//       if (f instanceof File) videoFiles.push(`day_${i}_referenceVideo_${fi}`);
//     });

//     return {
//       ...day,
//       poster: day.poster
//         ? {
//             ...day.poster,
//             referencePoster:           null,
//             referenceCertificate:      null,
//             referencePosterFiles:      posterFiles,
//             referenceCertificateFiles: certFiles,
//           }
//         : day.poster,
//       video: day.video
//         ? {
//             ...day.video,
//             referenceVideo: null,
//             referenceFiles: videoFiles,
//           }
//         : day.video,
//     };
//   });

//   fd.append("mediaData", JSON.stringify(jsonSafe));

//   mediaData.forEach((day, i) => {
//     (day.poster?.referencePoster || []).forEach((f, fi) => {
//       if (f instanceof File) fd.append(`day_${i}_referencePoster_${fi}`, f);
//     });
//     (day.poster?.referenceCertificate || []).forEach((f, fi) => {
//       if (f instanceof File) fd.append(`day_${i}_referenceCertificate_${fi}`, f);
//     });
//     (day.video?.referenceVideo || []).forEach((f, fi) => {
//       if (f instanceof File) fd.append(`day_${i}_referenceVideo_${fi}`, f);
//     });
//   });

//   return fd;
// }

// // ── Multi-select dropdown ─────────────────────────────────────────────────────

// function MultiSelectDropdown({ label, options, selected, onChange, error, labelBg = "#1E1E35" }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const toggle = (item) =>
//     onChange(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);

//   const displayText = selected.length === 0 ? "" : selected.join(" / ");

//   return (
//     <div className="w-full" ref={ref}>
//       <div className="relative w-full">
//         <span
//           className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
//           style={{ backgroundColor: labelBg }}
//         >
//           {label}
//         </span>
//         <div
//           onClick={() => setOpen(!open)}
//           className={`w-full bg-transparent border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-colors duration-200 min-h-[54px] ${
//             open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
//           }`}
//         >
//           <span
//             className={`text-sm leading-snug flex-1 mr-2 ${selected.length ? "text-white" : "text-gray-500"}`}
//             style={{ whiteSpace: "normal", wordBreak: "break-word" }}
//           >
//             {displayText || "Select options..."}
//           </span>
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
//             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//             className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
//             <polyline points="6 9 12 15 18 9" />
//           </svg>
//         </div>
//         {open && (
//           <div className="absolute top-full mt-1 w-full bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg z-20 max-h-52 overflow-y-auto custom-scrollbar">
//             {options.map((item, i) => {
//               const isSelected = selected.includes(item);
//               return (
//                 <div key={i} onClick={() => toggle(item)}
//                   className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
//                     isSelected ? "bg-purple-600/30 text-white" : "text-white hover:bg-purple-500/20"
//                   }`}>
//                   <span>{item}</span>
//                   {isSelected && (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400"
//                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
//                       strokeLinecap="round" strokeLinejoin="round">
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

// // ── ImagePreviewModal ─────────────────────────────────────────────────────────

// function ImagePreviewModal({ file, onClose }) {
//   const [objectUrl, setObjectUrl] = useState("");

//   useEffect(() => {
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     setObjectUrl(url);
//     return () => URL.revokeObjectURL(url);
//   }, [file]);

//   useEffect(() => {
//     const handler = (e) => { if (e.key === "Escape") onClose(); };
//     document.addEventListener("keydown", handler);
//     return () => document.removeEventListener("keydown", handler);
//   }, [onClose]);

//   if (!file || !objectUrl) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <button
//         type="button"
//         onClick={onClose}
//         className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#2A2A45] border border-[#3A3A5A] text-gray-300 hover:text-white hover:bg-[#3A3A5A] transition-colors duration-150 z-10"
//         aria-label="Close preview"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
//           className="w-4 h-4">
//           <line x1="18" y1="6" x2="6" y2="18" />
//           <line x1="6" y1="6" x2="18" y2="18" />
//         </svg>
//       </button>
//       <div
//         className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <img
//           src={objectUrl}
//           alt={file.name}
//           className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain shadow-2xl border border-[#3A3A5A]"
//         />
//         <p className="text-gray-400 text-xs truncate max-w-[80vw]">{file.name}</p>
//       </div>
//     </div>
//   );
// }

// // ── FileTabUpload ─────────────────────────────────────────────────────────────
// // Drop zone on top; uploaded files render as rounded pill tags with a cancel
// // button inside each. Clicking an image pill opens a full-screen preview.

// function FileTabUpload({ label, value = [], onChange, accept = ACCEPTED_FILE_TYPES, labelBg = "#1E1E35", sizeErrorPrefix = "" }) {
//   const inputRef = useRef();
//   const [sizeError,   setSizeError]   = useState("");
//   const [previewFile, setPreviewFile] = useState(null);

//   const handleFiles = (newFiles) => {
//     setSizeError("");
//     const valid     = [];
//     const oversized = [];
//     Array.from(newFiles).forEach((f) => {
//       if (f.size > MAX_FILE_SIZE_BYTES) oversized.push(f.name);
//       else valid.push(f);
//     });
//     if (oversized.length) {
//       setSizeError(`${sizeErrorPrefix}File(s) exceed ${MAX_FILE_SIZE_MB}MB: ${oversized.join(", ")}`);
//     }
//     if (valid.length) onChange([...value, ...valid]);
//   };

//   const removeFile = (idx) => {
//     onChange(value.filter((_, i) => i !== idx));
//     setSizeError("");
//   };

//   const isImage = (file) => file.type?.startsWith("image/");
//   const isPdf   = (file) => file.type === "application/pdf";
//   const isVideo = (file) => file.type?.startsWith("video/");

//   const fileIcon = (file) => {
//     if (isImage(file)) return "🖼️";
//     if (isPdf(file))   return "📄";
//     if (isVideo(file)) return "🎬";
//     return "📎";
//   };

//   const shortName = (name = "", max = 18) =>
//     name.length > max ? name.slice(0, max - 1) + "…" : name;

//   return (
//     <>
//       <div className="w-full flex flex-col gap-0">
//         <div className="relative w-full">
//           {/* Floating label */}
//           <span
//             className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
//             style={{ backgroundColor: labelBg }}
//           >
//             {label}
//           </span>

//           <div className="w-full bg-transparent border border-[#3A3A5A] rounded-lg overflow-hidden transition-colors duration-200 focus-within:border-purple-500">

//             {/* ── Drop zone (always visible) ── */}
//             <div
//               className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-purple-500/5 transition-colors duration-150"
//               onClick={() => inputRef.current.click()}
//               onDragOver={(e) => e.preventDefault()}
//               onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
//             >
//               <input
//                 ref={inputRef}
//                 type="file"
//                 className="hidden"
//                 accept={accept}
//                 multiple
//                 onChange={(e) => handleFiles(e.target.files)}
//                 onClick={(e) => { e.target.value = ""; }}
//               />
//               <div className="flex items-center gap-2 text-gray-500 text-sm">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400 flex-shrink-0" viewBox="0 0 24 24"
//                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <polyline points="16 16 12 12 8 16" />
//                   <line x1="12" y1="12" x2="12" y2="21" />
//                   <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
//                 </svg>
//                 <span>
//                   Drag & drop or{" "}
//                   <span className="text-purple-400 underline cursor-pointer">choose files</span>
//                 </span>
//               </div>
//             </div>

//             {/* ── Pill tags (shown only when files exist) ── */}
//             {value.length > 0 && (
//               <div className="px-3 py-3 flex flex-wrap gap-2">
//                 {value.map((file, idx) => (
//                   <div
//                     key={idx}
//                     onClick={() => { if (isImage(file)) setPreviewFile(file); }}
//                     className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2A2A45] border border-[#3A3A5A] text-xs text-white select-none transition-colors duration-150 ${
//                       isImage(file)
//                         ? "cursor-pointer hover:border-purple-500/60 hover:bg-[#2E2E50]"
//                         : ""
//                     }`}
//                   >
//                     <span className="flex-shrink-0">{fileIcon(file)}</span>
//                     <span className="truncate max-w-[120px]">{shortName(file.name, 18)}</span>
//                     <button
//                       type="button"
//                       onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
//                       className="flex-shrink-0 ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#3A3A5A] hover:bg-red-500/40 text-gray-400 hover:text-red-400 transition-colors duration-150"
//                       aria-label="Remove file"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
//                         stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
//                         className="w-2.5 h-2.5">
//                         <line x1="18" y1="6" x2="6" y2="18" />
//                         <line x1="6" y1="6" x2="18" y2="18" />
//                       </svg>
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//           </div>
//         </div>

//         {sizeError && <p className="text-red-400 text-xs mt-1">{sizeError}</p>}
//       </div>

//       {/* Image preview modal */}
//       {previewFile && (
//         <ImagePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
//       )}
//     </>
//   );
// }

// // ── PosterSection ─────────────────────────────────────────────────────────────

// function PosterSection({ data, onChange, errors = {}, showCertificate = false }) {
//   const update      = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });
//   const showFlex  = data.displayNeeded?.includes("Flex");
//   const showGlass = data.displayNeeded?.includes("Glass Sticker");

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3  border-[#3A3A5A]">
//         <h3 className="text-[#9810fa] text-base font-semibold">Poster</h3>
//       </div>

//       {/* Content for Poster */}
//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//             Content for Poster *
//           </span>
//           <textarea
//             value={data.contentPoster || ""}
//             onChange={updateInput("contentPoster")}
//             rows={3}
//             placeholder="content"
//             className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
//           />
//         </div>
//         <ErrorMsg msg={errors.contentPoster} />
//       </div>

//       {/* Reference Poster — tab-based file upload */}
//       <FileTabUpload
//         label="Reference Poster (If any)"
//         value={Array.isArray(data.referencePoster) ? data.referencePoster : (data.referencePoster ? [data.referencePoster] : [])}
//         onChange={update("referencePoster")}
//         accept={ACCEPTED_FILE_TYPES}
//         labelBg="#1E1E35"
//         sizeErrorPrefix="Poster: "
//       />

//       {/* ── Certificate fields — shown when purchase form has Certificate selected ── */}
//       {showCertificate && (
//         <>
//           <div>
//             <div className="relative w-full">
//               <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//                 Content for Certificate *
//               </span>
//               <textarea
//                 value={data.contentCertificate || ""}
//                 onChange={updateInput("contentCertificate")}
//                 rows={3}
//                 placeholder="content"
//                 className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
//               />
//             </div>
//             <ErrorMsg msg={errors.contentCertificate} />
//           </div>

//           {/* Reference Certificate — tab-based file upload */}
//           <FileTabUpload
//             label="Reference Certificate (If any)"
//             value={Array.isArray(data.referenceCertificate) ? data.referenceCertificate : (data.referenceCertificate ? [data.referenceCertificate] : [])}
//             onChange={update("referenceCertificate")}
//             accept={ACCEPTED_FILE_TYPES}
//             labelBg="#1E1E35"
//             sizeErrorPrefix="Certificate: "
//           />
//         </>
//       )}

//       {/* Content for Trophy */}
//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//             Content for Trophy *
//           </span>
//           <textarea
//             value={data.contentTrophy || ""}
//             onChange={updateInput("contentTrophy")}
//             rows={3}
//             placeholder="content"
//             className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
//           />
//         </div>
//         <ErrorMsg msg={errors.contentTrophy} />
//       </div>

//       {/* Display Needed */}
//       <div>
//         <MultiSelectDropdown
//           label="Display Needed *"
//           options={DISPLAY_OPTIONS}
//           selected={data.displayNeeded || []}
//           onChange={update("displayNeeded")}
//           error={errors.displayNeeded}
//         />
//       </div>

//       {(showFlex || showGlass) && (
//         <div className="flex gap-4">
//           {showFlex && (
//             <div className="flex-1">
//               <CustomInput labelBg="#1e1e35" label="Size for Flex *"
//                 value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
//               <ErrorMsg msg={errors.sizeForFlex} />
//             </div>
//           )}
//           {showGlass && (
//             <div className="flex-1">
//               <CustomInput labelBg="#1e1e35" label="Size for Glass Sticker *"
//                 value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
//               <ErrorMsg msg={errors.sizeForGlass} />
//             </div>
//           )}
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date"
//             value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""}
//             onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//             Special Requirements, If any
//           </span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes"
//             className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── VideoSection ──────────────────────────────────────────────────────────────

// function VideoSection({ data, onChange, errors = {} }) {
//   const update      = (field) => (val) => onChange({ ...data, [field]: val });
//   const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });

//   return (
//     <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
//       <div className="flex items-center gap-3 pb-3 border-[#3A3A5A]">
//         <h3 className="text-[#9810fa] text-base font-semibold">Video</h3>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//             Content for Video *
//           </span>
//           <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content"
//             className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
//         </div>
//         <ErrorMsg msg={errors.contentVideo} />
//       </div>

//       <div><MultiSelectDropdown label="Pre-Event Videos Needed *"  options={PRE_EVENT_OPTIONS}       selected={data.preEvent      || []} onChange={update("preEvent")}      error={errors.preEvent}      /></div>
//       <div><MultiSelectDropdown label="Event Coverage Needed *"    options={EVENT_COVERAGE_OPTIONS}  selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
//       <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS}      selected={data.postEvent     || []} onChange={update("postEvent")}     error={errors.postEvent}     /></div>
//       <div><MultiSelectDropdown label="Special Videos Needed *"    options={SPECIAL_VIDEO_OPTIONS}   selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

//       {/* Reference Video — tab-based file upload */}
//       <FileTabUpload
//         label="Reference Video (If any)"
//         value={Array.isArray(data.referenceVideo) ? data.referenceVideo : (data.referenceVideo ? [data.referenceVideo] : [])}
//         onChange={update("referenceVideo")}
//         accept={ACCEPTED_VIDEO_TYPES}
//         labelBg="#1E1E35"
//         sizeErrorPrefix="Video: "
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <CustomInput labelBg="#1E1E35" label="Delivery Date *" type="date"
//             value={data.deliveryDate || ""} onChange={updateInput("deliveryDate")} />
//           <ErrorMsg msg={errors.deliveryDate} />
//         </div>
//         <div>
//           <CustomSelect labelBg="#1E1E35" label="Priority *" value={data.priority || ""}
//             onChange={update("priority")} options={PRIORITY_OPTIONS} />
//           <ErrorMsg msg={errors.priority} />
//         </div>
//       </div>

//       <div>
//         <div className="relative w-full">
//           <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
//             Special Requirements, If any
//           </span>
//           <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes"
//             className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main MediaForm ────────────────────────────────────────────────────────────

// export default function MediaForm({
//   nextStep,
//   prevStep,
//   registerChildNavigation,
//   eventDays = [],
//   mediaData: externalMediaData,
//   onMediaDataChange,
//   onSave,
//   errors: externalErrors = {},
//   purchaseData = [],
// }) {
//   const dayCount = eventDays.length;

//   const [currentDayIndex, setCurrentDayIndex] = useState(0);
//   const [completedDays,   setCompletedDays]   = useState([]);
//   const [errors,          setErrors]          = useState({});
//   const [isLoading,       setIsLoading]       = useState(false);
//   const [apiError,        setApiError]        = useState("");

//   const [mediaData, setMediaData] = useState(() =>
//     Array.from({ length: Math.max(dayCount, 0) }, (_, i) =>
//       externalMediaData?.[i] ?? emptyDayData()
//     )
//   );

//   // Always-fresh refs
//   const mediaDataRef    = useRef(mediaData);
//   const onSaveRef       = useRef(onSave);
//   const prevStepRef     = useRef(prevStep);
//   const dayCountRef     = useRef(dayCount);
//   const currentIdxRef   = useRef(currentDayIndex);
//   const registerNavRef  = useRef(registerChildNavigation);
//   const purchaseDataRef = useRef(purchaseData);

//   useEffect(() => { mediaDataRef.current    = mediaData;               }, [mediaData]);
//   useEffect(() => { onSaveRef.current       = onSave;                  }, [onSave]);
//   useEffect(() => { prevStepRef.current     = prevStep;                }, [prevStep]);
//   useEffect(() => { dayCountRef.current     = dayCount;                }, [dayCount]);
//   useEffect(() => { currentIdxRef.current   = currentDayIndex;         }, [currentDayIndex]);
//   useEffect(() => { registerNavRef.current  = registerChildNavigation; }, [registerChildNavigation]);
//   useEffect(() => { purchaseDataRef.current = purchaseData;            }, [purchaseData]);

//   // ── Certificate detection ──────────────────────────────────────────────────
//   // Checks purchase form data for the given day: if requirementNeeded includes
//   // "Certificate", the poster section should show certificate fields.
//   const hasCertificateForDay = useCallback((dayIdx) => {
//     const pd = purchaseData[dayIdx];
//     // Support both array-form and string-form requirementNeeded
//     const req = pd?.requirementNeeded;
//     if (!req) return false;
//     if (Array.isArray(req)) return req.includes("Certificate");
//     if (typeof req === "string") return req === "Certificate" || req.includes("Certificate");
//     return false;
//   }, [purchaseData]);

//   // Sync local → parent
//   useEffect(() => {
//     if (onMediaDataChange) onMediaDataChange(mediaData);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mediaData]);

//   // Resize array when dayCount changes
//   useEffect(() => {
//     if (dayCount === 0) return;
//     setMediaData((prev) => {
//       if (prev.length === dayCount) return prev;
//       return Array.from({ length: dayCount }, (_, i) => prev[i] ?? emptyDayData());
//     });
//   }, [dayCount]);

//   // Clamp index when dayCount shrinks
//   useEffect(() => {
//     if (dayCount > 0 && currentDayIndex >= dayCount) setCurrentDayIndex(dayCount - 1);
//   }, [dayCount, currentDayIndex]);

//   const currentDay      = mediaData[currentDayIndex] ?? emptyDayData();
//   const currentErrors   = errors[currentDayIndex] || {};
//   const showPoster      = currentDay.designType === "Poster" || currentDay.designType === "Both";
//   const showVideo       = currentDay.designType === "Video"  || currentDay.designType === "Both";
//   const showCertificate = hasCertificateForDay(currentDayIndex);

//   const updateDay = (patch) => {
//     setMediaData((prev) => {
//       const updated = [...prev];
//       updated[currentDayIndex] = { ...(updated[currentDayIndex] ?? emptyDayData()), ...patch };
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
//     setApiError("");
//   };

//   // Push nav state up
//   const pushNavState = useCallback((overrideIdx, overrideLoading) => {
//     if (!registerNavRef.current) return;
//     const idx     = overrideIdx     ?? currentIdxRef.current;
//     const loading = overrideLoading ?? false;
//     const total   = dayCountRef.current;
//     const onLast  = total > 0 && idx === total - 1;
//     registerNavRef.current({
//       next:         (...args) => navRef.current.next(...args),
//       prev:         (...args) => navRef.current.prev(...args),
//       isLoading:    loading,
//       isOnLastDay:  onLast,
//       nextDayLabel: onLast ? "Save & Next" : `Day ${idx + 2} →`,
//     });
//   }, []);

//   // handleNext
//   const handleNext = useCallback(async () => {
//     const latestData     = mediaDataRef.current;
//     const latestPurchase = purchaseDataRef.current;
//     const idx            = currentIdxRef.current;
//     const total          = dayCountRef.current;

//     if (total === 0) return;

//     const isLast = idx === total - 1;

//     const certFlag  = !!(latestPurchase[idx]?.requirementNeeded?.includes
//       ? latestPurchase[idx].requirementNeeded.includes("Certificate")
//       : false);
//     const dayErrors = validateDay(latestData[idx] ?? emptyDayData(), certFlag);
//     if (Object.keys(dayErrors).length > 0) {
//       setErrors((prev) => ({ ...prev, [idx]: dayErrors }));
//       return;
//     }

//     setCompletedDays((prev) => prev.includes(idx) ? prev : [...prev, idx]);
//     setErrors((prev) => ({ ...prev, [idx]: {} }));

//     if (!isLast) {
//       const nextIdx = idx + 1;
//       setCurrentDayIndex(nextIdx);
//       setErrors((prev) => ({ ...prev, [nextIdx]: {} }));
//       pushNavState(nextIdx, false);
//       return;
//     }

//     // Last day: validate all
//     const allErrors = {};
//     latestData.forEach((day, i) => {
//       const pd  = latestPurchase[i];
//       const req = pd?.requirementNeeded;
//       const cf  = Array.isArray(req) ? req.includes("Certificate") : false;
//       const e   = validateDay(day, cf);
//       if (Object.keys(e).length > 0) allErrors[i] = e;
//     });
//     if (Object.keys(allErrors).length > 0) {
//       setErrors(allErrors);
//       setCurrentDayIndex(parseInt(Object.keys(allErrors)[0]));
//       return;
//     }

//     setIsLoading(true);
//     pushNavState(idx, true);
//     setApiError("");
//     try {
//       const formData = buildMediaFormData(latestData);
//       if (onSaveRef.current) await onSaveRef.current(formData);
//       if (registerNavRef.current) {
//         registerNavRef.current({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
//       }
//     } catch (err) {
//       setApiError(err?.message || "Failed to save media details. Please try again.");
//     } finally {
//       setIsLoading(false);
//       pushNavState(idx, false);
//     }
//   }, []);

//   // handleBack
//   const handleBack = useCallback(() => {
//     const idx = currentIdxRef.current;
//     if (idx > 0) {
//       const prevIdx = idx - 1;
//       setErrors((prev) => ({ ...prev, [idx]: {} }));
//       setCurrentDayIndex(prevIdx);
//       pushNavState(prevIdx, false);
//     } else {
//       if (prevStepRef.current) prevStepRef.current();
//     }
//   }, []);

//   const navRef = useRef({ next: handleNext, prev: handleBack });
//   navRef.current = { next: handleNext, prev: handleBack };

//   // Register on mount
//   useEffect(() => {
//     if (!registerChildNavigation) return;
//     const stableNext = (...args) => navRef.current.next(...args);
//     const stablePrev = (...args) => navRef.current.prev(...args);
//     const onLast     = dayCount <= 1;
//     registerChildNavigation({
//       next:         stableNext,
//       prev:         stablePrev,
//       isLoading:    false,
//       isOnLastDay:  onLast,
//       nextDayLabel: onLast ? "Save & Next" : "Day 2 →",
//     });
//     return () => registerChildNavigation({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerChildNavigation]);

//   useEffect(() => {
//     pushNavState(currentDayIndex, isLoading);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isLoading, currentDayIndex]);

//   // Guard
//   if (dayCount === 0) {
//     return (
//       <div className="flex flex-col gap-6 pb-6">
//         <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-6 text-center">
//           <p className="text-gray-400 text-sm">
//             No event days found. Please go back and add event days first.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-6 pb-6">
//       <DayTimeline
//         days={eventDays.slice(0, dayCount)}
//         currentDayIndex={currentDayIndex}
//         completedDays={completedDays}
//       />

//       <h2 className="text-white text-lg font-bold">
//         Media Requirement Details
//         {/* {dayCount > 1 && (
//           <span className="ml-2 text-sm font-normal text-gray-400">
//             ({currentDayIndex + 1} of {dayCount})
//           </span>
//         )} */}
//       </h2>

//       {/* Day progress bar */}
//       {/* {dayCount > 1 && (
//         <div className="flex items-center gap-2">
//           {Array.from({ length: dayCount }).map((_, i) => (
//             <div
//               key={i}
//               className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
//                 completedDays.includes(i)
//                   ? "bg-purple-500"
//                   : i === currentDayIndex
//                   ? "bg-purple-400/60"
//                   : "bg-[#3A3A5A]"
//               }`}
//             />
//           ))}
//         </div>
//       )} */}

//       {apiError && (
//         <div className="rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
//           <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24"
//             fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//           <p className="text-red-400 text-sm">{apiError}</p>
//         </div>
//       )}

//       <div className="rounded-xl">
//         <CustomSelect
//           label="Type of Design Required *"
//           value={currentDay.designType || ""}
//           onChange={handleDesignTypeChange}
//           options={DESIGN_TYPE_OPTIONS}
//         />
//         <ErrorMsg msg={currentErrors.designType} />
//       </div>

//       {showPoster && (
//         <PosterSection
//           data={currentDay.poster || emptyPoster()}
//           onChange={(d) => updateDay({ poster: d })}
//           errors={currentErrors.poster || {}}
//           showCertificate={showCertificate}
//         />
//       )}

//       {showVideo && (
//         <VideoSection
//           data={currentDay.video || emptyVideo()}
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

const ACCEPTED_FILE_TYPES    = "image/*,application/pdf";
const ACCEPTED_VIDEO_TYPES   = "video/mp4";
const MAX_FILE_SIZE_MB       = 10;
const MAX_FILE_SIZE_BYTES    = MAX_FILE_SIZE_MB * 1024 * 1024;

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

// ── Empty factories ───────────────────────────────────────────────────────────

function emptyPoster() {
  return {
    contentPoster: "", referencePoster: [],
    contentCertificate: "", referenceCertificate: [],
    contentTrophy: "", displayNeeded: [],
    sizeForFlex: "", sizeForGlass: "",
    deliveryDate: "", priority: "", specialReq: "",
  };
}

function emptyVideo() {
  return {
    contentVideo: "", preEvent: [], eventCoverage: [],
    postEvent: [], specialVideos: [], referenceVideo: [],
    deliveryDate: "", priority: "", specialReq: "",
  };
}

function emptyDayData() {
  return { designType: "", poster: emptyPoster(), video: emptyVideo() };
}

// ── Validators ────────────────────────────────────────────────────────────────

function validatePoster(data, showCertificate = false) {
  const e = {};
  if (!data.contentPoster?.trim())  e.contentPoster = "Content for poster is required";
  if (showCertificate && !data.contentCertificate?.trim())
    e.contentCertificate = "Content for certificate is required";
  if (!data.contentTrophy?.trim())  e.contentTrophy = "Content for trophy is required";
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

function validateDay(data, showCertificate = false) {
  const e = {};
  if (!data.designType) { e.designType = "Please select a design type"; return e; }
  if (data.designType === "Poster" || data.designType === "Both") {
    const pe = validatePoster(data.poster || {}, showCertificate);
    if (Object.keys(pe).length > 0) e.poster = pe;
  }
  if (data.designType === "Video" || data.designType === "Both") {
    const ve = validateVideo(data.video || {});
    if (Object.keys(ve).length > 0) e.video = ve;
  }
  return e;
}

// ── Build FormData for submission (includes File objects) ─────────────────────

export function buildMediaFormData(mediaData) {
  const fd = new FormData();

  const jsonSafe = mediaData.map((day, i) => {
    const posterFiles      = [];
    const certFiles        = [];
    const videoFiles       = [];

    (day.poster?.referencePoster || []).forEach((f, fi) => {
      if (f instanceof File) posterFiles.push(`day_${i}_referencePoster_${fi}`);
    });
    (day.poster?.referenceCertificate || []).forEach((f, fi) => {
      if (f instanceof File) certFiles.push(`day_${i}_referenceCertificate_${fi}`);
    });
    (day.video?.referenceVideo || []).forEach((f, fi) => {
      if (f instanceof File) videoFiles.push(`day_${i}_referenceVideo_${fi}`);
    });

    return {
      ...day,
      poster: day.poster
        ? {
            ...day.poster,
            referencePoster:           null,
            referenceCertificate:      null,
            referencePosterFiles:      posterFiles,
            referenceCertificateFiles: certFiles,
          }
        : day.poster,
      video: day.video
        ? {
            ...day.video,
            referenceVideo: null,
            referenceFiles: videoFiles,
          }
        : day.video,
    };
  });

  fd.append("mediaData", JSON.stringify(jsonSafe));

  mediaData.forEach((day, i) => {
    (day.poster?.referencePoster || []).forEach((f, fi) => {
      if (f instanceof File) fd.append(`day_${i}_referencePoster_${fi}`, f);
    });
    (day.poster?.referenceCertificate || []).forEach((f, fi) => {
      if (f instanceof File) fd.append(`day_${i}_referenceCertificate_${fi}`, f);
    });
    (day.video?.referenceVideo || []).forEach((f, fi) => {
      if (f instanceof File) fd.append(`day_${i}_referenceVideo_${fi}`, f);
    });
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

  const displayText = selected.length === 0 ? "" : selected.join(" / ");

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
          className={`w-full bg-transparent border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-colors duration-200 min-h-[54px] ${
            open ? "border-purple-500" : error ? "border-red-400" : "border-[#3A3A5A]"
          }`}
        >
          <span
            className={`text-sm leading-snug flex-1 mr-2 ${selected.length ? "text-white" : "text-gray-500"}`}
            style={{ whiteSpace: "normal", wordBreak: "break-word" }}
          >
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

// ── ImagePreviewModal ─────────────────────────────────────────────────────────

function ImagePreviewModal({ file, onClose }) {
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!file || !objectUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#2A2A45] border border-[#3A3A5A] text-gray-300 hover:text-white hover:bg-[#3A3A5A] transition-colors duration-150 z-10"
        aria-label="Close preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={objectUrl}
          alt={file.name}
          className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain shadow-2xl border border-[#3A3A5A]"
        />
        <p className="text-gray-400 text-xs truncate max-w-[80vw]">{file.name}</p>
      </div>
    </div>
  );
}

// ── FileTabUpload ─────────────────────────────────────────────────────────────
// Drop zone on top; uploaded files render as rounded pill tags with a cancel
// button inside each. Clicking an image pill opens a full-screen preview.

function FileTabUpload({ label, value = [], onChange, accept = ACCEPTED_FILE_TYPES, labelBg = "#1E1E35", sizeErrorPrefix = "" }) {
  const inputRef = useRef();
  const [sizeError,   setSizeError]   = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  const handleFiles = (newFiles) => {
    setSizeError("");
    const valid     = [];
    const oversized = [];
    Array.from(newFiles).forEach((f) => {
      if (f.size > MAX_FILE_SIZE_BYTES) oversized.push(f.name);
      else valid.push(f);
    });
    if (oversized.length) {
      setSizeError(`${sizeErrorPrefix}File(s) exceed ${MAX_FILE_SIZE_MB}MB: ${oversized.join(", ")}`);
    }
    if (valid.length) onChange([...value, ...valid]);
  };

  const removeFile = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
    setSizeError("");
  };

  const isImage = (file) => file.type?.startsWith("image/");
  const isPdf   = (file) => file.type === "application/pdf";
  const isVideo = (file) => file.type?.startsWith("video/");

  const fileIcon = (file) => {
    if (isImage(file)) return "🖼️";
    if (isPdf(file))   return "📄";
    if (isVideo(file)) return "🎬";
    return "📎";
  };

  const shortName = (name = "", max = 18) =>
    name.length > max ? name.slice(0, max - 1) + "…" : name;

  return (
    <>
      <div className="w-full flex flex-col gap-0">
        <div className="relative w-full">
          {/* Floating label */}
          <span
            className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none"
            style={{ backgroundColor: labelBg }}
          >
            {label}
          </span>

          <div className="w-full bg-transparent border border-[#3A3A5A] rounded-lg overflow-hidden transition-colors duration-200 focus-within:border-purple-500">

            {/* ── Drop zone (always visible) ── */}
            <div
              className="px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-purple-500/5 transition-colors duration-150"
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                onClick={(e) => { e.target.value = ""; }}
              />
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400 flex-shrink-0" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                <span>
                  Drag & drop or{" "}
                  <span className="text-purple-400 underline cursor-pointer">choose files</span>
                </span>
              </div>
            </div>

            {/* ── Pill tags (shown only when files exist) ── */}
            {value.length > 0 && (
              <div className="px-3 py-3 flex flex-wrap gap-2">
                {value.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => { if (isImage(file)) setPreviewFile(file); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2A2A45] border border-[#3A3A5A] text-xs text-white select-none transition-colors duration-150 ${
                      isImage(file)
                        ? "cursor-pointer hover:border-purple-500/60 hover:bg-[#2E2E50]"
                        : ""
                    }`}
                  >
                    <span className="flex-shrink-0">{fileIcon(file)}</span>
                    <span className="truncate max-w-[120px]">{shortName(file.name, 18)}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="flex-shrink-0 ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#3A3A5A] hover:bg-red-500/40 text-gray-400 hover:text-red-400 transition-colors duration-150"
                      aria-label="Remove file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        className="w-2.5 h-2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {sizeError && <p className="text-red-400 text-xs mt-1">{sizeError}</p>}
      </div>

      {/* Image preview modal */}
      {previewFile && (
        <ImagePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}

// ── PosterSection ─────────────────────────────────────────────────────────────

function PosterSection({ data, onChange, errors = {}, showCertificate = false }) {
  const update      = (field) => (val) => onChange({ ...data, [field]: val });
  const updateInput = (field) => (e)   => onChange({ ...data, [field]: e.target.value });
  const showFlex  = data.displayNeeded?.includes("Flex");
  const showGlass = data.displayNeeded?.includes("Glass Sticker");

  return (
    <div className="rounded-xl border border-[#3A3A5A] bg-[#1E1E35] p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3  border-[#3A3A5A]">
        <h3 className="text-[#9810fa] text-base font-semibold">Poster</h3>
      </div>

      {/* Content for Poster */}
      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Content for Poster *
          </span>
          <textarea
            value={data.contentPoster || ""}
            onChange={updateInput("contentPoster")}
            rows={3}
            placeholder="content"
            className={`w-full bg-transparent border ${errors.contentPoster ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
          />
        </div>
        <ErrorMsg msg={errors.contentPoster} />
      </div>

      {/* Reference Poster — tab-based file upload */}
      <FileTabUpload
        label="Reference Poster (If any)"
        value={Array.isArray(data.referencePoster) ? data.referencePoster : (data.referencePoster ? [data.referencePoster] : [])}
        onChange={update("referencePoster")}
        accept={ACCEPTED_FILE_TYPES}
        labelBg="#1E1E35"
        sizeErrorPrefix="Poster: "
      />

      {/* ── Certificate fields — shown when purchase form has Certificate selected ── */}
      {showCertificate && (
        <>
          <div>
            <div className="relative w-full">
              <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
                Content for Certificate *
              </span>
              <textarea
                value={data.contentCertificate || ""}
                onChange={updateInput("contentCertificate")}
                rows={3}
                placeholder="content"
                className={`w-full bg-transparent border ${errors.contentCertificate ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
              />
            </div>
            <ErrorMsg msg={errors.contentCertificate} />
          </div>

          {/* Reference Certificate — tab-based file upload */}
          <FileTabUpload
            label="Reference Certificate (If any)"
            value={Array.isArray(data.referenceCertificate) ? data.referenceCertificate : (data.referenceCertificate ? [data.referenceCertificate] : [])}
            onChange={update("referenceCertificate")}
            accept={ACCEPTED_FILE_TYPES}
            labelBg="#1E1E35"
            sizeErrorPrefix="Certificate: "
          />
        </>
      )}

      {/* Content for Trophy */}
      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Content for Trophy *
          </span>
          <textarea
            value={data.contentTrophy || ""}
            onChange={updateInput("contentTrophy")}
            rows={3}
            placeholder="content"
            className={`w-full bg-transparent border ${errors.contentTrophy ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`}
          />
        </div>
        <ErrorMsg msg={errors.contentTrophy} />
      </div>

      {/* Display Needed */}
      <div>
        <MultiSelectDropdown
          label="Display Needed *"
          options={DISPLAY_OPTIONS}
          selected={data.displayNeeded || []}
          onChange={update("displayNeeded")}
          error={errors.displayNeeded}
        />
      </div>

      {(showFlex || showGlass) && (
        <div className="flex gap-4">
          {showFlex && (
            <div className="flex-1">
              <CustomInput labelBg="#1e1e35" label="Size for Flex *"
                value={data.sizeForFlex || ""} onChange={updateInput("sizeForFlex")} placeholder="e.g. 4ft x 6ft" />
              <ErrorMsg msg={errors.sizeForFlex} />
            </div>
          )}
          {showGlass && (
            <div className="flex-1">
              <CustomInput labelBg="#1e1e35" label="Size for Glass Sticker *"
                value={data.sizeForGlass || ""} onChange={updateInput("sizeForGlass")} placeholder="e.g. A4" />
              <ErrorMsg msg={errors.sizeForGlass} />
            </div>
          )}
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
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, If any
          </span>
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
      <div className="flex items-center gap-3 pb-3 border-[#3A3A5A]">
        <h3 className="text-[#9810fa] text-base font-semibold">Video</h3>
      </div>

      <div>
        <div className="relative w-full">
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Content for Video *
          </span>
          <textarea value={data.contentVideo || ""} onChange={updateInput("contentVideo")} rows={3} placeholder="content"
            className={`w-full bg-transparent border ${errors.contentVideo ? "border-red-400" : "border-[#3A3A5A]"} text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600`} />
        </div>
        <ErrorMsg msg={errors.contentVideo} />
      </div>

      <div><MultiSelectDropdown label="Pre-Event Videos Needed *"  options={PRE_EVENT_OPTIONS}       selected={data.preEvent      || []} onChange={update("preEvent")}      error={errors.preEvent}      /></div>
      <div><MultiSelectDropdown label="Event Coverage Needed *"    options={EVENT_COVERAGE_OPTIONS}  selected={data.eventCoverage || []} onChange={update("eventCoverage")} error={errors.eventCoverage} /></div>
      <div><MultiSelectDropdown label="Post-Event Videos Needed *" options={POST_EVENT_OPTIONS}      selected={data.postEvent     || []} onChange={update("postEvent")}     error={errors.postEvent}     /></div>
      <div><MultiSelectDropdown label="Special Videos Needed *"    options={SPECIAL_VIDEO_OPTIONS}   selected={data.specialVideos || []} onChange={update("specialVideos")} error={errors.specialVideos} /></div>

      {/* Reference Video — tab-based file upload */}
      <FileTabUpload
        label="Reference Video (If any)"
        value={Array.isArray(data.referenceVideo) ? data.referenceVideo : (data.referenceVideo ? [data.referenceVideo] : [])}
        onChange={update("referenceVideo")}
        accept={ACCEPTED_VIDEO_TYPES}
        labelBg="#1E1E35"
        sizeErrorPrefix="Video: "
      />

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
          <span className="absolute left-3 -top-[9px] text-xs text-white px-1 bg-[#1E1E35] z-10 pointer-events-none">
            Special Requirements, If any
          </span>
          <textarea value={data.specialReq || ""} onChange={updateInput("specialReq")} rows={3} placeholder="notes"
            className="w-full bg-transparent border border-[#3A3A5A] text-white rounded-lg p-4 text-sm focus:outline-none focus:border-purple-500 resize-none placeholder-gray-600" />
        </div>
      </div>
    </div>
  );
}

// ── Main MediaForm ────────────────────────────────────────────────────────────

export default function MediaForm({
  nextStep,
  prevStep,
  registerChildNavigation,
  eventDays = [],
  mediaData: externalMediaData,
  onMediaDataChange,
  onSave,
  errors: externalErrors = {},
  purchaseData = [],
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

  // Always-fresh refs
  const mediaDataRef    = useRef(mediaData);
  const onSaveRef       = useRef(onSave);
  const prevStepRef     = useRef(prevStep);
  const dayCountRef     = useRef(dayCount);
  const currentIdxRef   = useRef(currentDayIndex);
  const registerNavRef  = useRef(registerChildNavigation);
  const purchaseDataRef = useRef(purchaseData);

  useEffect(() => { mediaDataRef.current    = mediaData;               }, [mediaData]);
  useEffect(() => { onSaveRef.current       = onSave;                  }, [onSave]);
  useEffect(() => { prevStepRef.current     = prevStep;                }, [prevStep]);
  useEffect(() => { dayCountRef.current     = dayCount;                }, [dayCount]);
  useEffect(() => { currentIdxRef.current   = currentDayIndex;         }, [currentDayIndex]);
  useEffect(() => { registerNavRef.current  = registerChildNavigation; }, [registerChildNavigation]);
  useEffect(() => { purchaseDataRef.current = purchaseData;            }, [purchaseData]);

  // ── Certificate detection ──────────────────────────────────────────────────
  // Checks purchase form data for the given day: if requirementNeeded includes
  // "Certificate", the poster section should show certificate fields.
  const hasCertificateForDay = useCallback((dayIdx) => {
    const pd = purchaseData[dayIdx];
    // Support both array-form and string-form requirementNeeded
    const req = pd?.requirementNeeded;
    if (!req) return false;
    if (Array.isArray(req)) return req.includes("Certificate");
    if (typeof req === "string") return req === "Certificate" || req.includes("Certificate");
    return false;
  }, [purchaseData]);

  // Sync local → parent
  useEffect(() => {
    if (onMediaDataChange) onMediaDataChange(mediaData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaData]);

  // Resize array when dayCount changes
  useEffect(() => {
    if (dayCount === 0) return;
    setMediaData((prev) => {
      if (prev.length === dayCount) return prev;
      return Array.from({ length: dayCount }, (_, i) => prev[i] ?? emptyDayData());
    });
  }, [dayCount]);

  // Clamp index when dayCount shrinks
  useEffect(() => {
    if (dayCount > 0 && currentDayIndex >= dayCount) setCurrentDayIndex(dayCount - 1);
  }, [dayCount, currentDayIndex]);

  const currentDay      = mediaData[currentDayIndex] ?? emptyDayData();
  const currentErrors   = errors[currentDayIndex] || {};
  const showPoster      = currentDay.designType === "Poster" || currentDay.designType === "Both";
  const showVideo       = currentDay.designType === "Video"  || currentDay.designType === "Both";
  const showCertificate = hasCertificateForDay(currentDayIndex);

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

  // Push nav state up
  const pushNavState = useCallback((overrideIdx, overrideLoading) => {
    if (!registerNavRef.current) return;
    const idx     = overrideIdx     ?? currentIdxRef.current;
    const loading = overrideLoading ?? false;
    const total   = dayCountRef.current;
    const onLast  = total > 0 && idx === total - 1;
    registerNavRef.current({
      next:         (...args) => navRef.current.next(...args),
      prev:         (...args) => navRef.current.prev(...args),
      isLoading:    loading,
      isOnLastDay:  onLast,
      nextDayLabel: onLast ? "Save & Next" : `Day ${idx + 2} →`,
    });
  }, []);

  // handleNext
  const handleNext = useCallback(async () => {
    const latestData     = mediaDataRef.current;
    const latestPurchase = purchaseDataRef.current;
    const idx            = currentIdxRef.current;
    const total          = dayCountRef.current;

    if (total === 0) return;

    const isLast = idx === total - 1;

    const certFlag  = !!(latestPurchase[idx]?.requirementNeeded?.includes
      ? latestPurchase[idx].requirementNeeded.includes("Certificate")
      : false);
    const dayErrors = validateDay(latestData[idx] ?? emptyDayData(), certFlag);
    if (Object.keys(dayErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [idx]: dayErrors }));
      return;
    }

    setCompletedDays((prev) => prev.includes(idx) ? prev : [...prev, idx]);
    setErrors((prev) => ({ ...prev, [idx]: {} }));

    if (!isLast) {
      const nextIdx = idx + 1;
      setCurrentDayIndex(nextIdx);
      setErrors((prev) => ({ ...prev, [nextIdx]: {} }));
      pushNavState(nextIdx, false);
      return;
    }

    // Last day: validate all
    const allErrors = {};
    latestData.forEach((day, i) => {
      const pd  = latestPurchase[i];
      const req = pd?.requirementNeeded;
      const cf  = Array.isArray(req) ? req.includes("Certificate") : false;
      const e   = validateDay(day, cf);
      if (Object.keys(e).length > 0) allErrors[i] = e;
    });
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentDayIndex(parseInt(Object.keys(allErrors)[0]));
      return;
    }

    setIsLoading(true);
    pushNavState(idx, true);
    setApiError("");
    try {
      const formData = buildMediaFormData(latestData);
      if (onSaveRef.current) await onSaveRef.current(formData);
      if (registerNavRef.current) {
        registerNavRef.current({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
      }
    } catch (err) {
      setApiError(err?.message || "Failed to save media details. Please try again.");
    } finally {
      setIsLoading(false);
      pushNavState(idx, false);
    }
  }, []);

  // handleBack
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
  }, []);

  const navRef = useRef({ next: handleNext, prev: handleBack });
  navRef.current = { next: handleNext, prev: handleBack };

  // Register on mount
  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    const stablePrev = (...args) => navRef.current.prev(...args);
    const onLast     = dayCount <= 1;
    registerChildNavigation({
      next:         stableNext,
      prev:         stablePrev,
      isLoading:    false,
      isOnLastDay:  onLast,
      nextDayLabel: onLast ? "Save & Next" : "Day 2 →",
    });
    return () => registerChildNavigation({ next: null, prev: null, isLoading: false, isOnLastDay: true, nextDayLabel: "Save & Next" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerChildNavigation]);

  useEffect(() => {
    pushNavState(currentDayIndex, isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, currentDayIndex]);

  // Guard
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

  return (
    <div className="flex flex-col gap-6 pb-6">
      <DayTimeline
        days={eventDays.slice(0, dayCount)}
        currentDayIndex={currentDayIndex}
        completedDays={completedDays}
      />

      <h2 className="text-white text-lg font-bold">
        Media Requirement Details
        {/* {dayCount > 1 && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({currentDayIndex + 1} of {dayCount})
          </span>
        )} */}
      </h2>

      {/* Day progress bar */}
      {/* {dayCount > 1 && (
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
      )} */}

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

      <div className="rounded-xl">
        <CustomSelect
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
          showCertificate={showCertificate}
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