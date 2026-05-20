import React, { useState } from "react";
import {
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../Components/AuthContext";
import { API_BASE } from "../../utils/apiConfig";

export default function PurchaseDetails() {
  const { user } = useAuth();

  const emptyPerson = {
    giftType: "",
    registrationKitNeeded: "",
    trophyType: "",
    basicTrophyQty: "",
    eliteTrophyQty: "",
    cashPrizeAmount: "",
    voucherQty: "",
    voucherWorth: "",
    registrationKitQty: "",
    specialRequirements: "",
  };

  const [form, setForm] = useState({
    requirement: "",
    idCardQty: "",
    certificateQty: "",
    persons: "",
    students: emptyPerson,
    guests: emptyPerson,
  });

  const [isLoading, setIsLoading] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildGiftItems = (section) => {
    const giftItems = [];

    /* TROPHY */
    if (
      section.giftType?.includes(
        "Trophy"
      )
    ) {
      const trophy = [];

      if (
        section.trophyType ===
          "Basic" ||
        section.trophyType === "Both"
      ) {
        trophy.push({
          trophyType: "Basic",
          quantity:
            parseInt(
              section.basicTrophyQty
            ) || 0,
        });
      }

      if (
        section.trophyType ===
          "Elite" ||
        section.trophyType === "Both"
      ) {
        trophy.push({
          trophyType: "Elite",
          quantity:
            parseInt(
              section.eliteTrophyQty
            ) || 0,
        });
      }

      if (trophy.length) {
        giftItems.push({
          giftType: "Trophy",
          trophy,
        });
      }
    }

    /* CASH PRIZE */
    if (
      section.giftType?.includes(
        "Cash Prize"
      )
    ) {
      giftItems.push({
        giftType: "Cash Prize",
        cashPrizeAmount:
          parseInt(
            section.cashPrizeAmount
          ) || 0,
      });
    }

    /* VOUCHER */
    if (
      section.giftType?.includes(
        "Voucher"
      )
    ) {
      giftItems.push({
        giftType: "Voucher",
        voucher: [
          {
            voucherWorth:
              section.voucherWorth ||
              "",
            quantity:
              parseInt(
                section.voucherQty
              ) || 0,
          },
        ],
      });
    }

    return giftItems;
  };

  const buildPayload = () => {
    const requirementNeeded = [];

    if (
      form.requirement.includes(
        "ID card"
      )
    ) {
      requirementNeeded.push({
        type: "ID Card",
        hardCount:
          parseInt(form.idCardQty) ||
          0,
        softCount: 0,
      });
    }

    if (
      form.requirement.includes(
        "Certificate"
      )
    ) {
      requirementNeeded.push({
        type: "Certificate",
        hardCount:
          parseInt(
            form.certificateQty
          ) || 0,
        softCount: 0,
      });
    }

    const requiredFor = [];

    if (
      form.persons === "Students" ||
      form.persons === "Both"
    ) {
      requiredFor.push("Students");
    }

    if (
      form.persons === "Guest" ||
      form.persons === "Both"
    ) {
      requiredFor.push("Guests");
    }

    return {
      employee:
        user?.id ||
        user?._id ||
        "",

      purchases: [
        {
          dayIndex: 1,
          deliveryDate: "",
          requirementNeeded,
          requiredFor,

          students: {
            registrationKitNeeded:
              form.students
                .registrationKitNeeded ===
              "Yes",

            registrationKitQty:
              parseInt(
                form.students
                  .registrationKitQty
              ) || 0,

            giftItems:
              buildGiftItems(
                form.students
              ),

            specialRequirements:
              form.students
                .specialRequirements ||
              "",
          },

          guests: {
            registrationKitNeeded:
              form.guests
                .registrationKitNeeded ===
              "Yes",

            registrationKitQty:
              parseInt(
                form.guests
                  .registrationKitQty
              ) || 0,

            giftItems:
              buildGiftItems(
                form.guests
              ),

            specialRequirements:
              form.guests
                .specialRequirements ||
              "",
          },
        },
      ],
    };
  };

  const handleSubmit = async () => {
    setApiError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const payload = buildPayload();
      const token = localStorage.getItem("token");
      const requestUrl = `${API_BASE}/api/purchase/create`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          (data && data.message) ||
            `Purchase submission failed with status ${response.status}`
        );
      }

      setSuccess(true);
    } catch (error) {
      setApiError(error.message || "Unable to send purchase data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen
      bg-[#141428] p-6 text-white"
    >
      <h1 className="text-xl">
        Purchase Details
      </h1>

      <div className="w-full space-y-5 mt-4">

        {/* REQUIREMENT */}
        <CustomDropdown
          label="Requirement Needed"
          value={form.requirement}
          setValue={(value) =>
            setField(
              "requirement",
              value
            )
          }
          options={[
            "Certificate / ID card",
            "Certificate",
            "ID card",
          ]}
          placeholder="Select Requirement"
        />

        {/* REQUIREMENT FIELDS */}
        {form.requirement && (
          <div
            className="grid grid-cols-1
            md:grid-cols-2 gap-4"
          >
            {(form.requirement ===
              "Certificate / ID card" ||
              form.requirement ===
                "ID card") && (
              <InputField
                label="Id Card Hard copy Quantity"
                placeholder="52"
                value={form.idCardQty}
                onChange={(e) =>
                  setField(
                    "idCardQty",
                    e.target.value
                  )
                }
              />
            )}

            {(form.requirement ===
              "Certificate / ID card" ||
              form.requirement ===
                "Certificate") && (
              <InputField
                label="Certificate Hard Copy Quantity"
                placeholder="52"
                value={
                  form.certificateQty
                }
                onChange={(e) =>
                  setField(
                    "certificateQty",
                    e.target.value
                  )
                }
              />
            )}
          </div>
        )}

        {/* PERSONS */}
        <CustomDropdown
          label="Select Required Persons*"
          value={form.persons}
          setValue={(value) =>
            setField(
              "persons",
              value
            )
          }
          options={[
            "Students",
            "Guest",
            "Both",
          ]}
          placeholder="Select Required Persons"
        />

        {/* STUDENTS */}
        {(form.persons ===
          "Students" ||
          form.persons ===
            "Both") && (
          <PersonSection
            title="Students"
            data={form.students}
            onChange={(updated) =>
              setForm((prev) => ({
                ...prev,
                students: updated,
              }))
            }
          />
        )}

        {/* GUEST */}
        {(form.persons ===
          "Guest" ||
          form.persons ===
            "Both") && (
          <PersonSection
            title="Guest"
            data={form.guests}
            onChange={(updated) =>
              setForm((prev) => ({
                ...prev,
                guests: updated,
              }))
            }
          />
        )}

        {/* ERROR */}
        {apiError && (
          <div
            className="bg-red-500/10
            border border-red-500/30
            text-red-300 rounded-lg
            px-4 py-3"
          >
            {apiError}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            className="bg-green-500/10
            border border-green-500/30
            text-green-300 rounded-lg
            px-4 py-3"
          >
            Purchase Details Submitted
            Successfully
          </div>
        )}

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#8b3dff]
            hover:bg-[#9a52ff]
            transition-all duration-300
            text-white font-semibold
            px-10 py-3 rounded-lg
            flex items-center gap-2"
          >
            {isLoading
              ? "Sending..."
              : "Submit"}

            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PERSON SECTION ================= */

function PersonSection({
  title,
  data,
  onChange,
}) {

  const handleFieldChange =
    (field) => (e) => {
      onChange({
        ...data,
        [field]:
          e.target.value,
      });
    };

  const hasTrophy =
    data.giftType?.includes(
      "Trophy"
    );

  const hasCash =
    data.giftType?.includes(
      "Cash Prize"
    );

  const hasVoucher =
    data.giftType?.includes(
      "Voucher"
    );

  return (
    <div
      className="w-full bg-[#1b1b35]
      rounded-xl p-5
      border border-[#2f2f5c]"
    >

      <h2
        className="text-[#8b3dff]
        text-2xl font-semibold mb-5"
      >
        {title}
      </h2>

      {/* ROW */}
      <div
        className="grid grid-cols-1
        md:grid-cols-2 gap-4 mb-4"
      >

        {/* GIFT TYPE */}
        <CustomDropdown
          label="Gift Type *"
          value={data.giftType}
          setValue={(value) =>
            onChange({
              ...data,
              giftType: value,
            })
          }
          options={[
            "Trophy",
            "Cash Prize",
            "Voucher",
            "Trophy / Cash Prize / Voucher",
          ]}
          placeholder="Select Gift Type"
        />

        {/* KIT */}
        <CustomDropdown
          label="Registration Kit Needed *"
          value={
            data.registrationKitNeeded
          }
          setValue={(value) =>
            onChange({
              ...data,
              registrationKitNeeded:
                value,
            })
          }
          options={[
            "Yes",
            "No",
          ]}
          placeholder="Select Option"
        />
      </div>

      {/* TROPHY */}
      {hasTrophy && (
        <>
          <div className="mb-4">
            <CustomDropdown
              label="Type of Trophy Wanted *"
              value={
                data.trophyType
              }
              setValue={(value) =>
                onChange({
                  ...data,
                  trophyType: value,

                  basicTrophyQty:
                    value ===
                    "Elite"
                      ? ""
                      : data.basicTrophyQty,

                  eliteTrophyQty:
                    value ===
                    "Basic"
                      ? ""
                      : data.eliteTrophyQty,
                })
              }
              options={[
                "Basic",
                "Elite",
                "Both",
              ]}
              placeholder="Select Trophy Type"
            />
          </div>

          {/* BASIC */}
          {(data.trophyType ===
            "Basic" ||
            data.trophyType ===
              "Both") && (
            <div className="mb-4">
              <InputField
                label="Basic Trophy Quantity *"
                placeholder="2"
                value={
                  data.basicTrophyQty
                }
                onChange={handleFieldChange(
                  "basicTrophyQty"
                )}
              />
            </div>
          )}

          {/* ELITE */}
          {(data.trophyType ===
            "Elite" ||
            data.trophyType ===
              "Both") && (
            <div className="mb-4">
              <InputField
                label="Elite Trophy Quantity *"
                placeholder="2"
                value={
                  data.eliteTrophyQty
                }
                onChange={handleFieldChange(
                  "eliteTrophyQty"
                )}
              />
            </div>
          )}
        </>
      )}

      {/* CASH */}
      {hasCash && (
        <div className="mb-4">
          <InputField
            label="Cash Prize Amount *"
            placeholder="₹ 5000"
            value={
              data.cashPrizeAmount
            }
            onChange={handleFieldChange(
              "cashPrizeAmount"
            )}
          />
        </div>
      )}

      {/* VOUCHER */}
      {hasVoucher && (
        <div
          className="grid grid-cols-1
          md:grid-cols-2 gap-4 mb-4"
        >
          <InputField
            label="Voucher Quantity *"
            placeholder="2"
            value={data.voucherQty}
            onChange={handleFieldChange(
              "voucherQty"
            )}
          />

          <CustomDropdown
            label="Voucher Worth *"
            value={
              data.voucherWorth
            }
            setValue={(value) =>
              onChange({
                ...data,
                voucherWorth: value,
              })
            }
            options={[
              "₹ 1000",
              "₹ 2000",
              "₹ 5000",
              "₹ 10000",
            ]}
            placeholder="Select Voucher Worth"
          />
        </div>
      )}

      {/* KIT QTY */}
      {data.registrationKitNeeded ===
        "Yes" && (
        <div className="mb-4">
          <InputField
            label="Registration Kit Quantity *"
            placeholder="2"
            value={
              data.registrationKitQty
            }
            onChange={handleFieldChange(
              "registrationKitQty"
            )}
          />
        </div>
      )}

      {/* TEXTAREA */}
      <div className="w-full">
        <label
          className="text-sm text-white
          mb-2 block"
        >
          Special Requirement
        </label>

        <textarea
          rows={5}
          value={
            data.specialRequirements
          }
          onChange={handleFieldChange(
            "specialRequirements"
          )}
          placeholder="Enter special requirements..."
          className="w-full bg-[#1d1d39]
          border border-[#3b1f72]
          rounded-md px-4 py-3
          text-sm text-gray-300
          placeholder:text-gray-500
          outline-none resize-none
          focus:border-[#8b3dff]"
        />
      </div>
    </div>
  );
}

/* ================= INPUT FIELD ================= */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="w-full">

      <label
        className="text-sm text-white
        mb-2 block"
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#1d1d39]
        border border-[#3b1f72]
        rounded-md px-4 py-3
        text-sm text-gray-300
        placeholder:text-gray-500
        outline-none
        focus:border-[#8b3dff]"
      />
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */

function CustomDropdown({
  label,
  value,
  setValue,
  options,
  placeholder,
}) {

  const [isOpen, setIsOpen] =
    useState(false);

  return (
    <div className="relative w-full">

      <label
        className="text-sm text-white
        mb-2 block"
      >
        {label}
      </label>

      <div
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className={`w-full bg-[#1d1d39]
        border rounded-md px-4 py-3
        flex items-center justify-between
        cursor-pointer
        ${
          isOpen
            ? "border-[#8b3dff]"
            : "border-[#3b1f72]"
        }`}
      >

        <span
          className={`text-sm ${
            value
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          {value || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-50
          mt-2 w-full bg-[#141428]
          border border-[#5b21b6]
          rounded-xl overflow-hidden"
        >
          {options.map(
            (item, index) => (
              <div
                key={index}
                onClick={() => {
                  setValue(item);
                  setIsOpen(false);
                }}
                className={`px-4 py-3
                cursor-pointer text-sm
                border-b border-[#2d2d52]
                last:border-b-0
                ${
                  value === item
                    ? "bg-[#2a174a] text-white"
                    : "text-gray-300 hover:bg-[#22163d]"
                }`}
              >
                {item}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}