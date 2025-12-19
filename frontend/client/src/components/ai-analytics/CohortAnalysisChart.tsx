import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingDown } from 'lucide-react';

interface Cohort {
  cohort_month: string;
  total_joined: number;
  active_rate: number;
  completion_rate: number;
  default_rate: number;
  inactive_rate: number;
}

interface CohortAnalysisChartProps {
  cohorts: Cohort[];
  insights: {
    best_performing_cohort: string | null;
    average_active_rate: number;
    average_default_rate: number;
  };
  isLoading?: boolean;
}

export const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = ({
  cohorts,
  insights,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = cohorts.slice(-6).map(cohort => ({
    ...cohort,
    cohort_month: cohort.cohort_month.substring(5),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-12">No cohort data available</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Active Rate',
      color: '#10b981',
      value: insights.average_active_rate,
    },
    {
      label: 'Completion Rate',
      color: '#3b82f6',
      value: cohorts.length > 0 ? (cohorts.reduce((sum, c) => sum + c.completion_rate, 0) / cohorts.length) : 0,
    },
    {
      label: 'Default Rate',
      color: '#ef4444',
      value: insights.average_default_rate,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Cohort Analysis
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Member retention and activity patterns by join cohort
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600">{metric.label}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: metric.color }}>
              {metric.value.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cohort_month" />
            <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend />
            <Bar dataKey="active_rate" fill="#10b981" name="Active Rate" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completion_rate" fill="#3b82f6" name="Completion Rate" radius={[4, 4, 0, 0]} />
            <Bar dataKey="default_rate" fill="#ef4444" name="Default Rate" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">Best Performing Cohort</p>
          <p className="text-lg font-bold text-green-600 mt-1">
            {insights.best_performing_cohort || 'N/A'}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">Total Cohorts Analyzed</p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            {cohorts.length}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700">
          <strong>Key Insights:</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>
              Average active rate of {insights.average_active_rate.toFixed(1)}% across all cohorts
            </li>
            <li>
              {insights.average_default_rate > 10 
                ? `Default rate of ${insights.average_default_rate.toFixed(1)}% suggests need for stronger risk management` 
                : `Low default rate of ${insights.average_default_rate.toFixed(1)}% indicates strong portfolio quality`}
            </li>
            <li>
              Focus retention efforts on cohorts with declining activity patterns
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
