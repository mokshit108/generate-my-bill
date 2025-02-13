'use client'
import { useState, useEffect } from 'react';
import FileUploadSection from './FileUploadSection';
import LoadingSpinner from './LoadingSpinner';
import BillPreview from './BillPreview';
import PDFPreview from './PDFPreview';
import { processExcelFile } from '@/utils/excelProcessor';
import { downloadTemplate } from '@/utils/templateGenerator';
import { generatePDF } from '@/utils/pdfGenerator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const BillGenerator = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to verify if something is a valid Blob
  const isValidBlob = (blob) => {
    return blob instanceof Blob || blob instanceof File;
  };

  // Helper function to create PDF blob
  const createPDFBlob = async (data, isPreview = false) => {
    try {
      const pdfDoc = await generatePDF(data, isPreview);

      if (isValidBlob(pdfDoc)) {
        return pdfDoc;
      }

      // Convert PDF document to blob with proper content type
      const pdfBlob = new Blob([pdfDoc.output('arraybuffer')], {
        type: 'application/pdf'
      });
      return pdfBlob;
    } catch (error) {
      console.error('Error creating PDF blob:', error);
      throw new Error('Failed to create PDF');
    }
  };

  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
      }
    };
  }, [pdfBlob]);

  const generatePDFPreview = async (data) => {
    try {
      const blob = await createPDFBlob(data, true);
      setPdfBlob(blob);
    } catch (err) {
      console.error('Error generating PDF preview:', err);
      setError('Failed to generate PDF preview');
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);
    setError(null);
    setPdfBlob(null);

    try {
      const processedData = await processExcelFile(uploadedFile);
      if (!processedData) {
        throw new Error('No data processed from file');
      }
      setPreview(processedData);
      await generatePDFPreview(processedData);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing the Excel file. Please ensure you are using the correct template format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!preview) {
      setError('No preview data available');
      return;
    }

    try {
      setLoading(true);
      const blob = await createPDFBlob(preview, false);

      if (!isValidBlob(blob)) {
        throw new Error('Invalid PDF generated');
      }

      // Create temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill-${preview.billNumber || 'generated'}.pdf`;

      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Bill Generator</h1>

          <FileUploadSection
            file={file}
            onDownloadTemplate={downloadTemplate}
            onFileUpload={handleFileUpload}
          />

          {loading && <LoadingSpinner />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {preview && !loading && (
            <div className="space-y-6">
              <BillPreview preview={preview} />

              {pdfBlob && isValidBlob(pdfBlob) && (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <PDFPreview pdfBlob={pdfBlob} />
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 ease-in-out transform hover:scale-105`}
              >
                <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                <span className="font-medium">
                  {loading ? 'Generating PDF...' : 'Download Bill PDF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;