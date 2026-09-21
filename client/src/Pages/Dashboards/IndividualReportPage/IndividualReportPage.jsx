import React, { useState } from "react";

const ProgramProposalForm = () => {
const today = new Date();

const formattedToday =
  String(today.getDate()).padStart(2, "0") +
  "/" +
  String(today.getMonth() + 1).padStart(2, "0") +
  "/" +
  today.getFullYear();

  const [form, setForm] = useState({
    department: "",
    date: formattedToday,
    type: "",
    programName: "",
    organizers: ["", "", "", "", ""],
    outcome: "",
    fromDate: "",
    toDate: "",
    numberOfDays: "",
    facultyName: "",
    hodName: "",
    expenseType: "",
    remarks: "",
  });

  const [expenses, setExpenses] = useState([
    { head: "", amount: "" },
    { head: "", amount: "" },
    { head: "", amount: "" },
    { head: "", amount: "" },
    { head: "", amount: "" },
  ]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateOrganizer = (index, value) => {
    const updated = [...form.organizers];
    updated[index] = value;

    setForm((prev) => ({
      ...prev,
      organizers: updated,
    }));
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setExpenses(updated);
  };

  const totalAmount = expenses.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0
  );

  return (
   <div className="min-h-screen bg-white flex justify-center items-start py-1 print:bg-white print:p-0">
      
      {/* ================= MAIN FORM ================= */}
      <div
  className="
    relative
    w-[730px]
    h-[960px]
    bg-white
    border-[2px]
    border-black
    px-[43px]
    pt-[38px]
    pb-[15px]
    text-black
    font-serif
    text-[12px]
    leading-[1.25]
    overflow-hidden
    print:w-[730px]
    print:h-[960px]
    print:border-[2px]
    print:border-black
  "
>

        {/* ================= HEADER ================= */}
        <div className="relative h-[65px] border-2 border-black bg-black text-center">
         <div className="text-[13px] font-bold">
            Sri Eshwar College of Engineering
          </div>

          <div className="text-[9px]">
            Kondampatti, Coimbatore - 641 202
          </div>

         <div className="text-[11px] font-bold">
            (Request for organizing program / event / visit)
          </div>

          {/* FORM NUMBER */}
         <div
  className="
    absolute
    right-[0px]
    top-[2px]
    border
    border-black
    bg-white
    px-[9px]
    py-[5px]
    text-[10px]
    font-bold
  "
>
  Form Number: PP – 01
</div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="mt-[5px]">

          {/* DEPARTMENT + DATE */}
         <div className="flex items-center justify-between text-[12px]">

  <div className="flex items-center">
    <span className="font-bold">
      Department:
    </span>

    <input
      type="text"
      value={form.department}
      onChange={(e) =>
        updateField("department", e.target.value)
      }
      className="
        ml-[6px]
        w-[300px]
        border-b
        border-black
        
        outline-none
        px-1
        text-[12px]
      "
    />
  </div>

  <div className="flex items-center">
    <span className="font-bold">
      Date:
    </span>

    <input
  type="text"
  value={form.date}
  onChange={(e) =>
    updateField("date", e.target.value)
  }
  className="
    ml-[6px]
    w-[145px]
    border-b
    border-black
    bg-white
    text-black
    outline-none
    text-[12px]
  "
/>
  </div>

</div>

          {/* ================= PRINCIPAL ================= */}
          <div className="mt-[7px]">

            <div className="font-bold underline">
              Submitted to the Principal:
            </div>

            <div className="mt-[5px]">
              Principal's kind permission is sought to organizing the
              following program / event / visit
            </div>

          </div>

          {/* ================= TYPE ================= */}
          <div className="mt-[8px] grid grid-cols-[235px_12px_1fr] items-center">

            <span className="font-bold">
              Type of the program/event/visit
            </span>

            <span>:</span>

            <input
              type="text"
              value={form.type}
              onChange={(e) =>
                updateField("type", e.target.value)
              }
              className="
                w-full
                border-b
                border-black
                bg-transparent
                outline-none
                text-[10px]
              "
            />

          </div>

          {/* ================= PROGRAM NAME ================= */}
          <div className="mt-[7px] grid grid-cols-[235px_12px_1fr] items-center">

            <span className="font-bold">
              Name of the program/event/visit
            </span>

            <span>:</span>

            <input
              type="text"
              value={form.programName}
              onChange={(e) =>
                updateField("programName", e.target.value)
              }
              className="
                w-full
                border-b
                border-black
                bg-transparent
                outline-none
                text-[10px]
              "
            />

          </div>

          {/* ================= ORGANIZERS ================= */}
          <div className="mt-[7px] grid grid-cols-[235px_12px_1fr]">

            <span className="font-bold">
              Name of the organizer(s)
            </span>

            <span>:</span>

            <div>

              {form.organizers.map((organizer, index) => (
                <div
                  key={index}
                  className="flex items-center h-[15px]"
                >

                  <span className="w-[22px]">
                    {index + 1}.
                  </span>

                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) =>
                      updateOrganizer(index, e.target.value)
                    }
                    className="
                      flex-1
                      border-b
                      border-gray-400
                      bg-transparent
                      outline-none
                      text-[10px]
                    "
                  />

                </div>
              ))}

            </div>

          </div>

          {/* ================= EXPECTED OUTCOME ================= */}
          <div className="mt-[7px] grid grid-cols-[235px_12px_1fr]">

            <span className="font-bold">
              Expected outcome of the program/event/visit
            </span>

            <span>:</span>

            <textarea
              value={form.outcome}
              onChange={(e) =>
                updateField("outcome", e.target.value)
              }
              rows={2}
              className="
                w-full
                h-[28px]
                resize-none
                border-b
                border-black
                bg-transparent
                outline-none
                text-[10px]
              "
            />

          </div>

          {/* ================= DATE ================= */}
          <div className="mt-[12px] grid grid-cols-[235px_12px_1fr] items-center">

            <span className="font-bold">
              Date of the program/event/visit
            </span>

            <span>:</span>

            <div className="flex items-center">

              <span>From:</span>

              <input
                type="text"
                placeholder="__/__/20__"
                value={form.fromDate}
                onChange={(e) =>
                  updateField("fromDate", e.target.value)
                }
                className="
                  ml-[4px]
                  w-[105px]
                  border-b
                  border-black
                  bg-transparent
                  outline-none
                  text-[10px]
                "
              />

              <span className="ml-[10px]">
                To:
              </span>

              <input
                type="text"
                placeholder="__/__/20__"
                value={form.toDate}
                onChange={(e) =>
                  updateField("toDate", e.target.value)
                }
                className="
                  ml-[4px]
                  w-[105px]
                  border-b
                  border-black
                  bg-transparent
                  outline-none
                  text-[10px]
                "
              />

            </div>

          </div>

          {/* ================= NUMBER OF DAYS ================= */}
          <div className="mt-[5px] grid grid-cols-[235px_12px_1fr] items-center">

            <span className="font-bold">
              Number of Days
            </span>

            <span>:</span>

            <input
              type="text"
              value={form.numberOfDays}
              onChange={(e) =>
                updateField("numberOfDays", e.target.value)
              }
              className="
                w-[110px]
                border-b
                border-black
                bg-transparent
                outline-none
                text-[10px]
              "
            />

          </div>

          {/* ================= EXPENDITURE ================= */}
          <div className="mt-[12px]">

            <div className="font-bold text-[10px]">
              Head-wise tentative expenditure including taxes (if applicable):
            </div>

            <table
              className="
                mt-[4px]
                mx-auto
                w-[365px]
                border-collapse
                border
                border-black
                text-[9px]
              "
            >

              <thead>

                <tr>

                  <th className="w-[42px] border border-black h-[20px]">
                    S.No
                  </th>

                  <th className="border border-black">
                    Expenditure Head
                  </th>

                  <th className="w-[150px] border border-black">
                    Amount including taxes (Rs.)
                  </th>

                </tr>

              </thead>

              <tbody>

                {expenses.map((expense, index) => (

                  <tr key={index}>

                    <td
                      className="
                        border
                        border-black
                        text-center
                        h-[16px]
                      "
                    >
                      {index + 1}
                    </td>

                    <td className="border border-black">

                      <input
                        type="text"
                        value={expense.head}
                        onChange={(e) =>
                          updateExpense(
                            index,
                            "head",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          h-[15px]
                          px-1
                          bg-transparent
                          outline-none
                          text-[9px]
                        "
                      />

                    </td>

                    <td className="border border-black">

                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) =>
                          updateExpense(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          h-[15px]
                          px-1
                          bg-transparent
                          outline-none
                          text-right
                          text-[9px]
                        "
                      />

                    </td>

                  </tr>

                ))}

                {/* TOTAL */}

                <tr>

                  <td
                    colSpan="2"
                    className="
                      border
                      border-black
                      h-[20px]
                      text-right
                      font-bold
                      px-3
                    "
                  >
                    Total
                  </td>

                  <td
                    className="
                      border
                      border-black
                      text-right
                      font-bold
                      px-2
                    "
                  >
                    {totalAmount.toFixed(2)}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          {/* ================= NOTES ================= */}
         <div className="mt-[7px] flex">

  <div className="w-[80px] font-bold text-[10px]">
    Please Note:
  </div>

  <div className="flex-1 text-[10px] leading-[1.4]">

    <div>
      1. Expenditure mentioned in the above table must be properly substantiated
    </div>

    <div>
      2. Expenditure exceeding the total amount to be avoided
    </div>

    <div>
      3. Bill settlement to be made within 3 working days after the completion of the program/event/visit.
    </div>

  </div>

</div>

          {/* ================= SIGNATURES ================= */}
        <div className="mt-[22px]">

  <div className="flex justify-between font-bold text-[12px]">

    <span>
      Signature of Faculty (Organizer)
    </span>

    <span>
      Head of the Department
    </span>

  </div>

  <div className="mt-[8px] flex justify-between">

    <input
      type="text"
      placeholder="Name of the Faculty"
      value={form.facultyName}
      onChange={(e) =>
        updateField("facultyName", e.target.value)
      }
      className="
        w-[300px]
        border-b
        border-black
        bg-transparent
        outline-none
        text-[10px]
      "
    />

    <input
      type="text"
      placeholder="Name of the Department"
      value={form.hodName}
      onChange={(e) =>
        updateField("hodName", e.target.value)
      }
      className="
        w-[300px]
        border-b
        border-black
        bg-transparent
        outline-none
        text-right
        text-[10px]
      "
    />

  </div>

</div>

          {/* ================= SEPARATOR ================= */}
          <div className="mt-[8px] border-t border-gray-500" />

          {/* ================= EXPENSE TYPE ================= */}
        <div className="mt-[7px] border-t border-gray-500" />

<div className="mt-[7px]">

  <div className="text-[11px]">
    In case of expense:
  </div>

  <div className="mt-[12px] flex items-center justify-center gap-[35px] text-[11px]">

    <span>College budget</span>

    <span>or</span>

    <span>department budget</span>

    <span>or</span>

    <span>to be borne by the individual</span>

  </div>

</div>

          {/* ================= PRINCIPAL REMARKS ================= */}
          <div className="mt-[18px]">

  <div className="text-[11px]">
    Remarks by Principal (if any):
  </div>

  <textarea
    value={form.remarks}
    onChange={(e) =>
      updateField("remarks", e.target.value)
    }
    className="
      mt-[5px]
      w-full
      h-[35px]
      resize-none
      border-b
      border-black
      bg-transparent
      outline-none
      text-[11px]
    "
  />

</div>

          {/* ================= APPROVAL ================= */}
          <div className="mt-[10px] text-center">

  <div className="font-bold text-[12px]">
    Approved / Not Approved
  </div>

</div>

        </div>

      </div>
    </div>
  );
};

export default ProgramProposalForm;