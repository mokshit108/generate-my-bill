import * as XLSX from 'xlsx';

export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
          throw new Error('Invalid template format');
        }

        // Helper function to convert Excel date to YYYY-MM-DD format
        const convertExcelDate = (excelDate) => {
          if (!excelDate) return new Date().toISOString().split('T')[0];
          const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
        };

        // Helper function to ensure string type
        const ensureString = (value) => {
          if (value === undefined || value === null) return '';
          return String(value);
        };

        // Helper function to ensure number type with 2 decimal places
        const ensureNumber = (value) => {
          const num = Number(value) || 0;
          return Number(num.toFixed(2));
        };

        // Extract basic information
        const basicInfo = {};
        for (let i = 2; i <= 10; i++) {
          const field = sheet[`A${i}`]?.v;
          const value = sheet[`B${i}`]?.v;
          if (field) {
            basicInfo[field] = value ?? '';
          }
        }

        // Extract items (starting from row 14)
        const items = [];
        for (let i = 14; i <= 18; i++) {
          const description = sheet[`B${i}`]?.v;
          const quantity = sheet[`C${i}`]?.v;
          const unitPrice = sheet[`D${i}`]?.v;
          const amount = sheet[`E${i}`]?.v;

          if (description && quantity) {
            items.push({
              description: ensureString(description),
              quantity: ensureNumber(quantity),
              unitPrice: ensureNumber(unitPrice),
              amount: ensureNumber(amount)
            });
          }
        }

        // Extract calculations with proper number formatting
        const subtotal = ensureNumber(sheet['E20']?.v);
        const taxRate = ensureNumber(sheet['E21']?.v);
        const taxAmount = ensureNumber(sheet['E22']?.v);
        const totalAmount = ensureNumber(sheet['E23']?.v);

        const processedData = {
          customerName: ensureString(basicInfo['Customer Name']) || 'N/A',
          companyName: ensureString(basicInfo['Company Name']) || 'N/A',
          billNumber: ensureString(basicInfo['Bill Number']) || `BILL-${Math.random().toString(36).substr(2, 9)}`,
          date: convertExcelDate(basicInfo['Date']),
          email: ensureString(basicInfo['Email']) || 'N/A',
          phone: ensureString(basicInfo['Phone']) || 'N/A',
          address: ensureString(basicInfo['Address']) || 'N/A',
          paymentTerms: ensureString(basicInfo['Payment Terms']) || 'N/A',
          notes: ensureString(basicInfo['Notes']) || '',
          items,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount
        };

        // Debug log to check values
        console.log('Processed Data:', processedData);

        resolve(processedData);
      } catch (error) {
        console.error('Error in Excel processing:', error);
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};