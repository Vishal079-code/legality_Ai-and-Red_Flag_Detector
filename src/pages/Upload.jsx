import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import { uploadDocument } from '../services/api';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadDocument(selectedFile);
      
      if (result.documentId) {
        navigate(`/analysis/${result.documentId}`);
      } else {
        throw new Error('No document ID received from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Document
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your document to analyze for potential legal risks and red flags.
          </p>

          {isUploading ? (
            <Loader message="Uploading and processing your document..." />
          ) : (
            <>
              <div className="mb-6">
                <UploadBox onFileSelect={handleFileSelect} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFile && !isUploading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Document
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Supported File Types
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Documents:</span> PDF, DOC, DOCX
            </div>
            <div>
              <span className="font-medium">Images:</span> JPG, JPEG, PNG
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Maximum file size: 10MB. Files are processed securely and are not stored
            permanently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;

