import React, {useMemo,  useState } from "react";
import EventPreview from "../Components/Preview/EventPreview";

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

    // const renderPreview = () => {
    //     switch (selectedTab) {
    //     case "event":
    //         return (
    //         <div className="space-y-5">
    //             <h2 className="text-2xl font-semibold">
    //             Event Requisition Details
    //             </h2>

    //             <div className="grid grid-cols-2 gap-5">
    //             <PreviewCard
    //                 title="Department"
    //                 value={formData?.event?.department}
    //             />

    //             <PreviewCard
    //                 title="Budget Approved"
    //                 value={formData?.event?.budget}
    //             />

    //             <PreviewCard
    //                 title="Finance Required"
    //                 value={formData?.event?.finance}
    //             />

    //             <PreviewCard
    //                 title="Event Name"
    //                 value={formData?.event?.eventData?.eventName}
    //             />

    //             <PreviewCard
    //                 title="Event Type"
    //                 value={formData?.event?.eventData?.eventType}
    //             />

    //             <PreviewCard
    //                 title="Target Audience"
    //                 value={formData?.event?.eventData?.audience}
    //             />

    //             <PreviewCard
    //                 title="Number Of Days"
    //                 value={formData?.event?.eventDays?.length}
    //             />
    //             </div>
    //         </div>
    //         );

    //     case "venue":
    //         return (
    //         <ComingSoon
    //             title="Venue Details Preview"
    //             data={formData?.venue}
    //         />
    //         );

    //     case "icts":
    //         return (
    //         <ComingSoon
    //             title="ICTS Details Preview"
    //             data={formData?.icts}
    //         />
    //         );

    //     case "audio":
    //         return (
    //         <ComingSoon
    //             title="Audio Details Preview"
    //             data={formData?.audio}
    //         />
    //         );

    //     case "transport":
    //         return (
    //         <ComingSoon
    //             title="Transport Details Preview"
    //             data={formData?.transport}
    //         />
    //         );

    //     case "foodandrefreshments":
    //         return (
    //         <ComingSoon
    //             title="Food & Refreshments Preview"
    //             data={formData?.foodandrefreshments}
    //         />
    //         );

    //     case "accommodation":
    //         return (
    //         <ComingSoon
    //             title="Accommodation Preview"
    //             data={formData?.accommodation}
    //         />
    //         );

    //     case "purchase":
    //         return (
    //         <ComingSoon
    //             title="Purchase Preview"
    //             data={formData?.purchase}
    //         />
    //         );

    //     case "media":
    //         return (
    //         <ComingSoon
    //             title="Media Preview"
    //             data={formData?.media}
    //         />
    //         );

    //     default:
    //         return null;
    //     }
    // };

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

                {/* {renderPreview()} */}
                <EventPreview
                    eventRequisition={formData?.event}
                />

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

    function PreviewCard({ title, value }) {
    return (
        <div className="bg-[#272742] rounded-lg p-4">

        <p className="text-gray-400 text-sm">
            {title}
        </p>

        <p className="mt-2 text-white font-medium">
            {value || "-"}
        </p>

        </div>
    );
    }

    function ComingSoon({ title, data }) {
    return (
        <div>

        <h2 className="text-2xl font-semibold mb-6">
            {title}
        </h2>

        <pre className="bg-[#272742] rounded-lg p-5 overflow-auto text-sm whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
        </pre>

        </div>
    );
    }