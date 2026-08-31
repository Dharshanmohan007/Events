/**
 * Builds the HTML string for the individual request PDF.
 * Pure function: (apiResponse) => htmlString
 *
 * CONFIRMED REAL API SHAPE (live console.log verified):
 * {
 *   id, formType, employee (string), employeeEmail,
 *   employeeDetail: { _id, email, name },   <-- only name/email, no empId/phone/dept
 *   status, workflowStage, createdAt, updatedAt,
 *   data: {
 *     requestNo, module, financialYear, departmentCode, typeOfMedia,
 *     adminApproval, hodApproval, departmentApproval, superAdminApproval, headApproval,
 *     approvalHistory: [{ role, approvedBy, action, remarks, actionDate }],
 *     poster: { posterContent, referencePosterFiles, certificateContent, referenceCertificateFiles,
 *               trophyContent, displayNeeded, sizes, deliveryDate, priority, specialRequirements },
 *     video:  { videoContent, preEventVideos, eventCoverage, postEventVideos, specialVideos,
 *               referenceFiles, deliveryDate, priority, specialRequirements },
 *     financeRequired, advanceAmount, estimatedAmount, advancePurpose,
 *   }
 * }
 */

// v2 - reads approvals from req.data (confirmed from live API response)
export function buildIndividualRequestTemplate(payload = {}) {
  // The API returns the root object directly — no wrapping layer needed.
  const req  = payload;
  const data = req.data || {};

  // ── Top-level fields ──────────────────────────────────────────────────────────
  // ObjectId check — if req.employee is a 24-char hex string, it's a DB ref not a name
  const isObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
  const formType      = req.formType     || '-';
  const employeeName  = (!req.employee || isObjectId(req.employee))
    ? (req.employeeDetail?.name || req.employeeDetail?.firstName || req.employeeDetail?.fullName || '-')
    : req.employee;
  const employeeEmail = req.employeeEmail|| req.employeeDetail?.email || '-';
  const employeeDetail= req.employeeDetail || {};
  const status        = req.status       || '-';
  const workflowStage = req.workflowStage|| '-';
  const createdAt     = req.createdAt;

  // ── Data fields (all approvals, module data live inside data) ─────────────────
  const requestNo      = data.requestNo     || '-';
  const module         = data.module        || '-';
  const financialYear  = data.financialYear || '-';
  const departmentCode = data.departmentCode|| '-';
  const finalStatus    = data.finalStatus   || status;
  const typeOfMedia    = data.typeOfMedia   || [];

  const adminApproval       = data.adminApproval       || null;
  const hodApproval         = data.hodApproval         || null;
  const departmentApproval  = data.departmentApproval  || null;
  const superAdminApproval  = data.superAdminApproval  || null;
  const headApproval        = data.headApproval        || null;
  const approvalHistory     = data.approvalHistory     || [];

  const ignoredKeys = new Set([
    '_id', 'requestNo', 'module', 'financialYear', 'departmentCode', 
    'typeOfMedia', 'overallStatus', 'finalStatus', 'status', 
    'approvalHistory', 'adminApproval', 'hodApproval', 'departmentApproval', 
    'superAdminApproval', 'headApproval', 'financeRequired', 'advanceAmount', 
    'estimatedAmount', 'advancePurpose', 'principalApprovalForm', 'uploadedFile', 
    'employee', 'employeeDetail', 'createdAt', 'updatedAt', '__v', 'id', 'formType'
  ]);
  
  const moduleSpecificKeys = Object.keys(data).filter(k => !ignoredKeys.has(k) && data[k] !== null && data[k] !== undefined && data[k] !== '');

  const financeRequired = data.financeRequired;
  const advanceAmount   = data.advanceAmount;
  const estimatedAmount = data.estimatedAmount;
  const advancePurpose  = data.advancePurpose;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatLabel = (k) =>
    k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const renderRecursive = (val, level = 0) => {
    if (val === null || val === undefined || val === '') return '-';
    
    if (Array.isArray(val)) {
      if (val.length === 0) return '-';
      if (typeof val[0] !== 'object') return val.join(', ');
      
      const rows = val.map((item, i) => {
        if (!item || typeof item !== 'object') return String(item);
        const itemHtml = Object.entries(item)
          .filter(([k,v]) => v !== undefined && v !== null && v !== '' && k !== '_id' && k !== 'id')
          .map(([k,v]) => {
             if (typeof v !== 'object') return `<strong>${formatLabel(k)}:</strong> ${v}`;
             return `<strong>${formatLabel(k)}:</strong> <div style="padding-left:10px;border-left:2px solid #ccc;margin-top:2px;">${renderRecursive(v, level + 1)}</div>`;
          }).join('<br/>');
        return `<div><span style="color:#1e3a8a;font-weight:bold;font-size:10px;">#${i+1}</span><br/>${itemHtml}</div>`;
      });
      return rows.join('<hr style="border:0;border-top:1px dashed #ccc;margin:4px 0;"/>');
    }
    
    if (typeof val === 'object') {
      if (val.publicId) return val.publicId;
      if (val.filename || val.name) return val.filename || val.name;
      
      const rows = Object.entries(val)
        .filter(([k,v]) => v !== undefined && v !== null && v !== '' && k !== '_id' && k !== 'id')
        .map(([k,v]) => {
          if (typeof v !== 'object') return `<strong>${formatLabel(k)}:</strong> ${v}`;
          return `<strong>${formatLabel(k)}:</strong> <div style="padding-left:10px;border-left:2px solid #ccc;margin-top:2px;">${renderRecursive(v, level + 1)}</div>`;
        });
      return rows.length > 0 ? rows.join('<br/>') : '-';
    }
    
    return String(val);
  };

  const renderValue = renderRecursive;

  // ── Approval rows ─────────────────────────────────────────────────────────────
  const getApprovalRow = (role, a) => {
    if (!a) return '';
    return `
      <tr>
        <td>${role}</td>
        <td>${a.status || '-'}</td>
        <td>${a.reason || '-'}</td>
        <td>${formatDate(a.approvedAt || a.updatedAt)}</td>
      </tr>`;
  };

  const approvalStatusRows = [
    getApprovalRow('Admin',       adminApproval),
    getApprovalRow('HOD',         hodApproval),
    getApprovalRow('Department',  departmentApproval),
    getApprovalRow('Super Admin', superAdminApproval),
    getApprovalRow('Head',        headApproval),
  ].join('');

  const historyRows = approvalHistory.map(h => `
    <tr>
      <td>${h.role || '-'}</td>
      <td>${h.action || '-'}</td>
      <td>${h.remarks || '-'}</td>
      <td>${formatDate(h.actionDate)}</td>
    </tr>`).join('');

  // ── Module section renderer ───────────────────────────────────────────────────
  const renderModuleSection = (title, obj) => {
    if (obj === undefined || obj === null || obj === '') return '';
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return `
          <div class="section">
            <h2>${title}</h2>
            <table><tbody><tr><td class="no-data" style="color:#999;font-style:italic;">No items specified for ${title.toLowerCase()}</td></tr></tbody></table>
          </div>`;
      }
      
      // If it's an array of primitives
      if (typeof obj[0] !== 'object') {
        return `
          <div class="section">
            <h2>${title}</h2>
            <table><tbody><tr><td style="width:35%;font-weight:600;color:#444;">${title}</td><td>${obj.join(', ')}</td></tr></tbody></table>
          </div>`;
      }
      
      // Array of objects
      const html = renderRecursive(obj);
      return `
        <div class="section">
          <h2>${title}</h2>
          <div style="padding:8px; border:1px solid #ccc; font-size:10.5px; border-radius:3px; background:#fff; margin-bottom:10px;">${html}</div>
        </div>`;
    }
    
    if (typeof obj === 'object') {
      const rows = Object.entries(obj)
        .filter(([k,v]) => v !== undefined && v !== null && v !== '' && k !== '_id' && k !== 'id')
        .map(([k, v]) => `
        <tr>
          <td style="width:35%;font-weight:600;color:#444;">${formatLabel(k)}</td>
          <td>${renderRecursive(v)}</td>
        </tr>`).join('');
        
      if (!rows) {
        return `
          <div class="section">
            <h2>${title}</h2>
            <table><tbody><tr><td class="no-data" style="color:#999;font-style:italic;">No items specified for ${title.toLowerCase()}</td></tr></tbody></table>
          </div>`;
      }
      
      return `
        <div class="section">
          <h2>${title}</h2>
          <table><tbody>${rows}</tbody></table>
        </div>`;
    }
    
    return '';
  };

  const primitiveKeys = moduleSpecificKeys.filter(k => typeof data[k] !== 'object');
  const objectKeys = moduleSpecificKeys.filter(k => typeof data[k] === 'object');

  let primitiveHtml = '';
  if (primitiveKeys.length > 0) {
    const rows = primitiveKeys.map(k => `
      <tr>
        <td style="width:35%;font-weight:600;color:#444;">${formatLabel(k)}</td>
        <td>${String(data[k])}</td>
      </tr>`).join('');
    primitiveHtml = `
      <div class="section">
        <h2>General Details</h2>
        <table><tbody>${rows}</tbody></table>
      </div>`;
  }

  const moduleSectionsHtml = primitiveHtml + objectKeys.map(key => {
    return renderModuleSection(formatLabel(key), data[key]);
  }).join('');

  const typeOfMediaHtml = typeOfMedia.length > 0 ? `
    <div class="section">
      <h2>Media Type Requested</h2>
      <table><tbody>
        <tr>
          <td style="width:35%;font-weight:600;color:#444;">Type of Media</td>
          <td>${typeOfMedia.join(', ')}</td>
        </tr>
      </tbody></table>
    </div>` : '';

  const financeHtml = (financeRequired || advanceAmount != null || estimatedAmount != null || advancePurpose) ? `
    <div class="section">
      <h2>Financial Details</h2>
      <table><tbody>
        <tr><td style="width:35%;font-weight:600;color:#444;">Finance Required</td><td>${financeRequired || '-'}</td></tr>
        <tr><td style="width:35%;font-weight:600;color:#444;">Estimated Amount</td><td>${estimatedAmount != null ? '\u20B9' + estimatedAmount : '-'}</td></tr>
        <tr><td style="width:35%;font-weight:600;color:#444;">Advance Amount</td><td>${advanceAmount != null ? '\u20B9' + advanceAmount : '-'}</td></tr>
        <tr><td style="width:35%;font-weight:600;color:#444;">Advance Purpose</td><td>${advancePurpose || '-'}</td></tr>
      </tbody></table>
    </div>` : '';

  let moduleStatusHtml = '';
  if (data.status && typeof data.status === 'object') {
    const statusRows = Object.entries(data.status).map(([k, v]) => `
      <tr>
        <td style="width:35%;font-weight:600;color:#444;text-transform:capitalize;">${k}</td>
        <td>${v}</td>
      </tr>`).join('');
    moduleStatusHtml = `
      <div class="section">
        <h2>Module Status</h2>
        <table><tbody>${statusRows}</tbody></table>
      </div>`;
  }

  let uploadedDocHtml = '';
  const docUrl = data.principalApprovalForm?.url || data.uploadedFile?.url;
  const docName = data.uploadedFile?.fileName || data.principalApprovalForm?.publicId || data.uploadedFile?.publicId || 'View Document';
  if (docUrl) {
    uploadedDocHtml = `
      <div class="section">
        <h2>Uploaded Document</h2>
        <table><tbody>
          <tr>
            <td style="width:35%;font-weight:600;color:#444;">Document Link</td>
            <td><a href="${docUrl}" target="_blank" style="color:#1e3a8a;text-decoration:none;">${docName}</a></td>
          </tr>
        </tbody></table>
      </div>`;
  }

  const overviewHtml = `
    <div class="section">
      <h2>Request Overview</h2>
      <div class="meta-grid">
        <div><span class="label">Data ID:</span>${data._id || '-'}</div>
        <div><span class="label">Workflow Stage:</span>${workflowStage}</div>
        <div><span class="label">Overall Status:</span>${data.overallStatus || '-'}</div>
        <div><span class="label">Submitted:</span>${formatDate(createdAt)}</div>
        <div><span class="label">Last Updated:</span>${formatDate(req.updatedAt)}</div>
      </div>
    </div>`;

  // ── Full HTML ─────────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Individual Request \u2013 ${requestNo}</title>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #333; margin: 0; padding: 20px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; color: #1e3a8a; margin: 0 0 4px 0; }
    .header .meta { font-size: 10px; color: #555; text-align: right; line-height: 1.8; }
    .section { margin-bottom: 18px; page-break-inside: avoid; }
    .section h2 {
      font-size: 13px; color: #fff; background: #1e3a8a;
      padding: 5px 10px; margin: 0 0 8px 0; border-radius: 3px;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; }
    th {
      background: #eef2ff; color: #1e3a8a; font-weight: 600;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    td { font-size: 10.5px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 30px; }
    .meta-grid div { padding: 3px 0; border-bottom: 1px solid #f0f0f0; }
    .meta-grid div span.label { color: #444; font-weight: 600; margin-right: 5px; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
    .no-data { color: #999; font-style: italic; padding: 6px 8px; }
    @media print { body { padding: 0; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>Individual Request \u2013 ${module}</h1>
      <div style="color:#555;font-size:11px;">Form Type: ${formType}</div>
      <div style="color:#555;font-size:11px;margin-top:3px;">Workflow Stage: ${workflowStage}</div>
    </div>
    <div class="meta">
      Request No: <strong>${requestNo}</strong><br/>
      Financial Year: ${financialYear}<br/>
      Department Code: ${departmentCode}<br/>
      Status: <strong>${finalStatus}</strong>
    </div>
  </div>

  <div class="section">
    <h2>Requester Details</h2>
    <div class="meta-grid">
      <div><span class="label">Name:</span>${employeeName}</div>
      <div><span class="label">Email:</span>${employeeEmail}</div>
      <div><span class="label">Employee ID:</span>${employeeDetail.empId || employeeDetail._id || '-'}</div>
      <div><span class="label">Phone:</span>${employeeDetail.phone || '-'}</div>
      <div><span class="label">Department:</span>${employeeDetail.department || departmentCode || '-'}</div>
      <div><span class="label">Designation:</span>${employeeDetail.designation || '-'}</div>
      <div><span class="label">Category:</span>${employeeDetail.employeeCategory || employeeDetail.category || '-'}</div>
      <div><span class="label">Location:</span>${employeeDetail.location || '-'}</div>
    </div>
  </div>

  ${overviewHtml}
  ${moduleStatusHtml}
  ${typeOfMediaHtml}
  ${financeHtml}
  ${uploadedDocHtml}
  ${moduleSectionsHtml}

  <div class="section">
    <h2>Approval Status</h2>
    <table>
      <thead><tr><th>Role</th><th>Status</th><th>Reason</th><th>Date</th></tr></thead>
      <tbody>${approvalStatusRows || '<tr><td colspan="4" class="no-data">No approval data</td></tr>'}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Approval History</h2>
    <table>
      <thead><tr><th>Role</th><th>Action</th><th>Remarks</th><th>Date</th></tr></thead>
      <tbody>${historyRows || '<tr><td colspan="4" class="no-data">No history</td></tr>'}</tbody>
    </table>
  </div>

  <div class="footer">
    <span>Generated on: ${new Date().toLocaleString('en-IN')}</span>
    <span>Final Status: ${finalStatus}</span>
  </div>

</body>
</html>`;
}
