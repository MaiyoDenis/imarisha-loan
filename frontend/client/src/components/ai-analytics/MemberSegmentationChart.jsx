import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';
var COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
var SEGMENT_DESCRIPTIONS = {
    'High-Value Customers': 'Established members with consistent repayment history and high loan activity',
    'Growth Potential': 'Active members showing improvement, ready for increased credit exposure',
    'Standard Members': 'Regular members maintaining normal loan and repayment patterns',
    'At-Risk': 'Members showing signs of financial stress or repayment difficulties',
    'Inactive': 'Members with minimal recent activity, may need reengagement',
};
export var MemberSegmentationChart = function (_a) {
    var segments = _a.segments, totalMembers = _a.totalMembers, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    if (isLoading) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>);
    }
    var safeSegments = segments && typeof segments === 'object' ? segments : {};
    var chartData = Object.entries(safeSegments).map(function (_a) {
        var name = _a[0], data = _a[1];
        return ({
            name: name,
            count: Number((data === null || data === void 0 ? void 0 : data.count) || 0),
            percentage: Number((data === null || data === void 0 ? void 0 : data.percentage) || 0),
        });
    });
    if (chartData.length === 0) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <p className="text-muted-foreground text-center py-12">No member data available</p>
      </div>);
    }
    return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary"/>
          Member Behavioral Segmentation
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {totalMembers} members grouped by behavior and performance patterns
        </p>
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={function (entry) { return "".concat(entry.percentage.toFixed(1), "%"); }} outerRadius={80} fill="#8884d8" dataKey="count">
              {chartData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={COLORS[index % COLORS.length]}/>); })}
            </Pie>
            <Tooltip formatter={function (value) { return "".concat(value, " members"); }}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {chartData.map(function (segment, index) {
            return (<div key={segment.name} className="border border-border/50 rounded-lg p-3 bg-accent">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{segment.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {segment.count} members ({segment.percentage.toFixed(1)}%)
                </p>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  {SEGMENT_DESCRIPTIONS[segment.name]}
                </p>
              </div>
            </div>
          </div>);
        })}
      </div>

      <div className="mt-4 bg-purple-500/10 border border-purple-300/40 rounded-lg p-3">
        <p className="text-sm text-purple-300">
          <strong>Insight:</strong> Focus engagement efforts on High-Value and Growth Potential segments 
          to maximize portfolio health, while developing retention strategies for At-Risk and Inactive members.
        </p>
      </div>
    </div>);
};
