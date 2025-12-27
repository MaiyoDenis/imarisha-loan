import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertCircle, TrendingUp, Users, DollarSign, Percent, Download, Calendar, Smartphone, Settings } from "lucide-react";
import KPICard from "@/components/dashboards/KPICard";
import { ExportDataModal } from "@/components/field-officer/ExportDataModal";
import { VisitScheduleWidget } from "@/components/field-officer/VisitScheduleWidget";
export function FieldOfficerDashboard() {
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(false), showExportData = _b[0], setShowExportData = _b[1];
    var _c = useQuery({
        queryKey: ["fieldOfficerGroups"],
        queryFn: function () { return api.getFieldOfficerGroups(); },
    }), groups = _c.data, isLoading = _c.isLoading, error = _c.error;
    var analytics = useMemo(function () {
        if (!groups || groups.length === 0) {
            return {
                totalGroups: 0,
                totalMembers: 0,
                totalSavings: 0,
                totalOutstanding: 0,
                averageRepayment: 0,
            };
        }
        return {
            totalGroups: groups.length,
            totalMembers: groups.reduce(function (sum, g) { return sum + g.totalMembers; }, 0),
            totalSavings: groups.reduce(function (sum, g) { return sum + parseFloat(g.totalSavings || "0"); }, 0),
            totalOutstanding: groups.reduce(function (sum, g) { return sum + parseFloat(g.totalLoansOutstanding || "0"); }, 0),
            averageRepayment: groups.reduce(function (sum, g) { return sum + g.repaymentRate; }, 0) /
                groups.length,
        };
    }, [groups]);
    if (isLoading)
        return <LoadingSpinner />;
    return (<Layout>
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Field Officer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track your groups, manage visits, and monitor performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={function () { return setShowExportData(true); }} className="gap-2" variant="outline" size="lg">
            <Download className="h-5 w-5"/>
            Export
          </Button>
        </div>
      </div>

      {error && (<div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-red-800">
          <AlertCircle className="h-5 w-5"/>
          <span>{error.message}</span>
        </div>)}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KPICard title="Total Groups" value={analytics.totalGroups} icon={<Users size={24}/>} status="normal"/>

            <KPICard title="Total Members" value={analytics.totalMembers} icon={<Users size={24}/>} status="normal"/>

            <KPICard title="Total Savings" value={new Intl.NumberFormat('en-KE').format(analytics.totalSavings)} unit="KES" icon={<DollarSign size={24}/>} status="success"/>

            <KPICard title="Outstanding Loans" value={new Intl.NumberFormat('en-KE').format(analytics.totalOutstanding)} unit="KES" icon={<TrendingUp size={24}/>} status="warning"/>

            <KPICard title="Avg. Repayment Rate" value={analytics.averageRepayment.toFixed(1)} unit="%" icon={<Percent size={24}/>} status={analytics.averageRepayment >= 90 ? 'success' : analytics.averageRepayment >= 70 ? 'warning' : 'critical'}/>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/field-officer/groups")}>
              <Users className="h-6 w-6" />
              <span>Manage Groups</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/field-officer/schedule")}>
              <Calendar className="h-6 w-6" />
              <span>View Schedule</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/mobile-features")}>
              <Smartphone className="h-6 w-6" />
              <span>Mobile Tools</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/settings")}>
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1">
          <VisitScheduleWidget groupsCount={analytics.totalGroups} />
        </div>
      </div>

      <ExportDataModal open={showExportData} onOpenChange={setShowExportData} groups={groups || []}/>
    </div>
    </Layout>);
}
