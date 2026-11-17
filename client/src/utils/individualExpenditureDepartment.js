import axios from "axios";

export const getIndividualDepartment = (item) => {
  if (item?._resolvedDepartment) return item._resolvedDepartment;

  const organizer =
    item?.faculty ||
    item?.data?.faculty ||
    item?.requester ||
    item?.user ||
    {};

  return (
    organizer?.department ||
    organizer?.departmentName ||
    organizer?.program ||
    organizer?.branch ||
    organizer?.specialization ||
    item?.department ||
    item?.data?.department ||
    item?.request?.department ||
    item?.facultyDetails?.department ||
    item?.expenditure?.faculty?.department ||
    "-"
  );
};

export const enrichEventAttendingDepartments = async (
  list,
  apiBaseUrl,
  token,
) =>
  Promise.all(
    list.map(async (item) => {
      const module = String(
        item?.module ||
          item?.requestType ||
          item?.requestDetails?.module ||
          item?.expenditure?.module ||
          "",
      )
        .toLowerCase()
        .replace(/[\s_-]/g, "");
      const requestId =
        item?._id ||
        item?.requestId ||
        item?.request?.id ||
        item?.request?._id ||
        item?.expenditure?._id ||
        item?.expenditureId ||
        item?.id ||
        "";

      if (
        !module.includes("eventattend") ||
        getIndividualDepartment(item) !== "-" ||
        !requestId
      ) {
        return item;
      }

      const endpoints = [
        `${apiBaseUrl}/api/individual/expenditure/${requestId}`,
        `${apiBaseUrl}/api/individual/expenditure/request/${requestId}`,
        `${apiBaseUrl}/api/individual/expenditure?id=${requestId}`,
      ];
      let lastError = null;

      for (const url of endpoints) {
        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const payload = response.data;
          const detail =
            Array.isArray(payload) ? payload[0] :
            payload?.data && typeof payload.data === "object" ? payload.data :
            payload?.result && typeof payload.result === "object" ? payload.result :
            payload || {};
          const department = getIndividualDepartment(detail);

          if (department !== "-") {
            return { ...item, _resolvedDepartment: department };
          }
        } catch (error) {
          lastError = error;
        }
      }

      console.error(
        `Failed to resolve event-attending department for ${requestId}`,
        lastError || "Department was not present in the detail response.",
      );
      return item;
    }),
  );
