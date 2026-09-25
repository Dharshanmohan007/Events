import React from "react";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatReportDate = (value) => {
  if (!value) return "__/__/20__";

  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatTimeValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getDayDiffValue = (fromDate, toDate) => {
  if (!fromDate || !toDate) return "__";

  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "__";

  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return String(Math.max(diff + 1, 0));
};

const normalizeParticipants = (payload) => {
  const list = Array.isArray(payload.participants) ? payload.participants : [];
  if (list.length > 0) return list;

  const count = Number(payload.numberOfParticipants || 0);
  return Array.from({ length: count }, (_, index) => ({
    name: `Participant ${index + 1}`,
    department: "",
    phoneNumber: "",
  }));
};

const buildParticipantList = (payload) => {
  const participants = normalizeParticipants(payload);
  const rows = participants.map((participant, index) => {
    const name = participant.name || "";
    return `
      <div style="display:flex; align-items:center; gap:8px; margin-top: 2px;">
        <span>${index + 1}.</span>
        <span style="display:inline-block; min-width:250px; border-bottom:1px solid #000; padding-bottom:2px;">${escapeHtml(name)}</span>
      </div>
    `;
  });

  const emptyRows = Array.from({ length: Math.max(0, 5 - participants.length) }, (_, index) => {
    const number = participants.length + index + 1;
    return `
      <div style="display:flex; align-items:center; gap:8px; margin-top: 2px;">
        <span>${number}.</span>
        <span style="display:inline-block; min-width:250px; border-bottom:1px solid #000; padding-bottom:2px;">&nbsp;</span>
      </div>
    `;
  });

  return [...rows, ...emptyRows].join("");
};

export const buildIndividualReportHtml = ({ payload = {}, reportData = {} }) => {
  const participants = normalizeParticipants(payload);
  const department = payload.department || "Name of the Department";
  const programType = payload.programType || "";
  const programName = payload.programName || "";
  const expectedOutcome = payload.expectedOutcome || "";
  const dateFrom = formatReportDate(payload.programFromDate);
  const dateTo = formatReportDate(payload.programToDate);
  const noOfDays = getDayDiffValue(payload.programFromDate, payload.programToDate);
  const onDutyFromDate = formatReportDate(payload.onDutyFrom);
  const onDutyToDate = formatReportDate(payload.onDutyTo);
  const onDutyFromTime = formatTimeValue(payload.onDutyFrom);
  const onDutyToTime = formatTimeValue(payload.onDutyTo);
  const submittedDate = formatReportDate(
    reportData.submittedDate || reportData.requestDate || reportData.createdAt || new Date()
  );
  const iqacNumber = reportData.iqacNumber || "020";

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Event Attendance Request</title>
      <style>
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: #f3f4f6;
          font-family: "Times New Roman", Times, serif;
          color: #000;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body {
          display: flex;
          justify-content: center;
          padding: 14px 0;
        }
        .page {
          width: 100%;
          max-width: 820px;
          min-height: 1120px;
          background: #fff;
          border: 3px solid #000;
          padding: 18px 18px 12px;
        }
        .header-centered {
          text-align: center;
          font-weight: 700;
          font-size: 15px;
          line-height: 1.35;
          margin-top: 4px;
        }
        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 8px 0 12px;
        }
        .header-box {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .form-no {
          font-weight: 700;
          font-size: 16px;
          border: 1px solid #000;
          padding: 4px 12px;
          white-space: nowrap;
          background: #fff;
        }
        .row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          margin: 4px 0;
          font-size: 14px;
          line-height: 1.45;
          flex-wrap: wrap;
        }
        .label {
          font-weight: 700;
        }
        .underline {
          display: inline-block;
          border-bottom: 1px solid #000;
          min-height: 20px;
          line-height: 1.2;
          vertical-align: bottom;
          padding-bottom: 2px;
        }
        .dept-field { width: 360px; }
        .date-field { width: 110px; }
        .type-field { width: 585px; }
        .name-field { width: 540px; }
        .small-field { width: 80px; }
        .section { margin-top: 10px; font-size: 14px; }
        .participants-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-left: 8px;
        }
        .table-wrap { margin-top: 10px; }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px 6px;
          text-align: center;
          font-size: 12px;
          height: 24px;
        }
        th { font-weight: 700; }
        .note {
          font-size: 12px;
          line-height: 1.5;
          margin-top: 8px;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          gap: 25px;
          margin-top: 18px;
        }
        .signature-box {
          width: 46%;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          height: 18px;
          margin-top: 18px;
        }
        .signature-caption {
          font-size: 12px;
          text-align: center;
          margin-top: 2px;
        }
        .opt-row {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 8px;
          font-size: 15px;
        }
        .remarks {
          border-bottom: 1px solid #000;
          margin-top: 10px;
          height: 22px;
        }
        .approved {
          text-align: center;
          font-weight: 700;
          font-size: 18px;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="top-row">
          <div class="header-box">
            <div class="header-centered">
              <div>Principal</div>
              <div>Sri Eshwar College of Engineering</div>
              <div>Kondampatti, Coimbatore - 641 202</div>
              <div>(Request for attending program / event / visit)</div>
            </div>
          </div>
          <div class="form-no">Form Number: PP - 02</div>
        </div>

        <div class="row">
          <span class="label">Department:</span>
          <span class="underline dept-field">${escapeHtml(department)}</span>
          <span class="label" style="margin-left:auto;">Date:</span>
          <span class="underline date-field">${escapeHtml(submittedDate)}</span>
        </div>

        <div class="section">
          <span class="label">Submitted to the Principal:</span>
        </div>

        <div class="section" style="margin-top: 8px;">
          <span>Principal's kind permission is sought to attend the following program / event / visit</span>
        </div>

        <div class="row" style="margin-top: 8px;">
          <span class="label">Type of the program/event/visit</span>
          <span>:</span>
          <span class="underline type-field">${escapeHtml(programType)}</span>
        </div>

        <div class="row">
          <span class="label">Name of the program/event/visit</span>
          <span>:</span>
          <span class="underline name-field">${escapeHtml(programName)}</span>
        </div>

        <div class="row" style="align-items:flex-start; margin-top: 8px;">
          <span class="label">Name of the Participant(s)</span>
          <span>:</span>
          <div class="participants-block">
            ${buildParticipantList(payload)}
          </div>
        </div>

        <div class="section" style="margin-top: 12px;">
          <span class="label">Expected outcome of the program/event/visit</span>
          <span>:</span>
        </div>

        <div class="row" style="margin-top: 4px;">
          <span class="underline" style="width:100%; min-height:24px;">${escapeHtml(expectedOutcome)}</span>
        </div>

        <div class="row" style="margin-top: 12px;">
          <span class="label">Date of the program/event/visit</span>
          <span>:</span>
          <span class="label">From</span>
          <span class="underline date-field">${escapeHtml(dateFrom)}</span>
          <span class="label">To</span>
          <span class="underline date-field">${escapeHtml(dateTo)}</span>
        </div>

        <div class="row">
          <span class="label">Number of Days</span>
          <span>:</span>
          <span class="underline small-field">${escapeHtml(noOfDays)}</span>
        </div>

        <div class="row" style="margin-top: 12px;">
          <span class="label">Request for On-Duty / Off Campus time</span>
          <span>:</span>
          <span class="label">From</span>
          <span class="underline date-field">${escapeHtml(onDutyFromDate)}</span>
          <span class="label">Time</span>
          <span class="underline date-field">${escapeHtml(onDutyFromTime)}</span>
          <span class="label">To</span>
          <span class="underline date-field">${escapeHtml(onDutyToDate)}</span>
          <span class="label">Time</span>
          <span class="underline date-field">${escapeHtml(onDutyToTime)}</span>
        </div>

        <div class="row">
          <span class="label">Number of Days</span>
          <span>:</span>
          <span class="underline small-field">${escapeHtml(noOfDays)}</span>
        </div>

        <div class="section" style="margin-top: 14px;">
          <span class="label">Head-wise tentative expenditure including taxes (if applicable):</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width: 14%;">S.No</th>
                <th style="width: 43%;">Expenditure Head</th>
                <th style="width: 43%;">Amount including taxes (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td></td><td></td></tr>
              <tr><td>2</td><td></td><td></td></tr>
              <tr><td>3</td><td></td><td></td></tr>
              <tr><td>4</td><td></td><td></td></tr>
              <tr><td>5</td><td></td><td></td></tr>
              <tr><td colspan="2" style="text-align:right; font-weight:700; padding-right: 10px;">Total</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div class="note">
          <strong>Please Note:</strong>
          <div>1. Expenditure mentioned in the above table must be properly substantiated</div>
          <div>2. Expenditure exceeding the total amount to be avoided</div>
          <div>3. Bill settlement to be made within 3 working days after the completion of the program/event/visit.</div>
        </div>

        <div class="signature-row">
          <div class="signature-box">
            <div class="label">Signature of Faculty</div>
            <div class="signature-line"></div>
            <div class="signature-caption">Name of the Faculty</div>
          </div>
          <div class="signature-box">
            <div class="label" style="text-align:right;">Head of the Department</div>
            <div class="signature-line"></div>
            <div class="signature-caption" style="text-align:right;">Name of the Department</div>
          </div>
        </div>

        <div class="section" style="margin-top: 18px;">
          <span class="label">In case of expense:</span>
        </div>

        <div class="opt-row">
          <span>College budget</span>
          <span>or</span>
          <span>department budget</span>
          <span>or</span>
          <span>to be borne by the individual</span>
        </div>

        <div class="section" style="margin-top: 12px;">
          <span class="label">Remarks by Principal (if any):</span>
        </div>
        <div class="remarks"></div>

        <div class="approved">Approved / Not Approved</div>
      </div>
    </body>
  </html>`;
};

const IndividualReport = ({ payload = {}, reportData = {} }) => {
  const html = buildIndividualReportHtml({ payload, reportData });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default IndividualReport;
