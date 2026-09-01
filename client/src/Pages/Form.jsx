import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventsSidebar from "../Components/EventsSidebar";
import EventRequistionDetails from "../Components/Forms/EventRequistionDetails";
import VenueForm from "../Components/Forms/VenueForm";
import ICTSForm from "../Components/Forms/IctsForm";
import TransportForm from "../Components/Forms/TransportForm";
import ExternalTransportForm, { validateExternalTransport } from "../Components/Forms/ExternalTransportForm";
import FoodAndRefreshments from "../Components/Forms/FoodAndRefreshments";
import AccommodationForm from "../Components/Forms/AccommodationForm";
import Purchase from "../Components/Forms/Purchase";
import MediaForm, { buildMediaFormData } from "../Components/Forms/MediaForm";
import AudioForm from "../Components/Forms/AudioForm";
import { useAuth } from "../Components/AuthContext";
import FormSubmitted from "../Components/Forms/FormSubmitted";
import EventPreviewPage from "./EventPreviewPage";
import { jwtDecode } from "jwt-decode";
import generateAdvanceReceiptPdf from '../utils/generateAdvanceReceiptPdf';
import { getFacultyById } from "../services/events/facultyService";


// ── Empty factories ───────────────────────────────────────────────────────────

const emptyVenueDay = () => ({
  participants: "",
  selectedVenues: [],
  venueCards: [],
});

const emptyPurchaseDay = () => ({
  requirementNeeded: [],
  idCardQty: "",
  certificateQty: "",
  selectedPersons: "",
  studentData: {
    giftType: [], registrationKitNeeded: "", trophyType: [],
    basicTrophyQty: "", eliteTrophyQty: "", cashPrizeAmount: "",
    voucherWorth: "", registrationKitQty: "", specialRequirements: "",
  },
  guestData: {
    giftType: [], registrationKitNeeded: "", trophyType: [],
    basicTrophyQty: "", eliteTrophyQty: "", cashPrizeAmount: "",
    voucherWorth: "", registrationKitQty: "", specialRequirements: "",
  },
});

const emptyMediaDay = () => ({
  designType: "",
  poster: {
    contentPoster: "", referencePoster: null,
    contentCertificate: "", referenceCertificate: null,
    contentTrophy: "", displayNeeded: [],
    sizeForFlex: "", sizeForGlass: "",
    deliveryDate: "", priority: "", specialReq: "",
  },
  video: {
    contentVideo: "", preEvent: [], eventCoverage: [],
    postEvent: [], specialVideos: [], referenceVideo: null,
    deliveryDate: "", priority: "", specialReq: "",
  },
});

const emptyFoodDay = () => ({
  id: crypto.randomUUID(),
  date: null, resourcePersonType: [], resourcePersons: "",
  internalCount: "", staffName: "", mobileNumber: "",
  foodTypes: [], specialRequirements: "",
  morningRefreshmentCount: "", eveningRefreshmentCount: "",
  breakfast: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
  lunch:     { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
  dinner:    { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
});

const emptyExternalTransport = () => ({
  id: crypto.randomUUID(),
  travelOption: "",
  travelDate: "",
  from: "",
  to: "",
  totalPassengers: "",
  classOrBerth: [],
  trainNumber: "",
  flightNumber: "",
  specialRequirements: "None",
  passengers: [],
});

const defaultAccommodation = {
  checkIn: null, checkOut: null, singleRooms: "", doubleRooms: "",
  suiteRooms: "", dBlockRooms: "", roomType: "", dine: "", dineType: "",
  hostelGuests: "1", amenityGuests: "1", guests: [], special: "",
};

const defaultAudio = {};

const defaultTransport = () => ({
  pickupDate: null, dropDate: null, pickupLocation: "", dropLocation: "",
  vistaTransport: [], staffCount: "", totalPassengers: "", busCount: "",
  accompanyingStaffName: "", accompanyingStaffMobile: "",
  specialRequirements: "", checkpoints: [],
});

const ensureLength = (items, length, factory) => {
  if (items.length === length) return items;
  const result = items.slice(0, length);
  while (result.length < length) result.push(factory());
  return result;
};

const ensureAtLeastLength = (items, length, factory) => {
  const result = [...items];
  while (result.length < length) result.push(factory());
  return result;
};

// ── Validators ────────────────────────────────────────────────────────────────

const validateEventRequisition = (data) => {
  const errors = {};
  // if (!data.doc) errors.doc = "This field is required";
  // if (data.doc === "Yes" && !data.file) errors.file = "Please upload the previous event documentation";
  // if (data.doc === "No" && !data.reason?.trim()) errors.reason = "Reason is required";
  if (!data.budget) errors.budget = "This field is required";
  if (!data.finance) errors.finance = "This field is required";
  if (!data.department?.trim()) errors.department = "Department name is required";
  if (data.numOrganizers === "" || parseInt(data.numOrganizers) < 0)
    errors.numOrganizers = "Enter a valid number of organizers";
  const toStr = (v) => (v === null || v === undefined ? "" : String(v));
  const organizerErrors = (data.organizers || []).map((org) => {
    const err = {};
    if (!org.name?.trim()) err.name = "Name is required";
    if (!org.department) err.department = "Department is required";
    const mobile = toStr(org.mobile).trim();
    if (!mobile) err.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(mobile)) err.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!org.designation?.trim()) err.designation = "Designation is required";
    if (!org.empId?.trim()) err.empId = "Employee ID is required";
    return err;
  });
  if (organizerErrors.some((o) => Object.keys(o).length > 0)) errors.organizers = organizerErrors;
  if (!data.eventData?.eventName?.trim()) errors.eventName = "Event name is required";
  if (!data.eventData?.eventType) errors.eventType = "Event type is required";
  if (data.eventData?.eventType === "Other" && !data.eventData?.eventTypeOther?.trim()) errors.eventTypeOther = "Please specify the event type";
  const societyArr = Array.isArray(data.eventData?.society) ? data.eventData.society : data.eventData?.society ? [data.eventData.society] : [];
  if (societyArr.length === 0) errors.society = "Society is required";
  if (societyArr.includes("Other") && !data.eventData?.societyOther?.trim()) errors.societyOther = "Please specify the society";
  const logosArr = Array.isArray(data.eventData?.logos) ? data.eventData.logos : data.eventData?.logos ? [data.eventData.logos] : [];
  if (logosArr.length === 0) errors.logos = "Logos selection is required";
  if (logosArr.includes("Other") && !data.eventData?.logosOther?.trim()) errors.logosOther = "Please specify the logos";
  const audienceArr = Array.isArray(data.eventData?.audience) ? data.eventData.audience : data.eventData?.audience ? [data.eventData.audience] : [];
  if (audienceArr.length === 0) errors.audience = "Target audience is required";
  if (!data.eventDays || !data.eventDays.length) errors.eventDays = "At least one event day is required";
  const dayErrors = (data.eventDays || []).map((day, idx) => {
    const e = {};
    if (!day.date) e.date = `Day ${idx + 1} date is required`;
    if (!day.startTime) e.startTime = `Start time is required`;
    if (!day.endTime) e.endTime = `End time is required`;
    if (day.startTime && day.endTime && day.endTime <= day.startTime) e.endTime = "End time must be after start time";
    if (day.numGuests === undefined || day.numGuests === null || day.numGuests === "" || parseInt(day.numGuests) < 0) e.numGuests = "Please enter a valid number of guests (0 or more)";
    const guestErrors = Array.from({ length: parseInt(day.numGuests) || 0 }, (_, i) => {
      const guest = (day.guests || [])[i] || {};
      const ge = {};
      if (!guest.name?.trim()) ge.name = "Guest name is required";
      if (!guest.designation?.trim()) ge.designation = "Designation is required";
      if (!guest.organization?.trim()) ge.organization = "Organization is required";
      return ge;
    });
    if (guestErrors.some((ge) => Object.keys(ge).length > 0)) e.guests = guestErrors;
    return e;
  });
  if (dayErrors.some((de) => Object.keys(de).length > 0)) errors.days = dayErrors;
  const reqKeys = ["venue", "icts", "audio", "transport", "foodandrefreshments", "accommodation", "purchase", "media"];
  if (!data.requirements || reqKeys.some(k => !data.requirements[k])) {
    errors.requirements = "Please select Yes or No for all 8 event requirements";
  }
  return errors;
};

const buildEventRequisitionPayload = ({ eventRequisition, user, existingOrganizerId }) => {
let token = localStorage.getItem("token");
let decodedToken = jwtDecode(token);

  // console.log("user log :",user);
  
  const fd = new FormData();
  const organizerId = decodedToken?.facultyId || existingOrganizerId || decodedToken?.id || decodedToken?._id || user?._id;
  fd.append("organizerId", organizerId);
  const requestDetails = {
    organizerDetails: {
      previousEventDocumentation: eventRequisition.doc === "Yes" ? true : eventRequisition.doc === "No" ? false : null,
      previousEventReason: eventRequisition.doc === "No" ? eventRequisition.reason : "",
      isBudgetApproved: eventRequisition.budget === "Yes",
      financeRequired: eventRequisition.finance === "Yes",
      estimatedBudget: Number(eventRequisition.estimatedBudget) || 0,
      advanceAmount: Number(eventRequisition.advanceAmount) || 0,
      purposeOfAdvance: eventRequisition.purposeOfAdvance || "",
      advanceToBeReceviedWithin: Number(eventRequisition.advanceToBeReceivedWithin) || 0,
      ExpectedEventOutcome: eventRequisition.expectedEventOutcome || "",
      organizingDepartment: eventRequisition.department,
      organizerCount: parseInt(eventRequisition.numOrganizers) || 0,
      organizers: (eventRequisition.organizers || []).map((o) => ({
        name: o.name || "", department: o.department || "",
        mobile: parseInt(o.mobile) || 0, designation: o.designation || "",
        email: o.empEmail || "", empId: o.empId || "", facultyId: user?._id ?? "",
      })),
    },
    eventDetails: {
      eventName: eventRequisition.eventData.eventName || "",
      iic: eventRequisition.eventData.iic === "Yes" || eventRequisition.eventData.iic === true || false,
      involvedIIC: eventRequisition.eventData.iic === "Yes" || eventRequisition.eventData.iic === true,
      eventType: eventRequisition.eventData.eventType || "",
      eventTypeOther: eventRequisition.eventData.eventTypeOther || "",
      professionalSociety: Array.isArray(eventRequisition.eventData.society)
        ? eventRequisition.eventData.society
        : eventRequisition.eventData.society
        ? [eventRequisition.eventData.society]
        : [],
      professionalSocietyOther: eventRequisition.eventData.societyOther || "",
      logosInPoster: Array.isArray(eventRequisition.eventData.logos)
        ? eventRequisition.eventData.logos
        : eventRequisition.eventData.logos
        ? [eventRequisition.eventData.logos]
        : [],
      logosOther: eventRequisition.eventData.logosOther || "",
      targetAudience: eventRequisition.eventData.audience || "",
      numberOfDays: eventRequisition.eventDays.length,
      eventSchedule: (eventRequisition.eventDays || []).map((day) => ({
        eventDate: day.date ? new Date(day.date).toISOString() : "",
        startTime: day.startTime || "", endTime: day.endTime || "",
        totalGuests: parseInt(day.numGuests) || 0,
        guests: (day.guests || []).map((g) => ({
          name: g.name || "", organization: g.organization || "",
          designation: g.designation || "", mobile: parseInt(g.mobile) || 0,
          gender: g.gender || "",
        })),
      })),
    },
    requirementDetails: {
      venueRequired: eventRequisition.requirements?.venue === "Yes",
      audioRequired: eventRequisition.requirements?.audio === "Yes",
      ictsRequired: eventRequisition.requirements?.icts === "Yes",
      transportRequired: eventRequisition.requirements?.transport === "Yes",
      externalTransportRequired: eventRequisition.requirements?.externalTransport === "Yes",
      refreshmentRequired: eventRequisition.requirements?.foodandrefreshments === "Yes",
      accommodationRequired: eventRequisition.requirements?.accommodation === "Yes",
      purchaseRequired: eventRequisition.requirements?.purchase === "Yes",
      mediaRequired: eventRequisition.requirements?.media === "Yes",
    },
  };
  fd.append("requestDetails", JSON.stringify(requestDetails));
  if (eventRequisition.doc === "Yes" && eventRequisition.file) {
    fd.append("previousEventDocumentation", eventRequisition.file);
  }
  if (eventRequisition.principalApprovalDocument) {
    if (eventRequisition.principalApprovalDocument instanceof File || eventRequisition.principalApprovalDocument instanceof Blob) {
      fd.append(
          "principalApprovalDocument",
          eventRequisition.principalApprovalDocument
      );
    }
  }
  return fd;
};

