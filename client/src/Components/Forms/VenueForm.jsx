import React from "react";

export default function VenueForm({ nextStep }) {
  return (
    <div>
      <h2 className="text-white text-lg mb-4">Venue Details</h2>

      

      <input
        className="w-full p-3 bg-transparent border border-gray-600 rounded mb-4 text-white"
        placeholder="Enter Venue Name"
      />

      <button
        onClick={nextStep}
        className="bg-purple-600 px-6 py-2 rounded text-white"
      >
        Next
      </button>
    </div>
  );
}