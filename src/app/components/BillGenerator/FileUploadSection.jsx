import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFileExcel } from "@fortawesome/free-solid-svg-icons";

const FileUploadSection = ({ file, onDownloadTemplate, onFileUpload }) => (
  <div className="w-full bg-white p-10 rounded-xl shadow-xl border border-gray-200 font-inter">
    {/* Download Button */}
    <button
      onClick={onDownloadTemplate}
      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-3 transition duration-300 text-lg"
    >
      <FontAwesomeIcon icon={faFileExcel} className="w-6 h-6" />
      <span>Download Excel Template</span>
    </button>

    {/* File Upload Section */}
    <div className="mt-8">
      <label
        htmlFor="file-upload"
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center transition duration-300 hover:border-emerald-600 hover:bg-gray-50"
      >
        <FontAwesomeIcon icon={faUpload} className="w-16 h-16 text-gray-400 mb-4" />
        <span className="text-gray-700 font-medium text-lg">
          {file ? file.name : "Click to Upload Excel File"}
        </span>
        <span className="text-sm text-gray-500 mt-2">
          Supported formats: .xlsx, .xls
        </span>
      </label>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileUpload}
        className="hidden"
        id="file-upload"
      />
    </div>
  </div>
);

export default FileUploadSection;
