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

  // Preserve date-only values exactly, independent of the viewer's timezone.
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

export const buildIndividualReportHtml = ({ payload = {}, reportData = {} }) => {
  const participants = Array.isArray(payload.participants) ? payload.participants : [];
  const transportEntries = Array.isArray(payload.externalTransport) ? payload.externalTransport : [];

  const participantRows = participants.length
    ? participants
        .map(
          (participant, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(participant.name || "-")}</td>
              <td>${escapeHtml(participant.department || "-")}</td>
              <td>${escapeHtml(participant.phoneNumber || participant.phone || "-")}</td>
            </tr>
          `
        )
        .join("")
    : "<tr><td colspan='4' style='text-align:center; color:#666; font-style:italic;'>No participants added</td></tr>";

  const transportRows = transportEntries.length
    ? transportEntries
        .map(
          (entry, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(entry.travelOption || "-")}</td>
              <td>${escapeHtml(entry.from || "-")} to ${escapeHtml(entry.to || "-")}</td>
              <td>${escapeHtml(entry.transportNumber || entry.trainNumber || entry.flightNumber || "-")}</td>
            </tr>
          `
        )
        .join("")
    : "<tr><td colspan='4' style='text-align:center; color:#666; font-style:italic;'>No external transport requested</td></tr>";

  const totalParticipants = Number(payload.numberOfParticipants || participants.length || 0);
  const dateFrom = formatReportDate(payload.programFromDate);
  const dateTo = formatReportDate(payload.programToDate);
  const onDutyFrom = payload.onDutyFrom || "__ / __ / 20__";
  const onDutyTo = payload.onDutyTo || "__ / __ / 20__";
  const programType = payload.programType || "-";
  const programName = payload.programName || "-";
  const expectedOutcome = payload.expectedOutcome || "-";
  const submittedDate = formatReportDate(
    reportData.submittedDate || reportData.requestDate || reportData.createdAt
  );
  const iqacNumber = reportData.iqacNumber || "-";

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Event Attended Request</title>
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: "Times New Roman", Times, serif;
            color: #000;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            padding: 0;
            margin: 0;
            background: #ffffff;
          }
          .page {
            width: 100%;
            max-width: 820px;
            min-height: 1120px;
            background: #fff;
            border: 3px solid #000;
            margin: 0 auto;
            padding: 15px 18px 12px;
            box-sizing: border-box;
          }
          .header-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 2px solid #000;
            background-color: #ffffff !important;
            padding: 8px 10px;
            margin-bottom: 12px;
          }
          .college-name {
            flex: 1;
            text-align: center;
            font-weight: 700;
            font-size: 18px;
            line-height: 1.3;
            letter-spacing: 0;
          }
          .form-no {
            font-weight: 700;
            font-size: 18px;
            white-space: nowrap;
            margin-left: 16px;
          }
          .row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            line-height: 1.8;
            margin: 4px 0;
            flex-wrap: wrap;
          }
          .label {
            font-weight: 700;
          }
          .inline-colon {
            display: inline-block;
            min-width: 10px;
            text-align: center;
          }
          .underline {
            display: inline-block;
            border-bottom: 1px solid #000;
            min-height: 18px;
            line-height: 1.2;
            vertical-align: bottom;
            padding-bottom: 2px;
          }
          .w-dept { width: 420px; }
          .w-date { width: 120px; }
          .w-name { width: 420px; }
          .w-long { width: 520px; }
          .w-mid { width: 150px; }
          .w-sm { width: 80px; }
          .body-text {
            font-size: 15px;
            line-height: 1.5;
            margin-top: 2px;
          }
          .section-title {
            font-weight: 700;
            font-size: 15px;
            margin-top: 10px;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px 6px;
            text-align: center;
            font-size: 12px;
            height: 22px;
          }
          th {
            font-weight: 700;
          }
          .note {
            font-size: 12px;
            line-height: 1.5;
            margin-top: 8px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            gap: 32px;
            margin-top: 18px;
          }
          .signature-box {
            width: 46%;
          }
          .signature-name-line {
            border-bottom: 1px solid #000;
            height: 18px;
            margin-top: 18px;
          }
          .signature-caption {
            font-size: 12px;
            margin-top: 2px;
          }
          .remarks {
            border-bottom: 1px solid #000;
            height: 18px;
            margin-top: 8px;
            width: 100%;
          }
          .approve {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header-box">
            <div style="flex:1; text-align:center;">
              <div class="college-name">Sri Eshwar College of Engineering<br>Kondampatti, Coimbatore - 641 202<br>(Request for organizing program / event / visit)</div>
            </div>
            <div class="form-no">IQAC Number: ${escapeHtml(iqacNumber)}</div>
          </div>

          <div class="row">
            <span class="label">Department:</span>
            <span class="underline w-dept">${escapeHtml(payload.department || "Name of the Department")}</span>
            <span style="margin-left:auto;" class="label">Date:</span>
            <span class="underline w-date">${escapeHtml(submittedDate)}</span>
          </div>

          <div class="row">
            <span class="label">Submitted to the Principal:</span>
          </div>

          <div class="body-text">Principal's kind permission is sought to organizing the following program / event / visit</div>

          <div class="row" style="margin-top: 8px;">
            <span class="label">Type of the program/event/visit</span>
            <span class="inline-colon">:</span>
            <span class="underline w-name">${escapeHtml(programType)}</span>
          </div>

          <div class="row">
            <span class="label">Name of the program/event/visit</span>
            <span class="inline-colon">:</span>
            <span class="underline w-name">${escapeHtml(programName)}</span>
          </div>

          <div class="row" style="align-items:flex-start; margin-top: 4px;">
            <span class="label">Name of the organizer(s)</span>
            <span class="inline-colon">:</span>
            <div style="display:flex; flex-direction:column; gap:2px; margin-left: 6px; min-width:200px;">
              ${participants.length ? participants.map((p, i) => `<span>${i + 1}. ${escapeHtml(p.name || "")}</span>`).join("") : ["1.", "2.", "3.", "4.", "5."].map((n) => `<span>${n}</span>`).join("")}
            </div>
          </div>

          <div class="row" style="margin-top: 8px;">
            <span class="label">Expected outcome of the program/event/visit</span>
            <span class="inline-colon">:</span>
            <span class="underline w-long">${escapeHtml(expectedOutcome)}</span>
          </div>

          <div class="row" style="margin-top: 8px;">
            <span class="label">Date of the program/event/visit</span>
            <span class="inline-colon">:</span>
            <span class="label" style="margin-left: 4px;">From</span>
            <span class="underline w-mid">${escapeHtml(dateFrom)}</span>
            <span class="label">To</span>
            <span class="underline w-mid">${escapeHtml(dateTo)}</span>
          </div>

          <div class="row">
            <span class="label">Number of Days</span>
            <span class="inline-colon">:</span>
            <span class="underline w-sm">${escapeHtml(String(getDayDiffValue(payload.programFromDate, payload.programToDate)))}</span>
          </div>

          <div class="section-title">Head-wise tentative expenditure including taxes (if applicable):</div>
          <table>
            <thead>
              <tr>
                <th style="width:16%;">S.No</th>
                <th style="width:42%;">Expenditure Head</th>
                <th style="width:42%;">Amount including taxes (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td></td><td></td></tr>
              <tr><td>2</td><td></td><td></td></tr>
              <tr><td>3</td><td></td><td></td></tr>
              <tr><td>4</td><td></td><td></td></tr>
              <tr><td>5</td><td></td><td></td></tr>
              <tr><td colspan="2" style="font-weight:700; text-align:right; padding-right:10px;">Total</td><td></td></tr>
            </tbody>
          </table>

          <div class="note">
            <strong>Please Note:</strong>
            <div>1. Expenditure mentioned in the above table must be properly substantiated</div>
            <div>2. Expenditure exceeding the total amount to be avoided</div>
            <div>3. Bill settlement to be made within 3 working days after the completion of the program/event/visit.</div>
          </div>

          <div class="signature-row">
            <div class="signature-box">
              <div class="label">Signature of Faculty (Organizer)</div>
              <div class="signature-name-line"></div>
              <div class="signature-caption">Name of the Faculty</div>
            </div>
            <div class="signature-box">
              <div class="label" style="text-align:right;">Head of the Department</div>
              <div class="signature-name-line"></div>
              <div class="signature-caption" style="text-align:right;">Name of the Department</div>
            </div>
          </div>

          <div class="section-title" style="margin-top: 18px;">In case of expense:</div>
          <div class="body-text">College budget &nbsp; or &nbsp; department budget &nbsp; or &nbsp; to be borne by the individual</div>

          <div class="row" style="margin-top: 10px; display:block;">
            <span class="label">Remarks by Principal (if any):</span>
            <div class="remarks"></div>
          </div>

          <div class="approve">Approved / Not Approved</div>
        </div>
      </body>
    </html>`;
};

const getDayDiffValue = (fromDate, toDate) => {
  if (!fromDate || !toDate) return "__";
  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "__";
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return String(Math.max(diff + 1, 0));
};

const IndividualReport = ({ payload = {}, reportData = {} }) => {
  const html = buildIndividualReportHtml({ payload, reportData });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default IndividualReport;
