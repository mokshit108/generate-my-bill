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

    // Updated colors for a more professional look
    const colors = {
      primary: [51, 51, 51],     // Darker gray for main text
      secondary: [102, 102, 102], // Medium gray for labels
      accent: [71, 71, 71],      // Dark gray for headers
      table: [66, 139, 202]      // Blue only for table
    };

    // Optimized margins and spacing
    const margins = {
      left: 15,
      right: 15,
      top: 15
    };
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margins.left - margins.right;
    const columnWidth = contentWidth / 2 - 3;

    // Invoice header with updated styling
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('INVOICE', pageWidth / 2, margins.top, { align: 'center' });

    let currentY = margins.top + 15;

    // Section labels with improved spacing
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.text('FROM:', margins.left, currentY);
    doc.text('TO:', pageWidth / 2 + 3, currentY);

    currentY += 6;

    const addFieldRow = (leftLabel, leftValue, rightLabel, rightValue, y) => {
      doc.setFontSize(9);
      doc.setTextColor(...colors.secondary);
      doc.setFont(undefined, 'normal');
      doc.text(leftLabel, margins.left, y);

      doc.setTextColor(...colors.primary);
      doc.setFont(undefined, 'bold');
      const leftValueX = margins.left + 30;
      const maxLeftWidth = columnWidth - 30;
      doc.text(leftValue, leftValueX, y, {
        maxWidth: maxLeftWidth
      });

      if (rightLabel && rightValue) {
        const rightColumnX = pageWidth / 2 + 3;
        doc.setTextColor(...colors.secondary);
        doc.setFont(undefined, 'normal');
        doc.text(rightLabel, rightColumnX, y);

        doc.setTextColor(...colors.primary);
        doc.setFont(undefined, 'bold');
        const rightValueX = rightColumnX + 30;
        const maxRightWidth = columnWidth - 30;
        doc.text(rightValue, rightValueX, y, {
          maxWidth: maxRightWidth
        });
      }
    };

    // Optimized line height
    const lineHeight = 6;

    // Company and Customer Information with tighter spacing
    addFieldRow('Company:', safePreview.companyName, 'Company:', safePreview.customerCompanyName, currentY);
    currentY += lineHeight;

    doc.setTextColor(...colors.secondary);
    doc.setFont(undefined, 'normal');
    doc.text('Address:', margins.left, currentY);
    doc.text('Address:', pageWidth / 2 + 3, currentY);

    doc.setTextColor(...colors.primary);
    doc.setFont(undefined, 'bold');
    const addressLines = doc.splitTextToSize(safePreview.companyAddress, columnWidth - 30);
    const customerAddressLines = doc.splitTextToSize(safePreview.customerAddress, columnWidth - 30);

    addressLines.forEach((line, index) => {
      doc.text(line, margins.left + 30, currentY + (index * 4));
    });

    customerAddressLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2 + 33, currentY + (index * 4));
    });

    const maxLines = Math.max(addressLines.length, customerAddressLines.length);
    currentY += (maxLines * 4) + lineHeight;

    // Contact Information
    addFieldRow('Email:', safePreview.companyEmail, 'Email:', safePreview.customerEmail, currentY);
    currentY += lineHeight;
    addFieldRow('Phone:', safePreview.companyPhone, 'Phone:', safePreview.customerPhone, currentY);
    currentY += lineHeight;
    addFieldRow('Tax ID:', safePreview.taxId, '', '', currentY);
    currentY += lineHeight;
    addFieldRow('Website:', safePreview.website, '', '', currentY);
    currentY += lineHeight;

    // Bank Details with improved spacing
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.text('BANK DETAILS', margins.left, currentY + 3);
    currentY += 8;

    doc.setFontSize(9);
    addFieldRow('Bank Name:', safePreview.bankName, 'Invoice No:', safePreview.billNumber, currentY);
    currentY += lineHeight;
    addFieldRow('Account No:', safePreview.accountNumber, 'Date:', safePreview.date, currentY);
    currentY += lineHeight;
    addFieldRow('IFSC Code:', safePreview.ifscCode, 'Terms:', safePreview.paymentTerms, currentY);
    currentY += lineHeight;

    // Separator line
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.3);
    doc.line(margins.left, currentY + 2, pageWidth - margins.right, currentY + 2);
    currentY += 8;

    // Items table with optimized styling
    const tableData = [
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
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
      ['', '', 'Total Amount:', `${safePreview.totalAmount}`]
    ];

    // Enhanced table styling
    doc.autoTable({
      startY: currentY,
      head: [tableData[0]],
      body: [...tableData.slice(1), ...summaryRows],
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        textColor: colors.primary
      },
      headStyles: {
        fillColor: colors.table,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: margins.left, right: margins.right },
      didParseCell: (data) => {
        if (data.row.index >= tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = colors.primary;
        }
      }
    });

    // Notes section with improved spacing
    if (safePreview.notes) {
      const notesY = doc.autoTable.previous.finalY + 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...colors.accent);
      doc.text('Notes:', margins.left, notesY);

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(safePreview.notes, margins.left, notesY + 5, {
        maxWidth: contentWidth,
        lineHeightFactor: 1.3
      });
    }

    // Footer with optimized positioning
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(...colors.primary);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, {
      align: 'center'
    });

    // Preview watermark if needed
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