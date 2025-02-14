"use client";
import { useState, useEffect } from "react";
import FileUploadSection from "./FileUploadSection";
import LoadingSpinner from "./LoadingSpinner";
import BillPreview from "./BillPreview";
import PDFPreview from "./PDFPreview";
import UserInfoForm from "../UserInfoForm";
import { processExcelFile } from "@/utils/excelProcessor";
import { downloadTemplate } from "@/utils/templateGenerator";
import { generatePDF } from "@/utils/pdfGenerator";
import { mergeUserInfoWithExcelData } from "@/utils/userInfoManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEdit } from "@fortawesome/free-solid-svg-icons";

const BillGenerator = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [formKey, setFormKey] = useState(0); // For form reset handling

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

      const pdfBlob = new Blob([pdfDoc.output("arraybuffer")], {
        type: "application/pdf",
      });
      return pdfBlob;
    } catch (error) {
      console.error("Error creating PDF blob:", error);
      throw new Error("Failed to create PDF");
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
      console.error("Error generating PDF preview:", err);
      setError("Failed to generate PDF preview");
    }
  };

  const handleUserInfoSave = (userData) => {
    setShowUserForm(false);
    if (preview) {
      const updatedPreview = mergeUserInfoWithExcelData(preview, userData);
      setPreview(updatedPreview);
      generatePDFPreview(updatedPreview);
    }
    setFormKey(prev => prev + 1); // Reset form state
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
        throw new Error("No data processed from file");
      }
      const mergedData = mergeUserInfoWithExcelData(processedData);
      setPreview(mergedData);
      await generatePDFPreview(mergedData);
    } catch (error) {
      console.error("Error processing file:", error);
      setError(
        "Error processing the Excel file. Please ensure you're using the correct template format."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!preview) {
      setError("No preview data available");
      return;
    }

    try {
      setLoading(true);
      const blob = await createPDFBlob(preview, false);

      if (!isValidBlob(blob)) {
        throw new Error("Invalid PDF generated");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${preview.billNumber || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Professional Invoice Generator
            </h3>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
              {showUserForm ? "Hide Company Info" : "Edit Company Info"}
            </button>
          </div>

          {showUserForm && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <UserInfoForm key={formKey} onSave={handleUserInfoSave} />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Upload Invoice Data
              </h4>
              <FileUploadSection
                file={file}
                onDownloadTemplate={downloadTemplate}
                onFileUpload={handleFileUpload}
              />
            </div>

            {loading && (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {preview && !loading && (
              <div className="space-y-8">
                <BillPreview preview={preview} />

                {pdfBlob && isValidBlob(pdfBlob) && (
                  <PDFPreview pdfBlob={pdfBlob} />
                )}

                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className={`w-full ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                  <span className="font-medium">
                    {loading ? "Generating PDF..." : "Download Invoice PDF"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;