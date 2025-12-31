import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ClauseHighlighter from "../components/ClauseHighlighter";
import RiskCard from "../components/RiskCard";
import { fetchAnalysis, downloadPDFReport } from "../services/api";

const Analysis = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("All");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!documentId) {
      navigate("/");
      return;
    }

    const loadAnalysis = async () => {
      try {
        const data = await fetchAnalysis(documentId);
        setAnalysis(data);
      } catch (err) {
        setError("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [documentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Analyzing document..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  const risks = analysis?.risks || [];
  const extractedText = analysis?.extractedText || "";

  const filteredRisks =
    selectedRiskLevel === "All"
      ? risks
      : risks.filter(
          (r) => (r.level || r.riskLevel || "Low") === selectedRiskLevel
        );

  const riskCounts = {
    High: risks.filter((r) => (r.level || r.riskLevel) === "High").length,
    Medium: risks.filter((r) => (r.level || r.riskLevel) === "Medium").length,
    Low: risks.filter((r) => (r.level || r.riskLevel) === "Low").length,
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      await downloadPDFReport(documentId);
    } catch {
      alert("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-8">
              <h2 className="text-xl font-bold mb-6">Risk Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between bg-red-50 p-3 rounded">
                  <span>High</span>
                  <span className="font-bold text-red-600">{riskCounts.High}</span>
                </div>
                <div className="flex justify-between bg-yellow-50 p-3 rounded">
                  <span>Medium</span>
                  <span className="font-bold text-yellow-600">{riskCounts.Medium}</span>
                </div>
                <div className="flex justify-between bg-blue-50 p-3 rounded">
                  <span>Low</span>
                  <span className="font-bold text-blue-600">{riskCounts.Low}</span>
                </div>
              </div>

              <div className="mb-6">
                {["All", "High", "Medium", "Low"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedRiskLevel(level)}
                    className={`w-full mb-2 py-2 rounded ${
                      selectedRiskLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className={`w-full py-3 rounded font-semibold ${
                  isDownloading
                    ? "bg-gray-300"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isDownloading ? "Downloading..." : "Download PDF Report"}
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="lg:col-span-3 space-y-6">
            <ClauseHighlighter text={extractedText} risks={risks} />

            {filteredRisks.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Identified Risks ({filteredRisks.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredRisks.map((risk, i) => (
                    <RiskCard key={i} risk={risk} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded text-center">
                No risks found.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analysis;
