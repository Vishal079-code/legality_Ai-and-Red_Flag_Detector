import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import Loader from "../components/Loader";
import { uploadAndAnalyze } from "../services/api";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadAndAnalyze(selectedFile);

      navigate("/analysis", {
        state: {
          documentId: response.documentId,
          analysis: response.result,
        },
      });

    } catch (err) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  return (
    <div>
      {isUploading ? (
        <Loader message="Analyzing your document..." />
      ) : (
        <>
          <UploadBox onFileSelect={setSelectedFile} />
          {error && <p className="text-red-600">{error}</p>}
          <button onClick={handleUpload}>Analyze Document</button>
        </>
      )}
    </div>
  );
};

export default Upload;
