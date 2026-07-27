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
import { ChevronRight } from 'lucide-react';

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
        media: "Media Details",
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
        <div className="h-screen bg-[#0B1326] text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
                <h1 className="text-2xl font-bold">
                Event Preview
                </h1>

                <p className="text-sm text-white/70">
                Lorem ipsum testing content
                </p>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <div className="w-[320px] p-5 overflow-y-auto">
                    <div
                        className="
                        border-2 border-[#2D2D4B]
                        rounded-xl
                        p-4
                        bg-[#FFFFFF0D]
                        min-h-[600px]
                        "
                    >
                        <div className="flex flex-col gap-4">
                            {tabs.map((tab) => (
                                <button
                                key={tab.key}
                                onClick={() => setSelectedTab(tab.key)}
                                className={`
                                    w-full flex items-center justify-between
                                    rounded-xl px-4 py-3
                                    transition-all duration-300
                                    backdrop-blur-[20px]
                                    ${
                                    selectedTab === tab.key
                                        ? "bg-[#8B5CF61A] shadow-[inset_0_0_20px_0_#8B5CF61A] text-white"
                                        : "bg-[#FFFFFF0D] text-white/80 hover:text-white"
                                    }
                                `}
                                >
                                <span>{tab.label}</span>
                                <ChevronRight size={18} />
                                </button>
                            ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Preview */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="min-h-full">
                        {renderPreview()}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
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
            </div>
        );
    }