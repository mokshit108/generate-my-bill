'use client';
import { useState, useEffect } from 'react';

const UserInfoForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    taxId: '',
    website: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    logo: null
  });

  useEffect(() => {
    // Load saved user info from loca0lStorage on component mount
    const savedUserInfo = localStorage.getItem('userInvoiceInfo');
    if (savedUserInfo) {
      setFormData(JSON.parse(savedUserInfo));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('userInvoiceInfo', JSON.stringify(formData));
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Company Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Company Name', name: 'companyName', type: 'text' },
          { label: 'Company Address', name: 'companyAddress', type: 'textarea' },
          { label: 'Email', name: 'companyEmail', type: 'email' },
          { label: 'Phone', name: 'companyPhone', type: 'tel' },
          { label: 'Tax ID', name: 'taxId', type: 'text' },
          { label: 'Website', name: 'website', type: 'url' },
          { label: 'Bank Name', name: 'bankName', type: 'text' },
          { label: 'Account Number', name: 'accountNumber', type: 'text' },
          { label: 'IFSC Code', name: 'ifscCode', type: 'text' }
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-semibold text-gray-700">{label}</label>
            {type === 'textarea' ? (
              <textarea
                name={name}
                value={formData[name]}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:border-emerald-500 focus:ring-emerald-500 transition"
                required
              />
            ) : (
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:border-emerald-500 focus:ring-emerald-500 transition"
                required
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          Save Information
        </button>
      </div>
    </form>
  );
};

export default UserInfoForm;
