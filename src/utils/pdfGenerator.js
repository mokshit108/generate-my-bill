import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        return `${day}-${month}-${year}`;
      }
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return dateString;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

export const generatePDF = async (preview, isPreview = false) => {
  try {
    if (!preview || typeof preview !== 'object') {
      throw new Error('Invalid preview data provided');
    }

    const safePreview = {
      ...preview,
      companyName: String(preview.companyName || ''),
      companyAddress: String(preview.companyAddress || ''),
      companyEmail: String(preview.companyEmail || ''),
      companyPhone: String(preview.companyPhone || ''),
      taxId: String(preview.taxId || ''),
      website: String(preview.website || ''),
      bankName: String(preview.bankName || ''),
      accountNumber: String(preview.accountNumber || ''),
      ifscCode: String(preview.ifscCode || ''),
      customerName: String(preview.customerName || ''),
      customerCompanyName: String(preview.customerCompanyName || ''),
      billNumber: String(preview.billNumber || ''),
      date: formatDate(preview.date || new Date().toISOString().split('T')[0]),
      customerEmail: String(preview.customerEmail || ''),
      customerPhone: String(preview.customerPhone || ''),
      customerAddress: String(preview.customerAddress || ''),
      paymentTerms: String(preview.paymentTerms || ''),
      notes: String(preview.notes || ''),
      subtotal: Number(preview.subtotal || 0).toFixed(2),
      taxRate: Number(preview.taxRate || 0).toFixed(2),
      taxAmount: Number(preview.taxAmount || 0).toFixed(2),
      totalAmount: Number(preview.totalAmount || 0).toFixed(2),
      items: Array.isArray(preview.items) ? preview.items.map(item => ({
        description: String(item.description || ''),
        quantity: Number(item.quantity || 0).toFixed(2),
        unitPrice: Number(item.unitPrice || 0).toFixed(2),
        amount: Number(item.amount || 0).toFixed(2)
      })) : []
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    doc.setProperties({
      title: `Invoice - ${safePreview.billNumber}`,
      subject: 'Invoice Document',
      creator: 'Invoice Generator',
      author: safePreview.companyName,
      keywords: 'invoice, bill, payment'
    });

    // Formal color scheme
    const colors = {
      primary: [51, 51, 51],     // Dark gray for main text
      secondary: [102, 102, 102], // Medium gray for labels
      accent: [71, 71, 71],      // Dark gray for headers
      tableHeader: [33, 82, 135], // Formal blue for table headers
      tableBorder: [200, 200, 200] // Light grey for table borders
    };

    // Compact margins
    const margins = {
      left: 15,
      right: 15,
      top: 15
    };

    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margins.left - margins.right;
    const columnWidth = contentWidth / 2 - 2;

    // Compact header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('INVOICE', pageWidth / 2, margins.top, { align: 'center' });

    let currentY = margins.top + 15; // Increased spacing after header

    // Compact section headers
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('FROM:', margins.left, currentY);
    doc.text('TO:', pageWidth / 2 + 3, currentY);

    currentY += 7; // Increased spacing after section headers

    const addFieldRow = (leftLabel, leftValue, rightLabel, rightValue, y) => {
      doc.setFontSize(10); // Increased font size for keys and values
      doc.setTextColor(...colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text(leftLabel, margins.left, y);

      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'normal');
      const leftValueX = margins.left + 18; // Reduced space between key and value
      const maxLeftWidth = columnWidth - 18;
      doc.text(leftValue, leftValueX, y, {
        maxWidth: maxLeftWidth
      });

      if (rightLabel && rightValue) {
        const rightColumnX = pageWidth / 2 + 3;
        doc.setTextColor(...colors.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text(rightLabel, rightColumnX, y);

        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'normal');
        const rightValueX = rightColumnX + 18; // Reduced space between key and value
        const maxRightWidth = columnWidth - 18;
        doc.text(rightValue, rightValueX, y, {
          maxWidth: maxRightWidth
        });
      }
    };

    // Reduced line height
    const lineHeight = 6; // Slightly increased line height

    // Company and Customer Information
    addFieldRow('Company:', safePreview.companyName, 'Company:', safePreview.customerCompanyName, currentY);
    currentY += lineHeight + 2; // Increased spacing after company info

    // Address in the same line (FROM)
    doc.setFontSize(10);
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', margins.left, currentY);

    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(safePreview.companyAddress, columnWidth - 18);
    const customerAddressLines = doc.splitTextToSize(safePreview.customerAddress, columnWidth - 18);

    // Display FROM address in the same line
    doc.text(addressLines[0], margins.left + 18, currentY);
    if (addressLines.length > 1) {
      for (let i = 1; i < addressLines.length; i++) {
        currentY += 4; // Adjust for multi-line addresses
        doc.text(addressLines[i], margins.left, currentY); // Align with the start of the line
      }
    }

    // Address in the same line (TO)
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', pageWidth / 2 + 3, currentY - (addressLines.length - 1) * 4);

    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'normal');
    // Display TO address in the same line
    doc.text(customerAddressLines[0], pageWidth / 2 + 3, currentY);
    if (customerAddressLines.length > 1) {
      for (let i = 1; i < customerAddressLines.length; i++) {
        currentY += 4; // Adjust for multi-line addresses
        doc.text(customerAddressLines[i], pageWidth / 2 + 1, currentY); // Align with the start of the line
      }
    }

    const maxLines = Math.max(addressLines.length, customerAddressLines.length);
    currentY += (maxLines * 4) + lineHeight + 4; // Increased spacing after address

    // Contact Information
    addFieldRow('Email:', safePreview.companyEmail, 'Email:', safePreview.customerEmail, currentY);
    currentY += lineHeight + 2; // Increased spacing after email
    addFieldRow('Phone:', safePreview.companyPhone, 'Phone:', safePreview.customerPhone, currentY);
    currentY += lineHeight + 2; // Increased spacing after phone
    addFieldRow('Tax ID:', safePreview.taxId, '', '', currentY);
    currentY += lineHeight + 6; // Increased spacing after tax ID

    // More gap above Bank Details
    currentY += 4; // Additional spacing

    // Bank Details section (bold)
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold'); // Bold for bank details
    doc.text('BANK DETAILS', margins.left, currentY + 2);
    currentY += 8; // Increased spacing after bank details header

    doc.setFontSize(10); // Increased font size for bank details
    addFieldRow('Bank:', safePreview.bankName, 'Invoice No:', `  ${safePreview.billNumber}`, currentY); // Added space for Invoice No
    currentY += lineHeight + 2; // Increased spacing after bank name
    addFieldRow('Account:', safePreview.accountNumber, 'Date:', safePreview.date, currentY);
    currentY += lineHeight + 2; // Increased spacing after account number
    addFieldRow('IFSC:', safePreview.ifscCode, 'Terms:', safePreview.paymentTerms, currentY);
    currentY += lineHeight + 6; // Increased spacing after IFSC

    // Compact separator
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
    currentY += 6; // Increased spacing after separator

    // Items table
    const tableData = [
      ['Description', 'Qty', 'Price', 'Amount'],
      ...safePreview.items.map(item => [
        item.description,
        item.quantity,
        `${item.unitPrice}`,
        `${item.amount}`
      ])
    ];

    const summaryRows = [
      ['', '', 'Subtotal:', `${safePreview.subtotal}`],
      ['', '', `Tax (${safePreview.taxRate}%)`, `${safePreview.taxAmount}`],
      ['', '', 'Total:', `${safePreview.totalAmount}`]
    ];

    // Compact table styling
    doc.autoTable({
      startY: currentY,
      head: [tableData[0]],
      body: [...tableData.slice(1), ...summaryRows],
      theme: 'grid',
      styles: {
        fontSize: 10, // Increased font size for table
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        textColor: colors.primary,
        font: 'helvetica',
        lineColor: colors.tableBorder, // Light grey for table borders
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: colors.tableHeader, // Formal blue for table headers
        textColor: 255, // White text for headers
        fontStyle: 'bold',
        fontSize: 10, // Increased font size for headers
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' }, // Left align description
        1: { cellWidth: 20, halign: 'center' },  // Center align quantity
        2: { cellWidth: 25, halign: 'center' },  // Center align price
        3: { cellWidth: 25, halign: 'center' }   // Center align amount
      },
      margin: { left: margins.left, right: margins.right },
      didParseCell: (data) => {
        if (data.row.index >= tableData.length - 1) {
          data.cell.styles.fontStyle = 'normal';
          data.cell.styles.textColor = colors.primary;
          data.cell.styles.fontSize = 10; // Increased font size for summary rows
          data.cell.styles.halign = 'left'; // Left align subtotal, tax, and total
        }
      }
    });

    // Compact notes section
    if (safePreview.notes) {
      const notesY = doc.autoTable.previous.finalY + 8; // Increased spacing after table
      doc.setFontSize(10); // Increased font size for notes
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.primary);
      doc.text('Notes:', margins.left, notesY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...colors.secondary);
      doc.text(safePreview.notes, margins.left, notesY + 4, {
        maxWidth: contentWidth,
        lineHeightFactor: 1.2
      });
    }

    // Compact footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10); // Increased font size for footer
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, {
      align: 'center'
    });

    if (isPreview) {
      doc.setTextColor(150, 150, 150); // Gray color for preview
      doc.setFontSize(60);
      doc.setFont('helvetica', 'normal'); // Not bold
      doc.text('PREVIEW', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });
    }

    return isPreview ? doc.output('blob') : doc;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
};