const validateVenueData = (venueData) => {
  const dayErrors = venueData.map((day) => {
    const err = {};
    if (!day.participants || parseInt(day.participants) < 1) err.participants = "Total number of participants is required";
    if (!day.selectedVenues || day.selectedVenues.length === 0) err.selectedVenues = "Please select at least one venue";
    const cardErrors = (day.venueCards || []).map((card) => {
      const e = {};
      if (!card.participants || parseInt(card.participants) < 1) e.participants = "Number of participants is required";
      if (!card.seatingCapacity || parseInt(card.seatingCapacity) < 1) e.seatingCapacity = "Seating capacity is required";
      if (!card.hallReqs || card.hallReqs.length === 0) e.hallReqs = "Select at least one hall requirement";
      if (card.hallReqs?.includes("Guest Chair") && (!card.guestChairs || parseInt(card.guestChairs) < 1)) e.guestChairs = "Number of guest chairs is required";
      if (card.hallReqs?.includes("Water Bottles") && (!card.waterBottles || parseInt(card.waterBottles) < 1)) e.waterBottles = "Number of water bottles is required";
      if (card.hallReqs?.includes("Dias Table") && (!card.diasTable || parseInt(card.diasTable) < 1)) e.diasTable = "Number of dias tables is required";
      if (card.hallReqs?.includes("Audience Chair") && (!card.audienceChair || parseInt(card.audienceChair) < 1)) e.audienceChair = "Number of audience chairs is required";
      if (!card.specialReqs?.trim()) e.specialReqs = "Special requirements field is required";
      return e;
    });
    if (cardErrors.some((ce) => Object.keys(ce).length > 0)) err.venueCards = cardErrors;
    return err;
  });
  if (dayErrors.some((d) => Object.keys(d).length > 0)) return dayErrors;
  return {};
};

const buildVenuePayload = (venueData) => {
  const venues = [];
  venueData.forEach((day, dayIndex) => {
    (day.venueCards || []).forEach((card) => {
      const hallRequirements = [];
      if (card.hallReqs?.includes("Guest Chair") && card.guestChairs) hallRequirements.push({ type: "Guest Chair", quantity: parseInt(card.guestChairs) });
      if (card.hallReqs?.includes("Water Bottles") && card.waterBottles) hallRequirements.push({ type: "Water Bottles", quantity: parseInt(card.waterBottles) });
      if (card.hallReqs?.includes("Dias Table") && card.diasTable) hallRequirements.push({ type: "Dias Table", quantity: parseInt(card.diasTable) });
      if (card.hallReqs?.includes("Audience Chair") && card.audienceChair) hallRequirements.push({ type: "Audience Chair", quantity: parseInt(card.audienceChair) });
      venues.push({
        dayIndex, venueName: card.venueName || "",
        numberOfParticipants: parseInt(card.participants) || 0,
        seatingCapacity: parseInt(card.seatingCapacity) || 0,
        hallRequirements, specialRequirements: card.specialReqs || "",
      });
    });
  });
  return { venues };
};

function getIctsDepartmentFromStorage() {
  try {
    const dept = localStorage.getItem("department");
    if (dept) return dept.toLowerCase().trim();
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      return (user?.department || "").toLowerCase().trim();
    }
  } catch {
    // ignore
  }
  return "";
}
const isIctsPlacementDept = () => getIctsDepartmentFromStorage() === "placement";

const validateIctsData = (ictsData, venueData) => {
  const showProctoring = isIctsPlacementDept();
  const errors = {};
  Object.entries(ictsData).forEach(([dayIndex, venues]) => {
    const dayErrors = {};
    const selectedVenues = venueData[Number(dayIndex)]?.selectedVenues || [];
    selectedVenues.forEach((venueName) => {
      const card = venues?.[venueName] || {};
      const cardErrors = {};

      if (!card.laptopTypes || card.laptopTypes.length === 0)
        cardErrors.laptopTypes = "Select at least one laptop type";
      if (!card.internetFacility)
        cardErrors.internetFacility = "This field is required";
      if (
        card.expectedInternetUsers === "" ||
        card.expectedInternetUsers === undefined ||
        card.expectedInternetUsers === null
      ) {
        cardErrors.expectedInternetUsers = "This field is required";
      }
      if (
        showProctoring &&
        (card.proctorUsers === "" || card.proctorUsers === undefined || card.proctorUsers === null)
      ) {
        cardErrors.proctorUsers = "This field is required";
      }
      if (
        card.guestWifi === "Yes" &&
        card.guestWifiExceed5 === "Yes" &&
        (card.totalGuestCount === "" || card.totalGuestCount === undefined || card.totalGuestCount === null)
      ) {
        cardErrors.totalGuestCount = "This field is required";
      }
      if (!card.requirements || card.requirements.length === 0)
        cardErrors.requirements = "Select at least one requirement";

      if (Object.keys(cardErrors).length > 0) dayErrors[venueName] = cardErrors;
    });
    if (Object.keys(dayErrors).length > 0) errors[dayIndex] = dayErrors;
  });
  return errors;
};

const buildIctsPayload = (ictsData) => {
  const ictses = [];
  Object.entries(ictsData).forEach(([dayIndexStr, venues]) => {
    const dayIndex = parseInt(dayIndexStr);
    Object.entries(venues || {}).forEach(([venueName, card]) => {
      const laptopSpec = (card.laptopTypes || []).map((type) => ({
        type,
        count:
          type === "Windows"
            ? parseInt(card.windowsCount) || 0
            : type === "Mac"
            ? parseInt(card.macCount) || 0
            : 0,
      }));

      ictses.push({
        dayIndex,
        venueName,
        laptopSpec,
        internetFacility:      card.internetFacility || "",
        expectedInternetUsers: parseInt(card.expectedInternetUsers) || 0,
        proctoringUsers:       parseInt(card.proctorUsers) || 0,
        guestWifiNeeded:       card.guestWifi === "Yes",
        guestWifiExceed5:      card.guestWifiExceed5 === "Yes",
        totalGuestCount:       parseInt(card.totalGuestCount) || 0,
        requirements:          card.requirements || [],
        otherRequirements:     card.others || "",
        specialRequirements:   card.specialRequirements || "",
      });
    });
  });
  return { ictses };
};

