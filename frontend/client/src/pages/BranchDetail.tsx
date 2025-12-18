import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, DollarSign, Package, TrendingUp, Loader2, Search, Filter, Download, Sheet, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, downloadJSON, downloadExcel } from "@/lib/exportUtils";

interface Branch {
  id: number;
  name: string;
  location: string;
  managerId: number | null;
  isActive: boolean;
  createdAt: string;
}

interface Group {
  id: number;
  name: string;
  branchId: number;
  loanOfficerId: number;
  maxMembers: number;
  isActive: boolean;
}

interface Member {
  id: number;
  userId: number;
  groupId?: number;
  memberCode: string;
  status: string;
  riskScore: number;
  riskCategory: string;
}

interface Loan {
  id: number;
  loanNumber: string;
  memberId: number;
  principleAmount: string;
  totalAmount: string;
  outstandingBalance: string;
  status: string;
  applicationDate: string;
  dueDate?: string;
}

interface LoanProduct {
  id: number;
  name: string;
  sellingPrice: string;
  stockQuantity: number;
}

export default function BranchDetail() {
  const { branchId } = useParams<{ branchId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [isMemberDetailsOpen, setIsMemberDetailsOpen] = useState(false);
  
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => api.getBranch(parseInt(branchId!)),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!branchId,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["branch-groups", branchId],
    queryFn: async () => {
      const allGroups = await api.getGroups();
      return allGroups.filter((g: Group) => g.branchId === parseInt(branchId!));
    },
    enabled: !!branchId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["branch-members", branchId],
    queryFn: async () => {
      const allMembers = await api.getMembers();
      return allMembers.filter((m: any) => m.branchId === parseInt(branchId!));
    },
    enabled: !!branchId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ["branch-loans", branchId],
    queryFn: async () => {
      const allLoans = await api.getLoans();
      const memberIds = members.map((m: Member) => m.id);
      return allLoans.filter((l: Loan) => memberIds.includes(l.memberId));
    },
    enabled: !!branchId && members.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["loan-products"],
    queryFn: api.getLoanProducts,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { data: branchStaff = [] } = useQuery({
    queryKey: ["branch-staff", branchId],
    queryFn: () => api.getBranchStaff(parseInt(branchId!)),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ["group-members", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const allMembers = await api.getMembers();
      return allMembers.filter((m: Member) => m.groupId === selectedGroup.id);
    },
    enabled: !!selectedGroup && isGroupDetailsOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: memberLoans = [] } = useQuery({
    queryKey: ["member-loans", selectedMember?.id],
    queryFn: async () => {
      if (!selectedMember) return [];
      const allLoans = await api.getLoans();
      return allLoans.filter((l: Loan) => l.memberId === selectedMember.id);
    },
    enabled: !!selectedMember && isMemberDetailsOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredGroups = groups.filter((group: Group) => {
    const searchLower = groupSearchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.id.toString().includes(searchLower)
    );
  });

  const filteredMembers = members.filter((member: Member) => {
    const searchLower = memberSearchQuery.toLowerCase();
    return (
      member.memberCode?.toLowerCase().includes(searchLower) ||
      member.id?.toString().includes(searchLower)
    );
  });

  const handleExportGroups = (format: "csv" | "json" | "excel") => {
    const reportData = filteredGroups.map((group: Group) => ({
      id: group.id,
      name: group.name,
      members: members.filter((m: Member) => m.groupId === group.id).length,
      maxMembers: group.maxMembers,
      status: group.isActive ? "Active" : "Inactive",
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${branch?.name}-groups-${timestamp}`;

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

  const handleExportMembers = (format: "csv" | "json" | "excel") => {
    const reportData = filteredMembers.map((member: Member) => ({
      id: member.id,
      memberCode: member.memberCode,
      groupId: member.groupId || "N/A",
      status: member.status,
      riskScore: member.riskScore,
      riskCategory: member.riskCategory,
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${branch?.name}-members-${timestamp}`;

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

  if (branchLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!branch) {
    return (
      <Layout>
        <div className="p-8">
          <p className="text-red-500">Branch not found</p>
          <Button variant="outline" onClick={() => navigate("/branches")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Branches
          </Button>
        </div>
      </Layout>
    );
  }

  const totalLoans = loans.length;
  const totalCustomers = members.length;
  const totalStaff = branchStaff.length;
  const totalRevenue = loans.reduce((sum: number, loan: Loan) => sum + parseFloat(loan.principleAmount || '0'), 0);
  const activeLoans = loans.filter((l: Loan) => l.status === 'active' || l.status === 'pending').length;
  const outstandingBalance = loans.reduce((sum: number, loan: Loan) => sum + parseFloat(loan.outstandingBalance || '0'), 0);

  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/branches")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">
                {branch.name}
              </h1>
            </div>
            <p className="text-muted-foreground">{branch.location}</p>
            <Badge variant={branch.isActive ? "default" : "secondary"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoans}</div>
              <p className="text-xs text-muted-foreground">{activeLoans} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {(outstandingBalance / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">To be repaid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground">Employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loan Portfolio</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {(totalRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Total disbursed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Branch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">Branch Name</p>
                    <p className="font-medium">{branch.name}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{branch.location}</p>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(branch.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Groups:</span>
                    <span className="font-medium">{groups.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customers:</span>
                    <span className="font-medium">{totalCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">{totalStaff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Loans:</span>
                    <span className="font-medium">{activeLoans}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Groups Tab with Search & Export */}
          <TabsContent value="groups">
            <Card className="glass-card gradient-border hover-tilt relative overflow-hidden">
              <span className="aura"></span>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Groups</CardTitle>
                    <CardDescription>Click on a group to view details and members</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search groups..." 
                        className="pl-9 w-64 neon-input"
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredGroups.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {groupSearchQuery ? "No groups match your search" : "No groups in this branch"}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group: Group) => {
                        const groupMemCount = members.filter((m: Member) => m.groupId === group.id).length;
                        return (
                          <TableRow key={group.id} className="cursor-pointer hover:bg-accent">
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>{groupMemCount}/{group.maxMembers}</TableCell>
                            <TableCell>
                              <Badge variant={group.isActive ? "default" : "secondary"}>
                                {group.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setIsGroupDetailsOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab with Search & Export */}
          <TabsContent value="customers">
            <Card className="glass-card gradient-border hover-tilt relative overflow-hidden">
              <span className="aura"></span>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>Click on a customer to view their loans</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search members..." 
                        className="pl-9 w-64 neon-input"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {memberSearchQuery ? "No members match your search" : "No customers in this branch"}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member: Member) => (
                        <TableRow key={member.id} className="cursor-pointer hover:bg-accent">
                          <TableCell className="font-medium">{member.memberCode}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                          <TableCell>{member.riskCategory}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsMemberDetailsOpen(true);
                              }}
                            >
                              View Loans
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans">
            <Card className="glass-card gradient-border hover-tilt relative overflow-hidden">
              <span className="aura"></span>
              <CardHeader>
                <CardTitle>All Loans</CardTitle>
                <CardDescription>Loans from all customers in this branch</CardDescription>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No loans in this branch</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan Number</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan: Loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                          <TableCell>KES {parseFloat(loan.principleAmount).toLocaleString()}</TableCell>
                          <TableCell>KES {parseFloat(loan.totalAmount).toLocaleString()}</TableCell>
                          <TableCell>KES {parseFloat(loan.outstandingBalance).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="glass-card gradient-border hover-tilt relative overflow-hidden">
              <span className="aura"></span>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>Products that can be distributed through this branch</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No products available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: LoanProduct) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>KES {parseFloat(product.sellingPrice).toLocaleString()}</TableCell>
                          <TableCell>{product.stockQuantity} units</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card className="glass-card gradient-border hover-tilt relative overflow-hidden">
              <span className="aura"></span>
              <CardHeader>
                <CardTitle>Branch Staff</CardTitle>
                <CardDescription>Team members assigned to this branch</CardDescription>
              </CardHeader>
              <CardContent>
                {branchStaff.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No staff assigned</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branchStaff.map((staff: any) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.firstName} {staff.lastName}
                          </TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>{staff.phone}</TableCell>
                          <TableCell>
                            <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Group Details Modal */}
      <Dialog open={isGroupDetailsOpen} onOpenChange={setIsGroupDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
            <DialogDescription>Group details and members</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedGroup.isActive ? 'default' : 'secondary'}>
                  {selectedGroup.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Group Members</p>
                {groupMembers.length === 0 ? (
                  <p className="text-sm py-4 text-muted-foreground">No members in this group</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupMembers.map((member: Member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.memberCode}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer/Member Details Modal */}
      <Dialog open={isMemberDetailsOpen} onOpenChange={setIsMemberDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedMember?.memberCode}</DialogTitle>
            <DialogDescription>Member loans and information</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedMember.status === 'active' ? 'default' : 'secondary'}>
                  {selectedMember.status}
                </Badge>
              </div>
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Risk Information</p>
                <div className="text-sm space-y-1">
                  <p>Risk Score: <span className="font-medium">{selectedMember.riskScore}</span></p>
                  <p>Risk Category: <span className="font-medium">{selectedMember.riskCategory}</span></p>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Loans</p>
                {memberLoans.length === 0 ? (
                  <p className="text-sm py-4 text-muted-foreground">No loans for this customer</p>
                ) : (
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
                      {memberLoans.map((loan: Loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                          <TableCell>KES {parseFloat(loan.principleAmount).toLocaleString()}</TableCell>
                          <TableCell>KES {parseFloat(loan.outstandingBalance).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
