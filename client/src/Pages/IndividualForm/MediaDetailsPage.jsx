import React, { useEffect, useState } from "react";
import CustomDateTimePicker from "../../Components/CustomDateTimePicker";
import {
  ChevronDown,
  Upload,
  FileText,
  X,
  CalendarDays,
  ArrowRight,
  Check,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";

const floatingLabelClass =
  "absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none";

const pageFloatingLabelClass = `${floatingLabelClass} bg-[#141428]`;

const cardFloatingLabelClass = `${floatingLabelClass} bg-[#1b1b35]`;

const MediaDetailsPage = () => {
  // =========================
  // MAIN TYPE DROPDOWN
  // =========================
  const [showTypeDropdown, setShowTypeDropdown] =
    useState(false);

  const [selectedTypes, setSelectedTypes] =
    useState([]);

  const typeOptions = [
    "Poster",
    "Video",
  ];

  const toggleTypeSelection = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  // =========================
  // POSTER STATES
  // =========================
  const [showDisplayDropdown, setShowDisplayDropdown] =
    useState(false);  

  const [
    showPosterPriorityDropdown,
    setShowPosterPriorityDropdown,
  ] = useState(false);

  const [selectedDisplays, setSelectedDisplays] =
    useState([]);

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

  const toggleDisplaySelection = (item) => {
    setSelectedDisplays((prev) =>
      prev.includes(item)
        ? prev.filter((d) => d !== item)
        : [...prev, item]
    );
  };

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

  // =========================
  // POSTER INPUTS
  // =========================
  const [posterContent, setPosterContent] =
    useState("");
  console.log("poster content  : ", posterContent);


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

    // if (type === "certificate") {
    //   setCertificateFile(null);
    // }

    // if (type === "trophy") {
    //   setTrophyFile(null);
    // }

    if (type === "video") {
      setVideoFile(null);
    }
  };

  const validatePoster = () => {
    console.log("validating poster...");
    const errors = [];
    if (!selectedTypes.includes("Poster")) {
      return errors;
    }
    if (selectedTypes.includes("Poster")) {
      if (!posterContent.trim()) {
        errors.push("Content for Poster is required.");
      }
      if (!selectedDisplays.length) {
        errors.push("Display Needed is required.");
      }
      if (selectedDisplays.length) {
        if (selectedDisplays.includes("Glass Sticker")) {
          if (!glassStickerSize.trim()) {
            errors.push("Size for Glass Sticker is required.");
          }
        }
        if (selectedDisplays.includes("Flex")) {
          if (!displaySize.trim()) {
            errors.push("Size for Flex is required.");
          }
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

    console.log("Poster validation errors:", errors);
    return errors;
  };

  const validateVideo = () => {
    const errors = [];
    if (!selectedTypes.includes("Video")) {
      return errors;
    }
    if (selectedTypes.includes("Video")) {
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
    formData.append("poster[deliveryDate]", posterDeliveryDate);
    if (selectedDisplays.length) {
      selectedDisplays.forEach((d) => formData.append("poster[displayNeeded][]", d));

      let sizeIndex = 0;
      if (selectedDisplays.includes("Flex")) {
        formData.append(`poster[sizes][${sizeIndex}][type]`, "Flex");
        formData.append(`poster[sizes][${sizeIndex}][value]`, displaySize);
        sizeIndex++;
      }
      if (selectedDisplays.includes("Glass Sticker")) {
        formData.append(`poster[sizes][${sizeIndex}][type]`, "Glass Sticker");
        formData.append(`poster[sizes][${sizeIndex}][value]`, glassStickerSize);
        sizeIndex++;
      }
    }
    if (posterFile) formData.append("referencePosterFiles", posterFile);
    // if (certificateFile) formData.append("referenceCertificateFiles", certificateFile);
    // if (trophyFile) formData.append("referenceFiles", trophyFile);
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
   
    formData.append("video[priority]", videoPriority);
    formData.append("video[specialRequirements]", videoRequirement);

    if (videoFile) {
      formData.append("referenceFiles", videoFile);
    }
    return formData;
  };

  const handleNext = async () => {
    console.log("activated function");
    
    if (!selectedTypes.length) {
      setValidationErrors(["Please select at least one Type of Design Required."]);
      return;
    }

    const errors = [];
    if (selectedTypes.includes("Poster")) {
      errors.push(...validatePoster());
    }
    if (selectedTypes.includes("Video")) {
      errors.push(...validateVideo());
    }

    setValidationErrors(errors);
    if (errors.length) return;

    console.log("no errors");

    // Submit Poster if selected
    if (selectedTypes.includes("Poster")) {
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

    // Submit Video if selected
    if (selectedTypes.includes("Video")) {
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
        <label className={pageFloatingLabelClass}>
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
            border
            border-[#2d2d4d]
            rounded-md
            px-4
            py-3
            flex
            justify-between
            items-center
            cursor-pointer
            flex-wrap gap-2
          "
        >
          <div className="flex flex-wrap gap-2">
            {selectedTypes.length > 0 ? (
              <span className="text-white text-sm">
                {selectedTypes.join(", ")}
              </span>
            ) : (
              <span className="text-[#8d8da8]">
                Select Types
              </span>
            )}
          </div>

          <ChevronDown size={18} />
        </div>

        {showTypeDropdown && (
          <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
            {typeOptions.map(
              (item, index) => {
                const isSelected = selectedTypes.includes(item);
                return (
                  <div
                    key={index}
                    onClick={() => {
                      toggleTypeSelection(item);
                    }}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors duration-200 ${isSelected ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check size={16} className="text-white" />}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* ================= POSTER SECTION ==================== */}
      {/* ===================================================== */}

      {selectedTypes.includes("Poster") && (
        <div className="bg-[#1b1b35] border border-[#2d2d4d] rounded-2xl p-6">
          <h2 className="text-[#8b5cf6] text-2xl font-bold mb-6">
            Poster
          </h2>

          {/* Poster Content */}
          <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
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
          <div className="relative mb-8">
            <span className={cardFloatingLabelClass}>
              Reference Poster ( If any )
            </span>

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
            <label className={cardFloatingLabelClass}>
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
                  selectedDisplays.length
                    ? "text-white"
                    : "text-[#8d8da8]"
                }
              >
                {selectedDisplays.length
                  ? selectedDisplays.join(", ")
                  : "Select Display"}
              </span>

              <ChevronDown size={18} />
            </div>

            {showDisplayDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                {displayOptions.map(
                  (item, index) => {
                    const isSelected = selectedDisplays.includes(item);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          toggleDisplaySelection(item);
                          // clear size inputs when deselecting an option
                          if (isSelected) {
                            setDisplaySize("");
                            setGlassStickerSize("");
                          }
                        }}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200 ${isSelected ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
                      >
                        <span>{item}</span>
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* SIZE INPUT */}
          {(selectedDisplays.includes("Flex") || selectedDisplays.includes("Glass Sticker")) && (
            <div className="mb-6 space-y-4">
              {selectedDisplays.includes("Flex") && (
                <div className="relative">
                  <label className={cardFloatingLabelClass}>
                    Size for Flex *
                  </label>

                  <input
                    type="text"
                    value={displaySize}
                    onChange={(e) => setDisplaySize(e.target.value)}
                    placeholder={`Enter Flex Size`}
                    className="
                      w-full
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

              {selectedDisplays.includes("Glass Sticker") && (
                <div className="relative">
                  <label className={cardFloatingLabelClass}>
                    Size for Glass Sticker *
                  </label>

                  <input
                    type="text"
                    value={glassStickerSize}
                    onChange={(e) => setGlassStickerSize(e.target.value)}
                    placeholder={`Enter Glass Sticker Size`}
                    className="
                      w-full
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
            </div>
          )}

          {/* DATE + PRIORITY */}
         
{/* DATE + PRIORITY */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">

  {/* DELIVERY DATE */}
  <div className="w-full">
    <CustomDateTimePicker
      label="Delivery Date *"
      value={
        posterDeliveryDate
          ? new Date(posterDeliveryDate)
          : null
      }
      onChange={(date) =>
        setPosterDeliveryDate(
          date.toISOString()
        )
      }
      placeholder="Select Delivery Date"
      showTime={false}
    />
  </div>

  {/* PRIORITY */}
  {/* PRIORITY */}
<div className="relative w-full pt-[1px]">
  <label className="absolute left-3 -top-[9px] text-xs text-white px-1 z-10 bg-[#1f1f3a]">
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
      bg-transparent
      border
      border-[#3A3A5A]
      rounded-lg
      px-4
      py-[13px]
      flex
      justify-between
      items-center
      cursor-pointer
      text-white
    "
  >
    <span>{posterPriority}</span>

    <ChevronDown
      size={18}
      className="text-gray-400"
    />
  </div>

  {showPosterPriorityDropdown && (
    <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
      {priorityOptions.map(
        (item, index) => (
          <div
            key={index}
            onClick={() => {
              setPosterPriority(item);

              setShowPosterPriorityDropdown(
                false
              );
            }}
            className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${posterPriority === item ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
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
          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Special Requirements, If any 
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

      {selectedTypes.includes("Video") && (
        <div className="bg-[#1b1b35] border border-[#2d2d4d] rounded-2xl p-6 mt-8">
          <h2 className="text-[#8b5cf6] text-2xl font-bold mb-6">
            Video
          </h2>

          {/* Video Content */}
          <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
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
          <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
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

          

          {/* VIDEO UPLOAD */}
          <div className="relative mb-8">
            <span className={cardFloatingLabelClass}>
              Reference Video ( If any )
            </span>

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
          <div className="relative">
            <label className={cardFloatingLabelClass}>
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
