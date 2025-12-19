import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertCircle, Search, Filter, Plus, TrendingUp, Users, DollarSign, Percent, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddGroupModal } from "@/components/field-officer/AddGroupModal";
import { ProfileMenu } from "@/components/field-officer/ProfileMenu";
import { ExportDataModal } from "@/components/field-officer/ExportDataModal";

interface Group {
  id: number;
  name: string;
  totalMembers: number;
  totalSavings: string;
  totalLoansOutstanding: string;
  repaymentRate: number;
}

interface FilterConfig {
  minRepayment: number;
  minMembers: number;
  sortBy: "name" | "members" | "savings" | "repayment";
}

export function FieldOfficerDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showExportData, setShowExportData] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>({
    minRepayment: 0,
    minMembers: 0,
    sortBy: "name",
  });

  const { data: groups, isLoading, error, refetch } = useQuery({
    queryKey: ["fieldOfficerGroups"],
    queryFn: () => api.getFieldOfficerGroups(),
  });

  const filteredAndSortedGroups = useMemo(() => {
    if (!groups) return [];

    let filtered = groups.filter((group: Group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const meetsRepaymentFilter = group.repaymentRate >= filters.minRepayment;
      const meetsMembersFilter = group.totalMembers >= filters.minMembers;

      return matchesSearch && meetsRepaymentFilter && meetsMembersFilter;
    });

    return filtered.sort((a: Group, b: Group) => {
      switch (filters.sortBy) {
        case "members":
          return b.totalMembers - a.totalMembers;
        case "savings":
          return (
            parseFloat(b.totalSavings || "0") - parseFloat(a.totalSavings || "0")
          );
        case "repayment":
          return b.repaymentRate - a.repaymentRate;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [groups, searchTerm, filters]);

  const analytics = useMemo(() => {
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
      totalMembers: groups.reduce((sum: number, g: Group) => sum + g.totalMembers, 0),
      totalSavings: groups.reduce(
        (sum: number, g: Group) => sum + parseFloat(g.totalSavings || "0"),
        0
      ),
      totalOutstanding: groups.reduce(
        (sum: number, g: Group) => sum + parseFloat(g.totalLoansOutstanding || "0"),
        0
      ),
      averageRepayment:
        groups.reduce((sum: number, g: Group) => sum + g.repaymentRate, 0) /
        groups.length,
    };
  }, [groups]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Layout>
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight">My Groups</h1>
          <p className="text-muted-foreground mt-2">Manage your assigned groups and members</p>
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
            onClick={() => setShowAddGroup(true)}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add Group
          </Button>
          <ProfileMenu />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{(error as Error).message}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-blue-900">
                {analytics.totalGroups}
              </p>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-green-900">
                {analytics.totalMembers}
              </p>
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-purple-900">
                KES {(analytics.totalSavings / 1000000).toFixed(1)}M
              </p>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900">
              Outstanding Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-orange-900">
                KES {(analytics.totalOutstanding / 1000000).toFixed(1)}M
              </p>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-cyan-900">
              Avg. Repayment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-cyan-900">
                {analytics.averageRepayment.toFixed(1)}%
              </p>
              <Percent className="h-5 w-5 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Groups Overview</CardTitle>
              <CardDescription>
                {filteredAndSortedGroups.length} of {groups?.length} groups
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as FilterConfig["sortBy"],
                  })
                }
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="members">Sort by Members</option>
                <option value="savings">Sort by Savings</option>
                <option value="repayment">Sort by Repayment Rate</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredAndSortedGroups && filteredAndSortedGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground text-lg">
              {groups?.length === 0 ? "No groups assigned" : "No groups match your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedGroups?.map((group: Group) => (
            <Card
              key={group.id}
              className="cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-300 border-2"
              onClick={() => setLocation(`/field-officer/groups/${group.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {group.name}
                  </CardTitle>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      group.repaymentRate >= 80
                        ? "bg-green-100 text-green-700"
                        : group.repaymentRate >= 50
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {group.repaymentRate.toFixed(1)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Members</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {group.totalMembers}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Savings</p>
                    <p className="text-sm font-bold text-green-600">
                      KES {parseFloat(group.totalSavings || "0").toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Outstanding Loans
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    KES{" "}
                    {parseFloat(group.totalLoansOutstanding || "0").toLocaleString()}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/field-officer/groups/${group.id}`);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    View Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddGroupModal
        open={showAddGroup}
        onOpenChange={setShowAddGroup}
        onSuccess={() => {
          refetch();
          setShowAddGroup(false);
        }}
      />

      <ExportDataModal
        open={showExportData}
        onOpenChange={setShowExportData}
        groups={groups || []}
      />
    </div>
    </Layout>
  );
}
