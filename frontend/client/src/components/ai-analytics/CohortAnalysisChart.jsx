var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
                if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { TrendingDown } from 'lucide-react';
export var CohortAnalysisChart = function (_a) {
    var cohorts = _a.cohorts, insights = _a.insights, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    if (isLoading) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>);
    }
    var chartData = cohorts.slice(-6).map(function (cohort) { return (__assign(__assign({}, cohort), { cohort_month: cohort.cohort_month.substring(5) })); });
    if (chartData.length === 0) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <p className="text-muted-foreground text-center py-12">No cohort data available</p>
      </div>);
    }
    var metrics = [
        {
            label: 'Active Rate',
            color: '#10b981',
            value: insights.average_active_rate,
        },
        {
            label: 'Completion Rate',
            color: '#3b82f6',
            value: cohorts.length > 0 ? (cohorts.reduce(function (sum, c) { return sum + c.completion_rate; }, 0) / cohorts.length) : 0,
        },
        {
            label: 'Default Rate',
            color: '#ef4444',
            value: insights.average_default_rate,
        },
    ];
    return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary"/>
          Cohort Analysis
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Member retention and activity patterns by join cohort
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map(function (metric) {
            return (<div key={metric.label} className="border border-border/50 rounded-lg p-3 bg-accent">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: metric.color }}>
              {metric.value.toFixed(1)}%
            </p>
          </div>);
        })}
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="cohort_month"/>
            <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}/>
            <Tooltip formatter={function (value) { return "".concat(value.toFixed(1), "%"); }}/>
            <Legend />
            <Bar dataKey="active_rate" fill="#10b981" name="Active Rate" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="completion_rate" fill="#3b82f6" name="Completion Rate" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="default_rate" fill="#ef4444" name="Default Rate" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-accent border border-border/50 rounded-lg p-3">
          <p className="text-sm text-emerald-400 font-medium">Best Performing Cohort</p>
          <p className="text-lg font-bold text-emerald-300 mt-1">
            {insights.best_performing_cohort || 'N/A'}
          </p>
        </div>
        <div className="bg-accent border border-border/50 rounded-lg p-3">
          <p className="text-sm text-blue-300 font-medium">Total Cohorts Analyzed</p>
          <p className="text-lg font-bold text-blue-300 mt-1">
            {cohorts.length}
          </p>
        </div>
      </div>

      <div className="mt-4 bg-accent border border-border/50 rounded-lg p-3">
        <div className="text-sm text-card-foreground/90">
          <strong>Key Insights:</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>
              Average active rate of {insights.average_active_rate.toFixed(1)}% across all cohorts
            </li>
            <li>
              {insights.average_default_rate > 10
            ? "Default rate of ".concat(insights.average_default_rate.toFixed(1), "% suggests need for stronger risk management")
            : "Low default rate of ".concat(insights.average_default_rate.toFixed(1), "% indicates strong portfolio quality")}
            </li>
            <li>
              Focus retention efforts on cohorts with declining activity patterns
            </li>
          </ul>
        </div>
      </div>
    </div>);
};
