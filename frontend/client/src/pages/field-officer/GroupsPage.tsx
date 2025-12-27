import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/layout/Layout";
import { AddGroupModal } from "@/components/field-officer/AddGroupModal";
import { ExportDataModal } from "@/components/field-officer/ExportDataModal";

interface Group {
  id: number;
  name: string;
  totalMembers: number;
  totalSavings: string;
  totalLoansOutstanding: string;
  repaymentRate: number;
  totalLoaned?: string;
  totalLoans?: number;
}

export function GroupsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { data: groups = [], isLoading, error, refetch } = useQuery<Group[]>({
    queryKey: ["fieldOfficerGroups"],
    queryFn: api.getFieldOfficerGroups,
  });

  const filteredGroups = useMemo(() => {
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.id.toString().includes(searchTerm)
    );
  }, [groups, searchTerm]);

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Groups
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your lending groups and monitor their performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowExport(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => setShowAddGroup(true)}
              className="gap-2 bg-primary hover:bg-primary/80 text-white shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Group
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <span>Error loading groups: {(error as Error).message}</span>
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No groups found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You haven't been assigned any groups yet"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Card 
                key={group.id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer overflow-hidden"
                onClick={() => setLocation(`/field-officer/groups/${group.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {group.name}
                      </CardTitle>
                      <CardDescription>ID: {group.id}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/field-officer/groups/${group.id}`)}>
                          View Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>Group Settings</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Members
                      </p>
                      <p className="font-bold text-lg">{group.totalMembers}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Repayment
                      </p>
                      <p className={`font-bold text-lg ${
                        group.repaymentRate >= 90 ? 'text-green-600' : 
                        group.repaymentRate >= 75 ? 'text-amber-600' : 
                        'text-destructive'
                      }`}>
                        {group.repaymentRate}%
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Outstanding Loans
                      </p>
                      <p className="font-bold text-lg">
                        KES {new Intl.NumberFormat('en-KE').format(parseFloat(group.totalLoansOutstanding))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex items-center justify-between group-hover:text-primary transition-colors">
                    <span className="text-sm font-medium">View Group Details</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          open={showExport} 
          onOpenChange={setShowExport} 
          groups={groups} 
        />
      </div>
    </Layout>
  );
}
