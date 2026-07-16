import React, {useMemo,  useState } from "react";
import EventPreview from "../Components/Preview/EventPreview";
import VenuePreview from "../Components/Preview/VenuePreview";
import ICTSPreview from "../Components/Preview/ICTSPreview";
import AudioPreview from "../Components/Preview/AudioPreview";
import TransportPreview from "../Components/Preview/TransportPreview";
import FoodRefreshmentPreview from "../Components/Preview/FoodPreview";
import AccommodationPreview from "../Components/Preview/AccommodationPreview";
import PurchasePreview from "../Components/Preview/PurchasePreview";
import MediaPreview from "../Components/Preview/MediaPreview";

export default function EventPreviewPage({
    formData,
    selectedRequirements,
    onBack,
    onSubmit,
    isLoading,
    eventId,
    }) {
    const requirementMap = {
        venue: "Venue Details",
        icts: "ICTS Details",
        audio: "Audio Details",
        transport: "Transport Details",
        foodandrefreshments: "Food & Refreshments",
        accommodation: "Accommodation Details",
        purchase: "Purchase Details",
        media: "Media Requirement Details",
    };

    const requirementKeys = Array.isArray(selectedRequirements)
        ? selectedRequirements
        : Object.entries(selectedRequirements || {})
            .filter(([, value]) => value === "Yes")
            .map(([key]) => key);

    const tabs = useMemo(() => {
        return [
        {
            key: "event",
            label: "Event Requisition Details",
        },
        ...requirementKeys.map((key) => ({
            key,
            label: requirementMap[key],
        })),
        ];
    }, [selectedRequirements]);

    const [selectedTab, setSelectedTab] = useState("event");

    const renderPreview = () => {
        switch (selectedTab) {
            case "event":
                return (
                    <EventPreview
                        eventRequisition={formData?.event}
                    />
                );
            case "venue":
                return (
                    <VenuePreview
                        venueData={formData?.venue}
                        eventDays={formData?.event?.eventDays}
                    />
                );
            case "icts":
                return (
                    <ICTSPreview
                        ictsData={formData?.icts}
                        venueData={formData?.venue}
                        eventDays={formData?.event?.eventDays}
                    />
                );
            case "audio":
                return (
                    <AudioPreview
                        audio={formData?.audio}
                        eventDays={formData?.event?.eventDays}
                        venueData={formData?.venue}
                    />
                );
            case "transport":
                return (
                    <TransportPreview
                        transportData={formData?.transport}
                    />
                );
            case "foodandrefreshments":
                return (
                    <FoodRefreshmentPreview foodData={formData?.foodandrefreshments} />
                );
            case "accommodation":
                return (
                    <AccommodationPreview
                        accommodationData={formData?.accommodation}
                        eventDays={formData?.event?.eventDays}
                    />
                );
            case "purchase":
                return (
                    <PurchasePreview
                        purchase={formData?.purchase}
                        eventDays={formData?.event?.eventDays}
                    />
                );
            case "media":
                return (
                    <MediaPreview
                        mediaData={formData?.media}
                        eventDays={formData?.event?.eventDays}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-[#16162A] text-white flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[320px] bg-[#1C1C34] border-r border-[#2D2D4B] p-5 overflow-y-auto">
            <h1 className="text-xl font-bold mb-8">
            Event Preview
            </h1>
            <div className="space-y-2">
            {tabs.map((tab) => (
                <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`w-full text-left rounded-lg px-4 py-3 transition
                    ${
                    selectedTab === tab.key
                        ? "bg-[#7C3AED] text-white"
                        : "bg-[#23233F] hover:bg-[#2F2F4E]"
                    }
                `}
                >
                {tab.label}
                </button>
            ))}
            </div>
        </div>

        {/* Right */}

        <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
            <div className="bg-[#1E1E36] rounded-xl p-8">
                {renderPreview()}
            </div>
            </div>
            <div className="border-t border-[#2D2D4B] p-6">
            <div className="flex justify-between">
                <button
                onClick={onBack}
                className="border border-purple-500 text-purple-400 rounded-lg px-6 py-2 hover:bg-purple-500/10"
                >
                ← Back To Form
                </button>
                <button
                onClick={onSubmit}
                disabled={!eventId || isLoading}
                className="bg-purple-600 rounded-lg px-6 py-2 hover:bg-purple-700 disabled:opacity-50"
                >
                {isLoading ? "Submitting..." : "Submit Event"}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
    }