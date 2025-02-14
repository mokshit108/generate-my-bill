import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (preview, isPreview = false) => {
  try {
    // Input validation and data preparation (same as before)
    if (!preview || typeof preview !== 'object') {
      throw new Error('Invalid preview data provided');
    }

    const safePreview = {
      ...preview,
      // Section 1: Your Company Information
      companyName: String(preview.companyName || ''),
      companyAddress: String(preview.companyAddress || ''),
      companyEmail: String(preview.companyEmail || ''),
      companyPhone: String(preview.companyPhone || ''),
      taxId: String(preview.taxId || ''),
      website: String(preview.website || ''),
      bankName: String(preview.bankName || ''),
      accountNumber: String(preview.accountNumber || ''),
      ifscCode: String(preview.ifscCode || ''),

      // Section 2: Customer Information
      customerName: String(preview.customerName || ''),
      customerCompanyName: String(preview.customerCompanyName || ''),
      billNumber: String(preview.billNumber || ''),
      date: String(preview.date || new Date().toISOString().split('T')[0]),
      customerEmail: String(preview.customerEmail || ''),
      customerPhone: String(preview.customerPhone || ''),
      customerAddress: String(preview.customerAddress || ''),
      paymentTerms: String(preview.paymentTerms || ''),
      notes: String(preview.notes || ''),

      // Section 4: Calculations
      subtotal: Number(preview.subtotal || 0).toFixed(2),
      taxRate: Number(preview.taxRate || 0).toFixed(2),
      taxAmount: Number(preview.taxAmount || 0).toFixed(2),
      totalAmount: Number(preview.totalAmount || 0).toFixed(2),

      // Section 3: Items
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

    // Set document properties (same as before)
    doc.setProperties({
      title: `Invoice - ${safePreview.billNumber}`,
      subject: 'Invoice Document',
      creator: 'Invoice Generator',
      author: safePreview.companyName,
      keywords: 'invoice, bill, payment'
    });

    // Define colors
    const colors = {
      primary: [40, 40, 40],    // Dark gray for main text
      label: [100, 100, 100],   // Medium gray for labels
      value: [0, 0, 0],         // Black for values
      accent: [66, 139, 202]    // Blue for accents
    };

    // Document margins and spacing
    const margins = {
      left: 20,
      right: 20,
      top: 20
    };
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margins.left - margins.right;
    const columnWidth = contentWidth / 2 - 5; // 5mm gap between columns

    // Add "INVOICE" header
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('INVOICE', pageWidth / 2, margins.top, { align: 'center' });

    let currentY = margins.top + 25;

    // Add section labels
    doc.setFontSize(12);
    doc.setTextColor(...colors.accent);
    doc.text('FROM:', margins.left, currentY);
    doc.text('TO:', pageWidth / 2 + 5, currentY);

    currentY += 8;

    // Function to add fields in a row
    const addFieldRow = (leftLabel, leftValue, rightLabel, rightValue, y) => {
      // Left side
      doc.setFontSize(10);
      doc.setTextColor(...colors.label);
      doc.setFont(undefined, 'normal');
      doc.text(leftLabel, margins.left, y);

      doc.setTextColor(...colors.value);
      doc.setFont(undefined, 'bold');
      const leftValueX = margins.left + 35;
      const maxLeftWidth = columnWidth - 35;
      doc.text(leftValue, leftValueX, y, {
        maxWidth: maxLeftWidth
      });

      // Right side
      if (rightLabel && rightValue) {
        const rightColumnX = pageWidth / 2 + 5;
        doc.setTextColor(...colors.label);
        doc.setFont(undefined, 'normal');
        doc.text(rightLabel, rightColumnX, y);

        doc.setTextColor(...colors.value);
        doc.setFont(undefined, 'bold');
        const rightValueX = rightColumnX + 35;
        const maxRightWidth = columnWidth - 35;
        doc.text(rightValue, rightValueX, y, {
          maxWidth: maxRightWidth
        });
      }
    };

    // Company and Customer Information
    const lineHeight = 8;
    addFieldRow('Company:', safePreview.companyName, 'Company:', safePreview.customerCompanyName, currentY);
    currentY += lineHeight;

    // Add multiline address with proper spacing
    doc.setTextColor(...colors.label);
    doc.setFont(undefined, 'normal');
    doc.text('Address:', margins.left, currentY);
    doc.text('Address:', pageWidth / 2 + 5, currentY);

    doc.setTextColor(...colors.value);
    doc.setFont(undefined, 'bold');
    const addressLines = doc.splitTextToSize(safePreview.companyAddress, columnWidth - 35);
    const customerAddressLines = doc.splitTextToSize(safePreview.customerAddress, columnWidth - 35);

    addressLines.forEach((line, index) => {
      doc.text(line, margins.left + 35, currentY + (index * 5));
    });

    customerAddressLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2 + 40, currentY + (index * 5));
    });

    // Adjust currentY based on the longest address
    const maxLines = Math.max(addressLines.length, customerAddressLines.length);
    currentY += (maxLines * 5) + lineHeight;

    // Continue with other fields
    addFieldRow('Email:', safePreview.companyEmail, 'Email:', safePreview.customerEmail, currentY);
    currentY += lineHeight;

    addFieldRow('Phone:', safePreview.companyPhone, 'Phone:', safePreview.customerPhone, currentY);
    currentY += lineHeight;

    addFieldRow('Tax ID:', safePreview.taxId, '', '', currentY);
    currentY += lineHeight;

    addFieldRow('Website:', safePreview.website, '', '', currentY);
    currentY += lineHeight * 1.5;

    // Bank Details Section
    doc.setFontSize(12);
    doc.setTextColor(...colors.accent);
    doc.text('BANK DETAILS', margins.left, currentY);
    currentY += 8;

    // Add bank details
    doc.setFontSize(10);
    addFieldRow('Bank Name:', safePreview.bankName, 'Invoice No:', safePreview.billNumber, currentY);
    currentY += lineHeight;

    addFieldRow('Account No:', safePreview.accountNumber, 'Date:', safePreview.date, currentY);
    currentY += lineHeight;

    addFieldRow('IFSC Code:', safePreview.ifscCode, 'Terms:', safePreview.paymentTerms, currentY);
    currentY += lineHeight * 1.5;

    // Add separator line
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.5);
    doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
    currentY += 10;

    // Prepare items table
    const tableData = [
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
      ...safePreview.items.map(item => [
        item.description,
        item.quantity,
        `$${item.unitPrice}`,
        `$${item.amount}`
      ])
    ];

    // Add summary rows
    const summaryRows = [
      ['', '', 'Subtotal:', `$${safePreview.subtotal}`],
      ['', '', `Tax (${safePreview.taxRate}%)`, `$${safePreview.taxAmount}`],
      ['', '', 'Total Amount:', `$${safePreview.totalAmount}`]
    ];

    // Configure and draw table
    doc.autoTable({
      startY: currentY,
      head: [tableData[0]],
      body: [...tableData.slice(1), ...summaryRows],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        textColor: [40, 40, 40]
      },
      headStyles: {
        fillColor: colors.accent,
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: margins.left, right: margins.right },
      didParseCell: (data) => {
        if (data.row.index >= tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = colors.primary;
        }
      }
    });

    // Add notes section
    if (safePreview.notes) {
      const notesY = doc.autoTable.previous.finalY + 20;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...colors.accent);
      doc.text('Notes:', margins.left, notesY);

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.primary);
      doc.text(safePreview.notes, margins.left, notesY + 7, {
        maxWidth: contentWidth,
        lineHeightFactor: 1.5
      });
    }

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, {
      align: 'center'
    });

    // Add preview watermark if needed
    if (isPreview) {
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
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