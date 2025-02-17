// processExcelFile.js
import * as XLSX from "xlsx";

// Constants for cell references
const CELL_REFS = {
  COMPANY: {
    NAME: "B3",
    ADDRESS: "B4",
    CONTACT_EMAIL: "B5",
    CONTACT_PHONE: "B6",
    TAX_ID: "B7",
    WEBSITE: "B8",
    BANK_NAME: "B9",
    ACCOUNT_NUMBER: "B10",
    IFSC_CODE: "B11",
  },
  CUSTOMER: {
    NAME: "B14",
    COMPANY_NAME: "B15",
    BILL_NUMBER: "B16",
    DATE: "B17",
    CLIENT_EMAIL: "B18",
    CLIENT_PHONE: "B19",
    ADDRESS: "B20",
    PAYMENT_TERMS: "B21",
    NOTES: "B22",
  },
  ITEMS: {
    START_ROW: 26,
    END_ROW: 30,
    DESCRIPTION_COL: "B",
    QUANTITY_COL: "C",
    UNIT_PRICE_COL: "D",
    AMOUNT_COL: "E",
  },
  TOTALS: {
    SUBTOTAL: "E33",
    TAX_RATE: "E34",
    TAX_AMOUNT: "E35",
    TOTAL_AMOUNT: "E36",
  },
};

// Helper functions
const ensureString = (value) => value?.toString() || "";
const ensureNumber = (value) => {
  const num = Number(value || 0);
  return Number(num.toFixed(2));
};

// Function to properly handle Excel dates
const getDateValue = (sheet, cell) => {
  const cellData = sheet[cell];
  if (!cellData || !cellData.v) return ""; // Ensure cell exists

  if (cellData.t === "d") {
    // If cell is a date, add one day correction
    const correctedDate = new Date(cellData.v);
    correctedDate.setDate(correctedDate.getDate() + 1);
    return correctedDate.toLocaleDateString("en-GB"); // Format as DD-MM-YYYY
  } else if (typeof cellData.v === "number") {
    // Excel stores dates as numbers, adjust for time zone
    const excelDate = new Date((cellData.v - 25569) * 86400000);
    excelDate.setDate(excelDate.getDate() + 1); // Adjust for Excel-JS offset
    return excelDate.toLocaleDateString("en-GB"); // Adjust format
  }
  return cellData.v; // Return as-is if not a date
};

export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true, // Enable date parsing
          dateNF: "dd-mm-yyyy", // Specify the date format
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
          throw new Error("Invalid template format");
        }

        const getCellValue = (cell) => {
          const cellData = sheet[cell];
          return cellData?.v ?? "";
        };

        // Get stored user info
        const userInfo = localStorage.getItem("userInvoiceInfo")
          ? JSON.parse(localStorage.getItem("userInvoiceInfo"))
          : {};

        // Process billing company info
        const billingCompanyInfo = {
          companyName:
            userInfo.companyName || getCellValue(CELL_REFS.COMPANY.NAME),
          companyAddress:
            userInfo.companyAddress || getCellValue(CELL_REFS.COMPANY.ADDRESS),
          companyEmail:
            userInfo.companyEmail ||
            getCellValue(CELL_REFS.COMPANY.CONTACT_EMAIL),
          companyPhone:
            userInfo.companyPhone ||
            getCellValue(CELL_REFS.COMPANY.CONTACT_PHONE),
          taxId: userInfo.taxId || getCellValue(CELL_REFS.COMPANY.TAX_ID),
          website: userInfo.website || getCellValue(CELL_REFS.COMPANY.WEBSITE),
          bankName:
            userInfo.bankName || getCellValue(CELL_REFS.COMPANY.BANK_NAME),
          accountNumber:
            userInfo.accountNumber ||
            getCellValue(CELL_REFS.COMPANY.ACCOUNT_NUMBER),
          ifscCode:
            userInfo.ifscCode || getCellValue(CELL_REFS.COMPANY.IFSC_CODE),
        };

        // Process customer info
        const customerInfo = {
          customerName: getCellValue(CELL_REFS.CUSTOMER.NAME),
          customerCompanyName: getCellValue(CELL_REFS.CUSTOMER.COMPANY_NAME),
          billNumber:
            getCellValue(CELL_REFS.CUSTOMER.BILL_NUMBER) || `INV-${Date.now()}`,
          date: getDateValue(sheet, CELL_REFS.CUSTOMER.DATE), // Use updated function
          customerEmail: getCellValue(CELL_REFS.CUSTOMER.CLIENT_EMAIL),
          customerPhone: getCellValue(CELL_REFS.CUSTOMER.CLIENT_PHONE),
          customerAddress: getCellValue(CELL_REFS.CUSTOMER.ADDRESS),
          paymentTerms: getCellValue(CELL_REFS.CUSTOMER.PAYMENT_TERMS),
          notes: getCellValue(CELL_REFS.CUSTOMER.NOTES),
        };

        console.log(customerInfo, "cs info");

        // Process items
        const items = [];
        for (
          let i = CELL_REFS.ITEMS.START_ROW;
          i <= CELL_REFS.ITEMS.END_ROW;
          i++
        ) {
          const description = getCellValue(
            `${CELL_REFS.ITEMS.DESCRIPTION_COL}${i}`
          );
          const quantity = getCellValue(`${CELL_REFS.ITEMS.QUANTITY_COL}${i}`);
          const unitPrice = getCellValue(
            `${CELL_REFS.ITEMS.UNIT_PRICE_COL}${i}`
          );
          const amount = getCellValue(`${CELL_REFS.ITEMS.AMOUNT_COL}${i}`);

          if (description || quantity || unitPrice || amount) {
            items.push({
              description: ensureString(description),
              quantity: ensureNumber(quantity),
              unitPrice: ensureNumber(unitPrice),
              amount: ensureNumber(amount),
            });
          }
        }

        // Process calculations
        const calculations = {
          subtotal: ensureNumber(getCellValue(CELL_REFS.TOTALS.SUBTOTAL)),
          taxRate: ensureNumber(getCellValue(CELL_REFS.TOTALS.TAX_RATE)),
          taxAmount: ensureNumber(getCellValue(CELL_REFS.TOTALS.TAX_AMOUNT)),
          totalAmount: ensureNumber(
            getCellValue(CELL_REFS.TOTALS.TOTAL_AMOUNT)
          ),
        };

        const processedData = {
          ...billingCompanyInfo,
          ...customerInfo,
          items,
          ...calculations,
        };

        resolve(processedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(new Error("Failed to process Excel file: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"));
    };

    reader.readAsArrayBuffer(file);
  });
};
