import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FileText, Download, Filter, Calendar } from "lucide-react";
import { useState } from "react";
export default function Reports() {
    var _a = useState("30"), dateRange = _a[0], setDateRange = _a[1];
    var _b = useState("overview"), reportType = _b[0], setReportType = _b[1];
    // Mock data for reports
    var summaryData = {
        totalLoans: 156,
        totalSavings: 2450000,
        activeMembers: 89,
        pendingApprovals: 12,
        monthlyGrowth: 8.5,
        overdueLoans: 5,
        collectionRate: 94.2,
        averageLoanAmount: 85000
    };
    var recentReports = [
        { id: 1, name: "Monthly Loan Portfolio Report", date: "2024-03-01", type: "Loans", status: "Generated" },
        { id: 2, name: "Member Savings Summary", date: "2024-03-01", type: "Savings", status: "Generated" },
        { id: 3, name: "Branch Performance Report", date: "2024-02-28", type: "Performance", status: "Generated" },
        { id: 4, name: "Collections Analysis", date: "2024-02-28", type: "Collections", status: "Generated" },
        { id: 5, name: "Risk Assessment Report", date: "2024-02-27", type: "Risk", status: "Generated" }
    ];
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">Generate insights and monitor performance across your organization.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="btn-neon">
                <Download className="mr-2 h-4 w-4"/> Export
              </Button>
              <Button className="btn-neon">
                <FileText className="mr-2 h-4 w-4"/> Generate Report
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 glass-card gradient-border p-4 rounded-lg">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48 neon-input">
                <Filter className="h-4 w-4 mr-2"/>
                <SelectValue placeholder="Report Type"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="loans">Loans</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 neon-input">
                <Calendar className="h-4 w-4 mr-2"/>
                <SelectValue placeholder="Date Range"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalLoans.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500"/>
                  +{summaryData.monthlyGrowth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {summaryData.totalSavings.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500"/>
                  +12.3% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.activeMembers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500"/>
                  +5 new this month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.collectionRate}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500"/>
                  -2.1% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <FileText className="h-4 w-4 text-orange-600"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{summaryData.pendingApprovals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{summaryData.overdueLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Loan Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {summaryData.averageLoanAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">+{summaryData.monthlyGrowth}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="glass-card gradient-border hover-tilt relative overflow-hidden">
            <span className="aura"></span>
            <div className="p-6 border-b">
              <h3 className="text-lg font-heading font-semibold">Recent Reports</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map(function (report) { return (<TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1"/>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
        </div>
    </Layout>);
}
