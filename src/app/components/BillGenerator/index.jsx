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
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progress = 0;

    // Step 1: Company Details - 50% of total progress
    const userInfo = localStorage.getItem('userInvoiceInfo');
    if (userInfo) {
      progress += 50; // Give 50% progress when user info is filled
    }

    // Step 2: Excel Upload - 50% of total progress
    if (file) {
      progress += 50;
    }

    setProgress(progress);
  }, [file, showUserForm, pdfBlob]);
  
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

  // Effect to update PDF preview when preview data changes
  useEffect(() => {
    let isMounted = true;

    const updatePDFPreview = async () => {
      if (!preview || isPdfGenerating) return;

      try {
        setIsPdfGenerating(true);
        const blob = await createPDFBlob(preview, true);
        if (isMounted) {
          setPdfBlob(blob);
        }
      } catch (err) {
        console.error("Error generating PDF preview:", err);
        if (isMounted) {
          setError("Failed to generate PDF preview");
        }
      } finally {
        if (isMounted) {
          setIsPdfGenerating(false);
        }
      }
    };

    updatePDFPreview();

    return () => {
      isMounted = false;
    };
  }, [preview, isPdfGenerating]);

  const handlePreviewChange = (newPreviewData) => {
    setPreview(newPreviewData);
    // PDF preview will be automatically updated by the effect
  };



  // const generatePDFPreview = async (data) => {
  //   try {
  //     const blob = await createPDFBlob(data, true);
  //     setPdfBlob(blob);
  //   } catch (err) {
  //     console.error("Error generating PDF preview:", err);
  //     setError("Failed to generate PDF preview");
  //   }
  // };

  // In your parent component:
const handleSave = async (data) => {
  try {
    // Make your API call or save to database here
    // Or if using local storage:
    localStorage.setItem('invoice', JSON.stringify(data));
    setPreview(data)
  } catch (error) {
    throw error; // This will be caught by the BillPreview component
  }
};

  const handleUserInfoSave = (userData) => {
    setShowUserForm(false);
    if (preview) {
      const updatedPreview = mergeUserInfoWithExcelData(preview, userData);
      setPreview(updatedPreview);
      console.log(updatedPreview, "up reivew");
    }
    setFormKey((prev) => prev + 1); // Reset form state
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
      // await generatePDFPreview(mergedData);
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-10">
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className="bg-emerald-600 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-center text-gray-700 font-medium">Progress: {progress.toFixed(0)}%</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-emerald-700 font-serif">Professional Invoice Generator</h2>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
              {showUserForm ? "Hide Company Info" : "Edit Company Info"}
            </button>
          </div>

          <h4 className="text-lg font-semibold text-gray-800 font-serif mb-2">Step 1: Add Company Details</h4>
          {showUserForm && <UserInfoForm key={formKey} onSave={handleUserInfoSave} />}

          <h4 className="text-lg font-semibold text-gray-800 font-serif mt-6 mb-2">Step 2: Upload Invoice Data</h4>
          <FileUploadSection file={file} onDownloadTemplate={downloadTemplate} onFileUpload={handleFileUpload} />

          {loading && <LoadingSpinner />}
          {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          {preview && !loading && (
            <>
               <BillPreview
  preview={preview}
  onPreviewChange={setPreview}
  onSave={handleSave} />
              {pdfBlob && <PDFPreview pdfBlob={pdfBlob} />}
            </>
          )}

          <h4 className="text-lg font-semibold text-gray-800 font-serif mt-6 mb-2">Step 3: Download Invoice PDF</h4>
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >

            <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
            <span className="font-medium">{loading ? "Generating PDF..." : "Download Invoice PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillGenerator;
