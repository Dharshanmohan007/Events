// import React, { useState } from "react";
// import EventsSidebar from "../Components/EventsSidebar";

// import EventRequistionDetails from "../Components/Forms/EventRequistionDetails";
// import VenueForm from "../Components/Forms/VenueForm";
// import AudioForm from "../Components/Forms/AudioForm";
// import ICTSForm from "../Components/Forms/IctsForm";
// import TransportForm from "../Components/Forms/TransportForm";
// import FoodAndRefreshments from "../Components/Forms/FoodAndRefreshments";
// import AccommodationForm from "../Components/Forms/AccommodationForm";
// import Purchase from "../Components/Forms/Purchase";
// import MediaForm from "../Components/Forms/MediaForm";

// export default function Form() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [completedSteps, setCompletedSteps] = useState([]);
//   const [selectedRequirements, setSelectedRequirements] = useState([]);

//   // Step Definitions
//   const baseSteps = [
//     { key: "event", label: "Event Requistion Details", component: EventRequistionDetails },
//   ];

//   const requirementMap = {
//     venue: { label: "Venue Details", component: VenueForm },
//     icts: { label: "ICTS Details", component: ICTSForm },
//     audio: { label: "Audio Details", component: AudioForm },
//     transport: { label: "Transport Details", component: TransportForm },
//     foodandrefreshments: { label: "Food and Refreshments Details", component: FoodAndRefreshments },
//     accommodation: { label: "Accommodation Details", component: AccommodationForm },
//     purchase: { label: "Purchase Details", component: Purchase },
//     media: { label: "Media Requirement Details", component: MediaForm },
    
//   };

//   const dynamicSteps = selectedRequirements.map((key) => ({
//     key,
//     ...requirementMap[key],
//   }));

//   const steps = [...baseSteps, ...dynamicSteps];

//   const CurrentComponent = steps[currentStep]?.component;

//   // const nextStep = () => {
//   //   if (currentStep < steps.length - 1) {
//   //     setCurrentStep((prev) => prev + 1);
//   //   }
//   // };

//   const handleNext = () => {
//   setCompletedSteps((prev) => {
//     if (!prev.includes(currentStep)) {
//       return [...prev, currentStep];
//     }
//     return prev;
//   });

//   setCurrentStep((prev) => prev + 1);
// };
//   return (
//     <div className="flex h-screen bg-[#16162A]">
      
//       {/* Sidebar (INCREASED WIDTH) */}
//       <div className="w-[320px]">
//         <EventsSidebar steps={steps} currentStep={currentStep} completedSteps={completedSteps}/>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">

//         {/* Header */}
//         <div className="px-6 pt-4 pb-3">
//           <h1 className="text-white text-xl font-bold">
//             {steps[currentStep]?.label}
//           </h1>

//           <div className="w-full h-2 bg-gray-700 rounded mt-3">
//             <div
//               className="h-full bg-purple-500 rounded"
//               style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Form Content */}
//         <div className="flex-1 overflow-y-auto px-6 py-4">
//           <CurrentComponent
//             nextStep={handleNext}
//             setSelectedRequirements={setSelectedRequirements}
//           />
//         </div>

//       </div>
//     </div>
//   );
// }




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
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  // Store event days from EventDetails form so downstream steps can use them
  const [eventDays, setEventDays] = useState([]);

  // Step Definitions
  const baseSteps = [
    { key: "event", label: "Event Requisition Details", component: EventRequistionDetails },
  ];

  const requirementMap = {
    venue: { label: "Venue Details", component: VenueForm },
    icts: { label: "ICTS Details", component: ICTSForm },
    audio: { label: "Audio Details", component: AudioForm },
    transport: { label: "Transport Details", component: TransportForm },
    foodandrefreshments: { label: "Food and Refreshments Details", component: FoodAndRefreshments },
    accommodation: { label: "Accommodation Details", component: AccommodationForm },
    purchase: { label: "Purchase Details", component: Purchase },
    media: { label: "Media Requirement Details", component: MediaForm },
  };

  const dynamicSteps = selectedRequirements.map((key) => ({
    key,
    ...requirementMap[key],
  }));

  const steps = [...baseSteps, ...dynamicSteps];

  const CurrentComponent = steps[currentStep]?.component;

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

  return (
    <div className="flex h-screen bg-[#16162A]">
      {/* Sidebar */}
      <div className="w-[280px] flex-shrink-0">
        <EventsSidebar steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-[#2A2A45]">
          <h1 className="text-white text-xl font-bold">
            {steps[currentStep]?.label}
          </h1>
          <div className="w-full h-1.5 bg-gray-700 rounded mt-3">
            <div
              className="h-full bg-purple-500 rounded transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CurrentComponent
            nextStep={handleNext}
            prevStep={handleBack}
            setSelectedRequirements={setSelectedRequirements}
            eventDays={eventDays}
            setEventDays={setEventDays}
          />
        </div>
      </div>
    </div>
  );
}