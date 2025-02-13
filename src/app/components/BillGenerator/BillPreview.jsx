const BillPreview = ({ preview }) => (
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
);
export default BillPreview;