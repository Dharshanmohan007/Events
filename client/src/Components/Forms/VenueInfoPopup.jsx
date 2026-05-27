import React, { useState, useEffect, useRef } from "react";


const audioKeys = [
  { key: "collarMic",        label: "COLLAR MIC" },
  { key: "handMic",          label: "HAND MIC" },
  { key: "handSpeaker",      label: "HAND SPEAKER" },
  { key: "podiumWithMic",    label: "PODIUM WITH MIC" },
  { key: "wiredMic",         label: "WIRED MIC" },
  { key: "speakerWithMixer", label: "SPEAKER W/ MIXER" },
  { key: "paSystem",         label: "PA SYSTEM" },
];

export default function VenueInfoPopup({ venueName, onClose }) {
  const [venueDetail, setVenueDetail] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const overlayRef                    = useRef(null);

  // Fetch venue list and match by name
  useEffect(() => {
    if (!venueName) return;
    let cancelled = false;

    const fetchVenues = async () => {
      setLoading(true);
      setError("");
      setVenueDetail(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/venues`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const matched = data.find(
            (v) => v.venue?.toLowerCase() === venueName?.toLowerCase()
          );
          setVenueDetail(matched || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load venue details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVenues();
    return () => { cancelled = true; };
  }, [venueName]);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const getActiveAudioKeys = (audio) => {
    if (!audio) return [];
    return audioKeys.filter(({ key }) => key in audio);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Close button anchor */}
        <div className="px-6 pt-5 pb-0">
          <button
            onClick={onClose}
            aria-label="Close venue details"
            className="absolute top-12 right-11 w-7 h-7 rounded-full flex items-center justify-center bg-[#2C2C2E] text-gray-400 hover:text-white hover:bg-[#3A3A3C] transition-all z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content card */}
        <div
          className="mx-4 mb-4 rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#232325", border: "1px solid #3A3A3C" }}
        >
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm">Loading venue details…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Not found */}
          {!loading && !error && !venueDetail && (
            <div className="text-center py-12 text-gray-500">
              <p>
                No details found for{" "}
                <strong className="text-gray-400">{venueName}</strong>
              </p>
            </div>
          )}

          {/* Venue details */}
          {!loading && !error && venueDetail && (() => {
            const activeAudio = getActiveAudioKeys(venueDetail.audio || {});
            return (
              <>
                {/* Header */}
                <div>
                  <h2 className="text-white text-3xl font-bold tracking-tight mb-1">
                    {venueDetail.venue}
                  </h2>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                      {venueDetail.block}
                      {venueDetail.floor ? ` , ${venueDetail.floor}` : ""}
                    </span>
                  </div>
                </div>

                {/* Capacity cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "CAPACITY",           value: venueDetail.capacity },
                    { label: "WITH PROCTORING",    value: venueDetail.seating?.withProctoring ?? 0 },
                    { label: "WITHOUT PROCTORING", value: venueDetail.seating?.withoutProctoring ?? 0 },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl p-4 flex flex-col gap-2"
                      style={{ background: "#2C2C2E" }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        {label}
                      </span>
                      {value > 0 ? (
                        <span className="text-white text-2xl font-bold leading-none">
                          {value}{" "}
                          <span className="text-lg font-semibold">Seats</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold leading-none">
                          N / A
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Audio equipment */}
                {activeAudio.length > 0 && (
                  <div
                    className="rounded-xl overflow-x-auto"
                    style={{ background: "#2C2C2E" }}
                  >
                    <div className="flex divide-x divide-[#3A3A3C] min-w-max w-full">
                      {activeAudio.map(({ key, label }) => {
                        const count = venueDetail.audio[key] ?? 0;
                        return (
                          <div
                            key={key}
                            className="flex-1 px-5 py-4 flex flex-col gap-2 min-w-[110px]"
                          >
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-tight whitespace-nowrap">
                              {label}
                            </span>
                            {count > 0 ? (
                              <span className="text-white text-xl font-bold leading-none whitespace-nowrap">
                                {count}{" "}
                                <span className="text-sm font-semibold">Available</span>
                              </span>
                            ) : (
                              <span className="text-gray-500 text-base font-semibold leading-none">
                                N / A
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {venueDetail.remarks && (
                  <div
                    className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                    style={{ background: "#2C2C2E" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">{venueDetail.remarks}</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}