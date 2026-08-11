import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EventsSidebar from "../Components/EventsSidebar";
import EventRequistionDetails from "../Components/Forms/EventRequistionDetails";
import VenueForm from "../Components/Forms/VenueForm";
import ICTSForm from "../Components/Forms/IctsForm";
import TransportForm from "../Components/Forms/TransportForm";
import FoodAndRefreshments from "../Components/Forms/FoodAndRefreshments";
import AccommodationForm from "../Components/Forms/AccommodationForm";
import Purchase from "../Components/Forms/Purchase";
import MediaForm from "../Components/Forms/MediaForm";
import AudioForm from "../Components/Forms/AudioForm";
import { useAuth } from "../Components/AuthContext";
import FormSubmitted from "../Components/Forms/FormSubmitted";

const BASE_URL = "https://sece-events.onrender.com";

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
  breakfast: { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
  lunch:     { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
  dinner:    { vegParticipants: "", vegGuest: "", nonVegParticipants: "", nonVegGuest: "" },
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

// ── Validators ────────────────────────────────────────────────────────────────

const validateEventRequisition = (data) => {
  const errors = {};
  if (!data.doc) errors.doc = "This field is required";
  if (data.doc === "Yes" && !data.file) errors.file = "Please upload the previous event documentation";
  if (data.doc === "No" && !data.reason?.trim()) errors.reason = "Reason is required";
  if (!data.budget) errors.budget = "This field is required";
  if (!data.finance) errors.finance = "This field is required";
  if (!data.department?.trim()) errors.department = "Department name is required";
  if (!data.numOrganizers || parseInt(data.numOrganizers) < 1)
    errors.numOrganizers = "At least 1 organizer is required";
  const organizerErrors = (data.organizers || []).map((org) => {
    const err = {};
    if (!org.name?.trim()) err.name = "Name is required";
    if (!org.department) err.department = "Department is required";
    if (!org.mobile?.trim()) err.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(org.mobile.trim())) err.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!org.designation?.trim()) err.designation = "Designation is required";
    if (!org.empId?.trim()) err.empId = "Employee ID is required";
    return err;
  });
  if (organizerErrors.some((o) => Object.keys(o).length > 0)) errors.organizers = organizerErrors;
  if (!data.eventData?.eventName?.trim()) errors.eventName = "Event name is required";
  if (!data.eventData?.eventType) errors.eventType = "Event type is required";
  if (data.eventData?.eventType === "Other" && !data.eventData?.eventTypeOther?.trim()) errors.eventTypeOther = "Please specify the event type";
  if (!data.eventData?.society) errors.society = "Society is required";
  if (data.eventData?.society === "Other" && !data.eventData?.societyOther?.trim()) errors.societyOther = "Please specify the society";
  const logosArr = Array.isArray(data.eventData?.logos) ? data.eventData.logos : data.eventData?.logos ? [data.eventData.logos] : [];
  if (logosArr.length === 0) errors.logos = "Logos selection is required";
  if (logosArr.includes("Other") && !data.eventData?.logosOther?.trim()) errors.logosOther = "Please specify the logos";
  if (!data.eventData?.audience) errors.audience = "Target audience is required";
  if (!data.eventDays || !data.eventDays.length) errors.eventDays = "At least one event day is required";
  const dayErrors = (data.eventDays || []).map((day, idx) => {
    const e = {};
    if (!day.date) e.date = `Day ${idx + 1} date is required`;
    if (!day.startTime) e.startTime = `Start time is required`;
    if (!day.endTime) e.endTime = `End time is required`;
    if (day.startTime && day.endTime && day.endTime <= day.startTime) e.endTime = "End time must be after start time";
    if (!day.numGuests || parseInt(day.numGuests) < 1) e.numGuests = "At least 1 guest is required";
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
  if (!data.requirements || data.requirements.length === 0) errors.requirements = "Select at least one requirement";
  return errors;
};

const buildEventRequisitionPayload = ({ eventRequisition, user }) => {
  const fd = new FormData();
  fd.append("organizerId", user?._id ?? "");
  const requestDetails = {
    organizerDetails: {
      previousEventDocumentation: eventRequisition.doc === "Yes",
      previousEventReason: eventRequisition.doc === "No" ? eventRequisition.reason : "",
      isBudgetApproved: eventRequisition.budget === "Yes",
      financeRequired: eventRequisition.finance === "Yes",
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
      professionalSociety: eventRequisition.eventData.society ? [eventRequisition.eventData.society] : [],
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
      venueRequired: eventRequisition.requirements.includes("venue"),
      audioRequired: eventRequisition.requirements.includes("audio"),
      ictsRequired: eventRequisition.requirements.includes("icts"),
      transportRequired: eventRequisition.requirements.includes("transport"),
      accommodationRequired: eventRequisition.requirements.includes("accommodation"),
      mediaRequired: eventRequisition.requirements.includes("media"),
    },
  };
  fd.append("requestDetails", JSON.stringify(requestDetails));
  if (eventRequisition.doc === "Yes" && eventRequisition.file) {
    fd.append("previousEventDocumentation", eventRequisition.file);
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

const validateIctsData = (ictsData, venueData) => {
  const errors = {};
  Object.entries(ictsData).forEach(([dayIndex, venues]) => {
    const dayErrors = {};
    const selectedVenues = venueData[Number(dayIndex)]?.selectedVenues || [];
    selectedVenues.forEach((venueName) => {
      const card = venues?.[venueName] || {};
      const cardErrors = {};
      if (!card.desktopLaptop) cardErrors.desktopLaptop = "This field is required";
      if (!card.internetFacility) cardErrors.internetFacility = "This field is required";
      if (!card.expectedInternetUsers?.trim()) cardErrors.expectedInternetUsers = "This field is required";
      if (!card.proctorUsers?.trim()) cardErrors.proctorUsers = "This field is required";
      if (!card.guestWifi) cardErrors.guestWifi = "This field is required";
      if (card.guestWifi === "Yes" && !card.guestWifiExceed5) cardErrors.guestWifiExceed5 = "This field is required";
      if (!card.totalGuestCount?.trim()) cardErrors.totalGuestCount = "This field is required";
      if (!card.requirements || card.requirements.length === 0) cardErrors.requirements = "Select at least one requirement";
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
      ictses.push({
        dayIndex, venueName,
        desktopLaptop: card.desktopLaptop === "Yes",
        internetFacility: card.internetFacility || "",
        expectedInternetUsers: parseInt(card.expectedInternetUsers) || 0,
        proctoringUsers: parseInt(card.proctorUsers) || 0,
        guestWifiNeeded: card.guestWifi === "Yes",
        guestWifiExceed5: card.guestWifiExceed5 === "Yes",
        totalGuestCount: parseInt(card.totalGuestCount) || 0,
        requirements: card.requirements || [],
        otherRequirements: card.others || "",
        specialRequirements: card.specialRequirements || "",
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

const buildPurchasePayload = (purchaseData) => {
  const purchases = purchaseData.map((day, dayIndex) => {
    const requirementNeeded = [];
    if (day.requirementNeeded?.includes("Id Card")) requirementNeeded.push({ type: "Id Card", hardCount: parseInt(day.idCardQty) || 0, softCount: 0 });
    if (day.requirementNeeded?.includes("Certificate")) requirementNeeded.push({ type: "Certificate", hardCount: parseInt(day.certificateQty) || 0, softCount: 0 });
    const requiredFor = [];
    if (day.selectedPersons === "Students" || day.selectedPersons === "Both") requiredFor.push("Students");
    if (day.selectedPersons === "Guest" || day.selectedPersons === "Both") requiredFor.push("Guest");
    const buildPersonData = (personData = {}) => {
      const giftItems = [];
      if (personData.giftType?.includes("Trophy")) giftItems.push({ type: "Trophy", trophyTypes: personData.trophyType || [], basicQty: parseInt(personData.basicTrophyQty) || 0, eliteQty: parseInt(personData.eliteTrophyQty) || 0 });
      if (personData.giftType?.includes("Cash Prize")) giftItems.push({ type: "Cash Prize", amount: parseInt(personData.cashPrizeAmount) || 0 });
      if (personData.giftType?.includes("Voucher")) giftItems.push({ type: "Voucher", worth: personData.voucherWorth || "" });
      return { registrationKitNeeded: personData.registrationKitNeeded === "Yes", registrationKitQty: parseInt(personData.registrationKitQty) || 0, specialRequirements: personData.specialRequirements || "", giftItems };
    };
    return { dayIndex, requirementNeeded, requiredFor, students: buildPersonData(day.studentData), guests: buildPersonData(day.guestData) };
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

const buildMediaPayload = (mediaData) => {
  const mediaRequirements = mediaData.map((day, dayIndex) => {
    const typeOfMedia = [];
    if (day.designType === "Poster" || day.designType === "Both") typeOfMedia.push("poster");
    if (day.designType === "Video"  || day.designType === "Both") typeOfMedia.push("video");
    const sizes = [];
    (day.poster?.displayNeeded || []).forEach((type) => {
      if (type === "Flex") {
        if (day.poster?.sizeForFlex?.trim()) sizes.push({ type: "Flex", value: day.poster.sizeForFlex.trim() });
      } else if (type === "Glass Sticker") {
        if (day.poster?.sizeForGlass?.trim()) sizes.push({ type: "Glass Sticker", value: day.poster.sizeForGlass.trim() });
      } else {
        sizes.push({ type, value: "" });
      }
    });
    return {
      dayIndex, typeOfMedia,
      poster: {
        posterContent:             day.poster?.contentPoster       || "",
        referencePosterFiles:      [],
        certificateContent:        day.poster?.contentCertificate  || "",
        referenceCertificateFiles: [],
        trophyContent:             day.poster?.contentTrophy       || "",
        displayNeeded:             day.poster?.displayNeeded       || [],
        sizes,
        deliveryDate:        day.poster?.deliveryDate ? new Date(day.poster.deliveryDate).toISOString() : "",
        priority:            day.poster?.priority    || "",
        specialRequirements: day.poster?.specialReq  || "",
      },
      video: {
        videoContent:        day.video?.contentVideo  || "",
        preEventVideos:      day.video?.preEvent      || [],
        eventCoverage:       day.video?.eventCoverage || [],
        postEventVideos:     day.video?.postEvent     || [],
        specialVideos:       day.video?.specialVideos || [],
        referenceFiles:      [],
        deliveryDate:        day.video?.deliveryDate ? new Date(day.video.deliveryDate).toISOString() : "",
        priority:            day.video?.priority   || "",
        specialRequirements: day.video?.specialReq || "",
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
    if (!form.vistaTransport) err.vistaTransport = "Transport type is required";
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
  const errors = {};
  if (!accommodationData.checkIn) errors.checkIn = "Check-in date is required";
  if (!accommodationData.checkOut) errors.checkOut = "Check-out date is required";
  if (!accommodationData.roomType) errors.roomType = "Room type is required";
  return errors;
};

const buildPayloadForSection = (sectionKey, data) => {
  switch (sectionKey) {
    case "venue":               return { venueDetails: buildVenuePayload(data) };
    case "icts":                return { ictsDetails: buildIctsPayload(data) };
    case "purchase":            return { purchaseDetails: buildPurchasePayload(data) };
    case "media":               return buildMediaPayload(data);
    case "audio":               return { audioDetails: data };
    case "transport":           return { transportDetails: data };
    case "foodandrefreshments": return { foodDetails: data };
    case "accommodation":       return { accommodationDetails: data };
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
      previousEventDocumentation: formData.event.doc === "Yes",
      previousEventReason: formData.event.doc === "No" ? formData.event.reason : "",
      isBudgetApproved: formData.event.budget === "Yes",
      financeRequired: formData.event.finance === "Yes",
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
    foodDetails:         formData.foodandrefreshments,
    accommodationDetails: formData.accommodation,
  };
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Form() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [eventId, setEventId] = useState("");
  const [formData, setFormData] = useState({
    event: {
      doc: "", finance: "", budget: "", department: "", file: null,
      reason: "", numOrganizers: "", organizers: [],
      eventData: {}, eventDays: [], requirements: [],
    },
    venue: [], icts: {}, audio: defaultAudio,
    transport: [defaultTransport()],
    foodandrefreshments: [emptyFoodDay()],
    accommodation: defaultAccommodation,
    purchase: [emptyPurchaseDay()],
    media: [emptyMediaDay()],
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    foodandrefreshments: { label: "Food and Refreshments Details", component: FoodAndRefreshments },
    accommodation:       { label: "Accommodation Details",         component: AccommodationForm },
    purchase:            { label: "Purchase Details",              component: Purchase },
    media:               { label: "Media Requirement Details",     component: MediaForm },
  };

  const dynamicSteps = selectedRequirements.map((key) => ({ key, ...requirementMap[key] }));
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
      foodandrefreshments: ensureLength(prev.foodandrefreshments, dayCount, emptyFoodDay),
    }));
  }, [formData.event.eventDays.length]);

  const updateFormSection = useCallback((sectionKey, value) => {
    setFormData((prev) => ({ ...prev, [sectionKey]: value }));
  }, []);

  const handleVenueDataChange         = useCallback((v) => updateFormSection("venue",               v), [updateFormSection]);
  const handleIctsDataChange          = useCallback((v) => updateFormSection("icts",                v), [updateFormSection]);
  const handleAudioDataChange         = useCallback((v) => updateFormSection("audio",               v), [updateFormSection]);
  const handleTransportDataChange     = useCallback((v) => updateFormSection("transport",           v), [updateFormSection]);
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
        const payload = buildEventRequisitionPayload({ eventRequisition: sectionValueOrFormData, user });
        const method  = eventId ? "PUT" : "POST";
        const url     = eventId ? `${BASE_URL}/api/events/${eventId}` : `${BASE_URL}/api/events`;
        response = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: payload,
        });
      } else if (isFormDataPayload) {
        // ── Media with files: send as multipart, no Content-Type header ───
        // The browser sets Content-Type automatically with the correct boundary.
        response = await fetch(`${BASE_URL}/api/events/${eventIdRef.current}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: sectionValueOrFormData,
        });
      } else {
        const payload = buildPayloadForSection(sectionKey, sectionValueOrFormData);
        response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
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
  const submitEvent = async () => {
    if (!eventId) { setApiError("No event ID available for submit."); return; }
    setIsLoading(true);
    setApiError("");
    try {
      const fullPayload = buildFullSubmitPayload(formDataRef.current, selectedRequirements, user);
      const response = await fetch(`${BASE_URL}/api/events/${eventId}/submit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(fullPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);
      setSubmitSuccess(true);
    } catch (error) {
      setApiError(error.message || "Unable to submit event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── registerChildNavigation ───────────────────────────────────────────────
  // Accepts the extended nav object from MediaForm:
  //   { next, prev, isLoading, isOnLastDay, nextDayLabel }
  // For all other forms, isOnLastDay defaults to true (no day tabs to track).
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

  // ── handleBack ────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (childNav.prev) { childNav.prev(); return; }
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // ── Button logic ──────────────────────────────────────────────────────────
  // isLastParentStep: true when we are on the last step in the parent's step list.
  // showSubmit:       true only when it's the last parent step AND the child
  //                   signals it is also on its last day (isOnLastDay).
  //                   This prevents Submit appearing on Day 1 of a 2-day MediaForm.
  const isLastParentStep = currentStep === steps.length - 1;
  const showSubmit       = isLastParentStep && childNav.isOnLastDay;

  // Label for the forward button when it's "Save & Next" territory
  const forwardLabel = () => {
    if (isLoading || childNav.isLoading) return "Saving...";
    // Child is on a non-last day → show the day label it gave us (e.g. "Day 2 →")
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
      // onSave receives a FormData built by MediaForm (includes File objects).
      // We pass it directly to saveSection which detects FormData and skips
      // JSON serialisation, sending it as multipart so files reach the backend.
      onSave: async (formDataPayload) => {
        const ok = await saveSection("media", formDataPayload);
        if (ok) advanceStep();
      },
    },
  };

  const progress = currentStep === 0 ? 0 : Math.min(20 + (currentStep - 1) * 10, 100);

  // Full-page success screen
  if (submitSuccess) {
    return (
      <FormSubmitted
        onSubmitAnother={() => { navigate("/dashboard"); }}
      />
    );
  }

  if (!CurrentComponent) return null;

  return (
    <div className="flex h-screen bg-[#16162A]">
      <div className="w-[325px] flex-shrink-0">
        <EventsSidebar steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden ">
        <div className="px-6 pt-4 pb-3 border-[#2A2A45] ">
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

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
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

        <div className="px-6 pb-6">
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
                onClick={submitEvent}
                disabled={!eventId || isLoading || childNav.isLoading}
                className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading || childNav.isLoading ? "Submitting..." : "Submit"}
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