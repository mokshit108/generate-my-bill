const BillPreview = ({ preview }) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  console.log(preview, "my preview");

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">Invoice Preview</h2>

      {/* Section 1: Your Company Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Your Company Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Company Name</p>
            <p className="font-medium">{preview.companyName}</p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">{preview.companyAddress}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{preview.companyEmail}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{preview.companyPhone}</p>
          </div>
          <div>
            <p className="text-gray-600">Tax ID</p>
            <p className="font-medium">{preview.taxId}</p>
          </div>
          <div>
            <p className="text-gray-600">Website</p>
            <p className="font-medium">{preview.website}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-gray-600 mb-2">Bank Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Bank Name</p>
              <p className="font-medium">{preview.bankName}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Number</p>
              <p className="font-medium">{preview.accountNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">IFSC Code</p>
              <p className="font-medium">{preview.ifscCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Customer Information */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Customer Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Customer Name</p>
            <p className="font-medium">{preview.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600">Company Name</p>
            <p className="font-medium">{preview.customerCompanyName}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{preview.customerEmail}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{preview.customerPhone}</p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">{preview.customerAddress}</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Terms</p>
            <p className="font-medium">{preview.paymentTerms}</p>
          </div>
        </div>
      </div>

      {/* Section 3: Invoice Details */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Invoice Number</p>
            <p className="font-medium">{preview.billNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">{preview.date}</p>
          </div>
        </div>
      </div>

      {/* Section 4: Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-gray-600">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-gray-600">Quantity</th>
                <th className="px-4 py-2 text-right text-gray-600">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-right text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {preview.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Totals */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Totals</h3>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex justify-between w-48">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              {formatCurrency(preview.subtotal)}
            </span>
          </div>
          <div className="flex justify-between w-48">
            <span className="text-gray-600">Tax Rate:</span>
            <span className="font-medium">{preview.taxRate}%</span>
          </div>
          <div className="flex justify-between w-48">
            <span className="text-gray-600">Tax Amount:</span>
            <span className="font-medium">
              {formatCurrency(preview.taxAmount)}
            </span>
          </div>
          <div className="flex justify-between w-48 text-lg font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(preview.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {preview.notes && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
          <p className="text-gray-700">{preview.notes}</p>
        </div>
      )}
    </div>
  );
};

export default BillPreview;