const validatePurchaseData = (purchaseData) => {
  const errors = purchaseData.map((day) => {
    const err = {};
    if (!day.requirementNeeded || day.requirementNeeded.length === 0) err.requirementNeeded = "Select at least one requirement";
    if (day.requirementNeeded?.includes("Id Card") && !day.idCardQty?.trim()) err.idCardQty = "ID Card quantity is required";
    if (day.requirementNeeded?.includes("Certificate") && !day.certificateQty?.trim()) err.certificateQty = "Certificate quantity is required";
    if (!day.selectedPersons) err.selectedPersons = "Please select required persons";
    if (day.selectedPersons === "Students" || day.selectedPersons === "Both") {
      const se = {};
      if (!day.studentData?.giftType || day.studentData.giftType.length === 0) se.giftType = "Gift type is required";
      if (!day.studentData?.registrationKitNeeded) se.registrationKitNeeded = "This field is required";
      if (day.studentData?.giftType?.includes("Trophy") && (!day.studentData?.trophyType || day.studentData.trophyType.length === 0)) se.trophyType = "Trophy type is required";
      if (day.studentData?.giftType?.includes("Trophy") && day.studentData?.trophyType?.includes("Basic") && !day.studentData.basicTrophyQty?.trim()) se.basicTrophyQty = "Basic trophy quantity is required";
      if (day.studentData?.giftType?.includes("Trophy") && day.studentData?.trophyType?.includes("Elite") && !day.studentData.eliteTrophyQty?.trim()) se.eliteTrophyQty = "Elite trophy quantity is required";
      if (day.studentData?.giftType?.includes("Cash Prize") && !day.studentData.cashPrizeAmount?.trim()) se.cashPrizeAmount = "Cash prize amount is required";
      if (day.studentData?.giftType?.includes("Voucher") && !day.studentData.voucherWorth) se.voucherWorth = "Voucher worth is required";
      if (day.studentData?.registrationKitNeeded === "Yes" && !day.studentData.registrationKitQty?.trim()) se.registrationKitQty = "Registration kit quantity is required";
      if (Object.keys(se).length > 0) err.studentData = se;
    }
    if (day.selectedPersons === "Guest" || day.selectedPersons === "Both") {
      const ge = {};
      if (!day.guestData?.giftType || day.guestData.giftType.length === 0) ge.giftType = "Gift type is required";
      if (!day.guestData?.registrationKitNeeded) ge.registrationKitNeeded = "This field is required";
      if (day.guestData?.giftType?.includes("Trophy") && (!day.guestData?.trophyType || day.guestData.trophyType.length === 0)) ge.trophyType = "Trophy type is required";
      if (day.guestData?.giftType?.includes("Trophy") && day.guestData?.trophyType?.includes("Basic") && !day.guestData.basicTrophyQty?.trim()) ge.basicTrophyQty = "Basic trophy quantity is required";
      if (day.guestData?.giftType?.includes("Trophy") && day.guestData?.trophyType?.includes("Elite") && !day.guestData.eliteTrophyQty?.trim()) ge.eliteTrophyQty = "Elite trophy quantity is required";
      if (day.guestData?.giftType?.includes("Cash Prize") && !day.guestData.cashPrizeAmount?.trim()) ge.cashPrizeAmount = "Cash prize amount is required";
      if (day.guestData?.giftType?.includes("Voucher") && !day.guestData.voucherWorth) ge.voucherWorth = "Voucher worth is required";
      if (day.guestData?.registrationKitNeeded === "Yes" && !day.guestData.registrationKitQty?.trim()) ge.registrationKitQty = "Registration kit quantity is required";
      if (Object.keys(ge).length > 0) err.guestData = ge;
    }
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
};

function buildStudentGiftItems(personData = {}) {
  const giftItems = [];

  if (personData.giftType?.includes("Trophy")) {
    const trophy = [];
    if (personData.trophyType?.includes("Basic"))
      trophy.push({ trophyType: "Basic", quantity: parseInt(personData.basicTrophyQty) || 0 });
    if (personData.trophyType?.includes("Elite"))
      trophy.push({ trophyType: "Elite", quantity: parseInt(personData.eliteTrophyQty) || 0 });
    giftItems.push({ giftType: "Trophy", trophy, cashPrizeAmount: 0, voucher: [] });
  }

  if (personData.giftType?.includes("Cash Prize")) {
    giftItems.push({
      giftType: "Cash Prize",
      trophy: [],
      cashPrizeAmount: parseInt(personData.cashPrizeAmount) || 0,
      voucher: [],
    });
  }

  if (personData.giftType?.includes("Voucher")) {
    const selectedWorths = Array.isArray(personData.voucherWorth)
      ? personData.voucherWorth
      : (personData.voucherWorth ? [personData.voucherWorth] : []);
    const worthQty = personData.voucherWorthQty || {};
    const voucher = selectedWorths.map((w) => ({
      voucherWorth: w,
      quantity: parseInt(worthQty[w]) || 0,
    }));
    giftItems.push({ giftType: "Voucher", trophy: [], cashPrizeAmount: 0, voucher });
  }

  return giftItems;
}

function buildGuestGiftItems(personData = {}) {
  const giftItems = [];

  if (personData.giftType?.includes("Trophy")) {
    const trophy = [];
    if (personData.trophyType?.includes("Basic"))
      trophy.push({ trophyType: "Basic", quantity: parseInt(personData.basicTrophyQty) || 0 });
    if (personData.trophyType?.includes("Elite"))
      trophy.push({ trophyType: "Elite", quantity: parseInt(personData.eliteTrophyQty) || 0 });
    giftItems.push({ giftType: "Trophy", trophy, giftsQty: 0, voucher: [] });
  }

  if (personData.giftType?.includes("Gifts")) {
    giftItems.push({
      giftType: "Gifts",
      trophy: [],
      giftsQty: parseInt(personData.giftsQty ?? personData.glassCupQty) || 0,
      voucher: [],
    });
  }

  if (personData.giftType?.includes("Voucher")) {
    const selectedWorths = Array.isArray(personData.voucherWorth)
      ? personData.voucherWorth
      : (personData.voucherWorth ? [personData.voucherWorth] : []);
    const worthQty = personData.voucherWorthQty || {};
    const voucher = selectedWorths.map((w) => ({
      voucherWorth: w,
      quantity: parseInt(worthQty[w]) || 0,
    }));
    giftItems.push({ giftType: "Voucher", trophy: [], giftsQty: 0, voucher });
  }

  return giftItems;
}

const buildPurchasePayload = (purchaseData) => {
  const purchases = purchaseData.map((day, dayIndex) => {
    const requirementNeeded = [];
    if (day.requirementNeeded?.includes("Id Card"))
      requirementNeeded.push({ type: "Id Card", hardCount: parseInt(day.idCardQty) || 0, softCount: 0 });
    if (day.requirementNeeded?.includes("Certificate"))
      requirementNeeded.push({ type: "Certificate", hardCount: parseInt(day.certificateQty) || 0, softCount: 0 });

    const requiredFor = [];
    if (day.selectedPersons === "Students" || day.selectedPersons === "Both") requiredFor.push("Students");
    if (day.selectedPersons === "Guest"    || day.selectedPersons === "Both") requiredFor.push("Guest");

    return {
      dayIndex,
      requirementNeeded,
      requiredFor,
      students: {
        giftItems: buildStudentGiftItems(day.studentData),
        registrationKitNeeded: day.studentData?.registrationKitNeeded === "Yes",
        registrationKitQty: parseInt(day.studentData?.registrationKitQty) || 0,
        specialRequirements: day.studentData?.specialRequirements || "",
      },
      guests: {
        giftItems: buildGuestGiftItems(day.guestData),
        registrationKitNeeded: day.guestData?.registrationKitNeeded === "Yes",
        registrationKitQty: parseInt(day.guestData?.registrationKitQty) || 0,
        specialRequirements: day.guestData?.specialRequirements || "",
      },
    };
  });

  return { purchases };
};

const validateMediaData = (mediaData) => {
  const errors = mediaData.map((day) => {
    const err = {};
    if (!day.designType) err.designType = "Please select a design type";
    if (day.designType === "Poster" || day.designType === "Both") {
      const pe = {};
      if (!day.poster?.contentPoster?.trim()) pe.contentPoster = "Content for poster is required";
      if (!day.poster?.contentCertificate?.trim()) pe.contentCertificate = "Content for certificate is required";
      if (!day.poster?.contentTrophy?.trim()) pe.contentTrophy = "Content for trophy is required";
      if (!day.poster?.displayNeeded || day.poster.displayNeeded.length === 0) pe.displayNeeded = "Select at least one display option";
      if (day.poster?.displayNeeded?.includes("Flex") && !day.poster?.sizeForFlex?.trim()) pe.sizeForFlex = "Size for Flex is required";
      if (day.poster?.displayNeeded?.includes("Glass Sticker") && !day.poster?.sizeForGlass?.trim()) pe.sizeForGlass = "Size for Glass Sticker is required";
      if (!day.poster?.deliveryDate) pe.deliveryDate = "Delivery date is required";
      if (!day.poster?.priority) pe.priority = "Priority is required";
      if (Object.keys(pe).length > 0) err.poster = pe;
    }
    if (day.designType === "Video" || day.designType === "Both") {
      const ve = {};
      if (!day.video?.contentVideo?.trim()) ve.contentVideo = "Content for video is required";
      if (!day.video?.preEvent || day.video.preEvent.length === 0) ve.preEvent = "Select at least one option";
      if (!day.video?.eventCoverage || day.video.eventCoverage.length === 0) ve.eventCoverage = "Select at least one option";
      if (!day.video?.postEvent || day.video.postEvent.length === 0) ve.postEvent = "Select at least one option";
      if (!day.video?.specialVideos || day.video.specialVideos.length === 0) ve.specialVideos = "Select at least one option";
      if (!day.video?.deliveryDate) ve.deliveryDate = "Delivery date is required";
      if (!day.video?.priority) ve.priority = "Priority is required";
      if (Object.keys(ve).length > 0) err.video = ve;
    }
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
};

const toIsoDate = (dStr) => {
  if (!dStr) return "";
  try {
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? dStr : d.toISOString();
  } catch {
    return dStr;
  }
};

const getArrayValue = (arr1, arr2) => {
  if (Array.isArray(arr1) && arr1.length > 0) return arr1;
  if (Array.isArray(arr2) && arr2.length > 0) return arr2;
  return Array.isArray(arr1) ? arr1 : Array.isArray(arr2) ? arr2 : [];
};

const buildMediaPayload = (mediaData) => {
  const mediaRequirements = mediaData.map((day, dayIndex) => {
    const typeOfMedia = [];
    if (day.designType === "Poster" || day.designType === "Both") typeOfMedia.push("poster");
    if (day.designType === "Video"  || day.designType === "Both") typeOfMedia.push("video");

    const sizes = [];
    const flexVal  = day.poster?.sizeForFlex?.trim();
    const glassVal = day.poster?.sizeForGlass?.trim();
    if (day.poster?.displayNeeded?.includes("Flex") && flexVal) {
      sizes.push({ type: "Flex", value: flexVal });
    }
    if (day.poster?.displayNeeded?.includes("Glass Sticker") && glassVal) {
      sizes.push({ type: "Glass Sticker", value: glassVal });
    }

    const extractNonFileMeta = (files1, files2) => {
      const list = getArrayValue(files1, files2);
      return list.filter((f) => !(f instanceof File));
    };

    return {
      dayIndex,
      typeOfMedia,
      poster: {
        posterContent:             day.poster?.contentPoster || day.poster?.posterContent || "",
        referencePosterFiles:      extractNonFileMeta(day.poster?.referencePoster, day.poster?.referencePosterFiles ?? day.referencePosterFiles),
        certificateContent:        day.poster?.contentCertificate || day.poster?.certificateContent || "",
        referenceCertificateFiles: extractNonFileMeta(day.poster?.referenceCertificate, day.poster?.referenceCertificateFiles ?? day.referenceCertificateFiles),
        trophyContent:             day.poster?.contentTrophy || day.poster?.trophyContent || "",
        displayNeeded:             day.poster?.displayNeeded || [],
        sizes,
        deliveryDate:        toIsoDate(day.poster?.deliveryDate),
        priority:            day.poster?.priority    || "",
        specialRequirements: day.poster?.specialReq || day.poster?.specialRequirements || "",
      },
      video: {
        videoContent:        day.video?.contentVideo || day.video?.videoContent || "",
        preEventVideos:      getArrayValue(day.video?.preEvent, day.video?.preEventVideos),
        eventCoverage:       day.video?.eventCoverage || [],
        postEventVideos:     getArrayValue(day.video?.postEvent, day.video?.postEventVideos),
        specialVideos:       day.video?.specialVideos || [],
        referenceFiles:      extractNonFileMeta(day.video?.referenceVideo, day.video?.referenceFiles ?? day.referenceFiles),
        deliveryDate:        toIsoDate(day.video?.deliveryDate),
        priority:            day.video?.priority   || "",
        specialRequirements: day.video?.specialReq || day.video?.specialRequirements || "",
      },
    };
  });
  return { mediaRequirementDetails: { mediaRequirements } };
};

const validateAudioData = (_audioData) => { return {}; };

const validateTransportData = (transportData) => {
  if (!Array.isArray(transportData) || transportData.length === 0) return { transport: "Enter transport information" };
  const errors = transportData.map((form) => {
    const err = {};
    if (!form.pickupDate) err.pickupDate = "Pickup date is required";
    if (!form.dropDate) err.dropDate = "Drop date is required";
    if (!form.pickupLocation?.trim()) err.pickupLocation = "Pickup location is required";
    if (!form.dropLocation?.trim()) err.dropLocation = "Drop location is required";
    if (!form.vistaTransport || form.vistaTransport.length === 0) err.vistaTransport = "Transport type is required";
    
    if (form.vistaTransport && form.vistaTransport.length > 0) {
      form.vistaTransport.forEach(type => {
        if (type.toLowerCase().includes("car")) {
          const count = Number(form.vehicleCounts?.[type]) || 0;
          const passengers = Number(form.totalPassengers) || 0;
          if (count > passengers && passengers > 0) {
            err.vistaTransport = "Vehicle count exceeds allowed limit based on total passengers.";
          }
        }
      });
    }

    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
};

const validateFoodData = (foodData) => {
  if (!Array.isArray(foodData) || foodData.length === 0) return { food: "Enter food details" };
  const errors = foodData.map((form) => {
    const err = {};
    if (!form.date) err.date = "Date is required";
    if (!form.resourcePersonType || form.resourcePersonType.length === 0) err.resourcePersonType = "Resource type is required";
    if (!form.resourcePersons?.trim()) err.resourcePersons = "Resource count is required";
    if (!form.internalCount?.trim()) err.internalCount = "Internal accompanying count is required";
    if (!form.staffName?.trim()) err.staffName = "Staff name is required";
    if (!form.mobileNumber?.trim()) err.mobileNumber = "Staff mobile is required";
    if (!form.foodTypes || form.foodTypes.length === 0) err.foodTypes = "Food type is required";
    return err;
  });
  if (errors.some((e) => Object.keys(e).length > 0)) return errors;
  return {};
};

const validateAccommodationData = (accommodationData) => {
  const blocks = accommodationData?.accommodations || [];
  return blocks.map((acc) => {
    const errors = {};
    if (!acc.checkIn) errors.checkIn = "Check-in date is required";
    if (!acc.checkOut) errors.checkOut = "Check-out date is required";
    if (acc.accommodationNeeded === "Yes" && (!acc.roomSelections || acc.roomSelections.length === 0)) {
      errors.roomSelections = "Select at least one room";
    }
    return errors;
  });
};

// in Form.jsx, near the other buildXPayload helpers

const flattenGuestsForAccommodation = (eventDays = []) => {
  const seen = new Set();
  const result = [];
  eventDays.forEach((day, dayIdx) => {
    (day.guests || []).forEach((g, gIdx) => {
      const guestId = `day${dayIdx}_g${gIdx}_${(g.name || "").replace(/\s+/g, "").toLowerCase()}`;
      if (!seen.has(guestId)) {
        seen.add(guestId);
        result.push({ ...g, guestId });
      }
    });
  });
  return result;
};

const formatAccommodationDateTime = (date) => {
  if (!date) return "";
  const value = new Date(date);
  const pad = (part) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:00.000Z`;
};

const buildAccommodationPayload = (accommodationState, eventDays) => {
  const allGuests = flattenGuestsForAccommodation(eventDays);
  const accommodations = (accommodationState?.accommodations || []).map((acc) => {
    const selectedGuests = allGuests.filter((g) =>
      (acc.selectedGuestIds || []).includes(g.guestId)
    );

    const roomSelections = acc.accommodationNeeded === "Yes" ? (acc.roomSelections || []).map((room) => ({
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      venue: room.venue,
      occupantCount: Number(room.occupantCount) || 0,
      requiresAdminConfirmation: room.requiresAdminConfirmation === true,
      adminContacted: room.adminContacted === true,
    })) : [];

    const dineInCounts = [];
    if (acc.dine === "Yes") {
      if (acc.dineTypes?.includes("Hostel") && parseInt(acc.hostelGuests) > 0)
        dineInCounts.push({ type: "Hostel", count: parseInt(acc.hostelGuests) });
      if (acc.dineTypes?.includes("Amenity") && parseInt(acc.amenityGuests) > 0)
        dineInCounts.push({ type: "Amenity", count: parseInt(acc.amenityGuests) });
    }

    return {
      checkInDateTime: formatAccommodationDateTime(acc.checkIn),
      checkOutDateTime: formatAccommodationDateTime(acc.checkOut),
      guests: selectedGuests.map((g) => ({
        name: g.name || "", mobile: parseInt(g.mobile) || 0, gender: g.gender || "",
      })),
      roomSelections,
      dineInRequired: acc.dine === "Yes",
      dineInCounts,
      specialRequirements: acc.special || "",
    };
  });
  return { accommodations };
};

const formatExternalTransportPayload = (externalTransportData) => {
  if (!Array.isArray(externalTransportData)) return [];
  return externalTransportData.map((item) => {
    const classOrBerthStr = Array.isArray(item.classOrBerth)
      ? item.classOrBerth
          .map((c) => {
            const m = String(c).match(/\(([^)]+)\)/);
            return m ? m[1] : String(c).trim();
          })
          .filter(Boolean)
          .join(", ")
      : (item.classOrBerth || (item.travelOption === "Flight" ? "Economy" : ""));

    return {
      travelOption: item.travelOption || "",
      travelDate: item.travelDate ? new Date(item.travelDate).toISOString() : "",
      from: item.from || "",
      to: item.to || "",
      totalPassengers: Number(item.totalPassengers) || 0,
      classOrBerth: classOrBerthStr,
      trainNumber: item.travelOption === "Train" ? (item.trainNumber || "") : "",
      flightNumber: item.travelOption === "Flight" ? (item.flightNumber || "") : "",
      specialRequirements: item.specialRequirements?.trim() || "None",
      passengers: (item.passengers || []).map((p) => ({
        name: p.name || "",
        phone: String(p.phone || "").trim(),
        email: p.email || "",
        age: Number(p.age) || 0,
        gender: p.gender || "",
        designation: p.designation || "",
        organization: p.organization || "",
      })),
    };
  });
};

const buildPayloadForSection = (sectionKey, data, eventDays = []) => {
  switch (sectionKey) {
    case "venue":               return { venueDetails: buildVenuePayload(data) };
    case "icts":                return { ictsDetails: buildIctsPayload(data) };
    case "purchase":            return { purchaseDetails: buildPurchasePayload(data) };
    case "media":               return buildMediaPayload(data);
    case "audio":               return { audioDetails: data };
    case "transport":           return { transportDetails: data };
    case "externalTransport":   return { externalTransportDetails: { externalTransports: formatExternalTransportPayload(data) } };
    case "foodandrefreshments": return { foodDetails: data };
    case "accommodation":       return { accommodationDetails: buildAccommodationPayload(data, eventDays) };
    default:                    return {};
  }
};

const validateSection = (sectionKey, data, extras = {}) => {
  switch (sectionKey) {
    case "event":               return validateEventRequisition(data);
    case "venue":               return validateVenueData(data);
    case "icts":                return validateIctsData(data, extras.venueData || []);
    case "purchase":            return validatePurchaseData(data);
    case "media":               return validateMediaData(data);
    case "audio":               return validateAudioData(data);
    case "transport":           return validateTransportData(data);
    case "externalTransport":   return validateExternalTransport(data);
    case "foodandrefreshments": return validateFoodData(data);
    case "accommodation":       return validateAccommodationData(data);
    default:                    return {};
  }
};

const buildFullSubmitPayload = (formData, selectedRequirements, user) => {
  const media    = buildMediaPayload(formData.media);
  const venue    = buildVenuePayload(formData.venue);
  const icts     = buildIctsPayload(formData.icts);
  const purchase = buildPurchasePayload(formData.purchase);
  return {
    organizerDetails: {
      previousEventDocumentation: formData.event.doc === "Yes" ? true : formData.event.doc === "No" ? false : null,
      previousEventReason: formData.event.doc === "No" ? formData.event.reason : "",
      isBudgetApproved: formData.event.budget === "Yes",
      financeRequired: formData.event.finance === "Yes",
      estimatedBudget: Number(formData.event.estimatedBudget) || 0,
      advanceAmount: Number(formData.event.advanceAmount) || 0,
      purposeOfAdvance: formData.event.purposeOfAdvance || "",
      advanceToBeReceviedWithin: Number(formData.event.advanceToBeReceivedWithin) || 0,
      ExpectedEventOutcome: formData.event.expectedEventOutcome || "",
      organizingDepartment: formData.event.department,
      organizerCount: parseInt(formData.event.numOrganizers) || 0,
      organizers: (formData.event.organizers || []).map((o) => ({
        name: o.name || "", department: o.department || "",
        mobile: parseInt(o.mobile) || 0, designation: o.designation || "",
        email: o.empEmail || "", empId: o.empId || "", facultyId: user?._id ?? "",
      })),
    },
    venueDetails:        venue,
    ictsDetails:         icts,
    purchaseDetails:     purchase,
    ...media,
    audioDetails:        formData.audio,
    transportDetails:    formData.transport,
    externalTransportDetails: {
      externalTransports: formatExternalTransportPayload(formData.externalTransport),
    },
    foodDetails:         formData.foodandrefreshments,
    accommodationDetails: buildAccommodationPayload(formData.accommodation, formData.event.eventDays),
  };
};

// ── Draft data hydration ──────────────────────────────────────────────────────

const REQUIREMENT_KEY_MAP = {
  venueRequired: "venue",
  ictsRequired: "icts",
  audioRequired: "audio",
  transportRequired: "transport",
  externalTransportRequired: "externalTransport",
  refreshmentRequired: "foodandrefreshments",
  accommodationRequired: "accommodation",
  purchaseRequired: "purchase",
  mediaRequired: "media",
};

function hydrateEventData(apiData) {
  const rd = apiData.requestDetails || {};
  const od = rd.organizerDetails || {};
  const ed = rd.eventDetails || {};
  const reqd = rd.requirementDetails || {};

  // DEBUG: find where principalApprovalDocument lives in the API response
  console.log("[HYDRATE DEBUG] apiData keys:", Object.keys(apiData));
  console.log("[HYDRATE DEBUG] rd keys:", Object.keys(rd));
  console.log("[HYDRATE DEBUG] od keys:", Object.keys(od));
  console.log("[HYDRATE DEBUG] od.principalApprovalDocument:", od.principalApprovalDocument);
  console.log("[HYDRATE DEBUG] od.principalApprovalForm:", od.principalApprovalForm);
  console.log("[HYDRATE DEBUG] rd.principalApprovalForm:", rd.principalApprovalForm);
  console.log("[HYDRATE DEBUG] apiData.principalApprovalForm:", apiData.principalApprovalForm);
  console.log("[HYDRATE DEBUG] apiData.principalApprovalDocument:", apiData.principalApprovalDocument);

  const asDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  };

  const asDateOnly = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
  };

  // 1. Event requisition
  const eventDays = (ed.eventSchedule || ed.eventDates || []).map((s) => ({
    date: asDateOnly(s.eventDate || s.date),
    startTime: s.startTime || "",
    endTime: s.endTime || "",
    numGuests: (s.totalGuests != null && s.totalGuests !== "") ? String(s.totalGuests) : (s.numGuests != null && s.numGuests !== "") ? String(s.numGuests) : "",
    guests: (s.guests || []).map((g) => ({
      name: g.name || "",
      organization: g.organization || "",
      designation: g.designation || "",
      mobile: g.mobile ? String(g.mobile) : "",
      gender: g.gender || "",
    })),
  }));
  const event = {
    doc: od.previousEventDocumentation === true ? "Yes" : (od.previousEventDocumentation === false && od.previousEventReason?.trim() ? "No" : ""),
    reason: od.previousEventReason || "",
    budget: od.isBudgetApproved ? "Yes" : "No",
    finance: od.financeRequired ? "Yes" : "No",
    estimatedBudget: od.estimatedBudget ? String(od.estimatedBudget) : "",
    advanceAmount: od.advanceAmount ? String(od.advanceAmount) : "",
    purposeOfAdvance: od.purposeOfAdvance || "",
    advanceToBeReceivedWithin: od.advanceToBeReceviedWithin ? String(od.advanceToBeReceviedWithin) : "",
    expectedEventOutcome: od.ExpectedEventOutcome || "",
    department: od.organizingDepartment || "",
    file: od.previousEventDocumentationDetails || od.previousEventDocumentationFile || null,
    principalApprovalDocument: od.principalApprovalDocument || od.principalApprovalForm || rd.principalApprovalForm || rd.principalApprovalDocument || apiData.principalApprovalForm || apiData.principalApprovalDocument || null,
    numOrganizers: String(od.organizerCount ?? od.totalCoOrganizers ?? od.coOrganizerCount ?? 0),
    organizers: (od.organizers || []).map((o) => ({
      name: o.name || "",
      department: o.department || "",
      mobile: o.mobile ? String(o.mobile) : "",
      designation: o.designation || "",
      empEmail: o.email || "",
      empId: o.empId || "",
    })),
    eventData: {
      eventName: ed.eventName || "",
      eventType: ed.eventType || "",
      eventTypeOther: ed.eventTypeOther || "",
      society: ed.professionalSociety || [],
      societyOther: ed.professionalSocietyOther || "",
      logos: ed.logosInPoster || [],
      logosOther: ed.logosOther || "",
      audience: ed.targetAudience || "",
      iic: ed.involvedIIC ? "Yes" : ed.iic ? "Yes" : "No",
      eventDays,
    },
    eventDays,
    requirements: {},
  };

  // 2. Selected requirements
  const selectedRequirements = [];
  const requirementsObj = {};
  Object.entries(REQUIREMENT_KEY_MAP).forEach(([backendKey, frontendKey]) => {
    if (reqd[backendKey]) {
      selectedRequirements.push(frontendKey);
      requirementsObj[frontendKey] = "Yes";
    } else {
      requirementsObj[frontendKey] = "No";
    }
  });
  event.requirements = requirementsObj;

  // 3. Venue — group backend venues by dayIndex
  const venueBackend = apiData.venueDetails?.venues || [];
  const numDays = ed.numberOfDays || ed.numberOfEventDays || event.eventDays.length || 1;
  const venue = Array.from({ length: numDays }, (_, dayIdx) => {
    const dayVenues = venueBackend.filter((v) => v.dayIndex === dayIdx);
    if (dayVenues.length === 0) return emptyVenueDay();
    return {
      participants: String(dayVenues.reduce(
        (total, venue) => total + (Number(venue.numberOfParticipants) || 0),
        0
      )),
      selectedVenues: dayVenues.map((v) => v.venueName),
      venueCards: dayVenues.map((v) => {
        const card = {
          venueName: v.venueName || "",
          participants: v.numberOfParticipants ? String(v.numberOfParticipants) : "",
          seatingCapacity: v.seatingCapacity ? String(v.seatingCapacity) : "",
          hallReqs: (v.hallRequirements || []).map((h) => h.type),
          specialReqs: v.specialRequirements || "",
        };
        (v.hallRequirements || []).forEach((h) => {
          if (h.type === "Guest Chair") card.guestChairs = String(h.quantity);
          if (h.type === "Water Bottles") card.waterBottles = String(h.quantity);
          if (h.type === "Dias Table") card.diasTable = String(h.quantity);
          if (h.type === "Audience Chair") card.audienceChair = String(h.quantity);
        });
        return card;
      }),
    };
  });

  // 4. ICTS — group by dayIndex + venueName
  const ictsBackend = apiData.ictsDetails?.ictses || [];
  const icts = {};
  ictsBackend.forEach((item) => {
    const dayKey = String(item.dayIndex);
    if (!icts[dayKey]) icts[dayKey] = {};
    const laptopTypes = (item.laptopSpec || []).map((d) => d.type);
    const card = {
      laptopTypes,
      windowsCount: "",
      macCount: "",
      internetFacility: item.internetFacility || "",
      expectedInternetUsers: item.expectedInternetUsers ? String(item.expectedInternetUsers) : "",
      proctorUsers: item.proctoringUsers ? String(item.proctoringUsers) : "",
      guestWifi: item.guestWifiNeeded ? "Yes" : "No",
      guestWifiExceed5: item.guestWifiExceed5 ? "Yes" : "No",
      totalGuestCount: item.totalGuestCount ? String(item.totalGuestCount) : "",
      requirements: item.requirements || [],
      others: item.otherRequirements || "",
      specialRequirements: item.specialRequirements || "",
    };
    (item.laptopSpec || []).forEach((d) => {
      if (d.type === "Windows") card.windowsCount = String(d.count);
      if (d.type === "Mac") card.macCount = String(d.count);
    });
    icts[dayKey][item.venueName] = card;
  });

  // 5. Audio — the API stores a flat list; AudioForm reads day -> venue -> data.
  const audio = {};
  const audioKeyByLabel = {
    "Hand Mic": "handMic",
    "Collar Mic": "collarMic",
    "Hand Speaker": "handSpeaker",
    "Podium With Mic": "podiumWithMic",
    "Wired Mic": "wiredMic",
    "Speaker w/ Mixer": "speakerWithMixer",
    "PA System": "paSystem",
  };
  (apiData.audioDetails?.audios || []).forEach((item) => {
    const audioRequired = item.audioRequirements?.length
      ? item.audioRequirements.map((requirement) => audioKeyByLabel[requirement] || requirement)
      : (item.audioItems || []).map((audioItem) => ({
          ...audioKeyByLabel,
        }[audioItem.type] || audioItem.type));
    const quantities = Object.entries(item.quantities || {}).reduce((result, [key, value]) => ({
      ...result,
      [audioKeyByLabel[key] || key]: String(value ?? ""),
    }), {});
    (item.audioItems || []).forEach((audioItem) => {
      const key = audioKeyByLabel[audioItem.type] || audioItem.type;
      if (key) quantities[key] = String(audioItem.quantity ?? "");
    });
    audio[item.dayIndex] = {
      ...(audio[item.dayIndex] || {}),
      [item.venueName]: {
        audioRequired,
        quantities,
        others: item.otherRequirements || "",
        specialRequirements: item.specialRequirements || "",
      },
    };
  });

  // 6. Transport — unwrap the API container and restore date-picker values.
  const transportItems = apiData.transportDetails?.transports || apiData.transportDetails || [];
  const transport = Array.isArray(transportItems) && transportItems.length > 0
    ? transportItems.map((item) => ({
        ...defaultTransport(),
        pickupLocation: item.pickupLocation || "",
        dropLocation: item.dropLocation || "",
        totalPassengers: item.totalPassengers ?? "",
        vistaTransport: (item.vehicles || []).map((vehicle) => vehicle.type),
        vehicleCounts: (item.vehicles || []).reduce((counts, vehicle) => ({
          ...counts,
          [vehicle.type]: String(vehicle.count ?? ""),
        }), {}),
        staffCount: String((item.accompanyingStaff || []).length),
        staffMembers: item.accompanyingStaff || [],
        checkpoints: (item.checkpoints || []).map((checkpoint) => ({
          name: checkpoint.name || checkpoint.location || "",
        })),
        specialRequirements: item.specialRequirements || "",
        pickupDate: asDate(item.pickupDate || item.pickupDateTime),
        dropDate: asDate(item.dropDate || item.dropDateTime),
      }))
    : [defaultTransport()];

  // 6b. External Transport
  const externalTransportBackend =
    apiData.externalTransportDetails?.externalTransports ||
    (Array.isArray(apiData.externalTransportDetails) ? apiData.externalTransportDetails : []) ||
    apiData.externalTransports ||
    [];
  const externalTransport = externalTransportBackend.length > 0
    ? externalTransportBackend.map(item => ({
        id: crypto.randomUUID(),
        travelOption: item.travelOption || "",
        travelDate: asDateOnly(item.travelDate),
        from: item.from || "",
        to: item.to || "",
        totalPassengers: String(item.totalPassengers || ""),
        classOrBerth: item.classOrBerth || (item.travelOption === "Train" ? [] : ""),
        trainNumber: item.trainNumber || "",
        flightNumber: item.flightNumber || "",
        specialRequirements: item.specialRequirements || "None",
        passengers: (item.passengers || []).map(p => ({
          id: crypto.randomUUID(),
          name: p.name || "",
          phone: p.phone || "",
          email: p.email || "",
          age: String(p.age || ""),
          gender: p.gender || "",
          designation: p.designation || "",
          organization: p.organization || ""
        }))
      }))
    : [emptyExternalTransport()];

  // 7. Food & Refreshments — unwrap refreshmentDetails and map backend names.
  const foodItems = apiData.refreshmentDetails?.refreshments || apiData.foodDetails?.refreshments || apiData.foodDetails || [];
  const countValue = (group, aliases = []) => {
    const value = group?.vegCount ?? group?.veg ?? group?.vegetarian ?? group?.vegParticipants
      ?? group?.vegetarianCount ?? group?.veg?.count ?? group?.vegetarian?.count ?? group?.[aliases[0]];
    return value === undefined || value === null ? "" : String(value);
  };
  const nonVegCountValue = (group, aliases = []) => {
    const value = group?.nonVegCount ?? group?.nonVeg ?? group?.nonVegetarian ?? group?.nonVegParticipants
      ?? group?.nonVegetarianCount ?? group?.nonVeg?.count ?? group?.nonVegetarian?.count ?? group?.[aliases[0]];
    return value === undefined || value === null ? "" : String(value);
  };
  const hydrateMeal = (meal = {}) => ({
    participants: {
      vegCount: countValue(meal.participants, ["vegParticipants"] ) || String(meal.vegParticipants ?? ""),
      nonVegCount: nonVegCountValue(meal.participants, ["nonVegParticipants"]) || String(meal.nonVegParticipants ?? ""),
    },
    vipGuests: {
      vegCount: countValue(meal.vipGuests, ["vegGuest"]) || String(meal.vegGuest ?? ""),
      nonVegCount: nonVegCountValue(meal.vipGuests, ["nonVegGuest"]) || String(meal.nonVegGuest ?? ""),
    },
    trainer: {
      vegCount: countValue(meal.trainer, ["vegTrainer"]) || String(meal.vegTrainer ?? meal.trainerVegCount ?? meal.vegCountTrainer ?? meal.trainer?.vegParticipants ?? ""),
      nonVegCount: nonVegCountValue(meal.trainer, ["nonVegTrainer"]) || String(meal.nonVegTrainer ?? meal.trainerNonVegCount ?? meal.nonVegCountTrainer ?? meal.trainer?.nonVegParticipants ?? ""),
    },
    placement: {
      vegCount: countValue(meal.placement, ["vegPlacement"]) || String(meal.vegPlacement ?? ""),
      nonVegCount: nonVegCountValue(meal.placement, ["nonVegPlacement"]) || String(meal.nonVegPlacement ?? ""),
    },
  });
  const foodandrefreshments = Array.isArray(foodItems) && foodItems.length > 0
    ? foodItems.map((item) => ({
        ...emptyFoodDay(),
        date: asDate(item.date),
        resourcePersons: String(item.resourcePersons ?? item.numberOfResourcePersons ?? ""),
        internalCount: String(item.internalCount ?? item.numberOfInternalAccompanyingStaff ?? ""),
        staffList: item.staffList || item.accompanyingStaff || [],
        resourcePersonType: item.resourcePersonType || [],
        foodTypes: (item.foodTypes || []).map((food) => food.type),
        breakfast: hydrateMeal((item.foodTypes || []).find((food) => food.type === "Breakfast")),
        lunch: hydrateMeal((item.foodTypes || []).find((food) => food.type === "Lunch")),
        dinner: hydrateMeal((item.foodTypes || []).find((food) => food.type === "Dinner")),
        morningRefreshmentCount: String((item.foodTypes || []).find((food) => food.type === "Morning Refreshment")?.refreshmentCount ?? ""),
        eveningRefreshmentCount: String((item.foodTypes || []).find((food) => food.type === "Evening Refreshment")?.refreshmentCount ?? ""),
        specialRequirements: item.specialRequirements || "",
      }))
    : [emptyFoodDay()];

  // 8. Accommodation — reverse from payload shape
  const accBackend = apiData.accommodationDetails?.accommodations || [];
  const normalizeGuestName = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  const normalizeGuestPhone = (value) => String(value || "").replace(/\D/g, "");
  const savedGuestMatches = (guest, saved) => {
    if (saved.guestId && saved.guestId === guest.guestId) return true;
    const guestName = normalizeGuestName(guest.name || guest.guestName);
    const savedName = normalizeGuestName(saved.name || saved.guestName);
    if (!guestName || guestName !== savedName) return false;
    const guestPhone = normalizeGuestPhone(guest.mobile || guest.phone || guest.phoneNumber);
    const savedPhone = normalizeGuestPhone(saved.mobile || saved.phone || saved.phoneNumber);
    return !guestPhone || !savedPhone || guestPhone === savedPhone;
  };
  let accommodation;
  if (accBackend.length > 0) {
    accommodation = {
      accommodations: accBackend.map((acc) => {
        const entry = {
          checkIn: asDate(acc.checkInDateTime),
          checkOut: asDate(acc.checkOutDateTime),
          roomSelections: (acc.roomSelections || []).map((room) => ({
            roomId: room.roomId,
            roomNumber: room.roomNumber,
            venue: room.venue,
            occupantCount: room.occupantCount || room.capacity || 0,
            requiresAdminConfirmation: room.requiresAdminConfirmation === true,
            adminContacted: room.adminContacted === true,
            adminMessage: room.message || "This room was occupied immediately before the requested time. Please contact the admin team to confirm room availability.",
          })),
          dine: acc.dineInRequired ? "Yes" : "No",
          dineTypes: (acc.dineInCounts || []).map((d) => d.type),
          hostelGuests: String((acc.dineInCounts || []).find((d) => d.type === "Hostel")?.count || "1"),
          amenityGuests: String((acc.dineInCounts || []).find((d) => d.type === "Amenity")?.count || "1"),
          selectedGuestIds: flattenGuestsForAccommodation(event.eventDays)
            .filter((guest) => (acc.guests || []).some((saved) => savedGuestMatches(guest, saved)))
            .map((guest) => guest.guestId),
          guests: acc.guests || [],
          special: acc.specialRequirements || "",
          accommodationNeeded: (acc.roomSelections && acc.roomSelections.length > 0) ? "Yes" : "No",
        };
        return entry;
      }),
    };
  } else {
    accommodation = defaultAccommodation;
  }

  // 9. Purchase — reverse gift items from backend payload
  const reverseGiftItems = (giftItems = []) => {
    const result = {
      giftType: [], trophyType: [], basicTrophyQty: "", eliteTrophyQty: "",
      cashPrizeAmount: "", voucherWorth: "", registrationKitNeeded: "",
      registrationKitQty: "", specialRequirements: "",
    };
    giftItems.forEach((gi) => {
      result.giftType.push(gi.giftType);
      if (gi.giftType === "Trophy") {
        result.trophyType = (gi.trophy || []).map((t) => t.trophyType);
        (gi.trophy || []).forEach((t) => {
          if (t.trophyType === "Basic") result.basicTrophyQty = String(t.quantity);
          if (t.trophyType === "Elite") result.eliteTrophyQty = String(t.quantity);
        });
      }
      if (gi.giftType === "Gifts") result.giftsQty = String(gi.giftsQty ?? gi.glassCupQty ?? gi.qty ?? "");
      if (gi.giftType === "Cash Prize") result.cashPrizeAmount = String(gi.cashPrizeAmount);
      if (gi.giftType === "Voucher") {
        const worths = (gi.voucher || []).map((v) => v.voucherWorth);
        result.voucherWorth = worths.length === 1 ? worths[0] : worths;
        result.voucherWorthQty = (gi.voucher || []).reduce((quantities, voucher) => ({
          ...quantities,
          [voucher.voucherWorth]: String(voucher.quantity ?? voucher.qty ?? ""),
        }), {});
      }
    });
    return result;
  };

  const purchaseBackend = apiData.purchaseDetails?.purchases || [];
  const purchase = purchaseBackend.length > 0
    ? purchaseBackend.map((p) => {
        const requirementNeeded = (p.requirementNeeded || []).map((r) => r.type);
        const idCardEntry = (p.requirementNeeded || []).find((r) => r.type === "Id Card");
        const certEntry = (p.requirementNeeded || []).find((r) => r.type === "Certificate");
        let selectedPersons = "";
        if (p.requiredFor?.includes("Students") && p.requiredFor?.includes("Guest")) selectedPersons = "Both";
        else if (p.requiredFor?.includes("Students")) selectedPersons = "Students";
        else if (p.requiredFor?.includes("Guest")) selectedPersons = "Guest";

        const studentData = reverseGiftItems(p.students?.giftItems);
        studentData.registrationKitNeeded = p.students?.registrationKitNeeded ? "Yes" : "No";
        studentData.registrationKitQty = p.students?.registrationKitQty ? String(p.students.registrationKitQty) : "";
        studentData.specialRequirements = p.students?.specialRequirements || "";

        const guestData = reverseGiftItems(p.guests?.giftItems);
        guestData.registrationKitNeeded = p.guests?.registrationKitNeeded ? "Yes" : "No";
        guestData.registrationKitQty = p.guests?.registrationKitQty ? String(p.guests.registrationKitQty) : "";
        guestData.specialRequirements = p.guests?.specialRequirements || "";

        return { requirementNeeded, idCardQty: idCardEntry ? String(idCardEntry.hardCount) : "", certificateQty: certEntry ? String(certEntry.hardCount) : "", selectedPersons, studentData, guestData };
      })
    : [emptyPurchaseDay()];

  // 10. Media — reverse poster/video per day
  const mediaBackend = apiData.mediaRequirementDetails?.mediaRequirements || [];
  const media = mediaBackend.length > 0
    ? mediaBackend.map((m) => {
        let designType = "";
        if (m.typeOfMedia?.includes("poster") && m.typeOfMedia?.includes("video")) designType = "Both";
        else if (m.typeOfMedia?.includes("poster")) designType = "Poster";
        else if (m.typeOfMedia?.includes("video")) designType = "Video";
        return {
          designType,
          poster: {
            contentPoster: m.poster?.posterContent || "",
            referencePoster: null,
            referencePosterFiles: m.poster?.referencePosterFiles || [],
            contentCertificate: m.poster?.certificateContent || "",
            referenceCertificate: null,
            referenceCertificateFiles: m.poster?.referenceCertificateFiles || [],
            contentTrophy: m.poster?.trophyContent || "",
            displayNeeded: m.poster?.displayNeeded || [],
            sizeForFlex: (m.poster?.sizes || []).find((s) => s.type === "Flex")?.value || "",
            sizeForGlass: (m.poster?.sizes || []).find((s) => s.type === "Glass Sticker")?.value || "",
            deliveryDate: asDateOnly(m.poster?.deliveryDate),
            priority: m.poster?.priority || "",
            specialReq: m.poster?.specialRequirements || "",
          },
          video: {
            contentVideo: m.video?.videoContent || "",
            preEvent: m.video?.preEventVideos || [],
            eventCoverage: m.video?.eventCoverage || [],
            postEvent: m.video?.postEventVideos || [],
            specialVideos: m.video?.specialVideos || [],
            referenceVideo: null,
            referenceFiles: m.video?.referenceFiles || [],
            deliveryDate: asDateOnly(m.video?.deliveryDate),
            priority: m.video?.priority || "",
            specialReq: m.video?.specialRequirements || "",
          },
        };
      })
    : [emptyMediaDay()];

  return {
    formData: { event, venue, icts, audio, transport, externalTransport, foodandrefreshments, accommodation, purchase, media },
    selectedRequirements,
  };
}

function determineDraftStep(apiData, selectedRequirements) {
  // Step 0 (event requisition) is always completed for a draft
  const sectionHasData = {
    venue: (apiData.venueDetails?.venues || []).length > 0,
    icts: (apiData.ictsDetails?.ictses || []).length > 0,
    audio: apiData.audioDetails && Object.keys(apiData.audioDetails).length > 0,
    transport: (apiData.transportDetails?.transports || apiData.transportDetails || []).length > 0,
    externalTransport: (apiData.externalTransportDetails?.externalTransports || (Array.isArray(apiData.externalTransportDetails) ? apiData.externalTransportDetails : []) || apiData.externalTransports || []).length > 0,
    foodandrefreshments: (apiData.refreshmentDetails?.refreshments || apiData.foodDetails?.refreshments || apiData.foodDetails || []).length > 0,
    accommodation: (apiData.accommodationDetails?.accommodations || []).length > 0,
    purchase: (apiData.purchaseDetails?.purchases || []).length > 0,
    media: (apiData.mediaRequirementDetails?.mediaRequirements || []).length > 0,
  };
  // Find the first requirement step that has no data
  for (let i = 0; i < selectedRequirements.length; i++) {
    if (!sectionHasData[selectedRequirements[i]]) {
      return i + 1; // +1 because step 0 is "event"
    }
  }
  // All steps have data — position on the last step
  return selectedRequirements.length;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Form() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { draftId, id } = useParams();
  const isEditMode = Boolean(id);
  const recordId = id || draftId;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [eventId, setEventId] = useState("");
  const [originalOrganizerId, setOriginalOrganizerId] = useState("");
  const [formData, setFormData] = useState({
    event: {
      doc: "", finance: "", budget: "", department: "", file: null, principalApprovalDocument: null,
      reason: "", numOrganizers: "", organizers: [],
      eventData: {}, eventDays: [], requirements: [],
    },
    venue: [], icts: {}, audio: defaultAudio,
    transport: [defaultTransport()],
    externalTransport: [emptyExternalTransport()],
    foodandrefreshments: [emptyFoodDay()],
    accommodation: defaultAccommodation,
    purchase: [emptyPurchaseDay()],
    media: [emptyMediaDay()],
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isDraftLoading, setIsDraftLoading] = useState(!!recordId);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // childNav extended with isOnLastDay + nextDayLabel from MediaForm
  // isOnLastDay: true  → the child is on its last day tab (show Submit if also last parent step)
  // isOnLastDay: false → the child still has more day tabs (always show "Next Day" label)
  const [childNav, setChildNav] = useState({
    next: null, prev: null, isLoading: false,
    isOnLastDay: true,   // default true so non-multi-day forms always show correct button
    nextDayLabel: "Save & Next",
  });

  const scrollContainerRef = useRef(null);

  const baseSteps = [{ key: "event", label: "Event Requisition Details", component: EventRequistionDetails }];
  const requirementMap = {
    venue:               { label: "Venue Details",                 component: VenueForm },
    icts:                { label: "ICTS Details",                  component: ICTSForm },
    audio:               { label: "Audio Details",                 component: AudioForm },
    transport:           { label: "Transport Details",             component: TransportForm },
    externalTransport:   { label: "External Transport Details",    component: ExternalTransportForm },
    foodandrefreshments: { label: "Food and Refreshments Details", component: FoodAndRefreshments },
    accommodation:       { label: "Accommodation Details",         component: AccommodationForm },
    purchase:            { label: "Purchase Details",              component: Purchase },
    media:               { label: "Media Requirement Details",     component: MediaForm },
  };
  const requirementKeys = Array.isArray(selectedRequirements)
    ? selectedRequirements
    : Object.entries(selectedRequirements || {})
        .filter(([, value]) => value === "Yes")
        .map(([key]) => key);

  const dynamicSteps = requirementKeys.map((key) => ({
    key,
    ...requirementMap[key],
  }));
  const steps = [...baseSteps, ...dynamicSteps];
  const CurrentComponent = steps[currentStep]?.component;
  const currentStepKey   = steps[currentStep]?.key;

  // Stable refs
  const stepsRef       = useRef(steps);
  const currentStepRef = useRef(currentStep);
  const formDataRef    = useRef(formData);
  const eventIdRef     = useRef(eventId);

  useEffect(() => { stepsRef.current       = steps;       }, [steps]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { formDataRef.current    = formData;    }, [formData]);
  useEffect(() => { eventIdRef.current     = eventId;     }, [eventId]);

  const advanceStep = useCallback(() => {
    const step  = currentStepRef.current;
    const total = stepsRef.current.length;
    setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
    if (step < total - 1) setCurrentStep((prev) => prev + 1);
  }, []);

  const goBackStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // ── Fetch and hydrate draft data when draftId or id is in the URL ────────────────
  useEffect(() => {
    if (!recordId) return;
    const fetchDraft = async () => {
      setIsDraftLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${recordId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch event data");
        const apiData = data.data || data;
        const { formData: hydratedData, selectedRequirements: hydratedReqs } = hydrateEventData(apiData);
        setFormData(hydratedData);
        setSelectedRequirements(hydratedReqs);
        setEventId(apiData._id || recordId);
        if (apiData.organizerId) setOriginalOrganizerId(apiData.organizerId);
        const step = isEditMode ? 0 : determineDraftStep(apiData, hydratedReqs);
        setCurrentStep(step);
        setCompletedSteps(Array.from({ length: step }, (_, i) => i));
        if (!isEditMode && step === hydratedReqs.length) setShowPreview(true);
      } catch (error) {
        console.error("Failed to load event data:", error);
        setApiError("Failed to load event data. Starting a fresh form.");
      } finally {
        setIsDraftLoading(false);
      }
    };
    fetchDraft();
  }, [recordId, isEditMode]);

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [currentStep]);

  useEffect(() => {
    const dayCount = formData.event.eventDays.length;
    setFormData((prev) => ({
      ...prev,
      venue:               ensureLength(prev.venue,               dayCount, emptyVenueDay),
      purchase:            ensureLength(prev.purchase,            dayCount, emptyPurchaseDay),
      media:               ensureLength(prev.media,               dayCount, emptyMediaDay),
      foodandrefreshments: ensureAtLeastLength(prev.foodandrefreshments, dayCount, emptyFoodDay),
    }));
  }, [formData.event.eventDays.length]);

  const updateFormSection = useCallback((sectionKey, value) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: value }));
  }, []);

  const handleVenueDataChange         = useCallback((v) => updateFormSection("venue",               v), [updateFormSection]);
  const handleIctsDataChange          = useCallback((v) => updateFormSection("icts",                v), [updateFormSection]);
  const handleAudioDataChange         = useCallback((v) => updateFormSection("audio",               v), [updateFormSection]);
  const handleTransportDataChange     = useCallback((v) => updateFormSection("transport",           v), [updateFormSection]);
  const handleExternalTransportDataChange = useCallback((v) => updateFormSection("externalTransport", v), [updateFormSection]);
  const handleFoodDataChange          = useCallback((v) => updateFormSection("foodandrefreshments", v), [updateFormSection]);
  const handleAccommodationDataChange = useCallback((v) => updateFormSection("accommodation",       v), [updateFormSection]);
  const handlePurchaseDataChange      = useCallback((v) => updateFormSection("purchase",            v), [updateFormSection]);
  const handleMediaDataChange         = useCallback((v) => updateFormSection("media",               v), [updateFormSection]);

  // ── saveSection ───────────────────────────────────────────────────────────
  // Media section: accepts either a FormData (from MediaForm with files) or
  // falls back to building JSON payload from the current formData.media state.
  const saveSection = async (sectionKey, sectionValueOrFormData, extras = {}) => {
    setApiError("");

    // For media with files, sectionValueOrFormData is already a FormData built
    // by MediaForm's buildMediaFormData — skip our JSON validation/build.
    const isFormDataPayload = sectionValueOrFormData instanceof FormData;

    if (!isFormDataPayload) {
      const errors = validateSection(sectionKey, sectionValueOrFormData, extras);
      if (Object.keys(errors).length > 0) {
        setFormErrors((prev) => ({ ...prev, [sectionKey]: errors }));
        return false;
      }
    }

    if (!eventId && sectionKey !== "event") {
      setApiError("Event must be created before saving this section.");
      return false;
    }
    setIsLoading(true);
    try {
      let response;
      if (sectionKey === "event") {
        const payload = buildEventRequisitionPayload({ eventRequisition: sectionValueOrFormData, user, existingOrganizerId: originalOrganizerId });
        const method  = eventId ? "PUT" : "POST";
        const url     = eventId ? `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}` : `${import.meta.env.VITE_API_BASE_URL}/api/events`;
        response = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: payload,
        });
      } else if (isFormDataPayload) {
        // ── Media with files: send as multipart, no Content-Type header ───
        // The browser sets Content-Type automatically with the correct boundary.
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventIdRef.current}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: sectionValueOrFormData,
        });
      } else {
        const payload = buildPayloadForSection(sectionKey, sectionValueOrFormData, formDataRef.current.event.eventDays);
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(payload),
        });
      }
      let data = {};
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await response.json();
      } else {
        await response.text();
        if (!response.ok) throw new Error(`Server error ${response.status}. Check your backend logs.`);
      }
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      if (sectionKey === "event") setEventId(data.data?._id || eventId);
      if (sectionKey === "media" && data.data?.mediaRequirementDetails?.mediaRequirements) {
        const backendReqs = data.data.mediaRequirementDetails.mediaRequirements;
        setFormData((prev) => {
          const updatedMedia = prev.media.map((day, idx) => {
            const req = backendReqs[idx];
            if (!req) return day;
            return {
              ...day,
              poster: {
                ...day.poster,
                referencePoster: [],            // clear raw Files — already uploaded
                referenceCertificate: [],        // clear raw Files — already uploaded
                referencePosterFiles: req.poster?.referencePosterFiles || day.poster?.referencePosterFiles || [],
                referenceCertificateFiles: req.poster?.referenceCertificateFiles || day.poster?.referenceCertificateFiles || [],
              },
              video: {
                ...day.video,
                referenceVideo: [],              // clear raw Files — already uploaded
                referenceFiles: req.video?.referenceFiles || day.video?.referenceFiles || [],
              },
            };
          });
          return { ...prev, media: updatedMedia };
        });
      }
      setFormErrors((prev) => ({ ...prev, [sectionKey]: {} }));
      return true;
    } catch (error) {
      setApiError(error.message || "Unable to save data. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── submitEvent ───────────────────────────────────────────────────────────
  // Helper: check if any media day has a pending File object that hasn't been uploaded yet
  const mediaHasFiles = (mediaData) => {
    if (!Array.isArray(mediaData)) return false;
    return mediaData.some((day) => {
      const checkList = (arr) => Array.isArray(arr) && arr.some((f) => f instanceof File);
      return (
        checkList(day.poster?.referencePoster) ||
        checkList(day.poster?.referenceCertificate) ||
        checkList(day.video?.referenceVideo) ||
        checkList(day.referencePosterFiles) ||
        checkList(day.referenceCertificateFiles) ||
        checkList(day.referenceFiles)
      );
    });
  };

  const submitEvent = async () => {
    if (!eventId) { setApiError("No event ID available for submit."); return; }
    setIsLoading(true);
    setApiError("");
    try {
      // If media has unsaved File objects, flush them via multipart PUT first
      let latestMedia = formDataRef.current.media;
      if (mediaHasFiles(latestMedia)) {
        const mediaFD = buildMediaFormData(latestMedia);
        const mediaRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventIdRef.current}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: mediaFD,
        });
        if (!mediaRes.ok) {
          const errData = await mediaRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to upload media files: ${mediaRes.status}`);
        }
        // Build updated media synchronously (don't wait for React state) so submit payload is accurate
        const mediaRespData = await mediaRes.json().catch(() => ({}));
        if (mediaRespData.data?.mediaRequirementDetails?.mediaRequirements) {
          const backendReqs = mediaRespData.data.mediaRequirementDetails.mediaRequirements;
          latestMedia = latestMedia.map((day, idx) => {
            const req = backendReqs[idx];
            if (!req) return day;
            return {
              ...day,
              poster: {
                ...day.poster,
                referencePoster: [],
                referenceCertificate: [],
                referencePosterFiles: req.poster?.referencePosterFiles || day.poster?.referencePosterFiles || [],
                referenceCertificateFiles: req.poster?.referenceCertificateFiles || day.poster?.referenceCertificateFiles || [],
              },
              video: {
                ...day.video,
                referenceVideo: [],
                referenceFiles: req.video?.referenceFiles || day.video?.referenceFiles || [],
              },
            };
          });
          // Also update React state for UI consistency
          setFormData((prev) => ({ ...prev, media: latestMedia }));
        }
      }

      const fullPayload = buildFullSubmitPayload(
        { ...formDataRef.current, media: latestMedia },
        selectedRequirements,
        user
      );
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}` 
        : `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}/submit`;
      const method = isEditMode ? "PUT" : "PATCH";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(fullPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      if (
          formDataRef.current.event.finance === "Yes" &&
          formDataRef.current.event.advanceAmount &&
          formDataRef.current.event.purposeOfAdvance
      ) {
          const organizer =
            data.data.requestDetails.organizerDetails.organizers?.[0];

          let facultyDetails = {};
          if (data.data.organizerId) {
            facultyDetails = await getFacultyById(data.data.organizerId);
          }

          await generateAdvanceReceiptPdf({
            formData: formDataRef.current.event,
            employee: facultyDetails,
            submitResponse: data.data,
          });
      }
      setSubmitSuccess(true);
    } catch (error) {
      setApiError(error.message || "Unable to submit event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── registerChildNavigation ───────────────────────────────────────────────
  const registerChildNavigation = useCallback((nav = {}) => {
    setChildNav({
      next:         nav.next         || null,
      prev:         nav.prev         || null,
      isLoading:    nav.isLoading    || false,
      isOnLastDay:  nav.isOnLastDay  !== undefined ? nav.isOnLastDay  : true,
      nextDayLabel: nav.nextDayLabel || "Save & Next",
    });
  }, []);

  // ── handleSaveAndContinue ─────────────────────────────────────────────────
  const handleSaveAndContinue = async () => {
    if (childNav.next) {
      await childNav.next();
      return;
    }
    const sectionKey   = currentStepKey;
    if (!sectionKey) return;
    const sectionValue = formData[sectionKey];
    const extras       = { venueData: formData.venue };
    const ok           = await saveSection(sectionKey, sectionValue, extras);
    if (ok) advanceStep();
  };

  const handlePreview = async () => {
    if (childNav.next) {
      const ok = await childNav.next();
      if (ok !== false) setShowPreview(true);
      return;
    }
    const sectionKey   = currentStepKey;
    if (!sectionKey) {
      setShowPreview(true);
      return;
    }
    const sectionValue = formData[sectionKey];
    const extras       = { venueData: formData.venue };
    const ok           = await saveSection(sectionKey, sectionValue, extras);
    if (ok) setShowPreview(true);
  };

  // ── handleBack ────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (childNav.prev) { childNav.prev(); return; }
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // ── Button logic ──────────────────────────────────────────────────────────
  const isLastParentStep = currentStep === steps.length - 1;
  const showSubmit       = isLastParentStep && childNav.isOnLastDay;

  const forwardLabel = () => {
    if (isLoading || childNav.isLoading) return "Saving...";
    if (childNav.next && !childNav.isOnLastDay) return childNav.nextDayLabel || "Next Day →";
    return "Save & Next";
  };

  const sectionProps = {
    event: {
      user,
      eventRequisition: formData.event,
      setEventRequisition: (value) => updateFormSection("event", value),
      setEventDays: (days) => updateFormSection("event", { ...formData.event, eventDays: days }),
      setSelectedRequirements: (reqs) => {
        setSelectedRequirements(reqs);
        updateFormSection("event", { ...formData.event, requirements: reqs });
      },
      eventId, setEventId,
      errors: formErrors.event || {},
      onSave: async (selectedReqs = []) => {
        const merged = { ...formData.event, requirements: selectedReqs };
        updateFormSection("event", merged);
        const ok = await saveSection("event", merged);
        if (ok) { setSelectedRequirements(selectedReqs); advanceStep(); }
      },
    },
    venue: {
      venueData: formData.venue,
      onVenueDataChange: handleVenueDataChange,
      eventDays: formData.event.eventDays,
      eventId, errors: formErrors.venue || {},
    },
    icts: {
      venueData: formData.venue,
      ictsData: formData.icts,
      onIctsDataChange: handleIctsDataChange,
      eventDays: formData.event.eventDays,
      eventId, errors: formErrors.icts || {},
    },
    audio: {
      audioData: formData.audio,
      onAudioDataChange: handleAudioDataChange,
      eventId, errors: formErrors.audio || {},
      venueData: formData.venue,
      eventDays: formData.event.eventDays,
    },
    transport: {
      transportData: formData.transport,
      onTransportDataChange: handleTransportDataChange,
      eventId, errors: formErrors.transport || {},
    },
    externalTransport: {
      initialValues: formData.externalTransport,
      externalTransportData: formData.externalTransport,
      onDataChange: handleExternalTransportDataChange,
      eventId,
      errors: formErrors.externalTransport || {},
    },
    foodandrefreshments: {
      foodData: formData.foodandrefreshments,
      onFoodDataChange: handleFoodDataChange,
      eventId, errors: formErrors.foodandrefreshments || {},
    },
    accommodation: {
      accommodationData: formData.accommodation,
      onAccommodationDataChange: handleAccommodationDataChange,
      eventId, errors: formErrors.accommodation || {},
      eventDays: formData.event.eventDays,
    },
    purchase: {
      purchaseData: formData.purchase,
      venueData: formData.venue,
      onPurchaseDataChange: handlePurchaseDataChange,
      eventId,
      eventDays: formData.event.eventDays,
      errors: formErrors.purchase || {},
    },
    media: {
      mediaData: formData.media,
      onMediaDataChange: handleMediaDataChange,
      eventId,
      eventDays: formData.event.eventDays,
      errors: formErrors.media || {},
      onSave: async (formDataPayload) => {
        const ok = await saveSection("media", formDataPayload);
        if (ok) advanceStep();
      },
    },
  };

  const progress = currentStep === 0 ? 0 : Math.min(20 + (currentStep - 1) * 10, 100);

  // Full-page draft loading screen
  if (isDraftLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#16162A]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white text-lg">Loading event...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <FormSubmitted
        onSubmitAnother={() => { navigate("/dashboard"); }}
      />
    );
  }

  if (showPreview) {
    return (
      <EventPreviewPage
        formData={formData}
        selectedRequirements={selectedRequirements}
        onBack={() => setShowPreview(false)}
        onSubmit={submitEvent}
        isLoading={isLoading}
        eventId={eventId}
      />
    );
  }

  if (!CurrentComponent) return null;

  return (
    <div className="flex h-screen bg-[#16162A] overflow-hidden">
      <div className="hidden md:block w-[325px] flex-shrink-">
        <EventsSidebar steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>
      <div className="w-full flex-1 flex flex-col overflow-hidden ">
        <div className="px-4 sm:px-6 pt-4 pb-3 border-[#2A2A45] ">
          <h1 className="text-white text-xl font-bold playfair">{steps[currentStep]?.label}</h1>
          <div className="flex flex-row  gap-5 ">
            <div className="w-full h-1.5 bg-gray-700 rounded mt-3">
              <div className="h-full bg-purple-500 rounded transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{progress}%</p>
          </div>
          {apiError && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3">
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4">
          <CurrentComponent
            nextStep={advanceStep}
            prevStep={goBackStep}
            registerChildNavigation={registerChildNavigation}
            setSelectedRequirements={setSelectedRequirements}
            eventDays={formData.event.eventDays}
            setEventDays={(days) => updateFormSection("event", { ...formData.event, eventDays: days })}
            eventId={eventId}
            setEventId={setEventId}
            {...(sectionProps[currentStepKey] || {})}
            onSave={sectionProps[currentStepKey]?.onSave}
          />
        </div>

        <div className="px-4 sm:px-6 pb-6">
          <div className="flex justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={!childNav.prev && currentStep === 0}
              className="rounded-lg border border-purple-600 px-6 py-2 text-purple-600 hover:bg-purple-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {/* ── Right button ──────────────────────────────────────────────
                showSubmit = last parent step AND child is on its last day.
                On Day 1 of a 2-day MediaForm, isOnLastDay is false →
                showSubmit is false → "Next Day →" is shown instead.
            ─────────────────────────────────────────────────────────────── */}
            {showSubmit ? (
              <button
                  onClick={handlePreview}
                  disabled={!eventId || isLoading || childNav.isLoading}
                  className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                  {isLoading || childNav.isLoading ? "Saving..." : "Preview"}
              </button>
          ) : (
              <button
                  onClick={handleSaveAndContinue}
                  disabled={isLoading || childNav.isLoading}
                  className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                  {forwardLabel()}
              </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}