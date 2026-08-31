import React, { useEffect, useState } from "react";
import FacultyDahsboardHeader from "../../Dashboards/Faculty-Dashboard/FacultyDahsboardHeader";
import { useParams } from "react-router-dom";
import axios from "axios";
import IndividualFoodDetailPage from "../IndividualFoodDetailPage";
import IndividualPurchaseDetailPage from "../IndividualPurchaseDetailPage";
import IndividualTrasnportDetailPage from "../IndividualTrasnportDetailPage";
import IndividualMediaDetailPage from "../IndividualMediaDetailPage";

const FacultyIndividualDetailiew = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { eventId } = useParams();

  console.log("id ", eventId);

  // token
  const token = localStorage.getItem("token");

  const [data, setData] = useState([]);
  const [formType, setFormType] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          `${apiUrl}/api/individual-submissions/getrequest/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setData(res.data.data);
        setFormType(res.data.data[0].formType);
      } catch (err) {
        console.error(
          "error occured while fetching invidiual details page data : ",
          err,
        );
      }
    }

    fetchData();
  }, [eventId]);

  return (
    <>
      <FacultyDahsboardHeader />
        <div className="main-container bg-[#0b1326] min-h-[calc(100vh-60px)] text-white p-5">
            {formType?.toLowerCase() == "food" && (
            <IndividualFoodDetailPage data={data[0]} />
            )}
            {formType?.toLowerCase() == "purchase" && (
            <IndividualPurchaseDetailPage data={data[0]} />
            )}
            {formType?.toLowerCase() == "transport" && (
            <IndividualTrasnportDetailPage data={data[0]} />
            )}
            {formType?.toLowerCase() == "media" && (
            <IndividualMediaDetailPage data={data[0]} />
            )}
        </div>
    </>
  );
};

export default FacultyIndividualDetailiew;
