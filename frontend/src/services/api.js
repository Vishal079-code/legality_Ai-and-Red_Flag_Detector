const API_BASE_URL = "http://localhost:5000";

// Upload + Analyze in ONE call
export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload & analysis failed");
  }

  return response.json(); 
};

// Download PDF report
export const downloadPDFReport = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/report/${documentId}`);

  if (!response.ok) {
    throw new Error("Failed to download report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${documentId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};
