import * as XLSX from 'xlsx';

export const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Combined Sheet Data
  const combinedSheet = [
    // Basic Information
    ['Bill Generator Template'],
    ['Field', 'Value', 'Instructions'],
    ['Customer Name', '', 'Enter customer\'s full name'],
    ['Company Name', '', 'Enter company name'],
    ['Bill Number', '', 'Enter unique bill identifier'],
    ['Date', '', 'Format: YYYY-MM-DD'],
    ['Email', '', 'Enter customer\'s email'],
    ['Phone', '', 'Enter contact number'],
    ['Address', '', 'Enter complete address'],
    ['Payment Terms', '', 'e.g., Net 30, Due on Receipt'],
    ['Notes', '', 'Enter additional notes if any'],
    [], // Empty row for spacing
    // Items Table
    ['No.', 'Description', 'Quantity', 'Unit Price', 'Amount'],
    [1, '', 0, 0.00, { f: 'C14*D14', v: 0 }], // Formula for Amount (Row 14)
    [2, '', 0, 0.00, { f: 'C15*D15', v: 0 }], // Formula for Amount (Row 15)
    [3, '', 0, 0.00, { f: 'C16*D16', v: 0 }], // Formula for Amount (Row 16)
    [4, '', 0, 0.00, { f: 'C17*D17', v: 0 }], // Formula for Amount (Row 17)
    [5, '', 0, 0.00, { f: 'C18*D18', v: 0 }], // Formula for Amount (Row 18)
    [], // Empty row for spacing
    // Calculations
    ['', '', '', 'Subtotal:', { f: 'SUM(E14:E18)', v: 0 }], // Formula for Subtotal
    ['', '', '', 'Tax Rate (%):', 0],
    ['', '', '', 'Tax Amount:', { f: 'E20*E21/100', v: 0 }], // Formula for Tax Amount
    ['', '', '', 'Total Amount:', { f: 'E20+E22', v: 0 }] // Formula for Total Amount
  ];

  // Create the sheet
  const ws = XLSX.utils.aoa_to_sheet(combinedSheet);

  // Add column widths for better readability
  ws['!cols'] = [
    { wch: 15 },  // Column A (No.)
    { wch: 40 },  // Column B (Description)
    { wch: 10 },  // Column C (Quantity)
    { wch: 12 },  // Column D (Unit Price)
    { wch: 12 }   // Column E (Amount)
  ];

  // Style the header rows
  ['A1:E1', 'A2:E2', 'A13:E13'].forEach(range => {
    if (!ws[range]) ws[range] = {};
    ws[range].s = { font: { bold: true }, fill: { fgColor: { rgb: "CCCCCC" } } };
  });

  // Add the sheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Bill Template');

  // Save the file
  XLSX.writeFile(wb, 'bill-template.xlsx');
};