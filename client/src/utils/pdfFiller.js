/**
 * PDF Filler Utility
 * Handles filling advance request PDF templates with form data
 */

import { PDFDocument } from 'pdf-lib';

export const downloadFilledPDF = async (submittedData) => {
  try {
    // Fetch the PDF template from public folder
    const pdfUrl = '/Advance_Request_Template.pdf';
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error('PDF template not found. Please ensure template is in public folder.');
    }
    
    const pdfBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    // Extract user details
    const userName = userData.name || userData.fullName || 'N/A';
    const empID = userData.id || userData.empId || 'N/A';
    const designation = userData.designation || 'Faculty Member';
    const department = userData.department || 'N/A';
    
    // Get form pages and fields
    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages');
    }
    
    // Get the first page for text insertion
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    // Try to fill form fields (if PDF is fillable form)
    try {
      const fields = form.getFields();
      
      // Map and fill all available fields
      const fieldValues = {
        'Requisition Date': new Date().toLocaleDateString(),
        'Name': userName,
        'Emp ID': empID,
        'Designation': designation,
        'Department': department,
        'Amount': submittedData.advanceAmount?.toString() || '',
        'Purpose': submittedData.advancePurpose || '',
        'Date': new Date().toLocaleDateString(),
      };
      
      // Try common field name variations
      fields.forEach(field => {
        const fieldName = field.getName();
        
        if (fieldName.toLowerCase().includes('date') && fieldName.toLowerCase().includes('requisition')) {
          try {
            field.setText(new Date().toLocaleDateString());
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('name') && !fieldName.toLowerCase().includes('iqac')) {
          try {
            field.setText(userName);
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('emp') || fieldName.toLowerCase().includes('id')) {
          try {
            field.setText(empID);
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('designation')) {
          try {
            field.setText(designation);
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('department')) {
          try {
            field.setText(department);
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('amount') || fieldName.toLowerCase().includes('rs')) {
          try {
            field.setText(submittedData.advanceAmount?.toString() || '');
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
        if (fieldName.toLowerCase().includes('purpose')) {
          try {
            field.setText(submittedData.advancePurpose || '');
          } catch (e) {
            console.warn(`Could not fill ${fieldName}`);
          }
        }
      });
    } catch (e) {
      console.warn('Could not access form fields:', e);
    }
    
    // Flatten the form (make fields non-editable)
    try {
      form.flatten();
    } catch (e) {
      console.warn('Could not flatten form:', e);
    }
    
    // Save and download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Advance_Request_${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error filling PDF:', error);
    throw error;
  }
};

/**
 * Generate a detailed text report of the submission
 */
export const generateTextReport = (submittedData) => {
  const content = `
╔══════════════════════════════════════════════════════════════════════╗
║     FOOD & REFRESHMENT FORM - ADVANCE REQUEST SUBMISSION REPORT      ║
╚══════════════════════════════════════════════════════════════════════╝

SUBMISSION INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submission Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Submission ID: ${Date.now()}

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event Date: ${submittedData.date ? new Date(submittedData.date).toLocaleDateString() : 'N/A'}
Resource Person Type: ${submittedData.resourcePersonType?.join(', ') || 'N/A'}
Number of Resource Persons: ${submittedData.numberOfResourcePersons || 'N/A'}
Internal Accompanying Staff: ${submittedData.numberOfInternalAccompanyingStaff || 'N/A'}

ADVANCE REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Finance Required: ${submittedData.financeRequired || 'No'}
${submittedData.financeRequired === 'Yes' ? `
Advance Amount Requested: ₹ ${submittedData.advanceAmount || '0'}
Purpose of Advance: ${submittedData.advancePurpose || 'N/A'}
` : ''}

AUTHORIZATION & CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This request has been submitted through the online portal and is
pending review by the administration. You will receive updates via
email regarding the status of your advance request.

For inquiries, please contact the Finance Department.

╔══════════════════════════════════════════════════════════════════════╗
║                    Keep this document for your records                ║
╚══════════════════════════════════════════════════════════════════════╝
`;

  return content;
};

/**
 * Download as text report when PDF is not available
 */
export const downloadTextReport = (submittedData) => {
  const content = generateTextReport(submittedData);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `Advance_Request_${Date.now()}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
