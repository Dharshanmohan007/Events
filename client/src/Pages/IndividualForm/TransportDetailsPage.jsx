import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomDateTimePicker from "../../Components/CustomDateTimePicker";
import FormSubmitted from "./FormSubmitted";

import UploadIcon from "../../assets/upload.svg";

import {
  Plus,
  MapPin,
  GripVertical,
  X,
  ChevronDown,
  ArrowRight,
  FileText,
} from "lucide-react";

import { jwtDecode } from "jwt-decode";
import { decodeToken, isTokenExpired } from "../../utils/tokenUtils";

import { API_BASE } from "../../utils/apiConfig";

const createTransportForm = () => ({
  pickupDateTime: null,
  dropDateTime: null,
  pickupLocation: "",
  dropLocation: "",
  checkpoints: [],
  draggedIndex: null,
  totalPassengers: "",
  numberOfGuests: "",
  guests: [],
  guestCountError: "",

  // VEHICLES
  selectedVehicles: [],
  vehicleCounts: {},
  availableVehicleCounts: {},
  inventoryLoading: false,
  showVehicleDropdown: false,

  // STAFF
  staffOptionType: "",
  showStaffDropdown: false,
  staffDetails: [],

  specialRequirement: "",
  financeRequired: "No",
  advanceAmount: "",
  advancePurpose: "",
  advanceToBeReceviedWithin: "",
  estimatedEventBudget: "",
  showFinanceDropdown: false,
});

const floatingLabelClass =
  "absolute left-3 -top-[9px] text-xs text-white px-1 z-10 pointer-events-none";

const formFloatingLabelClass = `${floatingLabelClass} bg-[#1b1b35]`;

const staffFloatingLabelClass = `${floatingLabelClass} bg-[#26264a]`;

const TransportDetailsPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoadingDetails, setIsLoadingDetails] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");
  const [existingPrincipalDocument, setExistingPrincipalDocument] = useState(null);

  const [transportForms, setTransportForms] = useState([createTransportForm()]);

  const [employeeId, setEmployeeId] = useState("");
  const [token, setToken] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const MAX_PRINCIPAL_FILE_SIZE_MB = 1;
  const MAX_PRINCIPAL_FILE_SIZE_BYTES =
    MAX_PRINCIPAL_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_PRINCIPAL_FILE_TYPE = "application/pdf";

  const principalInputRef = useRef(null);
  const [principalApprovalDocument, setPrincipalApprovalDocument] =
    useState(null);
  const [principalFileError, setPrincipalFileError] = useState("");

  const mapTransportApiToForm = (data) => {
    const transport = data?.data || data?.transport || data;

    let pickupDate = null;
    if (transport.pickupDateTime) {
      pickupDate = new Date(transport.pickupDateTime);
      if (Number.isNaN(pickupDate.getTime())) pickupDate = null;
    }

    let dropDate = null;
    if (transport.dropDateTime) {
      dropDate = new Date(transport.dropDateTime);
      if (Number.isNaN(dropDate.getTime())) dropDate = null;
    }

    const checkpointsList = Array.isArray(transport.checkpoints)
      ? transport.checkpoints.map((cp) => (typeof cp === "string" ? cp : cp.location || "")).filter(Boolean)
      : [];

    const vehiclesList = Array.isArray(transport.vehicles) ? transport.vehicles : [];
    const selectedVehicles = vehiclesList.map((v) => v.type).filter(Boolean);
    const vehicleCounts = vehiclesList.reduce((acc, v) => {
      if (v.type) acc[v.type] = String(v.count ?? 1);
      return acc;
    }, {});

    const accompanyingStaffList = Array.isArray(transport.accompanyingStaff) && transport.accompanyingStaff.length > 0
      ? transport.accompanyingStaff.map((s) => ({ name: s.name || "", mobile: String(s.mobile || "") }))
      : [];

    return {
      pickupDateTime: pickupDate,
      dropDateTime: dropDate,
      pickupLocation: transport.pickupLocation || "",
      dropLocation: transport.dropLocation || "",
      checkpoints: checkpointsList,
      draggedIndex: null,
      totalPassengers: String(transport.totalPassengers ?? ""),
      numberOfGuests: String(transport.numberOfGuests ?? transport.totalGuests ?? ""),
      guests: Array.isArray(transport.guests)
        ? transport.guests.map((guest) => ({
            name: guest.name || "",
            mobile: String(guest.mobile || ""),
            organization: guest.organization || guest.organizationName || "",
            gender: guest.gender || "",
            designation: guest.designation || "",
          }))
        : [],
      guestCountError: "",

      selectedVehicles: selectedVehicles,
      vehicleCounts: vehicleCounts,
      availableVehicleCounts: {},
      inventoryLoading: false,
      showVehicleDropdown: false,

      staffOptionType: String(transport.numberOfAccompanyingStaff ?? (accompanyingStaffList.length || "")),
      showStaffDropdown: false,
      staffDetails: accompanyingStaffList,

      specialRequirement: transport.specialRequirements || "",
      financeRequired: (transport.financeRequired || "No").toString().toLowerCase() === "yes" ? "Yes" : "No",
      advanceAmount: String(transport.advanceAmount ?? ""),
      advancePurpose: transport.advancePurpose || "",
      advanceToBeReceviedWithin: String(transport.advanceToBeReceviedWithin ?? ""),
      estimatedEventBudget: String(transport.estimatedEventBudget ?? transport.estimatedAmount ?? ""),
      showFinanceDropdown: false,
    };
  };

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;
    const fetchTransportDetails = async () => {
      setIsLoadingDetails(true);
      setLoadError("");
      try {
        const authToken = localStorage.getItem("token") || token;
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        let response = await fetch(`${API_BASE}/api/transports/${id}`, { headers });
        if (!response.ok) {
          response = await fetch(`${API_BASE}/api/individual-submissions/getrequest/${id}`, { headers });
        }

        if (!response.ok) {
          throw new Error(`Failed to load transport request (Status ${response.status})`);
        }

        const resData = await response.json();
        const rawData = resData.data || resData;
        const actualTransport = Array.isArray(rawData) ? rawData[0] : (rawData.data || rawData);

        if (isMounted) {
          const mappedForm = mapTransportApiToForm(actualTransport);
          setTransportForms([mappedForm]);
          const existingDoc =
            actualTransport?.principalApprovalForm ||
            actualTransport?.principalApprovalFormName ||
            actualTransport?.principalApprovalDocument ||
            actualTransport?.principalDocument ||
            actualTransport?.approvalDocument ||
            actualTransport?.approvalForm ||
            actualTransport?.files?.principalApprovalForm ||
            actualTransport?.files?.principalApprovalFormName ||
            rawData?.principalApprovalForm ||
            rawData?.principalApprovalFormName ||
            rawData?.principalApprovalDocument ||
            rawData?.principalDocument ||
            resData?.principalApprovalForm ||
            resData?.principalApprovalFormName ||
            resData?.principalApprovalDocument ||
            resData?.principalDocument;
          if (existingDoc) {
            setExistingPrincipalDocument(existingDoc);
          }
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || "Failed to load transport request details");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchTransportDetails();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      try {
        const decoded = jwtDecode(storedToken);

        if (decoded?.id) {
          setEmployeeId(decoded.id);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handlePrincipalFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== ALLOWED_PRINCIPAL_FILE_TYPE) {
      setPrincipalFileError("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_PRINCIPAL_FILE_SIZE_BYTES) {
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
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
      setPrincipalFileError(
        `File size must be less than ${MAX_PRINCIPAL_FILE_SIZE_MB}MB.`,
      );
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

  const handleUploadDragOver = (e) => e.preventDefault();

  const getVehicleOptions = (totalPassengers) => {
    const passengerCount = Number(totalPassengers) || 0;
    return passengerCount > 4 ? ["Car", "Bus"] : ["Car"];
  };

  // =========================
  // ADD FORM
  // =========================
  const addTransportForm = () => {
    setTransportForms((prev) => [...prev, createTransportForm()]);
  };

  // =========================
  // UPDATE FIELD
  // =========================
  const updateTransportForm = (formIndex, updates) => {
    setTransportForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[formIndex] = {
        ...updatedForms[formIndex],
        ...updates,
      };
      return updatedForms;
    });
  };

  const updateFormField = async (formIndex, field, value) => {
    const isDateField = field === "pickupDateTime" || field === "dropDateTime";
    const nextForm = {
      ...transportForms[formIndex],
      [field]: value,
    };

    // Keep the pickup/drop range valid even if a date is changed after both
    // fields have already been selected.
    if (
      nextForm.pickupDateTime &&
      nextForm.dropDateTime &&
      nextForm.pickupDateTime > nextForm.dropDateTime
    ) {
      if (field === "pickupDateTime") {
        nextForm.dropDateTime = null;
      } else {
        nextForm.pickupDateTime = null;
      }
    }

    if (field === "totalPassengers") {
      const allowedVehicles = getVehicleOptions(value);

      nextForm.selectedVehicles = (nextForm.selectedVehicles || []).filter(
        (vehicle) => allowedVehicles.includes(vehicle),
      );
      nextForm.vehicleCounts = Object.fromEntries(
        Object.entries(nextForm.vehicleCounts || {}).filter(([vehicle]) =>
          allowedVehicles.includes(vehicle),
        ),
      );

      if (Number(value) <= 4 && nextForm.selectedVehicles.includes("Bus")) {
        nextForm.selectedVehicles = nextForm.selectedVehicles.filter(
          (vehicle) => vehicle !== "Bus",
        );
        delete nextForm.vehicleCounts.Bus;
      }
    }

    if (field === "numberOfGuests") {
      const guestCount = Math.max(0, Math.min(10, Number(value) || 0));
      nextForm.guestCountError = Number(value) > 10
        ? "Number of guests cannot exceed 10."
        : "";
      nextForm.guests = Array.from({ length: guestCount }, (_, index) => ({
        name: nextForm.guests?.[index]?.name || "",
        mobile: nextForm.guests?.[index]?.mobile || "",
        organization: nextForm.guests?.[index]?.organization || "",
        gender: nextForm.guests?.[index]?.gender || "",
        designation: nextForm.guests?.[index]?.designation || "",
      }));
    }

    if (isDateField) {
      nextForm.availableVehicleCounts = {};
      nextForm.inventoryLoading = true;
    }

    updateTransportForm(formIndex, nextForm);

    if (isDateField) {
      if (nextForm.pickupDateTime && nextForm.dropDateTime) {
        await fetchVehicleInventory(formIndex, nextForm.pickupDateTime, nextForm.dropDateTime);
      } else {
        updateTransportForm(formIndex, { inventoryLoading: false });
      }
    }
  };

  // =========================
  // CHECKPOINTS
  // =========================
  const addCheckpoint = (formIndex) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints.push("");

    setTransportForms(updatedForms);
  };

  const updateCheckpoint = (formIndex, checkpointIndex, value) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints[checkpointIndex] = value;

    setTransportForms(updatedForms);
  };

  const removeCheckpoint = (formIndex, checkpointIndex) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].checkpoints = updatedForms[
      formIndex
    ].checkpoints.filter((_, i) => i !== checkpointIndex);

    setTransportForms(updatedForms);
  };

  // =========================
  // DRAG
  // =========================
  const handleDragStart = (formIndex, index) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].draggedIndex = index;

    setTransportForms(updatedForms);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (formIndex, dropIndex) => {
    const updatedForms = [...transportForms];

    const draggedIndex = updatedForms[formIndex].draggedIndex;

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const checkpoints = [...updatedForms[formIndex].checkpoints];

    const draggedItem = checkpoints[draggedIndex];

    checkpoints.splice(draggedIndex, 1);

    checkpoints.splice(dropIndex, 0, draggedItem);

    updatedForms[formIndex].checkpoints = checkpoints;

    updatedForms[formIndex].draggedIndex = null;

    setTransportForms(updatedForms);
  };

  // =========================
  // STAFF
  // =========================
  const updateStaffDetail = (formIndex, staffIndex, field, value) => {
    const updatedForms = [...transportForms];

    updatedForms[formIndex].staffDetails[staffIndex][field] = value;

    setTransportForms(updatedForms);
  };

  const updateGuestDetail = (formIndex, guestIndex, field, value) => {
    const updatedForms = [...transportForms];
    updatedForms[formIndex].guests[guestIndex][field] = value;
    setTransportForms(updatedForms);
  };

  // =========================
  // VEHICLE LABELS
  // =========================
  const getVehicleLabel = (vehicleType) => {
    switch (vehicleType) {
      case "Car":
        return "How many cars needed *";

      case "Bus":
        return "How many buses needed *";

      case "Van":
        return "How many vans needed *";

      default:
        return "How many vehicles needed *";
    }
  };

  const getVehiclePlaceholder = (vehicleType) => {
    switch (vehicleType) {
      case "Car":
        return "Enter number of cars";

      case "Bus":
        return "Enter number of buses";

      case "Van":
        return "Enter number of vans";

      default:
        return "Enter vehicle count";
    }
  };

  // =========================
  // HELPERS
  // =========================
  // Convert UTC ISO string back to local date for display
  const convertUTCToLocal = (utcString) => {
    if (!utcString) return null;
    const date = new Date(utcString);
    return date; // new Date() automatically interprets as local when used with getHours(), etc.
  };

  // Format date/time in Indian Standard Time (IST / Asia/Kolkata)
  const formatInIST = (date) => {
    if (!date) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      return date.toLocaleString();
    }
  };

  const formatDateOnly = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    const aS = new Date(aStart).getTime();
    const aE = new Date(aEnd).getTime();
    const bS = new Date(bStart).getTime();
    const bE = new Date(bEnd).getTime();
    return aS <= bE && bS <= aE;
  };

  const getDisplayedAvailability = (formIndex, vehicle) => {
    const form = transportForms[formIndex];
    const available = form.availableVehicleCounts?.[vehicle];
    if (available === undefined || available === null) return undefined;

    // subtract counts reserved by other forms that overlap this form's date range
    const reserved = transportForms.reduce((sum, otherForm, idx) => {
      if (idx === formIndex) return sum;
      if (!rangesOverlap(form.pickupDateTime, form.dropDateTime, otherForm.pickupDateTime, otherForm.dropDateTime)) return sum;
      const v = Number(otherForm.vehicleCounts?.[vehicle]) || 0;
      return sum + v;
    }, 0);

    const remaining = Number(available) - reserved;
    return remaining >= 0 ? remaining : 0;
  };

  const formatDateWithOffset = (date) => {
    if (!date) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const mo = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const absOff = Math.abs(offsetMin);
    const offH = pad(Math.floor(absOff / 60));
    const offM = pad(absOff % 60);

    return `${y}-${mo}-${d}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
  };

  const isFinanceYes = (value) => String(value || "").toLowerCase() === "yes";

  const fetchVehicleInventory = async (formIndex, pickupDate, dropDate) => {
    if (!pickupDate || !dropDate) return;

    const pickup = formatDateOnly(new Date(pickupDate));
    const drop = formatDateOnly(new Date(dropDate));
    const candidateUrls = [
      `${API_BASE}/api/transport-inventory/available?pickupDateTime=${encodeURIComponent(
        pickup,
      )}&dropDateTime=${encodeURIComponent(drop)}`,
      `http://10.57.1.245:5005/api/transport-inventory/available?pickupDateTime=${encodeURIComponent(
        pickup,
      )}&dropDateTime=${encodeURIComponent(drop)}`,
    ];

    let inventory = [];
    let lastError = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          lastError = new Error(
            `Transport inventory API returned ${res.status} for ${url}`,
          );
          console.warn(lastError.message);
          continue;
        }

        const json = await res.json();
        // Backend may return either { data: [...] } or [...] directly — handle both
        const candidateData = json?.data ?? json;
        if (Array.isArray(candidateData)) {
          inventory = candidateData;
        } else if (Array.isArray(candidateData?.data)) {
          inventory = candidateData.data;
        } else {
          inventory = [];
        }
        // Debugging aid when availability isn't present
        console.debug("Transport inventory response:", { url, json, inventory });
        break;
      } catch (error) {
        lastError = error;
        console.warn("Transport inventory fetch error:", error, "url=", url);
      }
    }

    const availableVehicleCounts = inventory.reduce((acc, item) => {
      if (item?.vehicleType) {
        acc[item.vehicleType] = item.availableCount ?? 0;
      }
      return acc;
    }, {});

    if (!inventory.length && lastError) {
      console.warn("Failed to load transport inventory:", lastError);
    }

    setTransportForms((prev) => {
      const updated = [...prev];
      updated[formIndex] = {
        ...updated[formIndex],
        availableVehicleCounts,
        inventoryLoading: false,
      };
      return updated;
    });
  };

  const buildTransportPayload = (form) => {
    const formData = new FormData();

    formData.append("employee", employeeId || "6a0411af4579d3137b255e70");

    if (principalApprovalDocument) {
      formData.append("principalApprovalForm", principalApprovalDocument);
    }

    formData.append(
      "pickupDateTime",
      form.pickupDateTime
        ? new Date(
            form.pickupDateTime.getTime() -
              form.pickupDateTime.getTimezoneOffset() * 60000,
          ).toISOString()
        : "",
    );

    formData.append(
      "dropDateTime",
      form.dropDateTime
        ? new Date(
            form.dropDateTime.getTime() -
              form.dropDateTime.getTimezoneOffset() * 60000,
          ).toISOString()
        : "",
    );

    formData.append("pickupLocation", form.pickupLocation.trim());

    formData.append("dropLocation", form.dropLocation.trim());

    formData.append(
      "checkpoints",
      JSON.stringify(
        (form.checkpoints || []).map((location) => ({
          location,
        })),
      ),
    );

    formData.append("totalPassengers", Number(form.totalPassengers) || 0);

    formData.append("numberOfGuests", Number(form.numberOfGuests) || 0);
    formData.append(
      "guests",
      JSON.stringify(
        (form.guests || []).map((guest) => ({
          name: guest.name,
          mobile: Number(guest.mobile) || 0,
          organization: guest.organization,
          gender: guest.gender,
          designation: guest.designation,
        })),
      ),
    );

    formData.append(
      "vehicles",
      JSON.stringify(
        (form.selectedVehicles || []).map((vehicle) => ({
          type: vehicle,
          count: Number(form.vehicleCounts?.[vehicle]) || 0,
        })),
      ),
    );

    formData.append(
      "numberOfBusNeeded",
      Number(form.vehicleCounts?.["Bus"]) || 0,
    );

    formData.append(
      "numberOfAccompanyingStaff",
      Number(form.staffOptionType) || 0,
    );

    formData.append(
      "accompanyingStaff",
      JSON.stringify(
        (form.staffDetails || []).map((staff) => ({
          name: staff.name,
          mobile: Number(staff.mobile),
        })),
      ),
    );

    formData.append("specialRequirements", form.specialRequirement);

    formData.append("financeRequired", form.financeRequired);
    formData.append("advanceAmount", form.financeRequired === "Yes" ? Number(form.advanceAmount) || 0 : 0);
    formData.append("advancePurpose", form.financeRequired === "Yes" ? form.advancePurpose || "" : "");
    formData.append("advanceToBeReceviedWithin", form.financeRequired === "Yes" ? Number(form.advanceToBeReceviedWithin) || 0 : 0);
    formData.append(
      "estimatedEventBudget",
      form.financeRequired === "Yes" ? Number(form.estimatedEventBudget) || 0 : 0,
    );

    // Also include backend-expected `estimatedAmount` for compatibility
    formData.append(
      "estimatedAmount",
      form.financeRequired === "Yes" ? Number(form.estimatedEventBudget) || 0 : 0,
    );

    formData.append("status", "Pending");

    return formData;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    // console.log('[TransportDetails] handleSubmit start');
    const errors = [];

    // Principal approval validation
    if (
      transportForms.some((form) => isFinanceYes(form.financeRequired)) &&
      !principalApprovalDocument &&
      !existingPrincipalDocument
    ) {
      errors.push("Principal Approval Form is required.");
    }

    transportForms.forEach((form, index) => {
      if (!form.pickupDateTime) {
        errors.push(`Form ${index + 1}: Pickup Date & Time is required`);
      }

      if (!form.dropDateTime) {
        errors.push(`Form ${index + 1}: Drop Date & Time is required`);
      }

      if (!form.pickupLocation.trim()) {
        errors.push(`Form ${index + 1}: Pickup Location is required`);
      }

      if (!form.dropLocation.trim()) {
        errors.push(`Form ${index + 1}: Drop Location is required`);
      }

      if (!form.totalPassengers) {
        errors.push(`Form ${index + 1}: Total passengers required`);
      }

      const numberOfGuests = Number(form.numberOfGuests) || 0;
      if (numberOfGuests > 10) {
        errors.push(`Form ${index + 1}: Number of guests cannot exceed 10.`);
      }

      (form.guests || []).slice(0, numberOfGuests).forEach((guest, guestIndex) => {
        if (!guest.name?.trim()) {
          errors.push(`Form ${index + 1}: Guest ${guestIndex + 1} name is required`);
        }
        if (!guest.mobile?.trim()) {
          errors.push(`Form ${index + 1}: Guest ${guestIndex + 1} mobile number is required`);
        }
        if (!guest.organization?.trim()) {
          errors.push(`Form ${index + 1}: Guest ${guestIndex + 1} organization name is required`);
        }
        if (!guest.gender) {
          errors.push(`Form ${index + 1}: Guest ${guestIndex + 1} gender is required`);
        }
        if (!guest.designation?.trim()) {
          errors.push(`Form ${index + 1}: Guest ${guestIndex + 1} designation is required`);
        }
      });

      if (!form.selectedVehicles || form.selectedVehicles.length === 0) {
        errors.push(`Form ${index + 1}: Vehicle type required`);
      }

      const totalPassengers = Number(form.totalPassengers) || 0;

      (form.selectedVehicles || []).forEach((vehicle) => {
        const vehicleCount = Number(form.vehicleCounts?.[vehicle]) || 0;

        if (!form.vehicleCounts?.[vehicle]) {
          errors.push(`Form ${index + 1}: ${vehicle} count required`);
          return;
        }

        if (vehicle === "Car") {
          if (totalPassengers === 1 && vehicleCount > 1) {
            errors.push(`Form ${index + 1}: Car count cannot exceed 1 when total passengers is 1.`);
          }

          if (totalPassengers > 1 && totalPassengers <= 4 && vehicleCount > totalPassengers) {
            errors.push(`Form ${index + 1}: Car count cannot exceed ${totalPassengers} when total passengers are ${totalPassengers}.`);
          }

          if (totalPassengers === 4 && vehicleCount > 4) {
            errors.push(`Form ${index + 1}: Car count cannot exceed 4 when total passengers are 4.`);
          }
        }

        if (vehicle === "Bus" && totalPassengers <= 4) {
          errors.push(`Form ${index + 1}: Bus is allowed only when total passengers are more than 4.`);
        }
      });

      // Staff count validation
      if (form.staffOptionType && Number(form.staffOptionType) > 99) {
        errors.push(`Form ${index + 1}: Number of accompanying staff cannot exceed 99.`);
      }

      // Finance validation
      if (form.financeRequired === "Yes") {
        const advanceAmount = parseFloat(form.advanceAmount);
        const totalBudget = parseFloat(form.estimatedEventBudget);

        if (!form.advanceAmount || Number.isNaN(advanceAmount) || advanceAmount <= 0) {
          errors.push(`Form ${index + 1}: Advance amount is required.`);
        }

        if (!form.advancePurpose || !form.advancePurpose.trim()) {
          errors.push(`Form ${index + 1}: Advance purpose is required.`);
        }

        if (!form.advanceToBeReceviedWithin) {
          errors.push(`Form ${index + 1}: Advance to be received within is required.`);
        }

        if (
          !form.estimatedEventBudget ||
          Number.isNaN(totalBudget) ||
          totalBudget <= 0
        ) {
          errors.push(`Form ${index + 1}: Total budget amount is required.`);
        }

        if (
          !Number.isNaN(advanceAmount) &&
          !Number.isNaN(totalBudget) &&
          advanceAmount > totalBudget
        ) {
          errors.push(
            `Form ${index + 1}: Advance amount cannot exceed the Estimated Budget amount.`,
          );
        }
      }
    });

    setValidationErrors(errors);
    setSubmitMessage("");

    if (errors.length) return;

    // Validate stored token before attempting submit. If token is missing/expired,
    // show an error instead of forcing a navigation to the login page.
    const authToken = localStorage.getItem("token") || token;
    const decodedAuthToken = decodeToken(authToken);

    if (!authToken || !decodedAuthToken || isTokenExpired(decodedAuthToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setValidationErrors(["Session expired or invalid token. Please login again."]);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Edit mode: single Transport update via PUT /api/transports/:id
        const form = transportForms[0];
        const payload = buildTransportPayload(form);

        let response = await fetch(`${API_BASE}/api/transports/${id}`, {
          method: "PUT",
          headers: {
            ...(authToken && {
              Authorization: `Bearer ${authToken}`,
            }),
          },
          body: payload,
        });

        if (!response.ok && response.status === 404) {
          response = await fetch(`${API_BASE}/api/transports/${id}`, {
            method: "PATCH",
            headers: {
              ...(authToken && {
                Authorization: `Bearer ${authToken}`,
              }),
            },
            body: payload,
          });
        }

        const responseText = await response.text();
        let responseData;
        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseData = null;
        }

        if (!response.ok) {
          const serverMessage =
            responseData?.message ||
            responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
            `Transport update failed (HTTP ${response.status}).`;
          throw new Error(serverMessage);
        }

        setValidationErrors([]);
        setSubmitMessage("Transport request updated successfully.");
        setSubmitSuccess(true);

        const financeEnabled = String(form?.financeRequired).toLowerCase() === "yes";
        if (financeEnabled) {
          const respData = responseData?.data || responseData || {};
          const receiptRequestNo =
            respData?.requestNo ||
            respData?.data?.requestNo ||
            respData?.transport?.requestNo ||
            respData?.data?.transport?.requestNo ||
            "";
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

          const employeePayload = {
            name: form?.employeeName || storedUser?.name || respData?.employeeName || "",
            empId: form?.empId || respData?.empId || storedUser?.empId || "",
            designation: form?.designation || storedUser?.designation || respData?.designation || "",
            department: form?.department || storedUser?.department || respData?.department || "",
          };

          const submitRespPayload = {
            requestNo: receiptRequestNo,
            response: responseData,
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
                selectDate: form?.pickupDateTime || "",
                advanceAmount: form?.advanceAmount || "",
                advancePurpose: form?.advancePurpose || "",
                clearanceDays: form?.advanceToBeReceviedWithin || 15,
                employeeName: employeePayload.name,
                empId: employeePayload.empId,
                designation: employeePayload.designation,
                department: employeePayload.department,
              },
              employee: employeePayload,
              submitResponse: submitRespPayload,
            });
          });
        }
      } else {
        // Create mode: loop through transportForms
        let lastResponseData = null;
        for (const form of transportForms) {
          const payload = buildTransportPayload(form);

          const response = await fetch(`${API_BASE}/api/transports`, {
            method: "POST",
            headers: {
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
            body: payload,
          });

          const responseText = await response.text();
          let responseData;

          try {
            responseData = responseText ? JSON.parse(responseText) : null;
          } catch {
            responseData = null;
          }

          if (!response.ok) {
            const serverMessage =
              responseData?.message ||
              responseText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
              `Transport submission failed (HTTP ${response.status}).`;

            console.error("Transport API error:", {
              status: response.status,
              response: responseData || responseText,
            });
            throw new Error(serverMessage);
          }

          lastResponseData = responseData;
        }

        setValidationErrors([]);
        setSubmitSuccess(true);

        const firstForm = transportForms[0] || {};
        const financeEnabled = firstForm?.financeRequired === "Yes";

        if (financeEnabled) {
          const respData = lastResponseData?.data || lastResponseData || {};
          const receiptRequestNo =
            respData?.requestNo ||
            respData?.data?.requestNo ||
            respData?.transport?.requestNo ||
            respData?.data?.transport?.requestNo ||
            "";
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

          const employeePayload = {
            name: firstForm?.employeeName || storedUser?.name || respData?.employeeName || "",
            empId: firstForm?.empId || respData?.empId || storedUser?.empId || "",
            designation: firstForm?.designation || storedUser?.designation || respData?.designation || "",
            department: firstForm?.department || storedUser?.department || respData?.department || "",
          };

          const submitRespPayload = {
            requestNo: receiptRequestNo,
            response: lastResponseData,
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
                selectDate: firstForm?.pickupDateTime || "",
                advanceAmount: firstForm?.advanceAmount || "",
                advancePurpose: firstForm?.advancePurpose || "",
                clearanceDays: firstForm?.advanceToBeReceviedWithin || 15,
                employeeName: employeePayload.name,
                empId: employeePayload.empId,
                designation: employeePayload.designation,
                department: employeePayload.department,
              },
              employee: employeePayload,
              submitResponse: submitRespPayload,
            });
          });
        }
      }
    } catch (error) {
      console.error("Transport submission failed:", error);
      setValidationErrors([
        error.message || "Unable to save transport data.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return <FormSubmitted advanceData={transportForms[0] || {}} showDownloadButton={false} />;
  }

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-[#141428] text-white p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-300 text-sm">Loading Transport request details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#141428] text-white p-6 flex flex-col items-center justify-center">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-6 max-w-md text-center">
          <p className="text-red-300 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 rounded-md transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transport-form min-h-screen bg-[#141428] text-white p-5">
      <style>{`
          .transport-form input:focus,
          .transport-form textarea:focus,
          .transport-form button:focus,
          .transport-form .transport-select-control:focus {
            border-color: #3b82f6 !important;
            box-shadow: none !important;
            outline: none !important;
          }
        `}</style>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Transport Details" : "Transport Details Form"}
          </h1>
          {isEditMode && (
            <p className="text-gray-400 text-xs mt-1">
              Editing Transport Request ID: <span className="text-purple-400 font-mono">{id}</span>
            </p>
          )}
        </div>
        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-gray-400 hover:text-white border border-gray-600 rounded-md px-3 py-1.5 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {transportForms.some((form) => isFinanceYes(form.financeRequired)) && (
      <div className="mb-6">
        <label className="block mb-2 text-sm text-white">
          Principal Approval Form {isEditMode ? "(Upload only to replace existing document)" : "(without uploading this document you cannot proceed further)"} *
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
          onClick={
            !principalApprovalDocument ? openPrincipalFilePicker : undefined
          }
          onDrop={handlePrincipalDrop}
          onDragOver={handleUploadDragOver}
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
            className="w-7 h-8 opacity-80 z-10 flex-shrink-0"
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
                  ({(principalApprovalDocument.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
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
              Drag and drop files here{" "}
              <span className="text-purple-400 underline">choose file</span>
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
      )}

      {/* ADD BUTTON */}
      {!isEditMode && (
        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={addTransportForm}
            className="
                flex
                items-center
                gap-2
                bg-[#8b5cf6]
                hover:bg-[#7c3aed]
                px-5
                py-2.5
                rounded-md
                transition-all
              "
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      )}

      {/* FORMS */}
      {transportForms.map((form, formIndex) => (
        <div
          key={formIndex}
          className="
                bg-[#1b1b35]
                border
                border-[#2a2a40]
                rounded-2xl
                p-6
                mb-8
              "
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#8b5cf6]">
              Transport Form {formIndex + 1}
            </h2>

            {formIndex !== 0 && (
              <button
                type="button"
                onClick={() => {
                  const updatedForms = transportForms.filter(
                    (_, index) => index !== formIndex,
                  );

                  setTransportForms(updatedForms);
                }}
                className="
      w-[42px]
      h-[42px]
      p-2
      rounded-full
      bg-[#f3d7d7]
      flex
      items-center
      justify-center
      transition-all
     
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff2b2b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            )}
          </div>

          {/* DATE PICKERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CustomDateTimePicker
              label="Pickup Date & Time *"
              value={form.pickupDateTime}
              minDate={new Date()}
              minDateTime={new Date()}
              onChange={(date) =>
                updateFormField(formIndex, "pickupDateTime", date)
              }
              placeholder="Select pickup date & time"
              labelBgClass="bg-[#1b1b35]"
              maxDate={form.dropDateTime}
            />

            <CustomDateTimePicker
              label="Drop Date & Time *"
              value={form.dropDateTime}
              onChange={(date) =>
                updateFormField(formIndex, "dropDateTime", date)
              }
              placeholder="Select drop date & time"
              labelBgClass="bg-[#1b1b35]"
              minDate={form.pickupDateTime}
            />
          </div>

          {/* PICKUP */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Pickup Location *</label>

            <div
              className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                 
                    focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
            >
              <MapPin size={18} />

              <input
                type="text"
                value={form.pickupLocation}
                onChange={(e) =>
                  updateFormField(formIndex, "pickupLocation", e.target.value)
                }
                placeholder="Enter pickup location"
                className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
              />
            </div>
          </div>

          {/* CHECKPOINT */}
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => addCheckpoint(formIndex)}
              className="flex items-center gap-2 text-[#9b5cff] font-medium"
            >
              <Plus
                size={16}
                className="bg-[#9b5cff] rounded-full p-0.5 text-white"
              />
              Add Checkpoint
            </button>
          </div>

          {/* CHECKPOINTS */}
          {(form.checkpoints || []).length > 0 && (
            <div className="mt-5 space-y-3">
              {(form.checkpoints || []).map((checkpoint, checkpointIndex) => (
                <div
                  key={checkpointIndex}
                  draggable
                  onDragStart={() =>
                    handleDragStart(formIndex, checkpointIndex)
                  }
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(formIndex, checkpointIndex)}
                  className="
                          bg-[#282846]
                          rounded-md
                          px-4
                          py-2
                          flex
                          items-center
                          justify-between
                        "
                >
                  <div className="flex  items-center gap-3 w-full">
                    <GripVertical size={18} className="text-[#8d8da8]" />

                    <MapPin size={18} />

                    <input
                      type="text"
                      value={checkpoint}
                      onChange={(e) =>
                        updateCheckpoint(
                          formIndex,
                          checkpointIndex,
                          e.target.value,
                        )
                      }
                      placeholder={`Checkpoint ${checkpointIndex + 1}`}
                      className="
                              bg-transparent
                              outline-none
                              text-white
                              w-full
                              border
                              border-[#2F2F47]
                              rounded-md
                              px-2
                              py-2
                              focus:border-[#3b82f6]
                              focus:ring-0
                              focus:ring-[#3b82f6]
                            "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCheckpoint(formIndex, checkpointIndex)}
                  >
                    <X size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* DROP */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Drop Location *</label>

            <div
              className="
                    flex
                    items-center
                    gap-3
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                   
                    focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                  "
            >
              <MapPin size={18} />

              <input
                type="text"
                value={form.dropLocation}
                onChange={(e) =>
                  updateFormField(formIndex, "dropLocation", e.target.value)
                }
                placeholder="Enter drop location"
                className="
                      bg-transparent
                      outline-none
                      w-full
                      text-white
                    "
              />
            </div>
          </div>

          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Finance Required *</label>
            <button
              type="button"
              onClick={() =>
                updateTransportForm(formIndex, {
                  showFinanceDropdown: !form.showFinanceDropdown,
                })
              }
              className="transport-select-control w-full border border-[#2F2F47] rounded-md px-4 py-3 flex justify-between items-center cursor-pointer focus:border-[#3b82f6] transition-all"
            >
              <span className={form.financeRequired === "Yes" ? "text-white" : "text-[#8d8da8]"}>
                {form.financeRequired}
              </span>
              <ChevronDown size={18} />
            </button>

            {form.showFinanceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#2F2F47] rounded-md overflow-hidden z-50">
                {["Yes", "No"].map((value) => (
                  <div
                    key={value}
                    onClick={() =>
                      updateTransportForm(formIndex, {
                        showFinanceDropdown: false,
                        financeRequired: value,
                        advanceAmount: value === "No" ? "" : undefined,
                        advancePurpose: value === "No" ? "" : undefined,
                        advanceToBeReceviedWithin: value === "No" ? "" : undefined,
                        estimatedEventBudget: value === "No" ? "" : undefined,
                      })
                    }
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                      form.financeRequired === value
                        ? "bg-[#492A6F] text-white"
                        : "text-white hover:bg-[#492A6F]"
                    }`}
                  >
                    <span>{value}</span>
                    {form.financeRequired === value && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GUEST COUNT */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>Number of Guests</label>

            <input
              type="number"
              min="0"
              max="10"
              value={form.numberOfGuests}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) > 99) return;
                updateFormField(formIndex, "numberOfGuests", value);
              }}
              placeholder="Enter number of guests"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              className="
                    w-full
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    transition-all
                  "
            />
            {form.guestCountError && (
              <p className="mt-1 text-sm text-red-400">{form.guestCountError}</p>
            )}
          </div>

          {/* GUEST DETAILS */}
          {(form.guests || []).length > 0 && (
            <div className="mt-5 space-y-5">
              {(form.guests || []).map((guest, guestIndex) => (
                <div
                  key={guestIndex}
                  className="bg-[#26264a] border border-[#34345c] rounded-2xl p-5"
                >
                  <h3 className="text-[#b06cff] font-semibold mb-4">
                    Guest {guestIndex + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className={staffFloatingLabelClass}>Guest Name *</label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) =>
                          updateGuestDetail(formIndex, guestIndex, "name", e.target.value)
                        }
                        placeholder="Enter guest name"
                        className="w-full bg-[#26264a] border border-[#2F2F47] rounded-xl px-4 py-4 outline-none text-white focus:border-[#3b82f6] focus:ring-0"
                      />
                    </div>

                    <div className="relative">
                      <label className={staffFloatingLabelClass}>Mobile Number *</label>
                      <input
                        type="tel"
                        value={guest.mobile}
                        onChange={(e) =>
                          updateGuestDetail(
                            formIndex,
                            guestIndex,
                            "mobile",
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                        placeholder="Enter mobile number"
                        className="w-full bg-[#26264a] border border-[#2F2F47] rounded-xl px-4 py-4 outline-none text-white focus:border-[#3b82f6] focus:ring-0"
                      />
                    </div>

                    <div className="relative">
                      <label className={staffFloatingLabelClass}>Organization Name *</label>
                      <input
                        type="text"
                        value={guest.organization}
                        onChange={(e) =>
                          updateGuestDetail(
                            formIndex,
                            guestIndex,
                            "organization",
                            e.target.value,
                          )
                        }
                        placeholder="Enter organization name"
                        className="w-full bg-[#26264a] border border-[#2F2F47] rounded-xl px-4 py-4 outline-none text-white focus:border-[#3b82f6] focus:ring-0"
                      />
                    </div>

                    <div className="relative">
                      <label className={staffFloatingLabelClass}>Gender *</label>
                      <select
                        value={guest.gender}
                        onChange={(e) =>
                          updateGuestDetail(formIndex, guestIndex, "gender", e.target.value)
                        }
                        className="w-full bg-[#26264a] border border-[#2F2F47] rounded-xl px-4 py-4 outline-none text-white focus:border-[#3b82f6] focus:ring-0"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="relative md:col-span-2">
                      <label className={staffFloatingLabelClass}>Designation *</label>
                      <input
                        type="text"
                        value={guest.designation}
                        onChange={(e) =>
                          updateGuestDetail(
                            formIndex,
                            guestIndex,
                            "designation",
                            e.target.value,
                          )
                        }
                        placeholder="Enter designation"
                        className="w-full bg-[#26264a] border border-[#2F2F47] rounded-xl px-4 py-4 outline-none text-white focus:border-[#3b82f6] focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PASSENGERS + VEHICLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div className="relative">
              <label className={formFloatingLabelClass}>
                Total Number of Passengers *
              </label>

              <input
                type="number"
                value={form.totalPassengers}
                onChange={(e) =>
                  updateFormField(formIndex, "totalPassengers", e.target.value)
                }
                placeholder="Enter total passengers"
                className="
                      w-full
                     
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      outline-none
                      focus-within:border-[#3b82f6]
                    focus-within:ring-0
                    focus-within:ring-[#3b82f6]
                    transition-all
                    
                    "
              />
            </div>

            {/* VEHICLE DROPDOWN */}
            <div className="relative">
              <label className={formFloatingLabelClass}>
                Type of Vehicle Needed *
              </label>

              <button
                type="button"
                onClick={() =>
                  updateFormField(
                    formIndex,
                    "showVehicleDropdown",
                    !form.showVehicleDropdown,
                  )
                }
                className="
                      transport-select-control
                      w-full
                     
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      flex
                      justify-between
                      items-center
                      cursor-pointer
                      focus:border-[#3b82f6]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#3b82f6]/20
                      hover:border-[#3b82f6]
                      transition-all
                    "
              >
                <span className="truncate">
                  {(form.selectedVehicles || []).length > 0
                    ? form.selectedVehicles.join(", ")
                    : "Select Vehicle"}
                </span>

                <ChevronDown size={18} />
              </button>

              {form.showVehicleDropdown && (
                <div className="absolute w-full mt-2 bg-[#26264a] border border-[#2F2F47] rounded-md overflow-hidden z-50">
                  {getVehicleOptions(form.totalPassengers).map((option, index) => {
                    const isSelected = (form.selectedVehicles || []).includes(
                      option,
                    );

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          const updatedForms = [...transportForms];

                          const currentVehicles =
                            updatedForms[formIndex].selectedVehicles || [];

                          let updatedVehicles = [];

                          if (isSelected) {
                            updatedVehicles = currentVehicles.filter(
                              (v) => v !== option,
                            );

                            const newVehicleCounts = {
                              ...updatedForms[formIndex].vehicleCounts,
                            };
                            delete newVehicleCounts[option];
                            updatedForms[formIndex].vehicleCounts = newVehicleCounts;
                          } else {
                            updatedVehicles = [...currentVehicles, option];
                          }

                          updatedForms[formIndex].selectedVehicles =
                            updatedVehicles;

                          setTransportForms(updatedForms);

                          const nextForm = {
                            ...updatedForms[formIndex],
                            selectedVehicles: updatedVehicles,
                          };
                          if (nextForm.pickupDateTime && nextForm.dropDateTime) {
                            fetchVehicleInventory(
                              formIndex,
                              nextForm.pickupDateTime,
                              nextForm.dropDateTime,
                            );
                          }
                        }}
                        className={`
                                 px-4
                                 py-3
                                 cursor-pointer
                                 flex
                                 items-center
                                 justify-between
                                 ${
                                   isSelected
                                     ? "bg-[#492A6F] text-white"
                                     : "hover:bg-[#492A6F]"
                                 }
                               `}
                      >
                        <span>{option}</span>

                        {isSelected && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {form.pickupDateTime && form.dropDateTime && (
                <div className="mt-2 text-xs text-gray-400">
                  {form.inventoryLoading ? (
                    <span>Checking available vehicle counts...</span>
                  ) : Object.keys(form.availableVehicleCounts).length > 0 ? (
                    <span>
                      Available counts: {getVehicleOptions(form.totalPassengers)
                        .map((vehicle) => {
                          const raw = form.availableVehicleCounts[vehicle];
                          const displayed = getDisplayedAvailability(formIndex, vehicle);
                          const toShow = displayed === undefined ? (raw !== undefined ? raw : null) : displayed;
                          return toShow !== null && toShow !== undefined
                            ? `${vehicle}: ${toShow}`
                            : null;
                        })
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  ) : (
                    <span>No availability data available for selected dates.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* VEHICLE COUNT */}
          {(form.selectedVehicles || []).length > 0 && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {(form.selectedVehicles || []).map((vehicle, index) => {
                const vehicleCount = (form.selectedVehicles || []).length;
                const isFullWidth =
                  vehicleCount === 1 || (vehicleCount === 3 && index === 2);

                return (
                  <div
                    key={index}
                    className={
                      isFullWidth ? "relative md:col-span-2" : "relative"
                    }
                  >
                    <label className={formFloatingLabelClass}>
                      {getVehicleLabel(vehicle)}
                    </label>

                    <input
                      type="number"
                      value={form.vehicleCounts?.[vehicle] || ""}
                      onChange={(e) => {
                        const updatedForms = [...transportForms];

                        updatedForms[formIndex].vehicleCounts = {
                          ...updatedForms[formIndex].vehicleCounts,
                          [vehicle]: e.target.value,
                        };

                        setTransportForms(updatedForms);
                      }}
                      placeholder={
                        (form.availableVehicleCounts?.[vehicle] !== undefined)
                          ? `${getVehiclePlaceholder(vehicle)} (Available: ${getDisplayedAvailability(formIndex, vehicle)})`
                          : getVehiclePlaceholder(vehicle)
                      }
                      className="
                            w-full
                         
                            border
                            border-[#2F2F47]
                            rounded-md
                            px-4
                            py-3
                            outline-none
                            focus:border-[#3b82f6]
                            focus:ring-0
                            focus:ring-[#3b82f6]
                            transition-all
                          "
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* STAFF COUNT */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>
              Number of Accompanying Staff *
            </label>

            <input
              type="number"
              min="0"
              max="99"
              value={form.staffOptionType}
              onChange={(e) => {
                const value = e.target.value;

                // Reject values greater than 99
                if (Number(value) > 99) {
                  return;
                }

                const updatedForms = [...transportForms];

                updatedForms[formIndex].staffOptionType = value;

                const count = Number(value);

                updatedForms[formIndex].staffDetails = Array.from(
                  {
                    length: count || 0,
                  },
                  (_, index) => ({
                    name:
                      updatedForms[formIndex].staffDetails?.[index]?.name || "",
                    mobile:
                      updatedForms[formIndex].staffDetails?.[index]?.mobile ||
                      "",
                  }),
                );

                setTransportForms(updatedForms);
              }}
              placeholder="Enter staff count"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              className="
                    w-full
                   
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
            />
          </div>

          {/* STAFF DETAILS */}
          {(form.staffDetails || []).length > 0 && (
            <div className="mt-5 space-y-5">
              {(form.staffDetails || []).map((staff, staffIndex) => (
                <div
                  key={staffIndex}
                  className="
                          bg-[#26264a]
                          border
                          border-[#34345c]
                          rounded-2xl
                          p-5
                        "
                >
                  <h3 className="text-[#b06cff] font-semibold mb-4">
                    Staff {staffIndex + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* NAME */}
                    <div className="relative">
                      <label className={staffFloatingLabelClass}>
                        Accompanying Staff Name *
                      </label>

                      <input
                        type="text"
                        value={staff.name}
                        onChange={(e) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="Enter staff name"
                        className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#2F2F47]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                      />
                    </div>

                    {/* MOBILE */}
                    <div className="relative">
                      <label className={staffFloatingLabelClass}>
                        Accompanying Staff Mobile Number *
                      </label>

                      <input
                        type="number"
                        value={staff.mobile}
                        onChange={(e) =>
                          updateStaffDetail(
                            formIndex,
                            staffIndex,
                            "mobile",
                            e.target.value,
                          )
                        }
                        placeholder="Enter mobile number"
                        className="
                                w-full
                                bg-[#26264a]
                                border
                                border-[#2F2F47]
                                rounded-xl
                                px-4
                                py-4
                                outline-none
                                text-white
                                focus:border-[#3b82f6]
                                focus:ring-0
                                focus:ring-[#3b82f6]
                                transition-all
                              "
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="hidden">
            <label className={formFloatingLabelClass}>Finance Required *</label>

            <button
              type="button"
              onClick={() =>
                updateTransportForm(formIndex, {
                  showFinanceDropdown: !form.showFinanceDropdown,
                })
              }
              className="
                transport-select-control
                w-full
                border
                border-[#2F2F47]
                rounded-md
                px-4
                py-3
                flex
                justify-between
                items-center
                cursor-pointer
                focus:border-[#3b82f6]
                transition-all
              "
            >
              <span className={form.financeRequired === "Yes" ? "text-white" : "text-[#8d8da8]"}>
                {form.financeRequired}
              </span>

              <ChevronDown size={18} />
            </button>

            {form.showFinanceDropdown && (
              <div className="absolute w-full mt-2 bg-[#26264a] border border-[#2F2F47] rounded-md overflow-hidden z-50">
                {[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }].map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() =>
                              updateTransportForm(formIndex, {
                        showFinanceDropdown: false,
                        financeRequired: opt.value,
                        advanceAmount: opt.value === "No" ? "" : undefined,
                        advancePurpose: opt.value === "No" ? "" : undefined,
                        advanceToBeReceviedWithin: opt.value === "No" ? "" : undefined,
                        estimatedEventBudget: opt.value === "No" ? "" : undefined,
                      })
                    }
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                      form.financeRequired === opt.value
                        ? "bg-[#492A6F] text-white"
                        : "text-white hover:bg-[#492A6F] hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>

                    {form.financeRequired === opt.value && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {form.financeRequired === "Yes" && (
            <div className="grid grid-cols-1 gap-5 mb-5">
              <div className="relative order-first md:col-span-2">
                <label className={formFloatingLabelClass}>Estimated Budget Amount (Rs.)</label>

                <input
                  type="number"
                  min="0"
                  value={form.estimatedEventBudget}
                  onChange={(e) => updateFormField(formIndex, "estimatedEventBudget", e.target.value)}
                  placeholder="0"
                  className="
                    w-full
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    text-white
                    outline-none
                  "
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className={formFloatingLabelClass}>Advance Amount (Rs.)</label>

                  <input
                    type="number"
                    min="0"
                    value={form.advanceAmount}
                    onChange={(e) => updateFormField(formIndex, "advanceAmount", e.target.value)}
                    placeholder="0"
                    className={`
                      w-full
                      border
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                      ${
                        Number(form.advanceAmount) > Number(form.estimatedEventBudget) &&
                        form.estimatedEventBudget !== ""
                          ? "border-red-500"
                          : "border-[#2F2F47]"
                      }
                    `}
                  />

                  {Number(form.advanceAmount) > Number(form.estimatedEventBudget) &&
                    form.estimatedEventBudget !== "" && (
                      <p className="mt-1 text-sm text-red-400">
                        Advance amount cannot exceed the estimated event budget.
                      </p>
                    )}
                </div>

                <div className="relative">
                  <label className={formFloatingLabelClass}>Purpose of Advance</label>

                  <input
                    type="text"
                    value={form.advancePurpose}
                    onChange={(e) => updateFormField(formIndex, "advancePurpose", e.target.value)}
                    placeholder="Purpose"
                    className="
                      w-full
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                  />
                </div>

                <div className="relative md:col-span-2">
                  <label className={formFloatingLabelClass}>
                    Advance To Be Received Within
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.advanceToBeReceviedWithin}
                    onChange={(e) => updateFormField(formIndex, "advanceToBeReceviedWithin", e.target.value)}
                    placeholder="0"
                    className="
                      w-full
                      border
                      border-[#2F2F47]
                      rounded-md
                      px-4
                      py-3
                      text-white
                      outline-none
                    "
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPECIAL REQUIREMENT */}
          <div className="relative mt-5">
            <label className={formFloatingLabelClass}>
              Special Requirement
            </label>

            <textarea
              rows={4}
              value={form.specialRequirement}
              onChange={(e) =>
                updateFormField(formIndex, "specialRequirement", e.target.value)
              }
              placeholder="Enter any special requirements"
              className="
                    w-full
                   
                    border
                    border-[#2F2F47]
                    rounded-md
                    px-4
                    py-3
                    outline-none
                    resize-none
                    focus:border-[#3b82f6]
                    focus:ring-0
                    focus:ring-[#3b82f6]
                    transition-all
                  "
            />
          </div>
        </div>
      ))}

      {/* ERRORS */}
      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUCCESS */}
      {submitMessage && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-200">
          {submitMessage}
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="
              bg-[#8b5cf6]
              hover:bg-[#7c3aed]
              disabled:opacity-60
              disabled:cursor-not-allowed
              text-white
              font-medium
              px-8
              py-3
              rounded-md
              transition-all
              duration-300
              flex
              items-center
              gap-2
            "
          >
          {isSubmitting ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update Transport Request" : "Submit")}

          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TransportDetailsPage;
