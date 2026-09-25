import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const IndividualReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportHtml = location.state?.reportHtml || sessionStorage.getItem("individualEventReportHtml") || "";

  const handleDownload = () => {
    if (!reportHtml) return;

    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "individual-report.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!reportHtml) return;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Individual Report</title></head><body>${reportHtml}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!reportHtml) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081b2d] px-6 text-white">
        <div className="rounded-xl border border-slate-700 bg-[#071b2f] p-8 text-center">
          <h2 className="text-2xl font-semibold">No report available</h2>
          <p className="mt-3 text-slate-300">Please submit the form again to generate the report.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb] p-4 text-slate-900">
      <div className="mx-auto w-full max-w-400">
        <div className="mb-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl bg-[#0f172a] px-5 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Download
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Print
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <iframe
            title="Individual report preview"
            srcDoc={reportHtml}
            className="h-[calc(100vh-120px)] w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default IndividualReportPage;