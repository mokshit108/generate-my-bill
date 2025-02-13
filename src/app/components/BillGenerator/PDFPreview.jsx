const PDFPreview = ({ pdfBlob }) => {
  if (!pdfBlob) return null;

  const pdfUrl = URL.createObjectURL(pdfBlob);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">PDF Preview</h2>
      <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title="PDF Preview"
          type="application/pdf"
        />
      </div>
    </div>
  );
};

export default PDFPreview;
