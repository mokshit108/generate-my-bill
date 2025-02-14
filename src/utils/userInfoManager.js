// utils/userInfoManager.js
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;

  const userInfo = localStorage.getItem('userInvoiceInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const mergeUserInfoWithExcelData = (excelData) => {
  const userInfo = getUserInfo();
  if (!userInfo || !excelData) return excelData;

  // Handle the updated field names
  const updatedUserInfo = {
    ...userInfo,
    // Map old field names to new ones if they exist in the old format
    companyEmail: userInfo.companyEmail || userInfo.email,
    companyPhone: userInfo.companyPhone || userInfo.phone
  };

  return {
    ...excelData,
    // Apply user info, ensuring new field names are used
    companyName: updatedUserInfo.companyName || excelData.companyName,
    companyAddress: updatedUserInfo.companyAddress || excelData.companyAddress,
    companyEmail: updatedUserInfo.companyEmail || excelData.companyEmail,
    companyPhone: updatedUserInfo.companyPhone || excelData.companyPhone,
    taxId: updatedUserInfo.taxId || excelData.taxId,
    website: updatedUserInfo.website || excelData.website,
    bankName: updatedUserInfo.bankName || excelData.bankName,
    accountNumber: updatedUserInfo.accountNumber || excelData.accountNumber,
    ifscCode: updatedUserInfo.ifscCode || excelData.ifscCode
  };
};