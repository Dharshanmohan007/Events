import React from "react";
import Logo from "../assets/logo.svg";
import SidebarDesign from "../assets/SidebarDesign.svg";

export default function EventsSidebar({ steps = [], currentStep = 0 }) {
  return (
    <div className="h-full bg-[#292946] p-6 flex flex-col relative overflow-hidden">

      {/* Logo */}
      <img src={Logo} alt="Logo" className="mb-8 w-40 z-10" />

      {/* Steps */}
      <div className="flex flex-col gap-4 z-10">
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
            {/* Step Number */}
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full border text-sm
                ${index === currentStep ? "border-white" : "border-gray-400"}
              `}
            >
              {index + 1}
            </div>

            {/* Step Label */}
            <span className="text-sm">{step.label}</span>
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