const RiskCard = ({ risk, onClick }) => {
  const riskLevel = risk.level || risk.riskLevel || 'Low';
  
  const bgColor =
    riskLevel === 'High'
      ? 'bg-red-50 border-red-200'
      : riskLevel === 'Medium'
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-blue-50 border-blue-200';

  const textColor =
    riskLevel === 'High'
      ? 'text-red-800'
      : riskLevel === 'Medium'
      ? 'text-yellow-800'
      : 'text-blue-800';

  const badgeColor =
    riskLevel === 'High'
      ? 'bg-red-600'
      : riskLevel === 'Medium'
      ? 'bg-yellow-600'
      : 'bg-blue-600';

  return (
    <div
      className={`${bgColor} border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`${badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}
        >
          {riskLevel.toUpperCase()}
        </span>
        {risk.clauseNumber && (
          <span className="text-xs text-gray-500">Clause #{risk.clauseNumber}</span>
        )}
      </div>
      <h4 className="font-semibold text-gray-800 mb-2">
        {risk.title || risk.clause || 'Risk Detected'}
      </h4>
      <p className={`text-sm ${textColor} mb-2`}>
        {risk.reason || risk.description || 'No description available'}
      </p>
      {risk.suggestion && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Suggestion:</span> {risk.suggestion}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskCard;

