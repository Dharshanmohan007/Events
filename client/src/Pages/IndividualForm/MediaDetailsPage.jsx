import React, { useState } from "react";
import {
  ChevronDown,
  Upload,
  FileText,
  X,
} from "lucide-react";

const MediaDetailsPage = () => {

  // =========================
  // MAIN TYPE DROPDOWN
  // =========================
  const [showTypeDropdown, setShowTypeDropdown] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState("");

  // ONLY POSTER AND VIDEO
  const typeOptions = [
    "Poster",
    "Video",
  ];

  // =========================
  // POSTER STATES
  // =========================
  const [showDisplayDropdown, setShowDisplayDropdown] =
    useState(false);

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

  // Poster Files
  const [posterFile, setPosterFile] =
    useState(null);

  const [certificateFile, setCertificateFile] =
    useState(null);

  const [trophyFile, setTrophyFile] =
    useState(null);

  // Poster Inputs
  const [posterContent, setPosterContent] =
    useState("");

  const [certificateContent, setCertificateContent] =
    useState("");

  const [trophyContent, setTrophyContent] =
    useState("");

  const [displaySize, setDisplaySize] =
    useState("");

  const [posterDeliveryDate, setPosterDeliveryDate] =
    useState("");

  const [posterPriority, setPosterPriority] =
    useState("");

  const [posterRequirement, setPosterRequirement] =
    useState("");

  // =========================
  // VIDEO STATES
  // =========================
  const [showPreEvent, setShowPreEvent] =
    useState(false);

  const [showCoverage, setShowCoverage] =
    useState(false);

  const [showPostEvent, setShowPostEvent] =
    useState(false);

  const [showSpecialVideo, setShowSpecialVideo] =
    useState(false);

  const [selectedPreEvent, setSelectedPreEvent] =
    useState("");

  const [selectedCoverage, setSelectedCoverage] =
    useState("");

  const [selectedPostEvent, setSelectedPostEvent] =
    useState("");

  const [selectedSpecialVideo, setSelectedSpecialVideo] =
    useState("");

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

  const [videoDeliveryDate, setVideoDeliveryDate] =
    useState("");

  const [videoPriority, setVideoPriority] =
    useState("");

  const [videoRequirement, setVideoRequirement] =
    useState("");

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

  return (
    <div className="min-h-screen bg-[#141428] text-white p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">
        Media Details Form
      </h1>

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
              placeholder="Enter poster content"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
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
                hover:border-[#8b5cf6]
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

          {/* Certificate */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Content for Certificate *
            </label>

            <textarea
              rows={4}
              value={certificateContent}
              onChange={(e) =>
                setCertificateContent(
                  e.target.value
                )
              }
              placeholder="Enter certificate content"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
              "
            />
          </div>

          {/* Certificate Upload */}
          <div className="mb-8">

            <label className="block text-sm mb-3">
              Reference Certificate ( If any )
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
                hover:border-[#8b5cf6]
              "
            >

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setCertificateFile(
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

            {certificateFile && (
              <div className="mt-4 bg-[#141428] border border-[#3a3a5a] rounded-md px-4 py-3 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <FileText size={18} />

                  <span className="text-sm">
                    {certificateFile.name}
                  </span>

                </div>

                <button
                  onClick={() =>
                    removeFile(
                      "certificate"
                    )
                  }
                >
                  <X className="text-red-500" />
                </button>

              </div>
            )}
          </div>

          {/* Trophy */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Content for Trophy *
            </label>

            <textarea
              rows={4}
              value={trophyContent}
              onChange={(e) =>
                setTrophyContent(
                  e.target.value
                )
              }
              placeholder="Enter trophy content"
              className="
                w-full
                bg-[#1f1f38]
                border
                border-[#3a3a5a]
                rounded-md
                p-4
                text-white
              "
            />
          </div>

          {/* Trophy Upload */}
          <div className="mb-8">

            <label className="block text-sm mb-3">
              Reference Trophy ( If any )
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
                hover:border-[#8b5cf6]
              "
            >

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setTrophyFile(
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

            {trophyFile && (
              <div className="mt-4 bg-[#141428] border border-[#3a3a5a] rounded-md px-4 py-3 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <FileText size={18} />

                  <span className="text-sm">
                    {trophyFile.name}
                  </span>

                </div>

                <button
                  onClick={() =>
                    removeFile("trophy")
                  }
                >
                  <X className="text-red-500" />
                </button>

              </div>
            )}
          </div>

          {/* Display Needed */}
          <div className="relative mb-8">

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

              <span>
                {selectedDisplay ||
                  "Select Display Type"}
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

          {/* Size */}
          {selectedDisplay && (
            <div className="mb-6">

              <label className="block text-sm mb-2">
                Size for {selectedDisplay} *
              </label>

              <input
                type="text"
                value={displaySize}
                onChange={(e) =>
                  setDisplaySize(
                    e.target.value
                  )
                }
                placeholder={`Enter ${selectedDisplay} Size`}
                className="
                  w-full
                  bg-[#141428]
                  border
                  border-[#3a3a5a]
                  rounded-md
                  px-4
                  py-3
                  text-white
                "
              />
            </div>
          )}

          {/* Delivery Date */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Delivery Date *
            </label>

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
                text-white
              "
            />
          </div>

          {/* Priority */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Priority *
            </label>

            <select
              value={posterPriority}
              onChange={(e) =>
                setPosterPriority(
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
                text-white
              "
            >
              <option value="">
                Select Priority
              </option>

              <option>
                High
              </option>

              <option>
                Medium
              </option>

              <option>
                Low
              </option>

            </select>
          </div>

          {/* Requirement */}
          <div>

            <label className="block text-sm mb-2">
              Special Requirements *
            </label>

            <textarea
              rows={4}
              value={posterRequirement}
              onChange={(e) =>
                setPosterRequirement(
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
              "
            />
          </div>

          {/* PRE EVENT */}
          <div className="relative mb-6">

            <label className="block text-sm mb-2">
              Pre-Event Videos Needed *
            </label>

            <div
              onClick={() =>
                setShowPreEvent(
                  !showPreEvent
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
                {selectedPreEvent ||
                  "Select Pre Event"}
              </span>

              <ChevronDown size={18} />

            </div>

            {showPreEvent && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">

                {preEventOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedPreEvent(
                          item
                        );
                        setShowPreEvent(
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

          {/* COVERAGE */}
          <div className="relative mb-6">

            <label className="block text-sm mb-2">
              Event Coverage Needed *
            </label>

            <div
              onClick={() =>
                setShowCoverage(
                  !showCoverage
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
                {selectedCoverage ||
                  "Select Coverage"}
              </span>

              <ChevronDown size={18} />

            </div>

            {showCoverage && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">

                {coverageOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedCoverage(
                          item
                        );
                        setShowCoverage(
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

          {/* POST EVENT */}
          <div className="relative mb-6">

            <label className="block text-sm mb-2">
              Post-Event Videos Needed *
            </label>

            <div
              onClick={() =>
                setShowPostEvent(
                  !showPostEvent
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
                {selectedPostEvent ||
                  "Select Post Event"}
              </span>

              <ChevronDown size={18} />

            </div>

            {showPostEvent && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">

                {postEventOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedPostEvent(
                          item
                        );
                        setShowPostEvent(
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

          {/* SPECIAL VIDEO */}
          <div className="relative mb-6">

            <label className="block text-sm mb-2">
              Special Videos Needed *
            </label>

            <div
              onClick={() =>
                setShowSpecialVideo(
                  !showSpecialVideo
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
                {selectedSpecialVideo ||
                  "Select Special Video"}
              </span>

              <ChevronDown size={18} />

            </div>

            {showSpecialVideo && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">

                {specialVideoOptions.map(
                  (item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedSpecialVideo(
                          item
                        );
                        setShowSpecialVideo(
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
              "
            />
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
                hover:border-[#8b5cf6]
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

          {/* DELIVERY DATE */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Delivery Date *
            </label>

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
                text-white
              "
            />
          </div>

          {/* PRIORITY */}
          <div className="mb-6">

            <label className="block text-sm mb-2">
              Priority *
            </label>

            <select
              value={videoPriority}
              onChange={(e) =>
                setVideoPriority(
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
                text-white
              "
            >
              <option value="">
                Select Priority
              </option>

              <option>
                High
              </option>

              <option>
                Medium
              </option>

              <option>
                Low
              </option>

            </select>
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
              "
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default MediaDetailsPage;