import React from "react";
import Logo from "../assets/logo.svg";
import SidebarDesign from "../assets/SidebarDesign.svg";

export default function EventsSidebar({ steps = [], currentStep = 0, completedSteps = [] }) {
  return (
    <div className="h-full bg-[#292946] p-6 flex flex-col relative overflow-hidden">

      {/* Logo */}
      <img src={Logo} alt="Logo" className="mb-8 w-40 z-10" />

      {/* Steps */}
      <div className="flex flex-col gap-1 z-10">
        {steps.map((step, index) => (
          <div
            key={step.key || index}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200
              ${
                index === currentStep
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  : "text-gray-300 hover:bg-[#3A3A5A]"
              }
            `}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full text-sm border
                ${
                  completedSteps.includes(index)
                    ? "bg-purple-600 border-purple-600 text-white"
                    : index === currentStep
                    ? "border-white text-white"
                    : "border-gray-400 text-gray-300"
                }
              `}
            >
              {completedSteps.includes(index) ? (
                // ✅ Tick Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step Label */}
            <span className="text-md">{step.label}</span>
          </div>
        ))}
      </div>
      {/* ✅ FIXED BOTTOM-LEFT DESIGN */}
      <img
        src={SidebarDesign}
        alt="Sidebar Design"
        className="absolute bottom-0 left-0 w-[40%] opacity-90 pointer-events-none"
      />
    </div>
  );
}