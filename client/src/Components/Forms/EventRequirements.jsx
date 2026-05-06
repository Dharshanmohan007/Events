// import React, { useState } from "react";
// import CustomSelect from "../CustomSelect";

// export default function EventRequirements({ nextStep, setSelectedRequirements }) {
//   const [values, setValues] = useState({
//     venue: "", icts: "", audio: "", transport: "",
//     foodandrefreshments: "", accommodation: "", purchase: "", media: "",
//   });
//   const [errors, setErrors] = useState({});

//   const handleChange = (key, val) => {
//     setValues((prev) => ({ ...prev, [key]: val }));
//     setErrors((prev) => ({ ...prev, [key]: "" }));
//   };

//   const validate = () => {
//     const newErrors = {};
//     Object.keys(values).forEach((key) => {
//       if (!values[key]) {
//         newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
//       }
//     });
//     return newErrors;
//   };

//   const handleNext = () => {
//     const errs = validate();
//     if (Object.keys(errs).length > 0) {
//       setErrors(errs);
//       return;
//     }
//     const selected = Object.keys(values).filter((key) => values[key] === "Yes");
//     setSelectedRequirements(selected);
//     nextStep();
//   };

//   return (
//     <div className='p-6 rounded-xl'>
//       <h1 className="text-white text-lg font-bold mb-6">Event Requirements</h1>
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         {Object.keys(values).map((key) => (
//           <div key={key}>
//             <CustomSelect
//               label={`${key.charAt(0).toUpperCase() + key.slice(1)} Required`}
//               value={values[key]}
//               onChange={(val) => handleChange(key, val)}
//               options={["Yes", "No"]}
//             />
//             {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
//           </div>
//         ))}
//       </div>
      
//       <div className="flex justify-end">
//         <button onClick={handleNext} className="bg-purple-600 text-white px-6 py-2 rounded-lg">
//           Next →
//         </button>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import CustomSelect from "../CustomSelect";

export default function EventRequirements({ nextStep, setSelectedRequirements, isLoading = false }) {
  const [values, setValues] = useState({
    venue: "", icts: "", purchase: "", media: "", audio: "", transport: "",
    foodandrefreshments: "", accommodation: "", 
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const selected = Object.keys(values).filter((key) => values[key] === "Yes");
    setSelectedRequirements(selected);
    // Pass selected requirements directly to nextStep so parent can use them immediately
    nextStep(selected);
  };

  const LABEL_MAP = {
    venue: "Venue",
    icts: "ICTS",
    audio: "Audio",
    transport: "Transport",
    foodandrefreshments: "Food & Refreshments",
    accommodation: "Accommodation",
    purchase: "Purchase",
    media: "Media",
  };

  return (
    <div className='p-6 rounded-xl'>
      <h1 className="text-white text-lg font-bold mb-6">Event Requirements</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(values).map((key) => (
          <div key={key}>
            <CustomSelect
              label={`${LABEL_MAP[key] || key} Required`}
              value={values[key]}
              onChange={(val) => handleChange(key, val)}
              options={["Yes", "No"]}
            />
            {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save & Next →"
          )}
        </button>
      </div>
    </div>
  );
}