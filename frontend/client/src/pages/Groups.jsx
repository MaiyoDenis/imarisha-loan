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
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreHorizontal, UserPlus, ArrowRight, Eye, Download, FileText, Sheet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AddGroupModal } from "@/components/field-officer/AddGroupModal";
import { downloadCSV, downloadJSON, downloadExcel, generateGroupReport, generateGroupMembersReport, generateLoansReport, } from "@/lib/exportUtils";
export default function Groups() {
    var _this = this;
    var setLocation = useLocation()[1];
    var toast = useToast().toast;
    // Debug logging
    useEffect(function () {
        console.log('Groups page mounted');
    }, []);
    var _a = useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = useState(null), selectedGroup = _b[0], setSelectedGroup = _b[1];
    var _c = useState(false), isMembersOpen = _c[0], setIsMembersOpen = _c[1];
    var _d = useState(false), isReportOpen = _d[0], setIsReportOpen = _d[1];
    var _e = useState("overview"), reportType = _e[0], setReportType = _e[1];
    var _f = useState(false), showAddGroupModal = _f[0], setShowAddGroupModal = _f[1];
    var queryClient = useQueryClient();
    var userStr = localStorage.getItem('user');
    var user = userStr ? JSON.parse(userStr) : null;
    var userRole = (user === null || user === void 0 ? void 0 : user.role) ? user.role.toLowerCase().replace(/[\s-]+/g, '_').trim() : '';
    var isFieldOfficer = userRole === 'field_officer';

    var _g = useQuery({
        queryKey: ["groups", isFieldOfficer],
        queryFn: isFieldOfficer ? api.getFieldOfficerGroups : api.getGroups,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }), _h = _g.data, groups = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var _i = useQuery({
        queryKey: ["members"],
        queryFn: api.getMembers,
        enabled: !isFieldOfficer,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, members = _i === void 0 ? [] : _i;
    var _j = useQuery({
        queryKey: ["loans"],
        queryFn: function () { return api.getLoans(); },
        enabled: !isFieldOfficer,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, loans = _j === void 0 ? [] : _j;
    var _k = useQuery({
        queryKey: ["group-members", selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!selectedGroup)
                    return [2 /*return*/, []];
                return [2 /*return*/, members.filter(function (m) { return m.groupId === selectedGroup.id; })];
            });
        }); },
        enabled: !!selectedGroup && isMembersOpen,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    }).data, groupMembers = _k === void 0 ? [] : _k;
    var filteredGroups = groups.filter(function (group) {
        var _a;
        var searchLower = searchQuery.toLowerCase();
        var matchesSearch = (group.name.toLowerCase().includes(searchLower) ||
            group.id.toString().includes(searchLower) ||
            group.branchId.toString().includes(searchLower));
        var userRole = (_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/[\s-]+/g, '_').trim();
        if (userRole === 'field_officer') {
            // Ensure both IDs are treated as numbers for comparison
            var userId = Number(user.id);
            var officerId = Number(group.loanOfficerId);
            return matchesSearch && officerId === userId;
        }
        return matchesSearch;
    });
    var handleViewMembers = function (group) {
        setSelectedGroup(group);
        setIsMembersOpen(true);
    };
    var handleOpenReport = function (group) {
        setSelectedGroup(group);
        setReportType("overview");
        setIsReportOpen(true);
    };
    var handleExportGroupsOverview = function (format) {
        var reportData = generateGroupReport(groups, members, loans);
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "groups-report-".concat(timestamp);
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
    var handleExportGroupMembers = function (format) {
        if (!selectedGroup)
            return;
        var reportData = generateGroupMembersReport(selectedGroup.id, selectedGroup.name, members, loans);
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "group-members-".concat(selectedGroup.name, "-").concat(timestamp);
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
    var handleExportGroupLoans = function (format) {
        if (!selectedGroup)
            return;
        var groupMemIds = members
            .filter(function (m) { return m.groupId === selectedGroup.id; })
            .map(function (m) { return m.id; });
        var groupLoans = loans.filter(function (l) { return groupMemIds.includes(l.memberId); });
        var reportData = generateLoansReport(groupLoans);
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "group-loans-".concat(selectedGroup.name, "-").concat(timestamp);
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
            description: "Loans report exported as ".concat(format.toUpperCase()),
        });
    };
    return (<Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">
              Groups
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage lending groups and their schedules.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search groups..." className="pl-9 bg-background neon-input h-10" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="btn-neon flex-1 sm:flex-none">
                    <Download className="mr-2 h-4 w-4"/> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={function () { return handleExportGroupsOverview("csv"); }}>
                    <Sheet className="mr-2 h-4 w-4"/> Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={function () { return handleExportGroupsOverview("excel"); }}>
                    <FileText className="mr-2 h-4 w-4"/> Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={function () { return handleExportGroupsOverview("json"); }}>
                    <Download className="mr-2 h-4 w-4"/> Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="btn-neon flex-1 sm:flex-none" onClick={function () { return setShowAddGroupModal(true); }}>
                <UserPlus className="mr-2 h-4 w-4"/> New Group
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (<div className="text-center py-12">Loading groups...</div>) : filteredGroups.length === 0 ? (<Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4"/>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No groups found" : "No groups yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                ? "Try adjusting your search criteria"
                : "Create your first lending group to get started."}
              </p>
              {!searchQuery && (<Button onClick={function () { return setShowAddGroupModal(true); }}>
                  <UserPlus className="mr-2 h-4 w-4"/> Create Group
                </Button>)}
            </CardContent>
          </Card>) : (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map(function (group) {
                var memberCount = 0;
                var savingsAmount = 0;
                var outstandingAmount = 0;
                var loanCount = 0;
                var totalLoanedAmount = 0;

                if (isFieldOfficer) {
                    memberCount = group.totalMembers || 0;
                    savingsAmount = parseFloat(group.totalSavings || "0");
                    outstandingAmount = parseFloat(group.totalLoansOutstanding || "0");
                    loanCount = group.totalLoans || 0;
                    totalLoanedAmount = parseFloat(group.totalLoaned || "0");
                } else {
                    var groupMembers = members.filter(function (m) { return m.groupId === group.id; });
                    var groupLoans = loans.filter(function (l) {
                        var loanMember = members.find(function (m) { return m.id === l.memberId; });
                        return loanMember && loanMember.groupId === group.id;
                    });
                    memberCount = groupMembers.length;
                    savingsAmount = groupMembers.reduce(function (sum, m) { return sum + parseFloat(m.savingsBalance || "0"); }, 0);
                    outstandingAmount = groupLoans.reduce(function (sum, l) { return sum + parseFloat(l.outstandingBalance || "0"); }, 0);
                    loanCount = groupLoans.length;
                    totalLoanedAmount = groupLoans.reduce(function (sum, l) { return sum + parseFloat(l.principleAmount || "0"); }, 0);
                }

                return (<Card key={group.id} className="relative overflow-visible transition-shadow duration-300 hover:shadow-xl cursor-pointer" onClick={function () { return setLocation("/field-officer/groups/".concat(group.id)); }}>
                  <span className="aura" style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}></span>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-heading">
                        {group.name}
                      </CardTitle>
                      <CardDescription>Branch ID: {group.branchId}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={function (e) { return e.stopPropagation(); }}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={function () { return handleViewMembers(group); }}>
                          <Eye className="mr-2 h-4 w-4"/> View Members
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={function () { return handleOpenReport(group); }}>
                          <FileText className="mr-2 h-4 w-4"/> View Report
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
                          <Users className="mr-2 h-4 w-4"/>
                          Members
                        </div>
                        <div className="font-medium">
                          {memberCount}/{group.maxMembers}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Loans</div>
                        <div className="font-medium">{loanCount}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Total Loaned</div>
                        <div className="font-medium">
                          KES {totalLoanedAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Outstanding</div>
                        <div className="font-medium">
                          KES {outstandingAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Status</div>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="pt-4 flex gap-2">
                        <Button variant="outline" className="flex-1 text-xs" onClick={function (e) { e.stopPropagation(); handleViewMembers(group); }}>
                          View Members <ArrowRight className="ml-2 h-3 w-3"/>
                        </Button>
                        <Button variant="outline" className="flex-1 text-xs" onClick={function (e) { e.stopPropagation(); handleOpenReport(group); }}>
                          <FileText className="mr-1 h-3 w-3"/> Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>);
            })}
          </div>)}
      </div>

      {/* Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.name} - Members</DialogTitle>
            <DialogDescription>
              All members in this group and their status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {groupMembers.length === 0 ? (<p className="text-center text-muted-foreground py-4">
                No members in this group
              </p>) : (<Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupMembers.map(function (member) { return (<TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.memberCode}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.riskScore}</TableCell>
                      <TableCell>{member.riskCategory}</TableCell>
                    </TableRow>); })}
                </TableBody>
              </Table>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.name} - Report & Export</DialogTitle>
            <DialogDescription>
              View and export group data in multiple formats
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" value={reportType} onValueChange={function (val) { return setReportType(val); }}>
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
                  <p className="font-medium">{selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.name}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="font-medium">
                    {members.filter(function (m) { return m.groupId === (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id); })
            .length}/{selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.maxMembers}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="font-medium">
                    {loans.filter(function (l) {
            var member = members.find(function (m) { return m.id === l.memberId; });
            return (member === null || member === void 0 ? void 0 : member.groupId) === (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id);
        }).length}
                  </p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.isActive) ? "default" : "secondary"}>
                    {(selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.isActive) ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Overview Report</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupsOverview("csv"); }}>
                    <Sheet className="mr-2 h-4 w-4"/> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupsOverview("excel"); }}>
                    <FileText className="mr-2 h-4 w-4"/> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupsOverview("json"); }}>
                    <Download className="mr-2 h-4 w-4"/> JSON
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
            .filter(function (m) { return m.groupId === (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id); })
            .map(function (member) { return (<TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.memberCode}
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.status === "active"
                ? "default"
                : "secondary"}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.riskScore}</TableCell>
                        </TableRow>); })}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Members Report</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupMembers("csv"); }}>
                    <Sheet className="mr-2 h-4 w-4"/> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupMembers("excel"); }}>
                    <FileText className="mr-2 h-4 w-4"/> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupMembers("json"); }}>
                    <Download className="mr-2 h-4 w-4"/> JSON
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
                    {loans
            .filter(function (l) {
            var member = members.find(function (m) { return m.id === l.memberId; });
            return (member === null || member === void 0 ? void 0 : member.groupId) === (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.id);
        })
            .map(function (loan) { return (<TableRow key={loan.id}>
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
                            <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                        </TableRow>); })}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Export Loans Report</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupLoans("csv"); }}>
                    <Sheet className="mr-2 h-4 w-4"/> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupLoans("excel"); }}>
                    <FileText className="mr-2 h-4 w-4"/> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={function () { return handleExportGroupLoans("json"); }}>
                    <Download className="mr-2 h-4 w-4"/> JSON
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddGroupModal
        open={showAddGroupModal}
        onOpenChange={setShowAddGroupModal}
        onSuccess={function () {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
        }}
      />
    </Layout>);
}
