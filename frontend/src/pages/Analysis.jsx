// imports
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import RiskCard from '../components/RiskCard';
import { downloadHighlightedPDF, openHighlightedPDF } from '../services/api';

const Analysis = () => {
  const location = useLocation();

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);

  useEffect(() => {
    const data = location.state?.analysisData;

    if (!data) {
      setError('No analysis data available. Please upload a document first.');
      setLoading(false);
      return;
    }

    try {
      if (data.analysis_id) setAnalysisId(data.analysis_id);

      const mapped = mapBackendResponseToUI(data);
      setAnalysisData(mapped);
    } catch (err) {
      setError(err.message || 'Failed to process analysis data.');
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  const mapBackendResponseToUI = (backendData) => {
    const { clauses = [], analysis_id } = backendData;
    const risks = [];

    clauses.forEach((clause, clauseIndex) => {
      if (!clause.labels) return;

      clause.labels.forEach((label) => {
        const finalScore10 = Math.round(label.final_score * 10);

        let riskLevel = 'Low';
        if (finalScore10 >= 7) riskLevel = 'High';
        else if (finalScore10 >= 4) riskLevel = 'Review';

        risks.push({
          level: riskLevel,
          riskLevel,
          label: label.label,
          title: label.label.replace(/_/g, ' '),
          clauseText: clause.clause_text,
          clauseNumber: clauseIndex + 1,
          pageNo: clause.page_no ?? 'N/A',
          finalScore10,
        });
      });
    });

    return {
      analysis_id,
      risks,
      docScore: backendData.doc_score,
    };
  };

  const handleDownloadReport = async () => {
    if (!analysisId) return alert('No analysis ID available.');
    setIsDownloading(true);
    try {
      await downloadHighlightedPDF(analysisId);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPDF = async () => {
    if (!analysisId) return alert('No analysis ID available.');
    await openHighlightedPDF(analysisId);
  };

  const filteredRisks =
    analysisData?.risks?.filter(
      (risk) => selectedRiskLevel === 'All' || risk.level === selectedRiskLevel
    ) || [];

  const riskCounts = {
    High: analysisData?.risks?.filter((r) => r.level === 'High').length || 0,
    Review: analysisData?.risks?.filter((r) => r.level === 'Review').length || 0,
    Low: analysisData?.risks?.filter((r) => r.level === 'Low').length || 0,
  };

  if (loading) return <Loader message="Analyzing document..." />;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Document Summary Card */}
        {analysisData && (
          <div className="mb-6">
            <div
              className={`rounded-xl p-6 border shadow-md flex flex-col md:flex-row justify-between items-start md:items-center
              ${
                analysisData.docScore >= 7
                  ? 'bg-red-50 border-red-300'
                  : analysisData.docScore >= 4
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div>
                <h1 className="text-xl font-bold tracking-wide text-gray-900 mb-1">Document Summary</h1>
                <p className="text-sm text-gray-600">
                  Overall Risk Level:{' '}
                  <span className="font-semibold capitalize">
                    {analysisData.docScore >= 7 ? 'High' : analysisData.docScore >= 4 ? 'Review' : 'Low'}
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-500 mb-1">Final Document Score</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {analysisData.docScore}
                  <span className="text-base font-medium text-gray-600"> / 10</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 sticky top-8">
              <h2 className="text-xl font-bold mb-5 text-gray-800">Risk Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-red-50 border border-red-200">
                  <span className="font-medium text-red-700">High Risk</span>
                  <span className="font-bold text-red-600">{riskCounts.High}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <span className="font-medium text-yellow-700">Review Risk</span>
                  <span className="font-bold text-yellow-600">{riskCounts.Review}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="font-medium text-blue-700">Low Risk</span>
                  <span className="font-bold text-blue-600">{riskCounts.Low}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Filter by Risk Level</h3>
                <div className="space-y-2">
                  {['All', 'High', 'Review', 'Low'].map((level) => {
                    const active = selectedRiskLevel === level;
                    const colorMap = {
                      All: 'bg-gray-800 text-white',
                      High: 'bg-red-600 text-white',
                      Review: 'bg-yellow-500 text-white',
                      Low: 'bg-blue-600 text-white',
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedRiskLevel(level)}
                        className={`w-full py-2 rounded-lg font-medium transition-all ${
                          active ? colorMap[level] : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PDF Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleOpenPDF}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition"
                >
                  Open Highlighted PDF
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition"
                >
                  {isDownloading ? 'Downloading…' : 'Download Highlighted PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredRisks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredRisks.map((risk, idx) => (
                  <RiskCard key={idx} risk={risk} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 text-center rounded-xl shadow">
                <p className="text-gray-500">No risks found for this filter.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analysis;
