import React, { useState } from "react";
import EventsSidebar from "../Components/EventsSidebar";

import EventRequistionDetails from "../Components/Forms/EventRequistionDetails";
import VenueForm from "../Components/Forms/VenueForm";
import AudioForm from "../Components/Forms/AudioForm";
import ICTSForm from "../Components/Forms/IctsForm";
import TransportForm from "../Components/Forms/TransportForm";
import FoodAndRefreshments from "../Components/Forms/FoodAndRefreshments";
import AccommodationForm from "../Components/Forms/AccommodationForm";
import Purchase from "../Components/Forms/Purchase";
import MediaForm from "../Components/Forms/MediaForm";

export default function Form() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRequirements, setSelectedRequirements] = useState([]);

  // Step Definitions
  const baseSteps = [
    { key: "event", label: "Event Request Details", component: EventRequistionDetails },
  ];

  const requirementMap = {
    venue: { label: "Venue Details", component: VenueForm },
    audio: { label: "Audio Details", component: AudioForm },
    icts: { label: "ICTS Details", component: ICTSForm },
    foodandrefreshments: { label: "Food and Refreshments Details", component: FoodAndRefreshments },
    transport: { label: "Transport Details", component: TransportForm },
    accommodation: { label: "Accommodation Details", component: AccommodationForm },
    purchase: { label: "Purchase Details", component: Purchase },
    media: { label: "Media Details", component: MediaForm },
    
  };

  const dynamicSteps = selectedRequirements.map((key) => ({
    key,
    ...requirementMap[key],
  }));

  const steps = [...baseSteps, ...dynamicSteps];

  const CurrentComponent = steps[currentStep]?.component;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="flex h-screen bg-[#16162A]">
      
      {/* Sidebar (INCREASED WIDTH) */}
      <div className="w-[320px]">
        <EventsSidebar steps={steps} currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-4 pb-3">
          <h1 className="text-white text-xl font-bold">
            {steps[currentStep]?.label}
          </h1>

          <div className="w-full h-2 bg-gray-700 rounded mt-3">
            <div
              className="h-full bg-purple-500 rounded"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CurrentComponent
            nextStep={nextStep}
            setSelectedRequirements={setSelectedRequirements}
          />
        </div>

      </div>
    </div>
  );
}