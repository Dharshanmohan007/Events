import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Upload,
  FileText,
  X,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";

const MediaDetailsPage = () => {
  // =========================
  // MAIN TYPE DROPDOWN
  // =========================
  const [showTypeDropdown, setShowTypeDropdown] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("");

  const typeOptions = [
    "Poster",
    "Video",
  ];

  // =========================
  // POSTER STATES
  // =========================
  const [showDisplayDropdown, setShowDisplayDropdown] =
    useState(false);

  const [
    showPosterPriorityDropdown,
    setShowPosterPriorityDropdown,
  ] = useState(false);

  const [selectedDisplay, setSelectedDisplay] =
    useState("");

  const displayOptions = [
    "Flex",
    "A type Standee",
    "Website Banner",
    "TV Display",
    "ID card",
    "Plug card",
    "Momento card",
    "Glass Sticker",
  ];

  const priorityOptions = [
    "High",
    "Medium",
    "Low",
  ];

  // Auth 
  const [id, setId] = useState("");
  useEffect(()=>{
    const token = localStorage.getItem("token");
      console.log("token :", token);

    if(token) {
      const decoded = jwtDecode(token);
      setId(decoded.id);

      console.log("Decoded JWT:", decoded);
    }
  }, [])
  



  // =========================
  // POSTER FILES
  // =========================
  const [posterFile, setPosterFile] =
    useState(null);

  const [certificateFile, setCertificateFile] =
    useState(null);

  const [trophyFile, setTrophyFile] =
    useState(null);

  // =========================
  // POSTER INPUTS
  // =========================
  const [posterContent, setPosterContent] =
    useState("");
  console.log("poster content  : ", posterContent);

  const [
    certificateContent,
    setCertificateContent,
  ] = useState("");

  const [trophyContent, setTrophyContent] =
    useState("");

  const [displaySize, setDisplaySize] =
    useState("");

  const [
    glassStickerSize,
    setGlassStickerSize,
  ] = useState("");

  const [
    posterDeliveryDate,
    setPosterDeliveryDate,
  ] = useState("");

  const [posterPriority, setPosterPriority] =
    useState("High");

  const [
    posterRequirement,
    setPosterRequirement,
  ] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // =========================
  // VIDEO STATES
  // =========================
  const [showPreEvent, setShowPreEvent] =
    useState(false);

  const [showCoverage, setShowCoverage] =
    useState(false);

  const [showPostEvent, setShowPostEvent] =
    useState(false);

  const [
    showSpecialVideo,
    setShowSpecialVideo,
  ] = useState(false);

  const [
    showVideoPriorityDropdown,
    setShowVideoPriorityDropdown,
  ] = useState(false);

  const [selectedPreEvent, setSelectedPreEvent] =
    useState("");

  const [selectedCoverage, setSelectedCoverage] =
    useState("");

  const [selectedPostEvent, setSelectedPostEvent] =
    useState("");

  const [
    selectedSpecialVideo,
    setSelectedSpecialVideo,
  ] = useState("");

  const preEventOptions = [
    "Coming Soon Video",
    "Promotional Video",
    "Invitation Video",
  ];

  const coverageOptions = [
    "Full coverage",
    "Highlights",
    "Voice over",
  ];

  const postEventOptions = [
    "Event Glimpse",
    "Post Event Video",
  ];

  const specialVideoOptions = [
    "Chief Guest Event",
    "Testimonials",
  ];

  const [videoContent, setVideoContent] =
    useState("");

  const [videoFile, setVideoFile] =
    useState(null);

  const [videoDuration, setVideoDuration] =
    useState("");

  const [
    videoDeliveryDate,
    setVideoDeliveryDate,
  ] = useState("");

  const [videoPriority, setVideoPriority] =
    useState("High");

  const [
    videoRequirement,
    setVideoRequirement,
  ] = useState("");

  // =========================
  // REMOVE FILE
  // =========================
  const removeFile = (type) => {
    if (type === "poster") {
      setPosterFile(null);
    }

    if (type === "certificate") {
      setCertificateFile(null);
    }

    if (type === "trophy") {
      setTrophyFile(null);
    }

    if (type === "video") {
      setVideoFile(null);
    }
  };

  const validatePoster = () => {
    const errors = [];
    if (!selectedType) {
      errors.push("Please select a Type of Design Required.");
    }
    if (selectedType === "Poster") {
      if (!posterContent.trim()) {
        errors.push("Content for Poster is required.");
      }
      if (!selectedDisplay) {
        errors.push("Display Needed is required.");
      }
      if (selectedDisplay) {
        if (selectedDisplay === "Glass Sticker") {
          if (!glassStickerSize.trim()) {
            errors.push("Size for Glass Sticker is required.");
          }
        } else if (!displaySize.trim()) {
          errors.push(`Size for ${selectedDisplay} is required.`);
        }
      }
      if (!posterDeliveryDate) {
        errors.push("Delivery Date is required.");
      }
      if (!posterPriority) {
        errors.push("Priority is required.");
      }
      if (!posterRequirement.trim()) {
        errors.push("Special Requirements is required.");
      }
    }
    return errors;
  };

  const validateVideo = () => {
    const errors = [];
    if (!selectedType) {
      errors.push("Please select a Type of Design Required.");
    }
    if (selectedType === "Video") {
      if (!videoContent.trim()) {
        errors.push("Content for Video is required.");
      }
      if (!videoDuration.trim()) {
        errors.push("Video Duration is required.");
      }
      if (!videoDeliveryDate) {
        errors.push("Video Delivery Date is required.");
      }
      if (!videoPriority) {
        errors.push("Video Priority is required.");
      }
      if (!videoRequirement.trim()) {
        errors.push("Special Requirements is required.");
      }
    }
    return errors;
  };

  const buildPosterFormData = () => {
    const formData = new FormData();
    formData.append("employee", "6a0411af4579d3137b255e71");
    formData.append("dayIndex", "1");
    formData.append("status", "Pending");
    formData.append("typeOfMedia[]", "Poster");
    formData.append("poster[posterContent]", posterContent);
    formData.append("poster[priority]", posterPriority);
    formData.append("poster[specialRequirements]", posterRequirement);
    if (selectedDisplay) {
      formData.append("poster[displayNeeded][]", selectedDisplay);
      const sizeValue = selectedDisplay === "Glass Sticker" ? glassStickerSize : displaySize;
      formData.append("poster[sizes][0][type]", selectedDisplay);
      formData.append("poster[sizes][0][value]", sizeValue);
    }
    if (posterFile) formData.append("referencePosterFiles", posterFile);
    if (certificateFile) formData.append("referenceCertificateFiles", certificateFile);
    if (trophyFile) formData.append("referenceFiles", trophyFile);
    return formData;
  };

  const buildVideoFormData = () => {
    const formData = new FormData();
    formData.append("employee", "6a0411af4579d3137b255e71");
    formData.append("dayIndex", "1");
    formData.append("status", "Pending");
    formData.append("typeOfMedia[]", "Video");
    formData.append("video[videoContent]", videoContent);
    formData.append("video[duration]", videoDuration);
    formData.append("video[deliveryDate]", videoDeliveryDate);
    formData.append("video[priority]", videoPriority);
    formData.append("video[specialRequirements]", videoRequirement);
    if (videoFile) {
      formData.append("referenceFiles", videoFile);
    }
    return formData;
  };

  const handleNext = async () => {
    const errors = selectedType === "Poster" ? validatePoster() : selectedType === "Video" ? validateVideo() : [];
    setValidationErrors(errors);
    if (errors.length) return;

    if (selectedType === "Poster") {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      try {
        const response = await fetch(`${API_BASE}/api/individual-media/create`, {
          method: "POST",
          body: buildPosterFormData(),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Poster submission failed.");
        }
        setSubmitSuccess(true);
      } catch (error) {
        setValidationErrors([error.message || "Unable to send poster data."]);
      } finally {
        setIsSubmitting(false);
      }
    }

    if (selectedType === "Video") {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      try {
        const response = await fetch(`${API_BASE}/api/individual-media/create`, {
          method: "POST",
          body: buildVideoFormData(),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Video submission failed.");
        }
        setSubmitSuccess(true);
      } catch (error) {
        setValidationErrors([error.message || "Unable to send video data."]);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] text-white p-6">
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">
        Media Details Form
      </h1>

      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TYPE DROPDOWN */}
      <div className="relative mb-8">
        <label className="block text-sm mb-2">
          Type of Design Required *
        </label>

        <div
          onClick={() =>
            setShowTypeDropdown(
              !showTypeDropdown
            )
          }
          className="
            w-full
            bg-[#1b1b35]
            border
            border-[#2d2d4d]
            rounded-md
            px-4
            py-3
            flex
            justify-between
            items-center
            cursor-pointer
          "
        >
          <span
            className={
              selectedType
                ? "text-white"
                : "text-[#8d8da8]"
            }
          >
            {selectedType ||
              "Select Type"}
          </span>

          <ChevronDown size={18} />
        </div>

        {showTypeDropdown && (
          <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
            {typeOptions.map(
              (item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedType(item);
                    setShowTypeDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                >
                  {item}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* ================= POSTER SECTION ==================== */}
      {/* ===================================================== */}

      {selectedType === "Poster" && (
        <div className="bg-[#1b1b35] border border-[#2d2d4d] rounded-2xl p-6">
          <h2 className="text-[#8b5cf6] text-2xl font-bold mb-6">
            Poster
          </h2>

          {/* Poster Content */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Content for Poster *
            </label>

            <textarea
              rows={4}
              value={posterContent}
              onChange={(e) =>
                setPosterContent(e.target.value)
              }
              placeholder="reason"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>

          {/* Poster Upload */}
          <div className="mb-8">
            <label className="block text-sm mb-3">
              Reference Poster ( If any )
            </label>

            <label
              className="
                border-2
                border-dashed
                border-[#4b4b6b]
                rounded-lg
                p-8
                flex
                flex-col
                justify-center
                items-center
                gap-3
                cursor-pointer
              "
            >
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setPosterFile(
                    e.target.files[0]
                  )
                }
              />

              <Upload size={24} />

              <span className="text-sm text-center">
                Drag and drop the files here or{" "}
                <span className="text-[#8b5cf6] underline">
                  choose file
                </span>
              </span>
            </label>

            {posterFile && (
              <div className="mt-4 bg-[#141428] border border-[#3a3a5a] rounded-md px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} />

                  <span className="text-sm">
                    {posterFile.name}
                  </span>
                </div>

                <button
                  onClick={() =>
                    removeFile("poster")
                  }
                >
                  <X className="text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Display Needed */}
          <div className="relative mb-6">
            <label className="block text-sm mb-2">
              Display Needed *
            </label>

            <div
              onClick={() =>
                setShowDisplayDropdown(
                  !showDisplayDropdown
                )
              }
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                flex
                justify-between
                items-center
                cursor-pointer
              "
            >
              <span
                className={
                  selectedDisplay
                    ? "text-white"
                    : "text-[#8d8da8]"
                }
              >
                {selectedDisplay ||
                  "Select Display"}
              </span>

              <ChevronDown size={18} />
            </div>

            {showDisplayDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {displayOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedDisplay(
                          item
                        );

                        setDisplaySize("");
                        setGlassStickerSize("");

                        setShowDisplayDropdown(
                          false
                        );
                      }}
                      className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* SIZE INPUT */}
          {selectedDisplay && (
            <div className="mb-6">
              <label className="block text-sm mb-2">
                Size for {selectedDisplay} *
              </label>

              <input
                type="text"
                value={
                  selectedDisplay ===
                  "Glass Sticker"
                    ? glassStickerSize
                    : displaySize
                }
                onChange={(e) => {
                  if (
                    selectedDisplay ===
                    "Glass Sticker"
                  ) {
                    setGlassStickerSize(
                      e.target.value
                    );
                  } else {
                    setDisplaySize(
                      e.target.value
                    );
                  }
                }}
                placeholder={`Enter ${selectedDisplay} Size`}
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  text-white
                  outline-none
                "
              />
            </div>
          )}

          {/* DATE + PRIORITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2">
                Delivery Date *
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={posterDeliveryDate}
                  onChange={(e) =>
                    setPosterDeliveryDate(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-[#1f1f38]
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    pr-12
                    text-white
                    outline-none
                    appearance-none
                  "
                />

                <CalendarDays
                  size={18}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#b0b0c3]
                    pointer-events-none
                  "
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm mb-2">
                Priority *
              </label>

              <div
                onClick={() =>
                  setShowPosterPriorityDropdown(
                    !showPosterPriorityDropdown
                  )
                }
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  flex
                  justify-between
                  items-center
                  cursor-pointer
                "
              >
                <span>
                  {posterPriority}
                </span>

                <ChevronDown size={18} />
              </div>

              {showPosterPriorityDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                  {priorityOptions.map(
                    (item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setPosterPriority(
                            item
                          );

                          setShowPosterPriorityDropdown(
                            false
                          );
                        }}
                        className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Requirement */}
          <div>
            <label className="block text-sm mb-2">
              Special Requirements, If any *
            </label>

            <textarea
              rows={4}
              value={posterRequirement}
              onChange={(e) =>
                setPosterRequirement(
                  e.target.value
                )
              }
              placeholder="reason"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* ================= VIDEO SECTION ===================== */}
      {/* ===================================================== */}

      {selectedType === "Video" && (
        <div className="bg-[#1b1b35] border border-[#2d2d4d] rounded-2xl p-6 mt-8">
          <h2 className="text-[#8b5cf6] text-2xl font-bold mb-6">
            Video
          </h2>

          {/* Video Content */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Content for Video *
            </label>

            <textarea
              rows={5}
              value={videoContent}
              onChange={(e) =>
                setVideoContent(
                  e.target.value
                )
              }
              placeholder="Enter video content"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>

          {/* VIDEO DURATION */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              Video Duration *
            </label>

            <input
              type="text"
              value={videoDuration}
              onChange={(e) =>
                setVideoDuration(
                  e.target.value
                )
              }
              placeholder="Enter video duration"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                px-4
                py-3
                text-white
                outline-none
              "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2">
                Delivery Date *
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={videoDeliveryDate}
                  onChange={(e) =>
                    setVideoDeliveryDate(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    bg-[#1f1f38]
                    border
                    border-[#3a3a5a]
                    rounded-md
                    px-4
                    py-3
                    pr-12
                    text-white
                    outline-none
                    appearance-none
                  "
                />

                <CalendarDays
                  size={18}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#b0b0c3]
                    pointer-events-none
                  "
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm mb-2">
                Priority *
              </label>

              <div
                onClick={() =>
                  setShowVideoPriorityDropdown(
                    !showVideoPriorityDropdown
                  )
                }
                className="
                  w-full
                  bg-[#1f1f38]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  flex
                  justify-between
                  items-center
                  cursor-pointer
                "
              >
                <span>
                  {videoPriority}
                </span>

                <ChevronDown size={18} />
              </div>

              {showVideoPriorityDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                  {priorityOptions.map(
                    (item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setVideoPriority(
                            item
                          );

                          setShowVideoPriorityDropdown(
                            false
                          );
                        }}
                        className="px-4 py-3 hover:bg-[#3b82f6] cursor-pointer"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* VIDEO UPLOAD */}
          <div className="mb-8">
            <label className="block text-sm mb-3">
              Reference Video ( If any )
            </label>

            <label
              className="
                border-2
                border-dashed
                border-[#4b4b6b]
                rounded-lg
                p-8
                flex
                flex-col
                justify-center
                items-center
                gap-3
                cursor-pointer
              "
            >
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setVideoFile(
                    e.target.files[0]
                  )
                }
              />

              <Upload size={24} />

              <span className="text-sm text-center">
                Drag and drop the files here or{" "}
                <span className="text-[#8b5cf6] underline">
                  choose file
                </span>
              </span>
            </label>

            {videoFile && (
              <div className="mt-4 bg-[#141428] border border-[#3a3a5a] rounded-md px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} />

                  <span>
                    {videoFile.name}
                  </span>
                </div>

                <button
                  onClick={() =>
                    removeFile("video")
                  }
                >
                  <X className="text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* REQUIREMENT */}
          <div>
            <label className="block text-sm mb-2">
              Special Requirements *
            </label>

            <textarea
              rows={4}
              value={videoRequirement}
              onChange={(e) =>
                setVideoRequirement(
                  e.target.value
                )
              }
              placeholder="Enter requirements"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>
        </div>
      )}

      {/* NEXT BUTTON */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="
            bg-[#8b3dff]
            hover:bg-[#9a52ff]
            transition-all
            duration-300
            text-white
            font-semibold
            px-10
            py-3
            rounded-lg
            flex
            items-center
            gap-2
            shadow-lg
            shadow-purple-900/30
          "
        >
          Next

          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MediaDetailsPage;