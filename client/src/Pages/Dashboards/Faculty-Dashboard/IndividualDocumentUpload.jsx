import { useState } from "react";
import { useParams } from "react-router-dom";
import { Upload, Plus, Calendar, Trash2 } from "lucide-react";
import { API_BASE } from "../../../utils/apiConfig";

export default function IndividualDocumentUpload({
  requestType = "Expenditure Request",
  sectionTitle = "Expenditure Details",
}) {
  const { eventId } = useParams();
  const requestKey = (() => {
    const label = String(requestType || "").toLowerCase();
    if (label.includes("purchase")) return "purchase";
    if (label.includes("transport")) return "transport";
    if (label.includes("media")) return "media";
    return "food";
  })();
  const [foodDetails, setFoodDetails] = useState([
    { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }
  ]);
  const [miscDetails, setMiscDetails] = useState([
    { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }
  ]);
  const [remarks, setRemarks] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFoodChange = (index, field, value) => {
    setFoodDetails((currentDetails) => currentDetails.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleMiscChange = (index, field, value) => {
    setMiscDetails((currentDetails) => currentDetails.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleFileUpload = (file, section, index) => {
    if (!file) return;

    const change = section === "food" ? handleFoodChange : handleMiscChange;
    if (file.size > 1024 * 1024) {
      change(index, "file", null);
      change(index, "fileError", "File is more than 1 MB");
      return;
    }

    change(index, "file", file);
    change(index, "fileError", "");
  };

  const handleFileDrop = (e, section, index) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files?.[0], section, index);
  };

  const removeFile = (section, index) => {
    if (section === "food") {
      handleFoodChange(index, "file", null);
      handleFoodChange(index, "fileError", "");
    } else {
      handleMiscChange(index, "file", null);
      handleMiscChange(index, "fileError", "");
    }
  };

  const addFoodRow = () => {
    setFoodDetails([...foodDetails, { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }]);
  };

  const addMiscRow = () => {
    setMiscDetails([...miscDetails, { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }]);
  };

  const removeFoodRow = (index) => {
    setFoodDetails(foodDetails.filter((_, rowIndex) => rowIndex !== index));
  };

  const removeMiscRow = (index) => {
    setMiscDetails(miscDetails.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!eventId) {
      setSubmitError("Request ID is missing");
      return;
    }

    const hasDetails = (item) => (
      item.name || item.billNo || item.billDate || item.vendor || item.amount || item.file
    );
    const getFilledRows = (rows) => rows.filter(hasDetails);
    const foodRows = getFilledRows(foodDetails);
    const miscRows = getFilledRows(miscDetails);

    if (!foodRows.length && !miscRows.length) {
      setSubmitError("Please enter at least one expenditure");
      return;
    }

    const invalidFile = [...foodDetails, ...miscDetails].find((item) => item.fileError);
    if (invalidFile) {
      setSubmitError(invalidFile.fileError);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("requestId", eventId);

      const foodPayload = foodRows.map((item) => ({
        expenseName: item.name,
        billNo: item.billNo,
        billDate: item.billDate,
        vendorOrGuestName: item.vendor,
        amount: item.amount,
      }));
      const othersPayload = miscRows.map((item) => ({
        expenseName: item.name,
        billNo: item.billNo,
        billDate: item.billDate,
        vendorOrGuestName: item.vendor,
        amount: item.amount,
      }));

      formData.append(requestKey, JSON.stringify(foodPayload));
      formData.append("others", JSON.stringify(othersPayload));
      formData.append("remarks", remarks);

      foodRows.forEach((item) => {
        if (item.file) formData.append(`${requestKey}Files`, item.file, item.file.name);
      });
      miscRows.forEach((item) => {
        if (item.file) formData.append("othersFiles", item.file, item.file.name);
      });

      if (foodRows[0]?.file) formData.append(`${requestKey}File`, foodRows[0].file, foodRows[0].file.name);
      if (miscRows[0]?.file) formData.append("othersFile", miscRows[0].file, miscRows[0].file.name);

      const response = await fetch(`${API_BASE}/api/individual/expenditure`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Unable to upload expenditure details");
      }

      setSubmitSuccess("Expenditure details uploaded successfully");
    } catch (error) {
      setSubmitError(error.message || "Unable to upload expenditure details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-slate-400">
        <span>{requestType}</span> <span className="mx-2">›</span> <span>Expenditure Details</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Expenditure Details</h1>
        {/* <p className="text-slate-400 text-xs">Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s</p> */}
      </div>

      {/* Food Details Section */}
      <div className="mb-12">
        {foodDetails.map((item, index) => (
          <div key={index} className="mb-8 last:mb-0 bg-[#191D36] border border-slate-700/50 p-6 rounded-lg">
            {index === 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-purple-400">{sectionTitle}</h2>
                <button
                  onClick={addFoodRow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {index > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={() => removeFoodRow(index)}
                  className="border border-red-500/60 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
            {/* Name of expense */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Name of the expense <span className=""></span>
              </label>
              <input
                type="text"
                placeholder="e.g.pcs"
                value={item.name}
                onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bill No and Bill Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill No <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={item.billNo}
                  onChange={(e) => handleFoodChange(index, "billNo", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill Date <span className=""></span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={item.billDate}
                    onChange={(e) => handleFoodChange(index, "billDate", e.target.value)}
                    className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer pr-10"
                    style={{ colorScheme: 'dark' }}
                  />
                  {item.billDate && <span className="absolute right-10 top-2.5 text-slate-300 text-sm pointer-events-none">{new Date(item.billDate).toLocaleDateString()}</span>}
                 
                </div>
              </div>
            </div>

            {/* Vendor and Amount */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Vendor / Guest name <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g.Vikram"
                  value={item.vendor}
                  onChange={(e) => handleFoodChange(index, "vendor", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Amount <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="₹"
                  value={item.amount}
                  onChange={(e) => handleFoodChange(index, "amount", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Upload (if have any supporting document )
              </label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "food", index)}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded px-4 py-6 cursor-pointer hover:border-slate-500 transition"
              >
                <Upload size={20} className="mb-2 text-slate-400" />
                {item.file ? (
                  <div className="relative flex w-full justify-center text-slate-300 text-xs">
                    <span>{item.file.name}</span>
                    <button
                      type="button"
                      aria-label="Delete uploaded file"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile("food", index);
                      }}
                      className="absolute right-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Drag and drop the files here or <span className="text-purple-500">choose file</span></span>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "food", index)}
                  className="hidden"
                />
              </label>
              {item.fileError && <p className="mt-2 text-xs text-red-400">{item.fileError}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Miscellaneous Section */}
      <div className="mb-12">
        {miscDetails.map((item, index) => (
          <div key={index} className="mb-8 last:mb-0 bg-[#191D36] border border-slate-700/50 p-6 rounded-lg">
            {index === 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-purple-400">miscellaneous ( others )</h2>
                <button
                  onClick={addMiscRow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {index > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={() => removeMiscRow(index)}
                  className="border border-red-500/60 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
            {/* Name of expense */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Name of the expense <span className=""></span>
              </label>
              <input
                type="text"
                placeholder="e.g.pcs"
                value={item.name}
                onChange={(e) => handleMiscChange(index, "name", e.target.value)}
                className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bill No and Bill Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill No <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="111632782"
                  value={item.billNo}
                  onChange={(e) => handleMiscChange(index, "billNo", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill Date <span className=""></span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={item.billDate}
                    onChange={(e) => handleMiscChange(index, "billDate", e.target.value)}
                    className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer pr-10"
                    style={{ colorScheme: 'dark' }}
                  />
                  {item.billDate && <span className="absolute right-10 top-2.5 text-slate-300 text-sm pointer-events-none">{new Date(item.billDate).toLocaleDateString()}</span>}
                  <span className="absolute right-3 top-2 text-slate-400 pointer-events-none"><Calendar size={16} /></span>
                </div>
              </div>
            </div>

            {/* Vendor and Amount */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Vendor / Guest name <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g.Vikram"
                  value={item.vendor}
                  onChange={(e) => handleMiscChange(index, "vendor", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Amount <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="₹"
                  value={item.amount}
                  onChange={(e) => handleMiscChange(index, "amount", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Upload (if have any supporting document )
              </label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "misc", index)}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded px-4 py-6 cursor-pointer hover:border-slate-500 transition"
              >
                <Upload size={20} className="mb-2 text-slate-400" />
                {item.file ? (
                  <div className="relative flex w-full justify-center text-slate-300 text-xs">
                    <span>{item.file.name}</span>
                    <button
                      type="button"
                      aria-label="Delete uploaded file"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile("misc", index);
                      }}
                      className="absolute right-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Drag and drop the files here or <span className="text-purple-500">choose file</span></span>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "misc", index)}
                  className="hidden"
                />
              </label>
              {item.fileError && <p className="mt-2 text-xs text-red-400">{item.fileError}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Remarks */}
      <div className="mb-8">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Remarks if any <span className=""></span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder=""
          rows="3"
          className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        ></textarea>
      </div>

      {/* Action Buttons */}
      {(submitError || submitSuccess) && (
        <p className={`mb-4 text-sm ${submitError ? "text-red-400" : "text-green-400"}`}>
          {submitError || submitSuccess}
        </p>
      )}
      <div className="flex justify-between items-center">
        <button className="border border-purple-600 text-purple-500 hover:bg-purple-600/10 px-4 py-2 rounded text-sm font-medium transition">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded text-sm font-medium transition"
        >
          {isSubmitting ? "Uploading..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}
