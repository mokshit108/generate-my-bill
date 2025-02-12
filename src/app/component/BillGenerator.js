'use client'
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BillGenerator = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [excelData, setExcelData] = useState(null);

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Create Basic Information sheet with table format
    const basicInfoSheet = [
      ['Basic Information'],
      ['Field', 'Value', 'Instructions'],
      ['Customer Name', '', 'Enter customer\'s full name'],
      ['Company Name', '', 'Enter company name'],
      ['Bill Number', '', 'Enter unique bill identifier'],
      ['Date', '', 'Format: YYYY-MM-DD'],
      ['Email', '', 'Enter customer\'s email'],
      ['Phone', '', 'Enter contact number'],
      ['Address', '', 'Enter complete address'],
      ['Payment Terms', '', 'e.g., Net 30, Due on Receipt'],
      ['Notes', '', 'Enter additional notes if any']
    ];

    // Create Items sheet with table format and formulas
    const itemsSheet = [
      ['Items Details'],
      ['No.', 'Description', 'Quantity', 'Unit Price', 'Amount'],
      ['1', '', '0', '0.00', '=C3*D3'],
      ['2', '', '0', '0.00', '=C4*D4'],
      ['3', '', '0', '0.00', '=C5*D5'],
      ['4', '', '0', '0.00', '=C6*D6'],
      ['5', '', '0', '0.00', '=C7*D7'],
      ['', '', '', 'Subtotal:', '=SUM(E3:E7)'],
      ['', '', '', 'Tax Rate (%):', '0'],
      ['', '', '', 'Tax Amount:', '=E8*E9/100'],
      ['', '', '', 'Total Amount:', '=E8+E10']
    ];

    // Instructions sheet
    const instructionsSheet = [
      ['Bill Generator Template Instructions'],
      [''],
      ['1. Basic Information Sheet:'],
      ['- Fill in all the required fields in the Basic Information sheet'],
      ['- Ensure date is in YYYY-MM-DD format'],
      ['- All fields are mandatory except Notes'],
      [''],
      ['2. Items Sheet:'],
      ['- Enter item details in the table provided'],
      ['- Amount will be calculated automatically'],
      ['- You can add up to 5 items'],
      ['- Subtotal, tax, and total amount are calculated automatically'],
      [''],
      ['3. Important Notes:'],
      ['- Do not modify the sheet structure'],
      ['- Use numbers only for quantity and prices'],
      ['- Do not include currency symbols']
    ];

    // Create and format sheets
    const wsBasic = XLSX.utils.aoa_to_sheet(basicInfoSheet);
    const wsItems = XLSX.utils.aoa_to_sheet(itemsSheet);
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsSheet);

    // Add column widths
    wsBasic['!cols'] = [
      { wch: 15 }, // Field
      { wch: 30 }, // Value
      { wch: 40 }  // Instructions
    ];

    wsItems['!cols'] = [
      { wch: 5 },  // No.
      { wch: 40 }, // Description
      { wch: 10 }, // Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }  // Amount
    ];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    XLSX.utils.book_append_sheet(wb, wsBasic, 'Basic Information');
    XLSX.utils.book_append_sheet(wb, wsItems, 'Items');

    // Save the file
    XLSX.writeFile(wb, 'bill-template.xlsx');
  };

  // Modified handleFileUpload to process structured template
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setLoading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Read Basic Information sheet
          const basicSheet = workbook.Sheets['Basic Information'];
          const itemsSheet = workbook.Sheets['Items'];

          if (!basicSheet || !itemsSheet) {
            throw new Error('Invalid template format');
          }

          // Process basic information
          const basicData = XLSX.utils.sheet_to_json(basicSheet, { range: 2 });
          const itemsData = XLSX.utils.sheet_to_json(itemsSheet, { range: 2, header: ['no', 'description', 'quantity', 'unitPrice', 'amount'] });

          // Filter out empty rows and summary rows
          const items = itemsData
            .filter(item => item.description && item.quantity)
            .map(item => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              amount: Number(item.amount)
            }));

          // Extract subtotal and tax from items sheet
          const subtotal = Number(itemsSheet['E8']?.v || 0);
          const tax = Number(itemsSheet['E10']?.v || 0);
          const totalAmount = Number(itemsSheet['E11']?.v || 0);

          setPreview({
            customerName: basicData[0]?.Value || 'N/A',
            companyName: basicData[1]?.Value || 'N/A',
            billNumber: basicData[2]?.Value || `BILL-${Math.random().toString(36).substr(2, 9)}`,
            date: basicData[3]?.Value || new Date().toLocaleDateString(),
            email: basicData[4]?.Value || 'N/A',
            phone: basicData[5]?.Value || 'N/A',
            address: basicData[6]?.Value || 'N/A',
            paymentTerms: basicData[7]?.Value || 'N/A',
            notes: basicData[8]?.Value || '',
            items,
            subtotal,
            tax,
            totalAmount
          });

          setExcelData({ basicData, itemsData });
          setLoading(false);
        } catch (error) {
          console.error('Error processing file:', error);
          setLoading(false);
          alert('Error processing the Excel file. Please ensure you are using the correct template format.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownload = () => {
    if (!preview) return;

    // Create new PDF document
    const doc = new jsPDF();

    // Add company header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(preview.companyName, 105, 20, { align: 'center' });

    // Add bill details
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);

    // Customer information
    doc.text('Bill To:', 20, 40);
    doc.setFont(undefined, 'bold');
    doc.text(preview.customerName, 20, 47);
    doc.setFont(undefined, 'normal');
    doc.text(preview.address, 20, 54);
    doc.text(preview.email, 20, 61);
    doc.text(preview.phone, 20, 68);

    // Bill information
    doc.text(`Bill Number: ${preview.billNumber}`, 120, 40);
    doc.text(`Date: ${preview.date}`, 120, 47);
    doc.text(`Payment Terms: ${preview.paymentTerms}`, 120, 54);

    // Add items table
    const tableData = [
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
      ...preview.items.map(item => [
        item.description,
        item.quantity,
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.amount.toFixed(2)}`
      ]),
      ['', '', 'Subtotal', `$${preview.subtotal.toFixed(2)}`],
      ['', '', 'Tax', `$${preview.tax.toFixed(2)}`],
      ['', '', 'Total', `$${preview.totalAmount.toFixed(2)}`]
    ];

    doc.autoTable({
      startY: 80,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });

    // Add notes and footer
    if (preview.notes) {
      doc.text('Notes:', 20, doc.autoTable.previous.finalY + 20);
      doc.text(preview.notes, 20, doc.autoTable.previous.finalY + 27);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });

    // Download the PDF
    doc.save(`bill-${preview.billNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Bill Generator</h1>

          {/* Template Download Button */}
          <button
            onClick={downloadTemplate}
            className="mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full"
          >
            <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5" />
            Download Excel Template
          </button>

          {/* File Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FontAwesomeIcon
                  icon={faFileExcel}
                  className="w-12 h-12 text-gray-400 mb-4"
                />
                <span className="text-gray-600">
                  {file ? file.name : "Upload Excel File"}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  Supported formats: .xlsx, .xls
                </span>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing file...</p>
            </div>
          )}

          {preview && !loading && (
            <div className="border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Bill Preview</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Customer Name</p>
                    <p className="font-medium">{preview.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Company Name</p>
                    <p className="font-medium">{preview.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bill Number</p>
                    <p className="font-medium">{preview.billNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{preview.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-medium">${preview.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Button */}
          {preview && !loading && (
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
              Download Bill PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;