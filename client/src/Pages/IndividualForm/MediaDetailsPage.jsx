import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import FormSubmitted from "../IndividualForm/FormSubmitted";
import UploadIcon from "../../assets/upload.svg";
import { jwtDecode } from "jwt-decode";
import { API_BASE } from "../../utils/apiConfig";
import { decodeToken, isTokenExpired } from "../../utils/tokenUtils";

const floatingLabelClass =
  "absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none";

const pageFloatingLabelClass = `${floatingLabelClass} bg-[#141428]`;

const cardFloatingLabelClass = `${floatingLabelClass} bg-[#1b1b35]`;

const getFinanceComparisonError = (estimatedAmount, advanceAmount) => {
  const estimated = Number(estimatedAmount);
  const advance = Number(advanceAmount);

  if (!Number.isNaN(estimated) && !Number.isNaN(advance) && advance > estimated) {
    return "Advance amount cannot exceed the estimated budget amount.";
  }

  return "";
};

const MediaDetailsPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoadingDetails, setIsLoadingDetails] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");
  const [existingPrincipalDocument, setExistingPrincipalDocument] = useState(null);
  const [existingPosterFile, setExistingPosterFile] = useState(null);
  const [existingCertificateFile, setExistingCertificateFile] = useState(null);
  const [existingVideoFile, setExistingVideoFile] = useState(null);

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
    "Id card",
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
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.id) {
          setEmployeeId(decoded.id);
        }
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    }
  }, []);

  const mapMediaApiToForm = (data) => {
    const mediaDoc = data?.data || data?.media || data;

    let types = [];
    if (Array.isArray(mediaDoc.typeOfMedia)) {
      types = mediaDoc.typeOfMedia.map((t) => {
        const lower = String(t).toLowerCase();
        if (lower === "poster") return "Poster";
        if (lower === "video") return "Video";
        return t;
      });
    } else if (mediaDoc.typeOfMedia) {
      const lower = String(mediaDoc.typeOfMedia).toLowerCase();
      if (lower.includes("poster")) types.push("Poster");
      if (lower.includes("video")) types.push("Video");
    }

    if (types.length === 0) {
      if (mediaDoc.poster && (mediaDoc.poster.posterContent || mediaDoc.poster.displayNeeded?.length)) {
        types.push("Poster");
      }
      if (mediaDoc.video && (mediaDoc.video.videoContent || mediaDoc.video.eventCoverage?.length)) {
        types.push("Video");
      }
    }

    const poster = mediaDoc.poster || {};
    const selectedDisplaysList = Array.isArray(poster.displayNeeded) ? poster.displayNeeded : [];
    let flexSizeVal = "";
    let glassSizeVal = "";
    if (Array.isArray(poster.sizes)) {
      poster.sizes.forEach((s) => {
        if (s.type === "Flex") flexSizeVal = s.value || "";
        if (s.type === "Glass Sticker") glassSizeVal = s.value || "";
      });
    }

    let pDelivery = "";
    if (poster.deliveryDate) {
      const d = new Date(poster.deliveryDate);
      if (!Number.isNaN(d.getTime())) {
        pDelivery = poster.deliveryDate;
      }
    }

    const video = mediaDoc.video || {};
    let vDelivery = "";
    if (video.deliveryDate) {
      const d = new Date(video.deliveryDate);
      if (!Number.isNaN(d.getTime())) {
        vDelivery = video.deliveryDate;
      }
    }

    return {
      types,
      poster: {
        selectedDisplays: selectedDisplaysList,
        posterContent: poster.posterContent || "",
        certificateContent: poster.certificateContent || "",
        trophyContent: poster.trophyContent || "",
        displaySize: flexSizeVal,
        glassStickerSize: glassSizeVal,
        posterDeliveryDate: pDelivery,
        posterPriority: poster.priority || "High",
        posterRequirement: poster.specialRequirements || "",
      },
      video: {
        videoContent: video.videoContent || "",
        selectedPreEvent: Array.isArray(video.preEventVideos) ? video.preEventVideos : [],
        selectedCoverage: Array.isArray(video.eventCoverage) ? video.eventCoverage : [],
        selectedPostEvent: Array.isArray(video.postEventVideos) ? video.postEventVideos : [],
        selectedSpecialVideo: Array.isArray(video.specialVideos) ? video.specialVideos : [],
        videoDeliveryDate: vDelivery,
        videoPriority: video.priority || "High",
        videoRequirement: video.specialRequirements || "",
      },
      finance: {
        financeRequired: (mediaDoc.financeRequired || "No").toString().toLowerCase() === "yes" ? "Yes" : "No",
        financeAdvanceAmount: String(mediaDoc.advanceAmount ?? ""),
        financeEstimatedAmount: String(mediaDoc.estimatedAmount ?? mediaDoc.estimatedEventBudget ?? ""),
        financeAdvancePurpose: mediaDoc.advancePurpose || "",
        financeAdvanceToBeReceviedWithin: String(mediaDoc.advanceToBeReceviedWithin ?? ""),
      },
      files: {
        principalApprovalForm:
          mediaDoc.principalApprovalForm ||
          mediaDoc.principalApprovalFormName ||
          mediaDoc.principalApprovalDocument ||
          mediaDoc.principalDocument ||
          mediaDoc.approvalDocument ||
          mediaDoc.approvalForm ||
          null,
        referencePosterFiles: mediaDoc.referencePosterFiles || null,
        referenceCertificateFiles: mediaDoc.referenceCertificateFiles || null,
        referenceFiles: mediaDoc.referenceFiles || null,
      },
    };
  };

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;
    const fetchMediaDetails = async () => {
      setIsLoadingDetails(true);
      setLoadError("");
      try {
        const authToken = localStorage.getItem("token");
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        let response = await fetch(`${API_BASE}/api/individual-media/${id}`, { headers });
        if (!response.ok) {
          response = await fetch(`${API_BASE}/api/individual-submissions/getrequest/${id}`, { headers });
        }

        if (!response.ok) {
          throw new Error(`Failed to load media request (Status ${response.status})`);
        }

        const resData = await response.json();
        const rawData = resData.data || resData;
        const actualMedia = Array.isArray(rawData) ? rawData[0] : (rawData.data || rawData);

        if (isMounted) {
          const mapped = mapMediaApiToForm(actualMedia);
          setSelectedTypes(mapped.types);
          // Poster
          setSelectedDisplays(mapped.poster.selectedDisplays);
          setPosterContent(mapped.poster.posterContent);
          setCertificateContent(mapped.poster.certificateContent);
          setTrophyContent(mapped.poster.trophyContent);
          setDisplaySize(mapped.poster.displaySize);
          setGlassStickerSize(mapped.poster.glassStickerSize);
          setPosterDeliveryDate(mapped.poster.posterDeliveryDate);
          setPosterPriority(mapped.poster.posterPriority);
          setPosterRequirement(mapped.poster.posterRequirement);
          // Video
          setVideoContent(mapped.video.videoContent);
          setSelectedPreEvent(mapped.video.selectedPreEvent);
          setSelectedCoverage(mapped.video.selectedCoverage);
          setSelectedPostEvent(mapped.video.selectedPostEvent);
          setSelectedSpecialVideo(mapped.video.selectedSpecialVideo);
          setVideoDeliveryDate(mapped.video.videoDeliveryDate);
          setVideoPriority(mapped.video.videoPriority);
          setVideoRequirement(mapped.video.videoRequirement);
          // Finance
          setFinanceRequired(mapped.finance.financeRequired);
          setFinanceAdvanceAmount(mapped.finance.financeAdvanceAmount);
          setFinanceEstimatedAmount(mapped.finance.financeEstimatedAmount);
          setFinanceAdvancePurpose(mapped.finance.financeAdvancePurpose);
          setFinanceAdvanceToBeReceviedWithin(mapped.finance.financeAdvanceToBeReceviedWithin);
          // Files
          const existingPrincipal =
            mapped.files?.principalApprovalForm ||
            actualMedia?.principalApprovalForm ||
            actualMedia?.principalApprovalFormName ||
            actualMedia?.principalApprovalDocument ||
            actualMedia?.principalDocument ||
            actualMedia?.approvalDocument ||
            actualMedia?.approvalForm ||
            rawData?.principalApprovalForm ||
            rawData?.principalApprovalFormName ||
            rawData?.principalApprovalDocument ||
            resData?.principalApprovalForm ||
            resData?.principalApprovalFormName ||
            resData?.principalApprovalDocument;
          if (existingPrincipal) {
            setExistingPrincipalDocument(existingPrincipal);
          }
          if (mapped.files.referencePosterFiles) {
            setExistingPosterFile(mapped.files.referencePosterFiles);
          }
          if (mapped.files.referenceCertificateFiles) {
            setExistingCertificateFile(mapped.files.referenceCertificateFiles);
          }
          if (mapped.files.referenceFiles) {
            setExistingVideoFile(mapped.files.referenceFiles);
          }
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || "Failed to load media request details");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchMediaDetails();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);
  



  // =========================
  // POSTER FILES
  // =========================
  const [posterFile, setPosterFile] =
    useState(null);
  const [certificateFile, setCertificateFile] =
    useState(null);

  // =========================
  // POSTER INPUTS
  // =========================
  const [posterContent, setPosterContent] = useState("");
const [certificateContent, setCertificateContent] = useState("");
const [trophyContent, setTrophyContent] = useState("");

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
  const [financeRequired, setFinanceRequired] = useState("No");
  const [financeEstimatedAmount, setFinanceEstimatedAmount] = useState("");
  const [financeAdvanceAmount, setFinanceAdvanceAmount] = useState("");
  const [financeAdvancePurpose, setFinanceAdvancePurpose] = useState("");
  const [financeAdvanceToBeReceviedWithin, setFinanceAdvanceToBeReceviedWithin] = useState("");
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const principalInputRef = useRef(null);
  const [principalApprovalDocument, setPrincipalApprovalDocument] = useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");

  const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
  const MAX_PRINCIPAL_FILE_SIZE_BYTES = MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PRINCIPAL_FILE_TYPE = "application/pdf";

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(`File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(selectedFile);
  };

  const handlePrincipalDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      return;
    }

    if (droppedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(`File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`);
      return;
    }

    setPrincipalFileError("");
    setPrincipalApprovalDocument(droppedFile);
  };

  const handlePrincipalRemove = (e) => {
    e.stopPropagation();
    setPrincipalApprovalDocument(null);
    setPrincipalFileError("");
    if (principalInputRef.current) {
      principalInputRef.current.value = "";
    }
  };

  const openPrincipalFilePicker = () => {
    if (principalInputRef.current) {
      principalInputRef.current.click();
    }
  };

  const handleDragOver = (e) => e.preventDefault();

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
    useState([]);

  const [selectedCoverage, setSelectedCoverage] =
    useState([]);

  const [selectedPostEvent, setSelectedPostEvent] =
    useState([]);

  const [
    selectedSpecialVideo,
    setSelectedSpecialVideo,
  ] = useState([]);

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

  const toggleVideoSelection = (item, setSelected) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((value) => value !== item)
        : [...prev, item]
    );
  };

  const [videoContent, setVideoContent] =
    useState("");

  const [videoFile, setVideoFile] =
    useState(null);

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
  const [videoEstimatedAmount, setVideoEstimatedAmount] = useState("");
  const [videoAdvanceAmount, setVideoAdvanceAmount] = useState("");
  const [videoAdvancePurpose, setVideoAdvancePurpose] = useState("");

  const financeComparisonError =
    financeRequired === "Yes"
      ? getFinanceComparisonError(financeEstimatedAmount, financeAdvanceAmount)
      : "";

  // =========================
  // FILE VALIDATION
  // =========================
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

  const validateFileType = (file) => {
    if (!file) return { valid: true };
    
    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} are allowed.` 
      };
    }
    
    return { valid: true };
  };

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

    // if (type === "trophy") {
    //   setTrophyFile(null);
    // }

    if (type === "video") {
      setVideoFile(null);
    }
  };

  const validatePoster = () => {
    // console.log("validating poster...");
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
      if (financeRequired === "Yes") {
        if (!financeEstimatedAmount || Number.isNaN(Number(financeEstimatedAmount)) || Number(financeEstimatedAmount) <= 0) {
          errors.push("Estimated budget amount is required.");
        }
        if (!financeAdvanceAmount || financeAdvanceAmount.toString().trim() === "") {
          errors.push("Advance amount is required.");
        }
        if (!financeAdvancePurpose || !financeAdvancePurpose.trim()) {
          errors.push("Advance purpose is required.");
        }
        if (!financeAdvanceToBeReceviedWithin) {
          errors.push("Advance to be received within is required.");
        }
        if (
          !Number.isNaN(Number(financeEstimatedAmount)) &&
          !Number.isNaN(Number(financeAdvanceAmount)) &&
          Number(financeAdvanceAmount) > Number(financeEstimatedAmount)
        ) {
          errors.push("Advance amount cannot exceed the estimated budget amount.");
        }
      }
    }

    // console.log("Poster validation errors:", errors);
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
      if (!selectedPreEvent.length) {
        errors.push("Pre-Event Videos Needed is required.");
      }
      if (!selectedCoverage.length) {
        errors.push("Event Coverage Needed is required.");
      }
      if (!selectedPostEvent.length) {
        errors.push("Post-Event Videos Needed is required.");
      }
      if (!selectedSpecialVideo.length) {
        errors.push("Special Videos Needed is required.");
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
      if (financeRequired === "Yes") {
        if (!financeEstimatedAmount || Number.isNaN(Number(financeEstimatedAmount)) || Number(financeEstimatedAmount) <= 0) {
          errors.push("Estimated budget amount is required.");
        }
        if (!financeAdvanceAmount || financeAdvanceAmount.toString().trim() === "") {
          errors.push("Advance amount is required.");
        }
        if (!financeAdvancePurpose || !financeAdvancePurpose.trim()) {
          errors.push("Advance purpose is required.");
        }
        if (!financeAdvanceToBeReceviedWithin) {
          errors.push("Advance to be received within is required.");
        }
        if (
          !Number.isNaN(Number(financeEstimatedAmount)) &&
          !Number.isNaN(Number(financeAdvanceAmount)) &&
          Number(financeAdvanceAmount) > Number(financeEstimatedAmount)
        ) {
          errors.push("Advance amount cannot exceed the estimated budget amount.");
        }
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
    if (principalApprovalDocument) {
      formData.append("principalApprovalFormName", principalApprovalDocument.name);
    }
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
    if (certificateFile) formData.append("referenceCertificateFiles", certificateFile);
    // if (trophyFile) formData.append("referenceFiles", trophyFile);
    return formData;
  };

  const appendPosterFormData = (formData) => {
    // The media API stores these enum values in lowercase.
    formData.append("typeOfMedia[]", "poster");
   if (principalApprovalDocument) {
  formData.append(
    "principalApprovalForm",
    principalApprovalDocument
  );
}
    formData.append("poster[posterContent]", posterContent);
    formData.append("poster[certificateContent]", certificateContent);
    formData.append("poster[trophyContent]", trophyContent);
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
    if (certificateFile) formData.append("referenceCertificateFiles", certificateFile);
  };

  const appendVideoFormData = (formData) => {
    formData.append("typeOfMedia[]", "video");
    if (principalApprovalDocument) {
      formData.append("principalApprovalFormName", principalApprovalDocument.name);
    }
    formData.append("video[videoContent]", videoContent);
    selectedPreEvent.forEach((item) => formData.append("video[preEventVideos][]", item));
    selectedCoverage.forEach((item) => formData.append("video[eventCoverage][]", item));
    selectedPostEvent.forEach((item) => formData.append("video[postEventVideos][]", item));
    selectedSpecialVideo.forEach((item) => formData.append("video[specialVideos][]", item));
    formData.append("video[deliveryDate]", videoDeliveryDate);
    formData.append("video[priority]", videoPriority);
    formData.append("video[specialRequirements]", videoRequirement);

    if (videoFile) {
      formData.append("referenceFiles", videoFile);
    }
  };

  const buildMediaFormData = () => {
    const formData = new FormData();
    
    // Root level fields
    formData.append("employee", employeeId || "6a0411af4579d3137b255e71");
    formData.append("dayIndex", "1");
    formData.append("status", "Pending");
    
    // Finance fields at root level (only if needed)
    if (financeRequired === "Yes") {
      formData.append("financeRequired", "Yes");
      formData.append("advanceAmount", financeAdvanceAmount || "0");
      formData.append("estimatedAmount", financeEstimatedAmount || "0");
      formData.append("advancePurpose", financeAdvancePurpose || "");
      formData.append("advanceToBeReceviedWithin", financeAdvanceToBeReceviedWithin || "0");
    }
    
    // typeOfMedia with CAPITALIZED names - append each type separately
    selectedTypes.forEach((type) => formData.append("typeOfMedia[]", type));
    
    // Append poster fields separately (not as JSON object)
    if (selectedTypes.includes("Poster")) {
      formData.append("poster[posterContent]", posterContent);
      formData.append("poster[certificateContent]", certificateContent);
      formData.append("poster[trophyContent]", trophyContent);
      formData.append("poster[priority]", posterPriority);
      formData.append("poster[specialRequirements]", posterRequirement);
      formData.append("poster[deliveryDate]", posterDeliveryDate);
      
      // Append display options
      selectedDisplays.forEach((d) => formData.append("poster[displayNeeded][]", d));
      
      // Append sizes separately
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
    
    // Append video fields separately (not as JSON object)
    if (selectedTypes.includes("Video")) {
      formData.append("video[videoContent]", videoContent);
      formData.append("video[deliveryDate]", videoDeliveryDate);
      formData.append("video[priority]", videoPriority);
      formData.append("video[specialRequirements]", videoRequirement);
      
      // Append video selection options
      selectedPreEvent.forEach((item) => formData.append("video[preEventVideos][]", item));
      selectedCoverage.forEach((item) => formData.append("video[eventCoverage][]", item));
      selectedPostEvent.forEach((item) => formData.append("video[postEventVideos][]", item));
      selectedSpecialVideo.forEach((item) => formData.append("video[specialVideos][]", item));
    }
    
    // Files
    if (principalApprovalDocument) {
      formData.append("principalApprovalForm", principalApprovalDocument);
    }
    if (posterFile) formData.append("referencePosterFiles", posterFile);
    if (certificateFile) formData.append("referenceCertificateFiles", certificateFile);
    if (videoFile) formData.append("referenceFiles", videoFile);

    return formData;
  };

  const handleNext = async () => {
    // console.log('[MediaDetails] handleNext start');
    // console.log("activated function");
    
    if (!selectedTypes.length) {
      setValidationErrors(["Please select at least one Type of Design Required."]);
      return;
    }

    // Principal approval validation — allow existing document in edit mode
    if (!principalApprovalDocument && !existingPrincipalDocument) {
      setValidationErrors(["Principal Approval Form is required."]);
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

    // console.log("no errors");

    // Validate token before attempting submit. Show an error instead of redirecting.
    const authToken = localStorage.getItem("token");
    const decodedAuthToken = decodeToken(authToken);

    if (!authToken || !decodedAuthToken || isTokenExpired(decodedAuthToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setValidationErrors(["Session expired or invalid token. Please login again."]);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const formData = buildMediaFormData();
      const headers = { ...(token && { Authorization: `Bearer ${token}` }) };

      let response;
      if (isEditMode) {
        // PUT to update existing media request
        response = await fetch(`${API_BASE}/api/individual-media/${id}`, {
          method: "PUT",
          headers,
          body: formData,
        });
        if (!response.ok) {
          // fallback route
          response = await fetch(`${API_BASE}/api/individual-media/update/${id}`, {
            method: "PUT",
            headers,
            body: formData,
          });
        }
      } else {
        response = await fetch(`${API_BASE}/api/individual-media/create`, {
          method: "POST",
          headers,
          body: formData,
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (isEditMode ? "Media update failed." : "Media submission failed."));
      }
      setSubmitSuccess(true);

      if (String(financeRequired).toLowerCase() === "yes") {
        const respData = data?.data || data || {};
        const receiptRequestNo =
          respData?.requestNo ||
          respData?.data?.requestNo ||
          respData?.media?.requestNo ||
          respData?.data?.media?.requestNo ||
          "";
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        const employeePayload = {
          name: storedUser?.name || storedUser?.employeeName || respData?.employeeName || "",
          empId: respData?.empId || storedUser?.empId || storedUser?.employeeId || "",
          designation: storedUser?.designation || respData?.designation || "",
          department: storedUser?.department || respData?.department || "",
        };

        const submitRespPayload = {
          requestNo: receiptRequestNo,
          response: data,
          employeeId:
            respData?.employee ||
            respData?.employeeId ||
            employeeId ||
            employeePayload.empId ||
            "",
        };

        await import("../../utils/ReportPdf").then(({ default: ReportPdf }) => {
          return ReportPdf({
            formData: {
              selectDate: posterDeliveryDate || videoDeliveryDate || "",
              advanceAmount: financeAdvanceAmount || "",
              advancePurpose: financeAdvancePurpose || "",
              clearanceDays: financeAdvanceToBeReceviedWithin || 15,
            },
            employee: employeePayload,
            submitResponse: submitRespPayload,
          });
        });
      }
    } catch (error) {
      setValidationErrors([error.message || "Unable to send media data."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVideoDropdown = ({
    label,
    placeholder,
    options,
    selected,
    setSelected,
    isOpen,
    setIsOpen,
  }) => (
    <div className="relative mb-6">
      <label className={cardFloatingLabelClass}>
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full
          border
          border-[#2F2F3E]
          rounded-md
          px-4
          py-3
          flex
          justify-between
          items-center
          cursor-pointer
          gap-3
        "
      >
        <span
          className={
            selected.length
              ? "text-white"
              : "text-[#8d8da8]"
          }
        >
          {selected.length ? selected.join(" / ") : placeholder}
        </span>

        <ChevronDown size={18} />
      </div>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
          {options.map((item, index) => {
            const isSelected = selected.includes(item);
            return (
              <div
                key={index}
                onClick={() => toggleVideoSelection(item, setSelected)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors duration-200 ${isSelected ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
              >
                <span>{item}</span>
                {isSelected && <Check size={16} className="text-white" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

    if (submitSuccess) {
    return (
      <FormSubmitted
        advanceData={{
          selectDate: posterDeliveryDate || videoDeliveryDate || "",
          advanceAmount: financeAdvanceAmount || "",
          advancePurpose: financeAdvancePurpose || "",
          clearanceDays: financeAdvanceToBeReceviedWithin || 15,
        }}
        showDownloadButton={false}
      />
    );
  }

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-[#141428] text-white flex items-center justify-center">
        <p className="text-lg text-purple-300 animate-pulse">Loading media request...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#141428] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{loadError}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-[#8b3dff] hover:bg-[#9a52ff] text-white text-sm transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141428] text-white p-6 media-details-page">
      {/* TITLE + CANCEL */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Media Request" : "Media Form"}
        </h1>
        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-lg border border-[#3a3a5a] text-gray-300 hover:text-white hover:border-purple-500 text-sm transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
 
      <div className="mb-8">
        <label className="block mb-2 text-sm text-white">
          Principal Approval Form (without uploading this document you cannot proceed further)
        </label>
        {/* Show existing principal document in edit mode */}
        {isEditMode && existingPrincipalDocument && !principalApprovalDocument && (
          <div className="mb-3 flex items-center gap-3 bg-[#1b1b35] border border-[#2F2F3E] rounded-lg px-4 py-2">
            <FileText size={16} className="text-purple-400 shrink-0" />
            <span className="text-sm text-purple-300">Current file:</span>
            <a
              href={
                typeof existingPrincipalDocument === "string"
                  ? (existingPrincipalDocument.startsWith("http")
                      ? existingPrincipalDocument
                      : `${API_BASE}/${existingPrincipalDocument.replace(/^[/]+/, "")}`)
                  : (existingPrincipalDocument?.url
                      ? existingPrincipalDocument.url
                      : (existingPrincipalDocument?.path
                          ? `${API_BASE}/${existingPrincipalDocument.path.replace(/^[/]+/, "")}`
                          : "#"))
              }
              target="_blank"
              rel="noreferrer"
              className="text-sm text-purple-400 underline truncate max-w-xs"
            >
              {typeof existingPrincipalDocument === "string"
                ? existingPrincipalDocument.split("/").pop() || "View existing document"
                : (existingPrincipalDocument?.name ||
                   existingPrincipalDocument?.filename ||
                   existingPrincipalDocument?.originalName ||
                   "View existing document")}
            </a>
            <span className="ml-auto text-xs text-green-400">✓ Will be retained</span>
          </div>
        )}

        <div
          onClick={!principalApprovalDocument ? openPrincipalFilePicker : undefined}
          onDrop={handlePrincipalDrop}
          onDragOver={handleDragOver}
          className={`relative text-center p-4 text-sm w-full text-white rounded-lg flex flex-row items-center justify-center gap-3 ${
            !principalApprovalDocument ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="10"
              ry="10"
              fill="none"
              stroke={principalFileError ? "#f87171" : "#3A3A5A"}
              strokeWidth="2"
              strokeDasharray="10 4"
            />
          </svg>

          <img
            src={UploadIcon}
            alt="upload"
            className="w-7 h-8 opacity-80 z-10 shrink-0"
          />

          {principalApprovalDocument ? (
            <div className="z-10 flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>

                <span className="text-purple-300 text-sm font-medium">
                  {principalApprovalDocument.name}
                </span>

                <span className="text-gray-400 text-xs">
                  ({(principalApprovalDocument.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrincipalRemove}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300/60 rounded-md px-2 py-1 transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Remove
              </button>
            </div>
          ) : (
            <p className="z-10">
              Drag and drop files here or <span className="text-purple-400 underline">choose file</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Only PDF files supported • Max file size: 1MB
              </span>
            </p>
          )}
        </div>

        <input
          type="file"
          accept=".pdf,application/pdf"
          ref={principalInputRef}
          onChange={handlePrincipalFileChange}
          className="hidden"
        />

        {principalFileError && (
          <p className="text-red-400 text-xs mt-1">{principalFileError}</p>
        )}
      </div>

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
            border-[#2F2F3E]
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

      <div className="space-y-4 mb-6">
        <div className="relative w-full">
          <label className={pageFloatingLabelClass}>Finance Required *</label>

          <div
            onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
            className="w-full bg-transparent border border-[#2F2F3E] rounded-lg px-4 py-3.25 flex justify-between items-center cursor-pointer text-white"
          >
            <span className={financeRequired === "Yes" ? "text-white" : "text-[#8d8da8]"}>
              {financeRequired === "Yes" ? "Yes" : "No"}
            </span>

            <ChevronDown size={18} className="text-gray-400" />
          </div>

          {showFinanceDropdown && (
            <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
              {[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }].map((opt) => (
                <div
                  key={opt.label}
                  onClick={() => {
                    setFinanceRequired(opt.value);
                    setShowFinanceDropdown(false);
                    if (opt.value === "No") {
                      setFinanceEstimatedAmount("");
                      setFinanceAdvanceAmount("");
                      setFinanceAdvancePurpose("");
                      setFinanceAdvanceToBeReceviedWithin("");
                    }
                  }}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between ${financeRequired === opt.value ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
                >
                  <span>{opt.label}</span>
                  {financeRequired === opt.value && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {financeRequired === "Yes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="relative w-full md:col-span-2">
              <label className={cardFloatingLabelClass}>Estimated Budget Amount (Rs.)</label>
              <input
                type="number"
                min="0"
                value={financeEstimatedAmount}
                onChange={(e) => setFinanceEstimatedAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-[#2F2F3E] rounded-md px-4 py-3 text-white outline-none"
              />
              {financeComparisonError && (
                <p className="mt-1 text-sm text-red-400">{financeComparisonError}</p>
              )}
            </div>

            <div className="relative w-full">
              <label className={cardFloatingLabelClass}>I require Cash / In bank / Travel Advance /Online Payment of Rs.</label>
              <input
                type="number"
                min="0"
                value={financeAdvanceAmount}
                onChange={(e) => setFinanceAdvanceAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-[#2F2F3E] rounded-md px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="relative w-full">
              <label className={cardFloatingLabelClass}>Purpose of Advance</label>
              <input
                type="text"
                value={financeAdvancePurpose}
                onChange={(e) => setFinanceAdvancePurpose(e.target.value)}
                placeholder="Purpose"
                className="w-full border border-[#2F2F3E] rounded-md px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="relative w-full md:col-span-2">
              <label className={cardFloatingLabelClass}>Advance To Be Received Within</label>
              <input
                type="number"
                min="0"
                value={financeAdvanceToBeReceviedWithin}
                onChange={(e) => setFinanceAdvanceToBeReceviedWithin(e.target.value)}
                placeholder="0"
                className="w-full border border-[#2F2F3E] rounded-md px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {selectedTypes.includes("Poster") && (
        <div className="bg-[#1b1b35] border border-[#2F2F3E] rounded-2xl p-6">
          <h2 className="text-[#8b5cf6] text-2xl font-bold mb-6">Poster</h2>

          <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>Content for poster*</label>
            <textarea
              rows={4}
              value={posterContent}
              onChange={(e) => setPosterContent(e.target.value)}
              placeholder="reason"
              className="w-full border border-[#2F2F3E] rounded-md p-4 text-white outline-none"
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
                border-[#2F2F3E]
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
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const validation = validateFileType(file);
                  if (!validation.valid) {
                    setValidationErrors([validation.error]);
                    return;
                  }
                  setValidationErrors([]);
                  setPosterFile(file);
                }}
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

           <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
              Content for Certificate *
            </label>

           <textarea
  rows={4}
  value={certificateContent}
  onChange={(e) => setCertificateContent(e.target.value)}
  placeholder="reason"
  className="w-full border border-[#2F2F3E] rounded-md p-4 text-white outline-none"
/>
          </div>

           <div className="relative mb-8">
            <span className={cardFloatingLabelClass}>
              Reference Certificate ( If any )
            </span>

            <label
              className="
                border-2
                border-dashed
                border-[#2F2F3E]
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
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const validation = validateFileType(file);
                  if (!validation.valid) {
                    setValidationErrors([validation.error]);
                    return;
                  }
                  setValidationErrors([]);
                  setCertificateFile(file);
                }}
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
                    removeFile("certificate")
                  }
                >
                  <X className="text-red-500" />
                </button>
              </div>
            )}
          </div>

           <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
              Content for Trophy *
            </label>

            <textarea
  rows={4}
  value={trophyContent}
  onChange={(e) => setTrophyContent(e.target.value)}
  placeholder="reason"
  className="w-full border border-[#2F2F3E] rounded-md p-4 text-white outline-none"
/>
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
                border-[#2F2F3E]
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
                    placeholder="e.g. 2 * 2 px"
                    className="
                      w-full
                      border
                      border-[#2F2F3E]
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
                    placeholder="e.g. 4 * 4 px"
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
      minDate={new Date()}
    />
  </div>

  {/* PRIORITY */}
  {/* PRIORITY */}
<div className="relative w-full pt-px">
  <label className="absolute left-3 -top-2.25 text-xs text-white px-1 z-10 bg-[#1f1f3a]">
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
      border-[#2F2F3E]
      rounded-lg
      px-4
      py-3.25
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
          {/* FINANCE REQUIRED */}
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
                border-[#2F2F3E]
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

          <div className="relative mb-6">
            <label className={cardFloatingLabelClass}>
              Content for Video *
            </label>

            <textarea
              rows={4}
              value={videoContent}
              onChange={(e) =>
                setVideoContent(
                  e.target.value
                )
              }
              placeholder="reason"
              className="
                w-full
                border
                border-[#2F2F3E]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>

          {renderVideoDropdown({
            label: "Pre-Event Videos Needed*",
            placeholder: "Coming soon video / Promotional Video / Invitation Video",
            options: preEventOptions,
            selected: selectedPreEvent,
            setSelected: setSelectedPreEvent,
            isOpen: showPreEvent,
            setIsOpen: setShowPreEvent,
          })}

          {renderVideoDropdown({
            label: "Event Coverage Needed*",
            placeholder: "Full coverage / Highlights / Voice over",
            options: coverageOptions,
            selected: selectedCoverage,
            setSelected: setSelectedCoverage,
            isOpen: showCoverage,
            setIsOpen: setShowCoverage,
          })}

          {renderVideoDropdown({
            label: "Post-Event Videos Needed*",
            placeholder: "Event Glimpse / Post Event Video",
            options: postEventOptions,
            selected: selectedPostEvent,
            setSelected: setSelectedPostEvent,
            isOpen: showPostEvent,
            setIsOpen: setShowPostEvent,
          })}

          {renderVideoDropdown({
            label: "Special Videos Needed*",
            placeholder: "Chief Guest Event / Testimonials",
            options: specialVideoOptions,
            selected: selectedSpecialVideo,
            setSelected: setSelectedSpecialVideo,
            isOpen: showSpecialVideo,
            setIsOpen: setShowSpecialVideo,
          })}

          <div className="relative mb-8">
            <span className={cardFloatingLabelClass}>
              Reference Video( If any )
            </span>

            <label
              className="
                border-2
                border-dashed
                border-[#4b4b6b]
                rounded-lg
                p-8
                min-h-13.5
                flex
                justify-center
                items-center
                gap-3
                cursor-pointer
              "
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const validation = validateFileType(file);
                  if (!validation.valid) {
                    setValidationErrors([validation.error]);
                    return;
                  }
                  setValidationErrors([]);
                  setVideoFile(file);
                }}
              />

              <Upload size={20} />

              <span className="text-sm text-center">
                Drag and drop the files here or{" "}
                <span className="text-[#8b5cf6] underline">
                  choose file
                </span>
              </span>
            </label>

            {videoFile && (
              <div className="mt-4 bg-[#141428] border border-[#2F2F3E] rounded-md px-4 py-3 flex items-center justify-between">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
            <div className="w-full">
              <CustomDateTimePicker
                label="Delivery Date *"
                value={
                  videoDeliveryDate
                    ? new Date(videoDeliveryDate)
                    : null
                }
                onChange={(date) =>
                  setVideoDeliveryDate(
                    date.toISOString()
                  )
                }
                placeholder="__/__/____"
                showTime={false}
                minDate={new Date()}
              />
            </div>

            <div className="relative w-full pt-px">
              <label className="absolute left-3 -top-2.25 text-xs text-white px-1 z-10 bg-[#1f1f3a]">
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
                  bg-transparent
                  border
                  border-[#2F2F3E]
                  rounded-lg
                  px-4
                  py-3.25
                  flex
                  justify-between
                  items-center
                  cursor-pointer
                  text-white
                "
              >
                <span>{videoPriority}</span>

                <ChevronDown
                  size={18}
                  className="text-gray-400"
                />
              </div>

              {showVideoPriorityDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#3a3a5a] rounded-md overflow-hidden z-50">
                  {priorityOptions.map(
                    (item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setVideoPriority(item);
                          setShowVideoPriorityDropdown(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${videoPriority === item ? "bg-[#492A6F] text-white" : "text-white hover:bg-[#492A6F] hover:text-white"}`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>


          <div className="relative">
            <label className={cardFloatingLabelClass}>
              Special Requirements, If any*
            </label>

            <textarea
              rows={4}
              value={videoRequirement}
              onChange={(e) =>
                setVideoRequirement(
                  e.target.value
                )
              }
              placeholder="reason"
              className="
                w-full
                border
                border-[#2F2F3E]
                rounded-md
                p-4
                text-white
                outline-none
              "
            />
          </div>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="
            bg-[#8b3dff]
            hover:bg-[#9a52ff]
            disabled:opacity-60
            disabled:cursor-not-allowed
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
          {isSubmitting
            ? (isEditMode ? "Updating..." : "Submitting...")
            : (isEditMode ? "Update Media Request" : "Submit")}

          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default MediaDetailsPage;
