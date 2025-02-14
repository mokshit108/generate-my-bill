import * as XLSX from 'xlsx';

export const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();
  const userInfo = localStorage.getItem('userInvoiceInfo')
    ? JSON.parse(localStorage.getItem('userInvoiceInfo'))
    : {};

  // Combined Sheet Data with formulas
  const combinedSheet = [
    // Basic Information
    ['Invoice Generator Template'],
    ['Section 1: Your Company Information', 'Value', 'Instructions'],
    ['Your Company Name', userInfo.companyName || '', 'Your company/business name'],
    ['Your Company Address', userInfo.companyAddress || '', 'Your business address'],
    ['Your Company Email', userInfo.companyEmail || '', 'Your business email for contact'],
    ['Your Company Phone', userInfo.companyPhone || '', 'Your business phone number'],
    ['Your Tax ID', userInfo.taxId || '', 'Your tax identification number'],
    ['Your Website', userInfo.website || '', 'Your business website'],
    ['Your Bank Name', userInfo.bankName || '', 'Your bank name'],
    ['Your Account Number', userInfo.accountNumber || '', 'Your bank account number'],
    ['Your IFSC Code', userInfo.ifscCode || '', 'Your bank IFSC code'],
    [], // Empty row for spacing
    ['Section 2: Customer Information', '', ''],
    ['Customer Name', '', 'Customer\'s full name'],
    ['Customer Company Name', '', 'Customer\'s company name'],
    ['Bill Number', '', 'Unique bill identifier'],
    ['Date', '', 'Format: YYYY-MM-DD'],
    ['Customer Email', '', 'Customer\'s email address'],
    ['Customer Phone', '', 'Customer\'s contact number'],
    ['Customer Address', '', 'Customer\'s complete address'],
    ['Payment Terms', '', 'e.g., Net 30, Due on Receipt'],
    ['Notes', '', 'Additional notes if any'],
    [], // Empty row for spacing
    // Items Table with formulas
    ['Section 3: Invoice Items', '', '', '', ''],
    ['No.', 'Description', 'Quantity', 'Unit Price', 'Amount'],
    [1, '', 0, 0, { f: 'C26*D26' }],
    [2, '', 0, 0, { f: 'C27*D27' }],
    [3, '', 0, 0, { f: 'C28*D28' }],
    [4, '', 0, 0, { f: 'C29*D29' }],
    [5, '', 0, 0, { f: 'C30*D30' }],
    [], // Empty row for spacing
    // Calculations with formulas
    ['Section 4: Totals', '', '', '', ''],
    ['', '', '', 'Subtotal:', { f: 'SUM(E26:E30)' }],
    ['', '', '', 'Tax Rate (%):', 0],
    ['', '', '', 'Tax Amount:', { f: 'E33*E34/100' }],
    ['', '', '', 'Total Amount:', { f: 'E33+E35' }]
  ];

  // Create and style the sheet
  const ws = XLSX.utils.aoa_to_sheet(combinedSheet);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 },  // A
    { wch: 40 },  // B
    { wch: 15 },  // C
    { wch: 15 },  // D
    { wch: 15 }   // E
  ];

  // Add styling to headers
  ['A1:E1', 'A2:E2', 'A13:E13', 'A24:E24', 'A32:E32'].forEach(range => {
    ws[range] = {
      s: {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      }
    };
  });

  // Add the sheet to workbook and save
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice Template');
  XLSX.writeFile(wb, 'invoice-template.xlsx');
};