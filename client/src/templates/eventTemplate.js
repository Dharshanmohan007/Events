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

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true
  });
}

// Returns a CSS color string based on the semantic meaning of a status
function statusColor(s) {
  if (!s || s === '-') return '#1e3a8a';
  const v = String(s).toLowerCase().trim();
  if (v.includes('approved') || v.includes('completed') || v.includes('closed') ||
      v.includes('acknowledged') || v.includes('accepted') || v.includes('sanctioned') ||
      v === 'yes') return '#15803d';  // green
  if (v.includes('rejected') || v.includes('cancelled') || v.includes('denied') ||
      v.includes('declined')) return '#b91c1c'; // red
  if (v.includes('pending') || v.includes('processing') || v.includes('review') ||
      v.includes('submitted')) return '#b45309'; // amber
  return '#1e3a8a'; // default blue
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
        const guestDetails = (day?.guests || []).map(g => {
          if (typeof g !== 'object') return `<strong>${g}</strong>`;
          const name = g?.name || g?.guestName || '';
          const parts = [name ? `<strong>${name}</strong>` : ''];
          if (g?.designation)  parts.push(g.designation);
          if (g?.organization) parts.push(g.organization);
          if (g?.mobile)       parts.push(g.mobile);
          return parts.filter(Boolean).join(', ');
        }).filter(Boolean).join('<br>');
        return `
      <tr>
        <td>Day ${i + 1}</td>
        <td>${formatDate(day?.eventDate)}</td>
        <td>${day?.startTime || '-'} - ${day?.endTime || '-'}</td>
        <td>${day?.totalGuests || '-'}</td>
        <td>${guestDetails || '-'}</td>
      </tr>`;
      }
    )
    .join("");


  const venueRows = (venueDetails?.venues || [])
    .map((v) => {
      const dayIdx = v?.dayIndex || 0;
      const dayDate = formatDate((eventDetails?.eventSchedule || [])[dayIdx]?.eventDate);
      const dayLabel = dayDate && dayDate !== '-' ? `Day ${dayIdx + 1} (${dayDate})` : `Day ${dayIdx + 1}`;
      return `
      <tr>
        <td>${dayLabel}</td>
        <td>${v?.venueName || '-'}</td>
        <td>${v?.numberOfParticipants || '-'}</td>
        <td>${v?.seatingCapacity || '-'}</td>
        <td>${(v?.hallRequirements || []).map((h) => `${h?.type} (${h?.quantity})`).join(", ") || '-'}</td>
      </tr>`;
    })
    .join("");

  const ictsRows = (ictsDetails?.ictses || [])
    .map((i) => {
      const dayIdx = i?.dayIndex || 0;
      const dayDate = formatDate((eventDetails?.eventSchedule || [])[dayIdx]?.eventDate);
      const dayLabel = dayDate && dayDate !== '-' ? `Day ${dayIdx + 1} (${dayDate})` : `Day ${dayIdx + 1}`;
      return `
      <tr>
        <td>${dayLabel}</td>
        <td>${i?.venueName || '-'}</td>
        <td>${(i?.desktopLaptop || []).map((d) => `${d?.type}: ${d?.count}`).join(", ") || '-'}</td>
        <td>${i?.internetFacility || '-'}</td>
        <td>${(i?.requirements || []).join(", ") || '-'}</td>
      </tr>`;
    })
    .join("");

  const audioRows = (audioDetails?.audios || [])
    .map((a) => {
      const dayIdx = a?.dayIndex || 0;
      const dayDate = formatDate((eventDetails?.eventSchedule || [])[dayIdx]?.eventDate);
      const dayLabel = dayDate && dayDate !== '-' ? `Day ${dayIdx + 1} (${dayDate})` : `Day ${dayIdx + 1}`;
      return `
      <tr>
        <td>${dayLabel}</td>
        <td>${a?.venueName || '-'}</td>
        <td>${(a?.audioItems || []).map((it) => `${it?.type} (${it?.quantity})`).join(", ") || '-'}</td>
      </tr>`;
    })
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

  // Helper: describe one giftItem object from the purchase payload
  const describeGiftItem = (gi) => {
    if (!gi || !gi.giftType) return '';
    if (gi.giftType === 'Trophy') {
      const parts = (gi.trophy || []).map(t => `${t.trophyType} ×${t.quantity}`);
      return parts.length ? `Trophy (${parts.join(', ')})` : 'Trophy';
    }
    if (gi.giftType === 'Cash Prize') return `Cash Prize ₹${gi.cashPrizeAmount || 0}`;
    if (gi.giftType === 'Gifts') return `Gifts ×${gi.giftsQty || 0}`;
    if (gi.giftType === 'Voucher') {
      const vp = (gi.voucher || []).map(v => `${v.voucherWorth} ×${v.quantity}`);
      return vp.length ? `Voucher (${vp.join(', ')})` : 'Voucher';
    }
    return gi.giftType;
  };

  const purchaseRows = (event?.purchaseDetails?.purchases || [])
    .map((p) => {
      // requirementNeeded: array of objects {type, hardCount, softCount}
      const needParts = (p.requirementNeeded || []).map(r =>
        r.type ? `${r.type} ×${r.hardCount || 0}` : String(r)
      );

      // requiredFor: ["Students","Guest"] or ["Both"]
      const requiredFor = (p.requiredFor || []).join(', ') || '-';

      // Gift items — proper objects with full trophy/voucher breakdowns
      const studentGifts = (p.students?.giftItems || []).map(describeGiftItem).filter(Boolean);
      const guestGifts   = (p.guests?.giftItems   || []).map(describeGiftItem).filter(Boolean);
      const regKit = [];
      if (p.students?.registrationKitNeeded) regKit.push(`Students kit ×${p.students.registrationKitQty || 0}`);
      if (p.guests?.registrationKitNeeded)   regKit.push(`Guests kit ×${p.guests.registrationKitQty || 0}`);

      const giftParts = [];
      if (studentGifts.length) giftParts.push(`Students: ${studentGifts.join(', ')}`);
      if (guestGifts.length)   giftParts.push(`Guests: ${guestGifts.join(', ')}`);
      if (regKit.length)       giftParts.push(regKit.join(', '));

      // Staff — may be stored as accompanyingStaff array or staffNames string
      const staffArr = p.accompanyingStaff || p.staffNames || [];
      const staffStr = Array.isArray(staffArr)
        ? staffArr.map(s => s.name || s).join(', ')
        : String(staffArr);

      return `
      <tr>
        <td>Day ${(p.dayIndex || 0) + 1}</td>
        <td>${requiredFor}</td>
        <td>${needParts.join(', ') || '-'}</td>
        <td>${giftParts.join(' | ') || '-'}</td>
        <td>${staffStr || '-'}</td>
      </tr>`;
    })
    .join('');

  const accommRows = (event?.accommodationDetails?.accommodations || [])
    .map((a) => {
      // Deduplicate guests by _id (fall back to name) to prevent rendering duplicates
      const seenGuests = new Set();
      const uniqueGuests = (a.guests || []).filter(g => {
        const key = g._id || g.name;
        if (seenGuests.has(key)) return false;
        seenGuests.add(key);
        return true;
      });
      const guests = uniqueGuests.map(g =>
        `<strong>${g.name}</strong>${g.mobile ? ' (' + g.mobile + ')' : ''}${g.gender ? ' [' + g.gender + ']' : ''}`
      ).join('<br/>');

      const dineInCounts = (a.dineInCounts || []).map(d => `${d.type}: ${d.count}`).join(', ');

      // Clean human-readable room selections — only show relevant fields
      const roomSel = (a.roomSelections || []);
      const roomHtml = roomSel.length
        ? roomSel.map(rs => {
            // rs.roomNumber already contains the full label (e.g. "Room 1"), don't prepend "Room"
            const num = rs.roomNumber || rs.room || '-';
            // rs.venue holds room type/category (e.g. "SUIT"), not the building venue
            const type = rs.venue ? ` [${rs.venue}]` : '';
            return `<strong>${num}</strong>${type} (Occupants: ${rs.occupantCount ?? '-'})`;
          }).join('<br/>')
        : '-';

      const staff = (a.accompanyingStaff || []).map(s => s.name).join(', ');
      return `
      <tr>
        <td>${formatDateTime(a.checkInDateTime)} → ${formatDateTime(a.checkOutDateTime)}</td>
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

  // Meal/refreshment type constants
  const MEAL_TYPES    = ['Breakfast', 'Lunch', 'Dinner'];
  const REFRESH_TYPES = ['Morning Refreshment', 'Evening Refreshment'];

  // ── Food section (Breakfast / Lunch / Dinner) ────────────────────────────
  const foodBlocks = (refreshmentDetails?.refreshments || [])
    .map((r) => {
      const foodTypes = (r?.foodTypes || []).filter(f => MEAL_TYPES.includes(f?.type));
      if (foodTypes.length === 0) return '';
      const foodRows = foodTypes.map((f) => {
        const pV  = f.participants?.vegCount    || 0;
        const pNV = f.participants?.nonVegCount || 0;
        const vV  = f.vipGuests?.vegCount       || 0;
        const vNV = f.vipGuests?.nonVegCount    || 0;
        const tV  = f.trainer?.vegCount         || 0;
        const tNV = f.trainer?.nonVegCount      || 0;
        return `<tr>
          <td>${f?.type || '-'}</td>
          <td>${pV}V / ${pNV}NV</td>
          <td>${vV}V / ${vNV}NV</td>
          <td>${tV}V / ${tNV}NV</td>
        </tr>`;
      }).join('');
      const staff = (r?.accompanyingStaff || []).map(s => `${s.name}${s.mobile ? ' ('+s.mobile+')' : ''}`).join(', ');
      const venue = r?.venue || '-';
      return `
      <tr style="background:#f7f7f7;">
        <td colspan="5">
          <strong>${formatDate(r?.date)}</strong> — 
          Venue: ${venue} | 
          Resource: ${(r?.resourcePersonType || []).join(', ') || '-'} — ${r?.numberOfResourcePersons || 0} person(s)${r?.numberOfInternalAccompanyingStaff ? ', Internal Staff: '+r.numberOfInternalAccompanyingStaff : ''}${staff ? ' | Staff: '+staff : ''}${r?.specialRequirements ? ' | Special: '+r.specialRequirements : ''}
        </td>
      </tr>
      ${foodRows}`;
    }).join('');

  // ── Pivot Food table (Breakfast / Lunch / Dinner per date column) ──────────
  const allRefreshments = refreshmentDetails?.refreshments || [];

  // Collect distinct dates that have meal-type food entries
  const foodDates = [];
  allRefreshments.forEach(r => {
    const hasMeals = (r?.foodTypes || []).some(f => MEAL_TYPES.includes(f?.type));
    if (hasMeals) {
      const label = (() => { const d = new Date(r?.date); return isNaN(d) ? (r?.date || '') : `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; })();
      if (!foodDates.find(fd => fd.raw === r?.date)) foodDates.push({ raw: r?.date, label, entry: r });
    }
  });

  // Build per-date summary (venue/resource) caption + pivot table rows
  const buildFoodPivot = () => {
    if (foodDates.length === 0) return '';

    // Summary block above the table
    const summaryLines = foodDates.map(fd => {
      const r = fd.entry;
      const staff = (r?.accompanyingStaff || []).map(s => `${s.name}${s.mobile ? ' ('+s.mobile+')' : ''}`).join(', ');
      const venue = r?.venue || '-';
      return `<strong>${fd.label}</strong>: Venue: ${venue} | Resource: ${(r?.resourcePersonType||[]).join(', ')||'-'} — ${r?.numberOfResourcePersons||0} person(s)${r?.numberOfInternalAccompanyingStaff?', Internal Staff: '+r.numberOfInternalAccompanyingStaff:''}${staff?' | Staff: '+staff:''}${r?.specialRequirements?' | Special: '+r.specialRequirements:''}`;
    }).join('<br/>');

    // Header row: date groups, each split into V / NV
    const dateHeaders = foodDates.map(fd =>
      `<th colspan="2" style="background:#bfdbfe;color:#1e3a8a;text-align:center;">${fd.label}</th>`
    ).join('');
    const subHeaders = foodDates.map(() =>
      `<th style="background:#bbf7d0;color:#166534;text-align:center;">V</th><th style="background:#bbf7d0;color:#166534;text-align:center;">NV</th>`
    ).join('');

    // One row per meal type
    const mealRows = MEAL_TYPES.map(mealType => {
      const cells = foodDates.map(fd => {
        const ft = (fd.entry?.foodTypes || []).find(f => f?.type === mealType);
        const v  = ft ? ((ft.participants?.vegCount||0) + (ft.vipGuests?.vegCount||0) + (ft.trainer?.vegCount||0)) : '-';
        const nv = ft ? ((ft.participants?.nonVegCount||0) + (ft.vipGuests?.nonVegCount||0) + (ft.trainer?.nonVegCount||0)) : '-';
        return `<td style="text-align:center;">${v}</td><td style="text-align:center;">${nv}</td>`;
      }).join('');
      return `<tr><td style="font-weight:600;">${mealType}</td>${cells}</tr>`;
    }).join('');

    return `
      <p style="font-size:10px;margin:0 0 6px 0;line-height:1.6;">${summaryLines}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
        <thead>
          <tr><th rowspan="2" style="background:#eef2ff;color:#1e3a8a;">Meal Type</th>${dateHeaders}</tr>
          <tr>${subHeaders}</tr>
        </thead>
        <tbody>${mealRows}</tbody>
      </table>`;
  };

  const foodPivot = buildFoodPivot();

  // ── Pivot Refreshment table (Morning / Evening per date column) ───────────
  const refreshDates = [];
  allRefreshments.forEach(r => {
    const hasRefresh = (r?.foodTypes || []).some(f => REFRESH_TYPES.includes(f?.type));
    if (hasRefresh) {
      const label = (() => { const d = new Date(r?.date); return isNaN(d) ? (r?.date || '') : `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; })();
      if (!refreshDates.find(rd => rd.raw === r?.date)) refreshDates.push({ raw: r?.date, label, entry: r });
    }
  });

  const buildRefreshPivot = () => {
    if (refreshDates.length === 0) return '';

    const summaryLines = refreshDates.map(rd => {
      const r = rd.entry;
      const staff = (r?.accompanyingStaff || []).map(s => `${s.name}${s.mobile ? ' ('+s.mobile+')' : ''}`).join(', ');
      const venue = r?.venue || '-';
      return `<strong>${rd.label}</strong>: Venue: ${venue} | Resource: ${(r?.resourcePersonType||[]).join(', ')||'-'} — ${r?.numberOfResourcePersons||0} person(s)${r?.numberOfInternalAccompanyingStaff?', Internal Staff: '+r.numberOfInternalAccompanyingStaff:''}${staff?' | Staff: '+staff:''}${r?.specialRequirements?' | Special: '+r.specialRequirements:''}`;
    }).join('<br/>');

    const dateHeaders = refreshDates.map(rd =>
      `<th style="background:#bfdbfe;color:#1e3a8a;text-align:center;">${rd.label}</th>`
    ).join('');

    // For refreshments the API has a single refreshmentCount (no VIP vs Normal split in real data)
    // Render as one count column per date
    const refreshTypeRows = REFRESH_TYPES.map(typeName => {
      const shortName = typeName.replace(' Refreshment', '');
      const cells = refreshDates.map(rd => {
        const ft = (rd.entry?.foodTypes || []).find(f => f?.type === typeName);
        const cnt = ft ? (ft.refreshmentCount ?? '-') : '-';
        return `<td style="text-align:center;">${cnt}</td>`;
      }).join('');
      return `<tr><td style="font-weight:600;">${shortName}</td>${cells}</tr>`;
    }).join('');

    return `
      <p style="font-size:10px;margin:0 0 6px 0;line-height:1.6;">${summaryLines}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
        <thead>
          <tr><th style="background:#eef2ff;color:#1e3a8a;">Refreshment</th>${dateHeaders}</tr>
        </thead>
        <tbody>${refreshTypeRows}</tbody>
      </table>`;
  };

  const refreshPivot = buildRefreshPivot();
    
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
      <h2>ICTS Requirements</h2>
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
          <tr><th>Day</th><th>Required For</th><th>Items Needed</th><th>Gifts/Kits</th><th>Staff</th></tr>
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

  const foodSection = (reqFlags.refreshmentRequired && foodPivot) ? `
    <div class="section">
      <h2>Food</h2>
      ${foodPivot}
    </div>
  ` : '';

  const refreshmentSection = (reqFlags.refreshmentRequired && refreshPivot) ? `
    <div class="section">
      <h2>Refreshments</h2>
      ${refreshPivot}
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
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .page-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
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
        margin-top: auto;
        padding-top: 40px;
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
  <div class="page-wrap">

    <div class="top-status" style="color:${statusColor(event?.status || event?.eventStatus)}">
      STATUS: ${event?.status || event?.eventStatus || '-'}
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
        Department: <strong style="font-size:14px;">${organizerDetails?.organizingDepartment || event?.organizingDepartment || '-'}</strong>
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
          <tr><th>Day</th><th>Date</th><th>Time</th><th>Guests</th><th>Guest Details</th></tr>
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
    ${foodSection}
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

  </div>
  </body>
  </html>
  `;
}

export { buildEventTemplate };
