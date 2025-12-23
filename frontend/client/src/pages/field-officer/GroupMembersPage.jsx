import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertCircle, ChevronLeft, Search, Plus, DollarSign, TrendingUp, Users, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddCustomerModal } from "@/components/field-officer/AddCustomerModal";
import { ExportDataModal } from "@/components/field-officer/ExportDataModal";
import { GroupVisitsSection } from "@/components/field-officer/GroupVisitsSection";
import Layout from "@/components/layout/Layout";
import KPICard from "@/components/dashboards/KPICard";

export function GroupMembersPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/field-officer/groups/:groupId");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
  });

  const groupId = params?.groupId ? parseInt(params.groupId) : null;

  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => (groupId ? api.getGroupMembers(groupId) : Promise.reject("No group ID")),
    enabled: !!groupId,
  });

  const { data: stats } = useQuery({
    queryKey: ["groupStats", groupId],
    queryFn: () => (groupId ? api.getGroupStats(groupId) : Promise.reject("No group ID")),
    enabled: !!groupId,
  });

  const filteredMembers = useMemo(() => {
    if (!members) return [];

    return members.filter((member) => {
      const matchesSearch =
        member.user.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        member.user.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        member.memberCode.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        member.user.phone.includes(filters.searchTerm);

      const matchesStatus =
        filters.status === "all" || member.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [members, filters]);

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  if (!groupId) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-destructive">Invalid group ID</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/field-officer")}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">
              {stats?.groupName || "Group"} - Members
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage group members and their loans
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowExportData(true)}
            className="gap-2"
            variant="outline"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Export
          </Button>
          <Button
            onClick={() => setShowAddCustomer(true)}
            className="gap-2 bg-primary hover:bg-primary/80"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add Customer
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error.message}</span>
        </div>
      )}

      <GroupVisitsSection groupId={groupId || 0} />

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Total Members"
            value={stats.totalMembers}
            unit={`${stats.activeMembers} active`}
            icon={<Users size={24} />}
            status="normal"
          />

          <KPICard
            title="Total Savings"
            value={new Intl.NumberFormat('en-KE').format(parseFloat(stats.totalSavings || "0"))}
            unit="KES"
            icon={<DollarSign size={24} />}
            status="success"
          />

          <KPICard
            title="Outstanding Loans"
            value={new Intl.NumberFormat('en-KE').format(parseFloat(stats.totalLoansOutstanding || "0"))}
            unit="KES"
            icon={<TrendingUp size={24} />}
            status="warning"
          />

          <KPICard
            title="Repayment Rate"
            value={stats.repaymentRate}
            unit="%"
            status={stats.repaymentRate >= 90 ? 'success' : stats.repaymentRate >= 70 ? 'warning' : 'critical'}
          />

          <KPICard
            title="Active Loans"
            value={stats.totalLoans || 0}
            status="normal"
          />
        </div>
      )}

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {filteredMembers.length} of {members?.length} members
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredMembers && filteredMembers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground text-lg">
              {members?.length === 0 ? "No members in this group" : "No members match your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMembers?.map((member) => (
            <Card
              key={member.id}
              className="hover:shadow-lg hover:border-blue-300 transition-all duration-300 border-2 cursor-pointer"
              onClick={() => setLocation(`/field-officer/members/${member.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                      <div>
                        <p className="font-semibold text-lg">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.memberCode} | {member.user.phone}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          member.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-foreground"
                        }`}
                      >
                        {member.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 flex-1 sm:flex-none text-center">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Active Loans
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {member.activeLoans}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Outstanding
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        KES {new Intl.NumberFormat('en-KE').format(parseFloat(member.totalOutstanding || "0"))}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Savings
                      </p>
                      <p className="text-sm font-bold text-secondary">
                        KES {new Intl.NumberFormat('en-KE').format(parseFloat(member.savingsBalance || "0"))}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l pl-0 sm:pl-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/field-officer/members/${member.id}`);
                      }}
                      className="w-full bg-primary hover:bg-primary/80"
                      size="sm"
                    >
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddCustomerModal
        open={showAddCustomer}
        onOpenChange={setShowAddCustomer}
        groupId={groupId || 0}
        onSuccess={() => {
          refetch();
          setShowAddCustomer(false);
        }}
      />

      <ExportDataModal
        open={showExportData}
        onOpenChange={setShowExportData}
        groups={[
          {
            id: groupId,
            name: stats?.groupName || "Group",
            totalMembers: stats?.totalMembers || 0,
            totalSavings: stats?.totalSavings || "0",
            totalLoansOutstanding: stats?.totalLoansOutstanding || "0",
            repaymentRate: stats?.repaymentRate || 0,
          },
        ]}
      />
      </div>
    </Layout>
  );
}
