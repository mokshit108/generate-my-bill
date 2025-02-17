'use client'
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const BillPreview = ({ preview, onPreviewChange, onSave }) => {
  const [openSections, setOpenSections] = useState({
    companyInfo: true,
    customerInfo: true,
    invoiceDetails: true,
    items: true,
    totals: true,
    notes: true
  });

  const [editableField, setEditableField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAll = () => {
    const areAllOpen = Object.values(openSections).every(value => value);
    setOpenSections({
      companyInfo: !areAllOpen,
      customerInfo: !areAllOpen,
      invoiceDetails: !areAllOpen,
      items: !areAllOpen,
      totals: !areAllOpen,
      notes: !areAllOpen
    });
  };

  const handleFieldEdit = (field, value) => {
    onPreviewChange({
      ...preview,
      [field]: value
    });
    setEditableField(null);
    setHasUnsavedChanges(true);
  };


  const handleItemEdit = (index, field, value) => {
    const newItems = [...preview.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      amount: field === 'quantity' || field === 'unitPrice'
        ? Number(value) * (field === 'quantity' ? newItems[index].unitPrice : newItems[index].quantity)
        : newItems[index].amount
    };

    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (preview.taxRate / 100);

    onPreviewChange({
      ...preview,
      items: newItems,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount
    });
    setHasUnsavedChanges(true);
  };

  const EditableField = ({ field, value, type = "text" }) => (
    <div onClick={() => setEditableField(field)} className="cursor-pointer">
      {editableField === field ? (
        <input
          type={type}
          className="w-full p-1 border rounded"
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleFieldEdit(field, type === "number" ? Number(e.target.value) : e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleFieldEdit(field, type === "number" ? Number(e.target.value) : e.target.value);
            }
          }}
        />
      ) : (
        <p className="font-medium hover:bg-gray-50">{value}</p>
      )}
    </div>
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(preview);
      setHasUnsavedChanges(false);
      // Show success notification
      alert('Invoice saved successfully!');
    } catch (error) {
      // Show error notification
      alert('Error saving invoice: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };



  const SectionHeader = ({ title, section }) => (
    <div
      className="flex items-center justify-between cursor-pointer py-2"
      onClick={() => toggleSection(section)}
    >
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      <button className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100">
        {openSections[section] ? '-' : '+'}
      </button>
    </div>
  );

  const areAllSectionsOpen = Object.values(openSections).every(value => value);

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Invoice Preview</h2>
        {hasUnsavedChanges && (
            <span className="text-sm text-orange-500">Unsaved changes</span>
          )}
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          <span className="w-4 h-4 flex items-center justify-center font-bold">
            {areAllSectionsOpen ? '-' : '+'}
          </span>
          <span className="text-sm">
            {areAllSectionsOpen ? 'Collapse All' : 'Expand All'}
          </span>
        </button>
        <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
    <FontAwesomeIcon icon={faSave} className="mr-2" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
      </div>

      {/* Section 1: Your Company Information */}
      <div className="mb-8">
        <SectionHeader title="Your Company Information" section="companyInfo" />
        {openSections.companyInfo && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Company Name</p>
                <EditableField field="companyName" value={preview.companyName} />
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <EditableField field="companyAddress" value={preview.companyAddress} />
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <EditableField field="companyEmail" value={preview.companyEmail} />
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <EditableField field="companyPhone" value={preview.companyPhone} />
              </div>
              <div>
                <p className="text-gray-600">Tax ID</p>
                <EditableField field="taxId" value={preview.taxId} />
              </div>
              <div>
                <p className="text-gray-600">Website</p>
                <EditableField field="website" value={preview.website} />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-gray-600 mb-2">Bank Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">Bank Name</p>
                  <EditableField field="bankName" value={preview.bankName} />
                </div>
                <div>
                  <p className="text-gray-600">Account Number</p>
                  <EditableField field="accountNumber" value={preview.accountNumber} />
                </div>
                <div>
                  <p className="text-gray-600">IFSC Code</p>
                  <EditableField field="ifscCode" value={preview.ifscCode} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Customer Information */}
      <div className="mb-8">
        <SectionHeader title="Customer Information" section="customerInfo" />
        {openSections.customerInfo && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Customer Name</p>
              <EditableField field="customerName" value={preview.customerName} />
            </div>
            <div>
              <p className="text-gray-600">Company Name</p>
              <EditableField field="customerCompanyName" value={preview.customerCompanyName} />
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <EditableField field="customerEmail" value={preview.customerEmail} />
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <EditableField field="customerPhone" value={preview.customerPhone} />
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <EditableField field="customerAddress" value={preview.customerAddress} />
            </div>
            <div>
              <p className="text-gray-600">Payment Terms</p>
              <EditableField field="paymentTerms" value={preview.paymentTerms} />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Invoice Details */}
      <div className="mb-8">
        <SectionHeader title="Invoice Details" section="invoiceDetails" />
        {openSections.invoiceDetails && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Invoice Number</p>
              <EditableField field="billNumber" value={preview.billNumber} />
            </div>
            <div>
              <p className="text-gray-600">Date</p>
              <EditableField field="date" value={preview.date} />
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Items */}
      <div className="mb-8">
        <SectionHeader title="Items" section="items" />
        {openSections.items && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-gray-600">Description</th>
                  <th className="px-4 py-2 text-right text-gray-600">Quantity</th>
                  <th className="px-4 py-2 text-right text-gray-600">Unit Price</th>
                  <th className="px-4 py-2 text-right text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {preview.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      <div onClick={() => setEditableField(`item-${index}-description`)} className="cursor-pointer">
                        {editableField === `item-${index}-description` ? (
                          <input
                            className="w-full p-1 border rounded"
                            defaultValue={item.description}
                            autoFocus
                            onBlur={(e) => handleItemEdit(index, 'description', e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleItemEdit(index, 'description', e.target.value);
                              }
                            }}
                          />
                        ) : (
                          <span className="hover:bg-gray-50">{item.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div onClick={() => setEditableField(`item-${index}-quantity`)} className="cursor-pointer">
                        {editableField === `item-${index}-quantity` ? (
                          <input
                            type="number"
                            className="w-full p-1 border rounded text-right"
                            defaultValue={item.quantity}
                            autoFocus
                            onBlur={(e) => handleItemEdit(index, 'quantity', Number(e.target.value))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleItemEdit(index, 'quantity', Number(e.target.value));
                              }
                            }}
                          />
                        ) : (
                          <span className="hover:bg-gray-50">{item.quantity}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div onClick={() => setEditableField(`item-${index}-unitPrice`)} className="cursor-pointer">
                        {editableField === `item-${index}-unitPrice` ? (
                          <input
                            type="number"
                            className="w-full p-1 border rounded text-right"
                            defaultValue={item.unitPrice}
                            autoFocus
                            onBlur={(e) => handleItemEdit(index, 'unitPrice', Number(e.target.value))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleItemEdit(index, 'unitPrice', Number(e.target.value));
                              }
                            }}
                          />
                        ) : (
                          <span className="hover:bg-gray-50">{formatCurrency(item.unitPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 5: Totals */}
      <div className="mb-8">
        <SectionHeader title="Totals" section="totals" />
        {openSections.totals && (
          <div className="mt-4 flex flex-col items-end space-y-2">
            <div className="flex justify-between w-48">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(preview.subtotal)}</span>
            </div>
            <div className="flex justify-between w-48">
              <span className="text-gray-600">Tax Rate:</span>
              <div onClick={() => setEditableField('taxRate')} className="cursor-pointer">
                {editableField === 'taxRate' ? (
                  <input
                    type="number"
                    className="w-20 p-1 border rounded text-right"
                    defaultValue={preview.taxRate}
                    autoFocus
                    onBlur={(e) => {
                      const newTaxRate = Number(e.target.value);
                      const newTaxAmount = preview.subtotal * (newTaxRate / 100);
                      handleFieldEdit('taxRate', newTaxRate);
                      handleFieldEdit('taxAmount', newTaxAmount);
                      handleFieldEdit('totalAmount', preview.subtotal + newTaxAmount);
                    }}
                  />
                ) : (
                  <span className="font-medium hover:bg-gray-50">{preview.taxRate}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between w-48">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="font-medium">{formatCurrency(preview.taxAmount)}</span>
            </div>
            <div className="flex justify-between w-48 text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(preview.totalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      {preview.notes && (
        <div>
          <SectionHeader title="Notes" section="notes" />
          {openSections.notes && (
            <div className="mt-4">
              <EditableField field="notes" value={preview.notes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillPreview;