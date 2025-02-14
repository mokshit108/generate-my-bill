'use client'
import { useEffect } from "react";
const PDFPreview = ({ pdfBlob }) => {
  if (!pdfBlob) return null;

  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Invoice Preview</h2>
      <div className="border rounded-lg overflow-hidden bg-white shadow-inner">
        <div className="relative" style={{ paddingTop: '141.4%' }}> {/* A4 aspect ratio */}
          <iframe
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