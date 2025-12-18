import React from 'react';
import { AlertTriangle, TrendingUp, Phone, Mail } from 'lucide-react';

interface AtRiskMember {
  member_id: number;
  member_name: string;
  risk_score: number;
  risk_factors: string[];
  recommended_action: string;
  outstanding_balance: number;
}

interface AtRiskMembersTableProps {
  members?: AtRiskMember[];
  totalScanned: number;
  isLoading?: boolean;
}

const getRiskColor = (score: number): string => {
  if (score > 0.8) return 'text-red-600 bg-red-50';
  if (score > 0.7) return 'text-orange-600 bg-orange-50';
  return 'text-yellow-600 bg-yellow-50';
};

const getRiskBadgeColor = (score: number): string => {
  if (score > 0.8) return 'bg-red-100 text-red-800';
  if (score > 0.7) return 'bg-orange-100 text-orange-800';
  return 'bg-yellow-100 text-yellow-800';
};

export const AtRiskMembersTable: React.FC<AtRiskMembersTableProps> = ({
  members,
  totalScanned,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!members) {
    return null;
  }

  const atRiskPercentage = ((members.length / totalScanned) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            At-Risk Members
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} of {totalScanned} members flagged for intervention ({atRiskPercentage}%)
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600">No at-risk members identified. Portfolio is healthy!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Member Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Outstanding Balance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Factors</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.member_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900 font-medium">
                    <div className="flex flex-col">
                      <span>{member.member_name}</span>
                      <span className="text-xs text-gray-500">ID: {member.member_id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(member.risk_score)}`}>
                      {(member.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">
                    KES {member.outstanding_balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {member.risk_factors.slice(0, 2).map((factor, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded w-fit">
                          {factor}
                        </span>
                      ))}
                      {member.risk_factors.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{member.risk_factors.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition">
                      <Phone className="w-4 h-4" />
                      <span className="hidden sm:inline">Contact</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">

          <p className="text-sm text-red-800 font-medium">Critical (Score {'>'} 0.8)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {members.filter(m => m.risk_score > 0.8).length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 font-medium">High (Score 0.7-0.8)</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {members.filter(m => m.risk_score > 0.7 && m.risk_score <= 0.8).length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">Medium (Score 0.6-0.7)</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {members.filter(m => m.risk_score >= 0.6 && m.risk_score <= 0.7).length}
          </p>
        </div>
      </div>
    </div>
  );
};
