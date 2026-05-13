import React, { useState, useRef, useEffect } from "react";
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

export default function Form() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [eventDays, setEventDays] = useState([]);
  const [eventId, setEventId] = useState("");
  const [eventRequisition, setEventRequisition] = useState({
    doc: "",
    finance: "",
    budget: "",
    department: "",
    file: null,
    reason: "",
    numOrganizers: "",
    organizers: [],
    eventData: {},
    eventDays: [],
  });

  // Shared cross-form state
  const [venueData, setVenueData] = useState([]); // passed from VenueForm → IctsForm
  const [ictsData, setIctsData] = useState({}); // ICTS form data
  const [audioData, setAudioData] = useState({}); // Audio form data
  const [transportData, setTransportData] = useState({}); // Transport form data
  const [foodData, setFoodData] = useState({}); // Food and refreshments form data
  const [accommodationData, setAccommodationData] = useState({}); // Accommodation form data
  const [purchaseData, setPurchaseData] = useState({}); // Purchase form data
  const [mediaData, setMediaData] = useState({}); // Media form data

  // Scroll container ref — used to reset scroll to top on every step change
  const scrollContainerRef = useRef(null);

  // Base Step
  const baseSteps = [
    {
      key: "event",
      label: "Event Requisition Details",
      component: EventRequistionDetails,
    },
  ];

  // Dynamic Steps
  const requirementMap = {
    venue: { label: "Venue Details", component: VenueForm },
    icts: { label: "ICTS Details", component: ICTSForm },
    audio: { label: "Audio Details", component: AudioForm },
    transport: { label: "Transport Details", component: TransportForm },
    foodandrefreshments: {
      label: "Food and Refreshments Details",
      component: FoodAndRefreshments,
    },
    accommodation: {
      label: "Accommodation Details",
      component: AccommodationForm,
    },
    purchase: { label: "Purchase Details", component: Purchase },
    media: { label: "Media Requirement Details", component: MediaForm },
  };

  const dynamicSteps = selectedRequirements.map((key) => ({
    key,
    ...requirementMap[key],
  }));

  const steps = [...baseSteps, ...dynamicSteps];
  const CurrentComponent = steps[currentStep]?.component;

  // Scroll the content area back to top whenever the step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const getProgressPercentage = () => {
    if (currentStep === 0) return 0;
    const progress = 20 + (currentStep - 1) * 10;
    return Math.min(progress, 100);
  };

  const progress = getProgressPercentage();

  const handleNext = () => {
    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Extra props per step key
  const extraProps = {
    event: { user, eventRequisition, setEventRequisition, setEventDays },
    venue: { venueData, onVenueDataChange: setVenueData },
    icts: { venueData, ictsData, onIctsDataChange: setIctsData },
    audio: { audioData, onAudioDataChange: setAudioData },
    transport: { transportData, onTransportDataChange: setTransportData },
    foodandrefreshments: { foodData, onFoodDataChange: setFoodData },
    accommodation: { accommodationData, onAccommodationDataChange: setAccommodationData },
    purchase: { purchaseData, onPurchaseDataChange: setPurchaseData },
    media: { mediaData, onMediaDataChange: setMediaData },
  };

  const currentStepKey = steps[currentStep]?.key;

  return (
    <div className="flex h-screen bg-[#16162A]">
      {/* Sidebar */}
      <div className="w-[325px] flex-shrink-0">
        <EventsSidebar
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-[#2A2A45]">
          <h1 className="text-white text-xl font-bold playfair">
            {steps[currentStep]?.label}
          </h1>

          {/* Progress Bar */}
          <div className="flex flex-row gap-5">
            <div className="w-full h-1.5 bg-gray-700 rounded mt-3">
              <div
                className="h-full bg-purple-500 rounded transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {progress}%
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
          <CurrentComponent
            nextStep={handleNext}
            prevStep={handleBack}
            setSelectedRequirements={setSelectedRequirements}
            eventDays={eventDays}
            setEventDays={setEventDays}
            eventId={eventId}
            setEventId={setEventId}
            {...(extraProps[currentStepKey] || {})}
          />
        </div>
      </div>
    </div>
  );
}