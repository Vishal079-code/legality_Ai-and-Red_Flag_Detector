// Flexible label → description mapping
// Flexible label → description mapping
const labelDescriptions = {
  non_disclosure: 'Protects confidential information from being shared.',
  termination_clause: 'Specifies conditions under which the contract can be terminated.',
  non_compete: 'Prevents the party from working with competitors.',
  uncapped_liability: 'No upper limit on financial liability.',
  competitive_restriction_exception: 'Exceptions for certain competitive activities.',
  termination_for_convenience: 'Allows termination of the contract for any reason with notice.', // ✅ new label
  // Add more labels here as needed
};
const RiskCard = ({ risk }) => {
  // Normalize level to match colorMap keys
  const level = risk.level === 'Medium' ? 'Review' : risk.level || 'Low';

  const colorMap = {
    High: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      badge: 'text-red-700',
      glow: 'hover:shadow-red-200',
    },
    Review: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      badge: 'text-yellow-700',
      glow: 'hover:shadow-yellow-200',
    },
    Low: {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      badge: 'text-blue-700',
      glow: 'hover:shadow-blue-200',
    },
  };

  const colors = colorMap[level] || colorMap['Low'];

  return (
    <div
      className={`rounded-lg p-4 border transition-all duration-300 shadow-sm hover:shadow-lg ${colors.border} ${colors.bg} ${colors.glow}`}
    >
      {/* TOP ROW */}
      <div className="flex justify-between items-center mb-2 relative">
        <span className="text-[15px] font-semibold text-gray-900 tracking-wide cursor-default relative group">
          {risk.label?.replace(/_/g, ' ')}

          {/* Tooltip */}
          {labelDescriptions[risk.label] && (
            <div className="absolute left-0 -bottom-8 w-max max-w-xs bg-gray-800 text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              {labelDescriptions[risk.label]}
            </div>
          )}
        </span>

        <span
          className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/70 ${colors.badge}`}
        >
          {level}
        </span>
      </div>

      {/* SCORE */}
      <p className="text-sm font-medium text-gray-800 mb-2">
        Final Score:{' '}
        <strong className="font-semibold text-gray-900">
          {risk.finalScore10} / 10
        </strong>
      </p>

      {/* PAGE + CLAUSE */}
      <p className="text-[11px] font-medium text-gray-500 tracking-wide mb-1">
        Clause #{risk.clauseNumber} • Page {risk.pageNo}
      </p>

      <p className="text-sm font-normal text-gray-700 leading-relaxed tracking-wide">
        {risk.clauseText}
      </p>
    </div>
  );
};

export default RiskCard;
