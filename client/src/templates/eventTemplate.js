/**
 * Builds the HTML string for the event approval PDF.
 * Pure function: (eventData) => htmlString
 * Keep all styling here in plain CSS — this is what Puppeteer will "screenshot to PDF".
 */

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildEventTemplate(event = {}) {
  const {
    requestDetails = {},
    venueDetails = {},
    ictsDetails = {},
    audioDetails = {},
    transportDetails = {},
    refreshmentDetails = {},
    iqacNumber = 'N/A'
  } = event;
  const { organizerDetails = {}, eventDetails = {} } = requestDetails;

  const organizersRows = (organizerDetails?.organizers || [])
    .map((o) => {
      let displayName = o?.name;
      if (displayName && displayName.includes('undefined')) {
        displayName = null;
      }
      const safeName = displayName || o?.fullName || '-';
      
      return `
      <tr>
        <td>${safeName}</td>
        <td>${o?.designation || '-'}</td>
        <td>${o?.department || '-'}</td>
        <td>${o?.mobile || '-'}</td>
        <td>${o?.email || '-'}</td>
      </tr>`;
    })
    .join("");

  const scheduleRows = (eventDetails?.eventSchedule || [])
    .map(
      (day, i) => `
      <tr>
        <td>Day ${i + 1}</td>
        <td>${formatDate(day?.eventDate)}</td>
        <td>${day?.startTime || '-'} - ${day?.endTime || '-'}</td>
        <td>${day?.totalGuests || '-'}</td>
        <td>${(day?.guests || []).map((g) => g?.name).join(", ") || '-'}</td>
      </tr>`
    )
    .join("");

  const venueRows = (venueDetails?.venues || [])
    .map(
      (v) => `
      <tr>
        <td>Day ${(v?.dayIndex || 0) + 1}</td>
        <td>${v?.venueName || '-'}</td>
        <td>${v?.numberOfParticipants || '-'}</td>
        <td>${v?.seatingCapacity || '-'}</td>
        <td>${(v?.hallRequirements || []).map((h) => `${h?.type} (${h?.quantity})`).join(", ") || '-'}</td>
      </tr>`
    )
    .join("");

  const ictsRows = (ictsDetails?.ictses || [])
    .map(
      (i) => `
      <tr>
        <td>Day ${(i?.dayIndex || 0) + 1}</td>
        <td>${i?.venueName || '-'}</td>
        <td>${(i?.desktopLaptop || []).map((d) => `${d?.type}: ${d?.count}`).join(", ") || '-'}</td>
        <td>${i?.internetFacility || '-'}</td>
        <td>${(i?.requirements || []).join(", ") || '-'}</td>
      </tr>`
    )
    .join("");

  const audioRows = (audioDetails?.audios || [])
    .map(
      (a) => `
      <tr>
        <td>Day ${(a?.dayIndex || 0) + 1}</td>
        <td>${a?.venueName || '-'}</td>
        <td>${(a?.audioItems || []).map((it) => `${it?.type} (${it?.quantity})`).join(", ") || '-'}</td>
      </tr>`
    )
    .join("");

  const transportRows = (transportDetails?.transports || [])
    .map(
      (t) => `
      <tr>
        <td>${formatDate(t?.pickupDateTime)}</td>
        <td>${t?.pickupLocation || '-'} → ${t?.dropLocation || '-'}</td>
        <td>${t?.totalPassengers || '-'}</td>
        <td>${(t?.vehicles || []).map((v) => `${v?.type} x${v?.count}`).join(", ") || '-'}</td>
        <td>${(t?.accompanyingStaff || []).map((s) => s?.name).join(", ") || '-'}</td>
      </tr>`
    )
    .join("");

  const refreshmentRows = (refreshmentDetails?.refreshments || [])
    .map((r) => {
      const foodSummary = (r?.foodTypes || [])
        .filter((f) => f?.participants?.vegCount || f?.participants?.nonVegCount)
        .map((f) => `${f?.type}: ${f?.participants?.vegCount || 0}V/${f?.participants?.nonVegCount || 0}NV`)
        .join(", ");
      return `
      <tr>
        <td>${formatDate(r?.date)}</td>
        <td>${(r?.resourcePersonType || []).join(", ") || '-'}</td>
        <td>${r?.numberOfResourcePersons || '-'}</td>
        <td>${foodSummary || "-"}</td>
      </tr>`;
    })
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      @page { margin: 0; }
      * { 
        box-sizing: border-box; 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        color: #1a1a1a;
        font-size: 11px;
        line-height: 1.4;
        padding: 28px 36px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #1e3a8a;
        padding-bottom: 10px;
        margin-bottom: 16px;
      }
      .header .logos { font-size: 10px; color: #555; }
      .header h1 {
        font-size: 18px;
        color: #1e3a8a;
        margin: 0;
      }
      .header .iqac {
        font-size: 10px;
        color: #555;
        text-align: right;
      }
      .section {
        margin-bottom: 18px;
        page-break-inside: avoid;
      }
      .section h2 {
        font-size: 13px;
        color: #fff;
        background: #1e3a8a;
        padding: 5px 10px;
        margin: 0 0 8px 0;
        border-radius: 3px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 6px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 5px 8px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #eef2ff;
        color: #1e3a8a;
        font-weight: 600;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 20px;
        margin-bottom: 8px;
      }
      .meta-grid div span.label { color: #555; font-weight: 600; }
      .footer {
        margin-top: 24px;
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #555;
        border-top: 1px solid #ccc;
        padding-top: 8px;
      }
    </style>
  </head>
  <body>

    <div class="header">
      <div>
        <h1>${eventDetails?.eventName || event?.eventName || 'Event Details'}</h1>
        <div class="logos">Logos: ${(eventDetails?.logosInPoster || []).join(" · ") || 'None'}</div>
      </div>
      <div class="iqac">
        IQAC No: ${iqacNumber}<br/>
        Event Type: ${eventDetails?.eventType || event?.eventType || '-'}<br/>
        Department: ${organizerDetails?.organizingDepartment || event?.organizingDepartment || '-'}
      </div>
    </div>

    <div class="section">
      <h2>Event Overview</h2>
      <div class="meta-grid">
        <div><span class="label">Number of Days:</span> ${eventDetails?.numberOfDays || '-'}</div>
        <div><span class="label">Target Audience:</span> ${(eventDetails?.targetAudience || []).join(", ") || '-'}</div>
        <div><span class="label">Professional Society:</span> ${(eventDetails?.professionalSociety || []).join(", ") || '-'}</div>
        <div><span class="label">Total Participants:</span> ${venueDetails?.totalParticipants || '-'}</div>
      </div>
    </div>

    <div class="section">
      <h2>Organizer Details</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Designation</th><th>Department</th><th>Mobile</th><th>Email</th></tr>
        </thead>
        <tbody>${organizersRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Day-wise Schedule</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Date</th><th>Time</th><th>Guests</th><th>Guest Names</th></tr>
        </thead>
        <tbody>${scheduleRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Venue Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Participants</th><th>Seating</th><th>Hall Requirements</th></tr>
        </thead>
        <tbody>${venueRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>ICT Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Devices</th><th>Internet</th><th>Requirements</th></tr>
        </thead>
        <tbody>${ictsRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Audio Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Items</th></tr>
        </thead>
        <tbody>${audioRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Transport</h2>
      <table>
        <thead>
          <tr><th>Pickup Date</th><th>Route</th><th>Passengers</th><th>Vehicles</th><th>Staff</th></tr>
        </thead>
        <tbody>${transportRows}</tbody>
      </table>
    </div>

    <div class="section">
      <h2>Refreshments</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Guest Type</th><th>Count</th><th>Food Summary</th></tr>
        </thead>
        <tbody>${refreshmentRows}</tbody>
      </table>
    </div>

    <div class="footer">
      <div>Generated on ${new Date().toLocaleString("en-IN")}</div>
      <div>Status: ${event?.status || event?.eventStatus || '-'}</div>
    </div>

  </body>
  </html>
  `;
}

export { buildEventTemplate };
