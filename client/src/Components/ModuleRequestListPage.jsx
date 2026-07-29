import React from "react";
import RequestListTable from "./RequestListTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

/**
 * A page wrapper for any module that needs a request list page with
 * Event Requests / Individual Requests two-tab layout.
 *
 * The component automatically fetches events from:
 *   GET /api/table/dashboard-table?module={module}
 * and individuals from:
 *   GET /api/table/dashboard-table?module=individual
 *   (or GET /api/individual-submissions when useIndividualSubmissionsApi=true)
 */
const ModuleRequestListPage = ({
  module,
  title = "Request List Overview",
  description = "View and manage event requests.",
  detailViewPath,
  individualDetailViewPath = "/dashboard/IndividualEvents",
  customHeader,
  useIndividualSubmissionsApi = false,
  individualEndpoint = "",
  showIndividualTab = false,
}) => {
  const getToken = () => localStorage.getItem("token");

  const fetchEvents = async () => {
    const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=${module}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    });
    if (!res.ok) throw new Error(`Failed to fetch ${module} events`);
    const json = await res.json();
    return json.data || [];
  };

  const fetchIndividuals = individualEndpoint
    ? async () => {
        const res = await fetch(`${API_BASE_URL}${individualEndpoint}`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch individual submissions");
        const json = await res.json();
        return json.data || [];
      }
    : useIndividualSubmissionsApi
    ? async () => {
        const res = await fetch(`${API_BASE_URL}/api/individual-submissions`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch individual submissions");
        const json = await res.json();
        return json.data || [];
      }
    : async () => {
        const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=individual`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch individual requests");
        const json = await res.json();
        return json.data || [];
      };

  return (
    <>
      {customHeader}
      <main className="px-6 pb-8">
        <div className="heading pt-3 pb-4">
          <h1 className="text-white text-lg font-medium">{title}</h1>
          <p className="text-[#FFFFFF80] text-sm">{description}</p>
        </div>
        <RequestListTable
          onFetchEvents={fetchEvents}
          onFetchIndividuals={showIndividualTab ? fetchIndividuals : undefined}
          detailViewPath={detailViewPath}
          individualDetailViewPath={individualDetailViewPath}
          showIndividualTab={showIndividualTab}
        />
      </main>
    </>
  );
};

export default ModuleRequestListPage;
