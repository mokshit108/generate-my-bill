import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileExcel } from '@fortawesome/free-solid-svg-icons';

const FileUploadSection = ({ file, onDownloadTemplate, onFileUpload }) => (
  <>
    <button
      onClick={onDownloadTemplate}
      className="mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full"
    >
      <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5" />
      Download Excel Template
    </button>

    <div className="mb-8">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FontAwesomeIcon
            icon={faFileExcel}
            className="w-12 h-12 text-gray-400 mb-4"
          />
          <span className="text-gray-600">
            {file ? file.name : "Upload Excel File"}
          </span>
          <span className="text-sm text-gray-500 mt-2">
            Supported formats: .xlsx, .xls
          </span>
        </label>
      </div>
    </div>
  </>
);

export default FileUploadSection;