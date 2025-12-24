import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
export var ArrearsForcastChart = function (_a) {
    var _b;
    var data = _a.data, _c = _a.isLoading, isLoading = _c === void 0 ? false : _c;
    if (isLoading) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>);
    }
    var mockChartData = Array.from({ length: 12 }, function (_, i) {
        return ({
            date: new Date(new Date().getFullYear(), new Date().getMonth() + i + 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            rate: 5.0 + (i * 0.3),
            upper: 5.0 + (i * 0.3) + 1.5,
            lower: Math.max(0, 5.0 + (i * 0.3) - 1.5),
        });
    });
    var chartData = !data || !data.predictions || data.predictions.length === 0
        ? mockChartData
        : data.predictions.map(function (pred) {
            return ({
                date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                rate: parseFloat(pred.forecasted_rate.toFixed(2)),
                upper: parseFloat(pred.upper_bound.toFixed(2)),
                lower: parseFloat(pred.lower_bound.toFixed(2)),
            });
        });
    var currentRate = (data === null || data === void 0 ? void 0 : data.current_rate) || 5.0;
    var averageRate = (data === null || data === void 0 ? void 0 : data.average_rate) || 5.0;
    var confidenceLevel = (data === null || data === void 0 ? void 0 : data.confidence_level) || 50;
    var trend = ((_b = chartData[chartData.length - 1]) === null || _b === void 0 ? void 0 : _b.rate) > currentRate;
    var isDemo = !data || !data.predictions || data.predictions.length === 0;
    return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Arrears Rate Forecast</h3>
          <p className="text-sm text-muted-foreground mt-1">{isDemo ? 'Sample forecast' : '12-month prediction with confidence intervals'}</p>
        </div>
        <div className="flex items-center gap-2">
          {trend ? (<div className="flex items-center gap-1 text-red-400">
              <ArrowUpIcon className="w-4 h-4"/>
              <span className="text-sm font-medium">Increasing</span>
            </div>) : (<div className="flex items-center gap-1 text-emerald-400">
              <ArrowDownIcon className="w-4 h-4"/>
              <span className="text-sm font-medium">Decreasing</span>
            </div>)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-accent rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Current Rate</p>
          <p className="text-2xl font-bold text-blue-300">{currentRate.toFixed(2)}%</p>
        </div>
        <div className="bg-accent rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Average Rate</p>
          <p className="text-2xl font-bold text-purple-300">{averageRate.toFixed(2)}%</p>
        </div>
        <div className="bg-accent rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Confidence Level</p>
          <p className="text-2xl font-bold text-emerald-300">{confidenceLevel}%</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="date"/>
            <YAxis label={{ value: 'Arrears Rate (%)', angle: -90, position: 'insideLeft' }}/>
            <Tooltip formatter={function (value) { return "".concat(value.toFixed(2), "%"); }}/>
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent"/>
            <Area type="monotone" dataKey="rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRate)"/>
            <Area type="monotone" dataKey="upper" stroke="none" fill="transparent"/>
            <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Upper Bound"/>
            <Line type="monotone" dataKey="lower" stroke="#10b981" strokeDasharray="5 5" dot={false} name="Lower Bound"/>
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={"mt-4 border rounded-lg p-3 ".concat(isDemo ? 'border-yellow-400/40 bg-accent/100/10' : 'border-blue-400/40 bg-primary/10')}>
        <p className={"text-sm ".concat(isDemo ? 'text-yellow-300' : 'text-blue-300')}>
          <strong>{isDemo ? 'Note:' : 'Insight:'}</strong> {isDemo
            ? 'This is a sample forecast. To get accurate predictions, more historical loan data is needed.'
            : "The forecast suggests ".concat(trend ? 'an increasing' : 'a decreasing', " trend in arrears rate over the next 12 months. ").concat(trend ? 'Consider implementing preventive measures.' : 'Current strategies appear effective.')}
        </p>
      </div>
    </div>);
};
