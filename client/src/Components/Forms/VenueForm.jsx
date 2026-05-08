import React from "react";

export default function VenueForm({ nextStep }) {
  return (
    <div>
      <h2 className="text-white text-lg mb-4">Venue Details</h2>

 
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Enter Venue Name"
          className="
            w-full p-3
            bg-transparent
            border border-gray-600
            rounded-lg
            text-white
            placeholder-gray-400
            outline-none
            transition-all duration-200

            focus:border-purple-400
            focus:ring-1
            focus:ring-purple-500
            focus:bg-transparent

            active:bg-transparent
          "
        />
      </div>

      {/* Next Button */}
      <button
        onClick={nextStep}
        className="
          bg-purple-600
          hover:bg-purple-700
          transition-colors
          px-6 py-2
          rounded-lg
          text-white
        "
      >
        Next
      </button>
    </div>
  );
}