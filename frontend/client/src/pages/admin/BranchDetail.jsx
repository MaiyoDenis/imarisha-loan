var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, DollarSign, Package, TrendingUp, Loader2, Search, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, downloadJSON, downloadExcel } from "@/lib/exportUtils";
export default function BranchDetail() {
    var _this = this;
    var branchId = useParams().branchId;
    var _a = useLocation(), navigate = _a[1];
    var toast = useToast().toast;
    var _b = useState(null), selectedGroup = _b[0], setSelectedGroup = _b[1];
    var _c = useState(null), selectedMember = _c[0], setSelectedMember = _c[1];
    var _d = useState(false), isGroupDetailsOpen = _d[0], setIsGroupDetailsOpen = _d[1];
    var _e = useState(false), isMemberDetailsOpen = _e[0], setIsMemberDetailsOpen = _e[1];
    var _f = useState(""), groupSearchQuery = _f[0], setGroupSearchQuery = _f[1];
    var _g = useState(""), memberSearchQuery = _g[0], setMemberSearchQuery = _g[1];
    var _h = useQuery({
        queryKey: ["branch", branchId],
        queryFn: function () { return api.getBranch(parseInt(branchId)); },
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        enabled: !!branchId,
    }), branch = _h.data, branchLoading = _h.isLoading;
    var _j = useQuery({
        queryKey: ["branch-groups", branchId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var allGroups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.getGroups()];
                    case 1:
                        allGroups = _a.sent();
                        return [2 /*return*/, allGroups.filter(function (g) { return g.branchId === parseInt(branchId); })];
                }
            });
        }); },
        enabled: !!branchId,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, groups = _j === void 0 ? [] : _j;
    var _k = useQuery({
        queryKey: ["branch-members", branchId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var allMembers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.getMembers()];
                    case 1:
                        allMembers = _a.sent();
                        return [2 /*return*/, allMembers.filter(function (m) { return m.branchId === parseInt(branchId); })];
                }
            });
        }); },
        enabled: !!branchId,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, members = _k === void 0 ? [] : _k;
    var _l = useQuery({
        queryKey: ["branch-loans", branchId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var allLoans, memberIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.getLoans()];
                    case 1:
                        allLoans = _a.sent();
                        memberIds = members.map(function (m) { return m.id; });
                        return [2 /*return*/, allLoans.filter(function (l) { return memberIds.includes(l.memberId); })];
                }
            });
        }); },
        enabled: !!branchId && members.length > 0,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, loans = _l === void 0 ? [] : _l;
    var _m = useQuery({
        queryKey: ["loan-products"],
        queryFn: api.getLoanProducts,
        staleTime: 15 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
    }).data, products = _m === void 0 ? [] : _m;
    var _o = useQuery({
        queryKey: ["branch-staff", branchId],
        queryFn: function () { return api.getBranchStaff(parseInt(branchId)); },
        enabled: !!branchId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    }).data, branchStaff = _o === void 0 ? [] : _o;
    var _p = useQuery({
        queryKey: ["group-members", selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var allMembers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedGroup)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, api.getMembers()];
                    case 1:
                        allMembers = _a.sent();
                        return [2 /*return*/, allMembers.filter(function (m) { return m.groupId === selectedGroup.id; })];
                }
            });
        }); },
        enabled: !!selectedGroup && isGroupDetailsOpen,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    }).data, groupMembers = _p === void 0 ? [] : _p;
    var _q = useQuery({
        queryKey: ["member-loans", selectedMember === null || selectedMember === void 0 ? void 0 : selectedMember.id],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var allLoans;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedMember)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, api.getLoans()];
                    case 1:
                        allLoans = _a.sent();
                        return [2 /*return*/, allLoans.filter(function (l) { return l.memberId === selectedMember.id; })];
                }
            });
        }); },
        enabled: !!selectedMember && isMemberDetailsOpen,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    }).data, memberLoans = _q === void 0 ? [] : _q;
    var filteredGroups = groups.filter(function (group) {
        var searchLower = groupSearchQuery.toLowerCase();
        return (group.name.toLowerCase().includes(searchLower) ||
            group.id.toString().includes(searchLower));
    });
    var filteredMembers = members.filter(function (member) {
        var _a, _b;
        var searchLower = memberSearchQuery.toLowerCase();
        return (((_a = member.memberCode) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
            ((_b = member.id) === null || _b === void 0 ? void 0 : _b.toString().includes(searchLower)));
    });
    var handleExportGroups = function (format) {
        var reportData = filteredGroups.map(function (group) { return ({
            id: group.id,
            name: group.name,
            members: members.filter(function (m) { return m.groupId === group.id; }).length,
            maxMembers: group.maxMembers,
            status: group.isActive ? "Active" : "Inactive",
        }); });
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "".concat(branch === null || branch === void 0 ? void 0 : branch.name, "-groups-").concat(timestamp);
        if (format === "csv") {
            downloadCSV(reportData, filename);
        }
        else if (format === "json") {
            downloadJSON(reportData, filename);
        }
        else if (format === "excel") {
            downloadExcel(reportData, filename);
        }
        toast({
            title: "Success",
            description: "Groups report exported as ".concat(format.toUpperCase()),
        });
    };
    var handleExportMembers = function (format) {
        var reportData = filteredMembers.map(function (member) { return ({
            id: member.id,
            memberCode: member.memberCode,
            groupId: member.groupId || "N/A",
            status: member.status,
            riskScore: member.riskScore,
            riskCategory: member.riskCategory,
        }); });
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "".concat(branch === null || branch === void 0 ? void 0 : branch.name, "-members-").concat(timestamp);
        if (format === "csv") {
            downloadCSV(reportData, filename);
        }
        else if (format === "json") {
            downloadJSON(reportData, filename);
        }
        else if (format === "excel") {
            downloadExcel(reportData, filename);
        }
        toast({
            title: "Success",
            description: "Members report exported as ".concat(format.toUpperCase()),
        });
    };
    if (branchLoading) {
        return (<Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin"/>
        </div>
      </Layout>);
    }
    if (!branch) {
        return (<Layout>
        <div className="p-8">
          <p className="text-red-500">Branch not found</p>
          <Button variant="outline" onClick={function () { return navigate("/branches"); }} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Branches
          </Button>
        </div>
      </Layout>);
    }
    var totalLoans = loans.length;
    var totalCustomers = members.length;
    var totalStaff = branchStaff.length;
    var totalRevenue = loans.reduce(function (sum, loan) { return sum + parseFloat(loan.principleAmount || '0'); }, 0);
    var activeLoans = loans.filter(function (l) { return l.status === 'active' || l.status === 'pending'; }).length;
    var outstandingBalance = loans.reduce(function (sum, loan) { return sum + parseFloat(loan.outstandingBalance || '0'); }, 0);
    return (<Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={function () { return navigate("/branches"); }} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4"/>
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
              <Users className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoans}</div>
              <p className="text-xs text-muted-foreground">{activeLoans} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {(outstandingBalance / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">To be repaid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground">Employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loan Portfolio</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground"/>
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
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                      <Input placeholder="Search groups..." className="pl-9 w-64 neon-input" value={groupSearchQuery} onChange={function (e) { return setGroupSearchQuery(e.target.value); }}/>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4"/> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredGroups.length === 0 ? (<p className="text-center text-muted-foreground py-8">
                    {groupSearchQuery ? "No groups match your search" : "No groups in this branch"}
                  </p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map(function (group) {
                var groupMemCount = members.filter(function (m) { return m.groupId === group.id; }).length;
                return (<TableRow key={group.id} className="cursor-pointer hover:bg-accent">
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>{groupMemCount}/{group.maxMembers}</TableCell>
                            <TableCell>
                              <Badge variant={group.isActive ? "default" : "secondary"}>
                                {group.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={function () {
                        setSelectedGroup(group);
                        setIsGroupDetailsOpen(true);
                    }}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>);
            })}
                    </TableBody>
                  </Table>)}
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
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                      <Input placeholder="Search members..." className="pl-9 w-64 neon-input" value={memberSearchQuery} onChange={function (e) { return setMemberSearchQuery(e.target.value); }}/>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4"/> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (<p className="text-center text-muted-foreground py-8">
                    {memberSearchQuery ? "No members match your search" : "No customers in this branch"}
                  </p>) : (<Table>
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
                      {filteredMembers.map(function (member) { return (<TableRow key={member.id} className="cursor-pointer hover:bg-accent">
                          <TableCell className="font-medium">{member.memberCode}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                          <TableCell>{member.riskCategory}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={function () {
                    setSelectedMember(member);
                    setIsMemberDetailsOpen(true);
                }}>
                              View Loans
                            </Button>
                          </TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
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
                {loans.length === 0 ? (<p className="text-center text-muted-foreground py-8">No loans in this branch</p>) : (<Table>
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
                      {loans.map(function (loan) { return (<TableRow key={loan.id}>
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
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
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
                {products.length === 0 ? (<p className="text-center text-muted-foreground py-8">No products available</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(function (product) { return (<TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>KES {parseFloat(product.sellingPrice).toLocaleString()}</TableCell>
                          <TableCell>{product.stockQuantity} units</TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
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
                {branchStaff.length === 0 ? (<p className="text-center text-muted-foreground py-8">No staff assigned</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branchStaff.map(function (staff) { return (<TableRow key={staff.id}>
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
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Group Details Modal */}
      <Dialog open={isGroupDetailsOpen} onOpenChange={setIsGroupDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.name}</DialogTitle>
            <DialogDescription>Group details and members</DialogDescription>
          </DialogHeader>
          {selectedGroup && (<div className="space-y-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedGroup.isActive ? 'default' : 'secondary'}>
                  {selectedGroup.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Group Members</p>
                {groupMembers.length === 0 ? (<p className="text-sm py-4 text-muted-foreground">No members in this group</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupMembers.map(function (member) { return (<TableRow key={member.id}>
                          <TableCell className="font-medium">{member.memberCode}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
              </div>
            </div>)}
        </DialogContent>
      </Dialog>

      {/* Customer/Member Details Modal */}
      <Dialog open={isMemberDetailsOpen} onOpenChange={setIsMemberDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedMember === null || selectedMember === void 0 ? void 0 : selectedMember.memberCode}</DialogTitle>
            <DialogDescription>Member loans and information</DialogDescription>
          </DialogHeader>
          {selectedMember && (<div className="space-y-4">
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
                {memberLoans.length === 0 ? (<p className="text-sm py-4 text-muted-foreground">No loans for this customer</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan Number</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberLoans.map(function (loan) { return (<TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                          <TableCell>KES {parseFloat(loan.principleAmount).toLocaleString()}</TableCell>
                          <TableCell>KES {parseFloat(loan.outstandingBalance).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
              </div>
            </div>)}
        </DialogContent>
      </Dialog>
    </Layout>);
}
