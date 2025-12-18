import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreHorizontal, UserPlus, ArrowRight, Eye, X, Download, FileText, Sheet, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  downloadCSV,
  downloadJSON,
  downloadExcel,
  generateGroupReport,
  generateGroupMembersReport,
  generateLoansReport,
} from "@/lib/exportUtils";

interface Group {
  id: number;
  name: string;
  branchId: number;
  loanOfficerId: number;
  maxMembers: number;
  isActive: boolean;
  createdAt: string;
}

interface Member {
  id: number;
  groupId?: number;
  memberCode: string;
  status: string;
  riskScore: number;
  riskCategory: string;
  createdAt: string;
}

interface Loan {
  id: number;
  memberId: number;
  loanNumber: string;
  principleAmount: string;
  totalAmount: string;
  outstandingBalance: string;
  status: string;
  applicationDate: string;
  dueDate?: string;
}

export default function Groups() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<"overview" | "members" | "loans">("overview");

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: api.getGroups,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: api.getMembers,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ["loans"],
    queryFn: () => api.getLoans(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ["group-members", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      return members.filter((m: Member) => m.groupId === selectedGroup.id);
    },
    enabled: !!selectedGroup && isMembersOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredGroups = groups.filter((group: Group) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.id.toString().includes(searchLower) ||
      group.branchId.toString().includes(searchLower)
    );
  });

  const handleViewMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsMembersOpen(true);
  };

  const handleOpenReport = (group: Group) => {
    setSelectedGroup(group);
    setReportType("overview");
    setIsReportOpen(true);
  };

  const handleExportGroupsOverview = (format: "csv" | "json" | "excel") => {
    const reportData = generateGroupReport(groups, members, loans as Loan[]);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `groups-report-${timestamp}`;

    if (format === "csv") {
      downloadCSV(reportData, filename);
    } else if (format === "json") {
      downloadJSON(reportData, filename);
    } else if (format === "excel") {
      downloadExcel(reportData, filename);
    }

    toast({
      title: "Success",
      description: `Groups report exported as ${format.toUpperCase()}`,
    });
  };

  const handleExportGroupMembers = (format: "csv" | "json" | "excel") => {
    if (!selectedGroup) return;

    const reportData = generateGroupMembersReport(
      selectedGroup.id,
      selectedGroup.name,
      members,
      loans as Loan[]
    );
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `group-members-${selectedGroup.name}-${timestamp}`;

    if (format === "csv") {
      downloadCSV(reportData, filename);
    } else if (format === "json") {
      downloadJSON(reportData, filename);
    } else if (format === "excel") {
      downloadExcel(reportData, filename);
    }

    toast({
      title: "Success",
      description: `Members report exported as ${format.toUpperCase()}`,
    });
  };

  const handleExportGroupLoans = (format: "csv" | "json" | "excel") => {
    if (!selectedGroup) return;

    const groupMemIds = members
      .filter((m: Member) => m.groupId === selectedGroup.id)
      .map((m: Member) => m.id);

    const groupLoans = (loans as Loan[]).filter((l: Loan) => groupMemIds.includes(l.memberId));
    const reportData = generateLoansReport(groupLoans);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `group-loans-${selectedGroup.name}-${timestamp}`;

    if (format === "csv") {
      downloadCSV(reportData, filename);
    } else if (format === "json") {
      downloadJSON(reportData, filename);
    } else if (format === "excel") {
      downloadExcel(reportData, filename);
    }

    toast({
      title: "Success",
      description: `Loans report exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Groups
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage lending groups and their schedules.
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-lg shadow-primary/20">
                  <Download className="mr-2 h-4 w-4" /> Export Reports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportGroupsOverview("csv")}>
                  <Sheet className="mr-2 h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportGroupsOverview("excel")}>
                  <FileText className="mr-2 h-4 w-4" /> Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportGroupsOverview("json")}>
                  <Download className="mr-2 h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-4 w-4" /> Create New Group
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by group name, ID, or branch..." 
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No groups found" : "No groups yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery 
                  ? "Try adjusting your search criteria"
                  : "Create your first lending group to get started."
                }
              </p>
              {!searchQuery && (
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Create Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group: Group) => {
              const groupMembers = members.filter(
                (m: Member) => m.groupId === group.id
              );
              const groupLoans = (loans as Loan[]).filter((l: Loan) => {
                const loanMember = members.find(
                  (m: Member) => m.id === l.memberId
                );
                return loanMember && loanMember.groupId === group.id;
              });
              const totalLoanAmount = groupLoans.reduce(
                (sum: number, l: Loan) => sum + parseFloat(l.principleAmount || "0"),
                0
              );
              const outstandingBalance = groupLoans.reduce(
                (sum: number, l: Loan) => sum + parseFloat(l.outstandingBalance || "0"),
                0
              );

              return (
                <Card
                  key={group.id}
                  className="border-border/50 hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-heading">
                        {group.name}
                      </CardTitle>
                      <CardDescription>Branch ID: {group.branchId}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewMembers(group)}>
                          <Eye className="mr-2 h-4 w-4" /> View Members
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenReport(group)}>
                          <FileText className="mr-2 h-4 w-4" /> View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Group</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Dissolve Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          Members
                        </div>
                        <div className="font-medium">
                          {groupMembers.length}/{group.maxMembers}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Loans</div>
                        <div className="font-medium">{groupLoans.length}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Total Loaned</div>
                        <div className="font-medium">
                          KES {totalLoanAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Outstanding</div>
                        <div className="font-medium">
                          KES {outstandingBalance.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Status</div>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleViewMembers(group)}
                        >
                          View Members <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleOpenReport(group)}
                        >
                          <FileText className="mr-1 h-3 w-3" /> Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name} - Members</DialogTitle>
            <DialogDescription>
              All members in this group and their status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {groupMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No members in this group
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupMembers.map((member: Member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.memberCode}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.riskScore}</TableCell>
                      <TableCell>{member.riskCategory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name} - Report & Export</DialogTitle>
            <DialogDescription>
              View and export group data in multiple formats
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" value={reportType} onValueChange={(val: any) => setReportType(val)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Group Name</p>
                  <p className="font-medium">{selectedGroup?.name}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="font-medium">
                    {members.filter((m: Member) => m.groupId === selectedGroup?.id)
                      .length}/{selectedGroup?.maxMembers}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="font-medium">
                    {(loans as Loan[]).filter((l: Loan) => {
                      const member = members.find(
                        (m: Member) => m.id === l.memberId
                      );
                      return member?.groupId === selectedGroup?.id;
                    }).length}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedGroup?.isActive ? "default" : "secondary"}>
                    {selectedGroup?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Overview Report</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupsOverview("csv")}
                  >
                    <Sheet className="mr-2 h-4 w-4" /> CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupsOverview("excel")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupsOverview("json")}
                  >
                    <Download className="mr-2 h-4 w-4" /> JSON
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members
                      .filter((m: Member) => m.groupId === selectedGroup?.id)
                      .map((member: Member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.memberCode}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Members Report</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupMembers("csv")}
                  >
                    <Sheet className="mr-2 h-4 w-4" /> CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupMembers("excel")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupMembers("json")}
                  >
                    <Download className="mr-2 h-4 w-4" /> JSON
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Loans Tab */}
            <TabsContent value="loans" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(loans as Loan[])
                      .filter((l: Loan) => {
                        const member = members.find(
                          (m: Member) => m.id === l.memberId
                        );
                        return member?.groupId === selectedGroup?.id;
                      })
                      .map((loan: Loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {loan.loanNumber}
                          </TableCell>
                          <TableCell>
                            KES {parseFloat(loan.principleAmount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            KES{" "}
                            {parseFloat(loan.outstandingBalance).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                loan.status === "active" ? "default" : "secondary"
                              }
                            >
                              {loan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Loans Report</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupLoans("csv")}
                  >
                    <Sheet className="mr-2 h-4 w-4" /> CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupLoans("excel")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportGroupLoans("json")}
                  >
                    <Download className="mr-2 h-4 w-4" /> JSON
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
