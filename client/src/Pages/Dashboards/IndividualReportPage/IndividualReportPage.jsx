import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function IndividualReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch report data based on id
    // For now, just set a placeholder
    setReport({ id, title: "Individual Report" });
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="individual-report-page">
      <h1>Individual Report</h1>
      <p>Report ID: {id}</p>
      {/* Add your report content here */}
    </div>
  );
}
