'use client'
import React, { useEffect, useState } from "react";

const PDFPreview = ({ pdfBlob }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (!pdfBlob) {
      setPdfUrl('');
      return;
    }

    // Create new URL for the updated PDF blob
    const newUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(newUrl);

    // Cleanup previous URL when blob changes or component unmounts
    return () => {
      if (newUrl) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [pdfBlob]); // Re-run when pdfBlob changes

  if (!pdfBlob || !pdfUrl) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Invoice Preview</h2>
      <div className="border rounded-lg overflow-hidden bg-white shadow-inner">
        <div className="relative" style={{ paddingTop: '141.4%' }}> {/* A4 aspect ratio */}
          <iframe
            key={pdfUrl} // Add key to force iframe refresh
            src={pdfUrl}
            className="absolute top-0 left-0 w-full h-full"
            title="PDF Preview"
            type="application/pdf"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;