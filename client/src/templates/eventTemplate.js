import clgLogo from '../assets/clg-logo2.webp';

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
  
  const { organizerDetails = {}, eventDetails = {}, requirementDetails = {} } = requestDetails;
  const reqFlags = requirementDetails || {};

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
      (day, i) => {
        const guestNames = (day?.guests || []).map(g => typeof g === 'object' ? (g?.name || g?.guestName || '') : g).filter(Boolean).join(", ");
        return `
      <tr>
        <td>Day ${i + 1}</td>
        <td>${formatDate(day?.eventDate)}</td>
        <td>${day?.startTime || '-'} - ${day?.endTime || '-'}</td>
        <td>${day?.totalGuests || '-'}</td>
        <td>${guestNames || '-'}</td>
      </tr>`;
      }
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
    
  const mediaRows = (reqFlags?.mediaRequirementDetails?.mediaRequirements || [])
    .map((m) => {
      let details = [];
      if (m.poster) {
        details.push(`<b>Poster:</b> ${m.poster.posterContent || '-'} (Sizes: ${(m.poster.sizes || []).map(s => `${s.type}x${s.value}`).join(", ")})`);
      }
      if (m.video) {
        details.push(`<b>Video:</b> ${m.video.videoContent || '-'} (Pre: ${(m.video.preEventVideos || []).join(", ")})`);
      }
      return `
      <tr>
        <td>Day ${(m.dayIndex || 0) + 1}</td>
        <td>${(m.typeOfMedia || []).join(", ") || '-'}</td>
        <td>${details.join("<br/>") || '-'}</td>
      </tr>`;
    })
    .join("");

  const purchaseRows = (event?.purchaseDetails?.purchases || [])
    .map((p) => {
      const needed = (p.requirementNeeded || []).map(r => `${r.type} (H:${r.hardCount || 0}, S:${r.softCount || 0})`).join(", ");
      let gifts = [];
      if (p.students?.giftItems?.length) gifts.push(`Students: ${p.students.giftItems.length} gifts`);
      if (p.guests?.giftItems?.length) gifts.push(`Guests: ${p.guests.giftItems.length} gifts`);
      return `
      <tr>
        <td>Day ${(p.dayIndex || 0) + 1}</td>
        <td>${(p.requiredFor || []).join(", ") || '-'}</td>
        <td>${needed || '-'}</td>
        <td>${gifts.join(", ") || '-'}</td>
      </tr>`;
    })
    .join("");

  const accommRows = (event?.accommodationDetails?.accommodations || [])
    .map((a) => {
      const guests = (a.guests || []).map(g => `${g.name}${g.mobile ? ' (' + g.mobile + ')' : ''}${g.gender ? ' [' + g.gender + ']' : ''}`).join('<br/>');
      const dineInCounts = (a.dineInCounts || []).map(d => `${d.type}: ${d.count}`).join(', ');
      // roomSelections — defensive generic rendering for any keys present
      const roomSel = (a.roomSelections || []);
      const roomHtml = roomSel.length
        ? roomSel.map(rs => Object.entries(rs).filter(([k]) => k !== '_id').map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(', ')).join('<br/>')
        : '-';
      const staff = (a.accompanyingStaff || []).map(s => s.name).join(', ');
      return `
      <tr>
        <td>${formatDate(a.checkInDateTime)} → ${formatDate(a.checkOutDateTime)}</td>
        <td>${guests || '-'}</td>
        <td>${a.dineInRequired ? 'Yes' : 'No'}<br/><small>${dineInCounts || '-'}</small></td>
        <td>${roomHtml}</td>
        <td>${staff || '-'}</td>
        <td>${a.specialRequirements || '-'}</td>
      </tr>`;
    })
    .join("");

  const extTransportRows = (event?.externalTransportDetails?.externalTransports || [])
    .map((t) => {
      const passengers = (t.passengers || []).map(p => p.phone ? `${p.name} (${p.phone})` : p.name).join('<br/>');
      return `
      <tr>
        <td>${formatDate(t.travelDate)}</td>
        <td>${t.travelOption || '-'}</td>
        <td>${t.from || '-'} → ${t.to || '-'}</td>
        <td>${t.totalPassengers || '-'}</td>
        <td>${passengers || '-'}</td>
      </tr>`;
    })
    .join("");

  const transportRows = (transportDetails?.transports || [])
    .map(
      (t) => `
      <tr>
        <td>${formatDate(t?.pickupDateTime)}</td>
        <td>${t?.pickupLocation || '-'} → ${t?.dropLocation || '-'}</td>
        <td>${t?.totalPassengers || '-'}</td>
        <td>${(t?.vehicles || []).map((v) => `${v?.type} x${v?.count}`).join(", ") || '-'}</td>
        <td>${(t?.accompanyingStaff || []).map((s) => s?.mobile ? `${s.name} (${s.mobile})` : s?.name).join('<br/>') || '-'}</td>
      </tr>`
    )
    .join("");

  // Meal types that have veg/nonveg breakdown per category
  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
  // Types that have a flat refreshmentCount
  const REFRESH_TYPES = ['Morning Refreshment', 'Evening Refreshment'];

  const refreshmentBlocks = (refreshmentDetails?.refreshments || [])
    .map((r) => {
      const foodTypes = r?.foodTypes || [];

      // Build one row per food type present
      const foodRows = foodTypes.map((f) => {
        const isMeal = MEAL_TYPES.includes(f?.type);
        const isRefresh = REFRESH_TYPES.includes(f?.type);
        let detail = '-';
        if (isMeal) {
          const parts = [];
          if (f.participants && (f.participants.vegCount || f.participants.nonVegCount))
            parts.push(`Participants: ${f.participants.vegCount || 0}V / ${f.participants.nonVegCount || 0}NV`);
          if (f.vipGuests && (f.vipGuests.vegCount || f.vipGuests.nonVegCount))
            parts.push(`VIP: ${f.vipGuests.vegCount || 0}V / ${f.vipGuests.nonVegCount || 0}NV`);
          if (f.trainer && (f.trainer.vegCount || f.trainer.nonVegCount))
            parts.push(`Trainer: ${f.trainer.vegCount || 0}V / ${f.trainer.nonVegCount || 0}NV`);
          detail = parts.join('<br/>') || '-';
        } else if (isRefresh) {
          detail = `Count: ${f.refreshmentCount || '-'}`;
        } else if (f.participants) {
          detail = `${f.participants.vegCount || 0}V / ${f.participants.nonVegCount || 0}NV`;
        }
        return `<tr><td>${f?.type || '-'}</td><td>${detail}</td></tr>`;
      }).join('');

      const staff = (r?.accompanyingStaff || []).map(s => `${s.name}${s.mobile ? ' ('+s.mobile+')' : ''}`).join(', ');

      return `
      <tr>
        <td colspan="2">
          <strong>${formatDate(r?.date)}</strong><br/>
          Resource: ${(r?.resourcePersonType || []).join(', ') || '-'} — ${r?.numberOfResourcePersons || 0} person(s)${r?.numberOfInternalAccompanyingStaff ? ', Internal Staff: ' + r.numberOfInternalAccompanyingStaff : ''}${staff ? '<br/>Staff: ' + staff : ''}${r?.specialRequirements ? '<br/>Special: ' + r.specialRequirements : ''}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <table style="width:100%;border-collapse:collapse;margin:4px 0;">
            <thead><tr><th style="background:#eef2ff;color:#1e3a8a;padding:4px 6px;border:1px solid #ccc;">Food Type</th><th style="background:#eef2ff;color:#1e3a8a;padding:4px 6px;border:1px solid #ccc;">Details</th></tr></thead>
            <tbody>${foodRows || '<tr><td colspan="2">-</td></tr>'}</tbody>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  // Keep refreshmentRows variable pointing to same content for conditional section check
  const refreshmentRows = refreshmentBlocks;
    
  const venueSection = (reqFlags.venueRequired && venueRows) ? `
    <div class="section">
      <h2>Venue Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Participants</th><th>Seating</th><th>Hall Requirements</th></tr>
        </thead>
        <tbody>${venueRows}</tbody>
      </table>
    </div>
  ` : '';

  const ictsSection = (reqFlags.ictsRequired && ictsRows) ? `
    <div class="section">
      <h2>ICT Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Devices</th><th>Internet</th><th>Requirements</th></tr>
        </thead>
        <tbody>${ictsRows}</tbody>
      </table>
    </div>
  ` : '';

  const audioSection = (reqFlags.audioRequired && audioRows) ? `
    <div class="section">
      <h2>Audio Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Venue</th><th>Items</th></tr>
        </thead>
        <tbody>${audioRows}</tbody>
      </table>
    </div>
  ` : '';
  
  const mediaSection = (reqFlags.mediaRequired && mediaRows) ? `
    <div class="section">
      <h2>Media Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Media Types</th><th>Details</th></tr>
        </thead>
        <tbody>${mediaRows}</tbody>
      </table>
    </div>
  ` : '';
  
  const purchaseSection = (reqFlags.purchaseRequired && purchaseRows) ? `
    <div class="section">
      <h2>Purchase Requirements</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Required For</th><th>Items Needed</th><th>Gifts/Kits</th></tr>
        </thead>
        <tbody>${purchaseRows}</tbody>
      </table>
    </div>
  ` : '';

  const transportSection = (reqFlags.transportRequired && transportRows) ? `
    <div class="section">
      <h2>Internal Transport</h2>
      <table>
        <thead>
          <tr><th>Pickup Date</th><th>Route</th><th>Passengers</th><th>Vehicles</th><th>Staff</th></tr>
        </thead>
        <tbody>${transportRows}</tbody>
      </table>
    </div>
  ` : '';
  
  const extTransportSection = (reqFlags.externalTransportRequired && extTransportRows) ? `
    <div class="section">
      <h2>External Transport</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Mode</th><th>Route</th><th>Passengers</th><th>Names</th></tr>
        </thead>
        <tbody>${extTransportRows}</tbody>
      </table>
    </div>
  ` : '';
  
  const accommSection = (reqFlags.accommodationRequired && accommRows) ? `
    <div class="section">
      <h2>Accommodation</h2>
      <table>
        <thead>
          <tr><th>Check In → Out</th><th>Guests</th><th>Dine-in</th><th>Room Selections</th><th>Staff</th><th>Special Requirements</th></tr>
        </thead>
        <tbody>${accommRows}</tbody>
      </table>
    </div>
  ` : '';

  const refreshmentSection = (reqFlags.refreshmentRequired && refreshmentRows) ? `
    <div class="section">
      <h2>Refreshments</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
        <thead><tr><th colspan="2">Date / Summary &amp; Food Breakdown</th></tr></thead>
        <tbody style="font-size:10.5px;">${refreshmentRows}</tbody>
      </table>
    </div>
  ` : '';
  
  const profSociety = (eventDetails?.professionalSociety || [])
    .map(p => typeof p === 'object' ? (p.name || p.value || JSON.stringify(p)) : p)
    .join(", ");

  const targAudience = (eventDetails?.targetAudience || [])
    .map(t => typeof t === 'object' ? (t.name || t.value || JSON.stringify(t)) : t)
    .join(", ");

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
      .top-status {
        font-size: 13px;
        font-weight: bold;
        color: #1e3a8a;
        margin-bottom: 16px;
        text-transform: uppercase;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #1e3a8a;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .logo-container {
        flex: 1;
        display: flex;
        justify-content: flex-start;
      }
      .logo {
        height: 50px;
        width: auto;
      }
      .header-titles {
        flex: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .form-title {
        font-size: 12px;
        font-weight: 600;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .header h1 {
        font-size: 18px;
        color: #1e3a8a;
        margin: 4px 0 0 0;
      }
      .iqac {
        flex: 1;
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
      
      .signatures {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        page-break-inside: avoid;
      }
      .signature-block {
        text-align: center;
        width: 28%;
      }
      .signature-line {
        border-top: 1px solid #1a1a1a;
        margin-bottom: 6px;
        height: 1px;
        width: 100%;
      }
      .signature-label {
        font-size: 11px;
        font-weight: 600;
        color: #1e3a8a;
      }
      
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

    <div class="top-status">
      Status: ${event?.status || event?.eventStatus || '-'}
    </div>

    <div class="header">
      <div class="logo-container">
        <img src="${clgLogo}" class="logo" alt="Logo" />
      </div>
      <div class="header-titles">
        <div class="form-title">Event Request Form</div>
        <h1>${eventDetails?.eventName || event?.eventName || 'Event Details'}</h1>
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
        <div><span class="label">Target Audience:</span> ${targAudience || '-'}</div>
        <div><span class="label">Professional Society:</span> ${profSociety || '-'}</div>
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

    ${venueSection}
    ${ictsSection}
    ${audioSection}
    ${mediaSection}
    ${purchaseSection}
    ${transportSection}
    ${extTransportSection}
    ${accommSection}
    ${refreshmentSection}

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">Event Organizer</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">HoD / Section Head</div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-label">IQAC Team</div>
      </div>
    </div>

    <div class="footer">
      <div>Submitted on: ${formatDate(event?.createdAt || event?.updatedAt)}</div>
      <div>Generated on: ${new Date().toLocaleString("en-IN")}</div>
    </div>

  </body>
  </html>
  `;
}

export { buildEventTemplate };
