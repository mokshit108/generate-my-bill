import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (preview, isPreview = false) => {
  try {
    // Input validation
    if (!preview || typeof preview !== 'object') {
      throw new Error('Invalid preview data provided');
    }

    // Ensure all numeric values have default values and proper formatting
    const safePreview = {
      ...preview,
      companyName: String(preview.companyName || ''),
      customerName: String(preview.customerName || ''),
      billNumber: String(preview.billNumber || ''),
      date: String(preview.date || new Date().toISOString().split('T')[0]),
      email: String(preview.email || ''),
      phone: String(preview.phone || ''),
      address: String(preview.address || ''),
      paymentTerms: String(preview.paymentTerms || ''),
      notes: String(preview.notes || ''),
      subtotal: Number(preview.subtotal || 0).toFixed(2),
      taxAmount: Number(preview.taxAmount || 0).toFixed(2),
      taxRate: Number(preview.taxRate || 0).toFixed(2),
      totalAmount: Number(preview.totalAmount || 0).toFixed(2),
      items: Array.isArray(preview.items) ? preview.items.map(item => ({
        description: String(item.description || ''),
        quantity: Number(item.quantity || 0).toFixed(2),
        unitPrice: Number(item.unitPrice || 0).toFixed(2),
        amount: Number(item.amount || 0).toFixed(2)
      })) : []
    };

    // Create new PDF document with proper configuration
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Set document properties
    doc.setProperties({
      title: `Bill - ${safePreview.billNumber}`,
      subject: 'Invoice Document',
      creator: 'Bill Generator',
      author: safePreview.companyName,
      keywords: 'invoice, bill, payment'
    });

    // Add company header with proper positioning and styling
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(safePreview.companyName, doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Add bill details with improved formatting
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);

    // Customer information block
    const customerBlock = [
      'Bill To:',
      safePreview.customerName,
      safePreview.address,
      safePreview.email,
      safePreview.phone
    ].filter(Boolean);

    customerBlock.forEach((line, index) => {
      const yPos = 40 + (index * 7);
      if (index === 1) doc.setFont(undefined, 'bold');
      doc.text(line, 20, yPos);
      if (index === 1) doc.setFont(undefined, 'normal');
    });

    // Bill information block
    const billInfoBlock = [
      `Bill Number: ${safePreview.billNumber}`,
      `Date: ${safePreview.date}`,
      `Payment Terms: ${safePreview.paymentTerms}`
    ];

    billInfoBlock.forEach((line, index) => {
      doc.text(line, 120, 40 + (index * 7));
    });

    // Prepare table data with proper formatting
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
      ['', '', 'Subtotal', `$${safePreview.subtotal}`],
      ['', '', `Tax (${safePreview.taxRate}%)`, `$${safePreview.taxAmount}`],
      ['', '', 'Total', `$${safePreview.totalAmount}`]
    ];

    // Configure and draw table
    doc.autoTable({
      startY: 80,
      head: [tableData[0]],
      body: [...tableData.slice(1), ...summaryRows],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      didParseCell: (data) => {
        // Apply special styling to summary rows
        if (data.row.index >= tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Add notes section if present
    if (safePreview.notes) {
      const notesY = doc.autoTable.previous.finalY + 20;
      doc.setFontSize(11);
      doc.text('Notes:', 20, notesY);
      doc.setFontSize(10);
      doc.text(safePreview.notes, 20, notesY + 7, {
        maxWidth: doc.internal.pageSize.width - 40,
        lineHeightFactor: 1.5
      });
    }

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, pageHeight - 20, {
      align: 'center'
    });

    // Add watermark if preview mode
    if (isPreview) {
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.text('PREVIEW', doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
        align: 'center',
        angle: 45
      });
    }

    // Return the appropriate format based on the isPreview parameter
    if (isPreview) {
      return doc.output('blob');
    }

    return doc;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
};