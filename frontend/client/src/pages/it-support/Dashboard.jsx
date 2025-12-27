import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Server, Clock, ShieldCheck, Settings, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function ITSupportDashboard() {
  const { toast } = useToast();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const { data: status, refetch } = useQuery({
    queryKey: ["/api/subscription/status"],
  });

  const { data: health } = useQuery({
    queryKey: ["/health"],
    refetchInterval: 30000
  });

  const { data: apiInfo } = useQuery({
    queryKey: ["/api"],
  });

  const handleRenew = async () => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/subscription/renew", { duration_days: days });
      toast({
        title: "Success",
        description: "Subscription renewed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to renew subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">IT Support Dashboard</h1>
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${status?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status?.status === 'active' ? <CheckCircle2 className="mr-1 h-4 w-4"/> : <AlertTriangle className="mr-1 h-4 w-4"/>}
                    System {status?.status === 'active' ? 'Active' : 'Locked'}
                </span>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{health?.status || "Unknown"}</div>
                    <p className="text-xs text-muted-foreground">Version: {health?.version || "Unknown"}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Database</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{health?.database || "Checking..."}</div>
                    <p className="text-xs text-muted-foreground">PostgreSQL</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cache</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{health?.cache || "Checking..."}</div>
                    <p className="text-xs text-muted-foreground">Local Cache</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Status</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{apiInfo?.status || "Unknown"}</div>
                    <p className="text-xs text-muted-foreground">{apiInfo?.version}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                <CardTitle>System Subscription</CardTitle>
                <CardDescription>Manage system access and validity period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div>
                    <p className="font-medium text-sm text-muted-foreground">Current Status</p>
                    <p className={`text-xl font-bold ${status?.status === 'expired' ? 'text-destructive' : 'text-green-600'}`}>
                        {status?.status === 'expired' ? 'Expired' : 'Active'}
                    </p>
                    </div>
                    <div className="text-right">
                    <p className="font-medium text-sm text-muted-foreground">Expires At</p>
                    <p className="text-xl font-bold">
                        {status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                         {status?.expiresAt ? new Date(status.expiresAt).toLocaleTimeString() : ''}
                    </p>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                     <h4 className="text-sm font-medium">Renew Subscription</h4>
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                        <div className="space-y-2 flex-1">
                            <Label>Duration (Days)</Label>
                            <Input 
                                type="number" 
                                value={days} 
                                onChange={(e) => setDays(parseInt(e.target.value))}
                                min={1}
                            />
                        </div>
                        <Button onClick={handleRenew} disabled={loading} className="flex-1">
                            {loading ? "Processing..." : "Add Days"}
                        </Button>
                     </div>
                </div>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common system maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link href="/settings">
                        <Button variant="outline" className="w-full justify-start h-12">
                            <Settings className="mr-2 h-4 w-4" />
                            <div className="flex flex-col items-start">
                                <span>System Settings</span>
                                <span className="text-xs text-muted-foreground font-normal">Configure global preferences</span>
                            </div>
                        </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start h-12" onClick={() => window.open('/api', '_blank')}>
                         <Server className="mr-2 h-4 w-4" />
                            <div className="flex flex-col items-start">
                                <span>API Documentation</span>
                                <span className="text-xs text-muted-foreground font-normal">View API specs and status</span>
                            </div>
                    </Button>
                     <Button variant="outline" className="w-full justify-start h-12" disabled>
                         <Database className="mr-2 h-4 w-4" />
                            <div className="flex flex-col items-start">
                                <span>Backup Database</span>
                                <span className="text-xs text-muted-foreground font-normal">Coming soon</span>
                            </div>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </Layout>
  );
}
