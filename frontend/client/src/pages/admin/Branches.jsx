var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, MoreHorizontal, Plus, Users, Trash2, Edit, Eye, UserCheck, Search, Filter, Download, Sheet, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { downloadCSV, downloadJSON, downloadExcel } from "@/lib/exportUtils";
export default function Branches() {
    var queryClient = useQueryClient();
    var _a = useLocation(), navigate = _a[1];
    var toast = useToast().toast;
    var _b = useState(false), isAddOpen = _b[0], setIsAddOpen = _b[1];
    var _c = useState(false), isEditOpen = _c[0], setIsEditOpen = _c[1];
    var _d = useState(false), isViewDetailsOpen = _d[0], setIsViewDetailsOpen = _d[1];
    var _e = useState(false), isAssignManagerOpen = _e[0], setIsAssignManagerOpen = _e[1];
    var _f = useState(false), isViewStaffOpen = _f[0], setIsViewStaffOpen = _f[1];
    var _g = useState(false), isDeleteOpen = _g[0], setIsDeleteOpen = _g[1];
    var _h = useState(""), searchQuery = _h[0], setSearchQuery = _h[1];
    var _j = useState(null), selectedBranch = _j[0], setSelectedBranch = _j[1];
    var _k = useState(""), selectedManager = _k[0], setSelectedManager = _k[1];
    var _l = useState({ name: "", location: "" }), formData = _l[0], setFormData = _l[1];
    var _m = useState({ name: "", location: "", isActive: true }), editFormData = _m[0], setEditFormData = _m[1];
    var _o = useQuery({
        queryKey: ["branches"],
        queryFn: api.getBranches,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }), _p = _o.data, branches = _p === void 0 ? [] : _p, isLoading = _o.isLoading;
    var _q = useQuery({
        queryKey: ["users"],
        queryFn: api.getMembers,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }).data, users = _q === void 0 ? [] : _q;
    var _r = useQuery({
        queryKey: ["branch-staff", selectedBranch === null || selectedBranch === void 0 ? void 0 : selectedBranch.id],
        queryFn: function () { return selectedBranch ? api.getBranchStaff(selectedBranch.id) : Promise.resolve([]); },
        enabled: !!selectedBranch && isViewStaffOpen,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    }).data, branchStaff = _r === void 0 ? [] : _r;
    var filteredBranches = branches.filter(function (branch) {
        var searchLower = searchQuery.toLowerCase();
        return (branch.name.toLowerCase().includes(searchLower) ||
            branch.location.toLowerCase().includes(searchLower) ||
            branch.id.toString().includes(searchLower));
    });
    var createMutation = useMutation({
        mutationFn: function (data) { return api.createBranch(data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setIsAddOpen(false);
            setFormData({ name: "", location: "" });
            toast({
                title: "Success",
                description: "Branch created successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create branch",
                variant: "destructive",
            });
        },
    });
    var updateMutation = useMutation({
        mutationFn: function (data) { return api.updateBranch(selectedBranch.id, data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setIsEditOpen(false);
            toast({
                title: "Success",
                description: "Branch updated successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update branch",
                variant: "destructive",
            });
        },
    });
    var assignManagerMutation = useMutation({
        mutationFn: function (managerId) {
            return api.updateBranch(selectedBranch.id, { managerId: managerId });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setIsAssignManagerOpen(false);
            setSelectedManager("");
            toast({
                title: "Success",
                description: "Manager assigned successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to assign manager",
                variant: "destructive",
            });
        },
    });
    var deleteMutation = useMutation({
        mutationFn: function (id) { return api.deleteBranch(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            setIsDeleteOpen(false);
            setSelectedBranch(null);
            toast({
                title: "Success",
                description: "Branch deleted successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete branch",
                variant: "destructive",
            });
        },
    });
    var handleAddBranch = function () {
        if (!formData.name.trim() || !formData.location.trim()) {
            toast({
                title: "Error",
                description: "Name and location are required",
                variant: "destructive",
            });
            return;
        }
        createMutation.mutate(formData);
    };
    var handleEditBranch = function () {
        if (!editFormData.name.trim() || !editFormData.location.trim()) {
            toast({
                title: "Error",
                description: "Name and location are required",
                variant: "destructive",
            });
            return;
        }
        updateMutation.mutate(editFormData);
    };
    var handleAssignManager = function () {
        var managerId = selectedManager ? parseInt(selectedManager) : null;
        assignManagerMutation.mutate(managerId);
    };
    var handleExportBranches = function (format) {
        var reportData = branches.map(function (branch) { return ({
            id: branch.id,
            name: branch.name,
            location: branch.location,
            managerId: branch.managerId || "N/A",
            status: branch.isActive ? "Active" : "Inactive",
            createdAt: new Date(branch.createdAt).toLocaleDateString(),
        }); });
        var timestamp = new Date().toISOString().split("T")[0];
        var filename = "branches-report-".concat(timestamp);
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
            description: "Branches report exported as ".concat(format.toUpperCase()),
        });
    };
    var openEditModal = function (branch) {
        setSelectedBranch(branch);
        setEditFormData({
            name: branch.name,
            location: branch.location,
            isActive: branch.isActive,
        });
        setIsEditOpen(true);
    };
    var openViewDetailsModal = function (branch) {
        setSelectedBranch(branch);
        setIsViewDetailsOpen(true);
    };
    var openAssignManagerModal = function (branch) {
        var _a;
        setSelectedBranch(branch);
        setSelectedManager(((_a = branch.managerId) === null || _a === void 0 ? void 0 : _a.toString()) || "");
        setIsAssignManagerOpen(true);
    };
    var openViewStaffModal = function (branch) {
        setSelectedBranch(branch);
        setIsViewStaffOpen(true);
    };
    var openDeleteDialog = function (branch) {
        setSelectedBranch(branch);
        setIsDeleteOpen(true);
    };
    return (<Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">
              Branches
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's branch network.
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4"/> Export Reports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={function () { return handleExportBranches("csv"); }}>
                  <Sheet className="mr-2 h-4 w-4"/> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={function () { return handleExportBranches("excel"); }}>
                  <FileText className="mr-2 h-4 w-4"/> Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={function () { return handleExportBranches("json"); }}>
                  <Download className="mr-2 h-4 w-4"/> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="button-primary" onClick={function () { return setIsAddOpen(true); }}>
              <Plus className="mr-2 h-4 w-4"/> Add Branch
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search by name, location, or ID..." className="pl-9 bg-background" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4"/> Filter
          </Button>
        </div>

        {isLoading ? (<div className="text-center py-12">Loading branches...</div>) : filteredBranches.length === 0 ? (<Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4"/>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No branches found" : "No branches yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                ? "Try adjusting your search criteria"
                : "Create your first branch to get started."}
              </p>
              {!searchQuery && (<Button onClick={function () { return setIsAddOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4"/> Add Branch
                </Button>)}
            </CardContent>
          </Card>) : (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map(function (branch) { return (<Card key={branch.id} className="relative overflow-visible">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1 cursor-pointer flex-1 min-w-0 relative z-40 group" onClick={function () {
                    console.log("Branch clicked:", branch.id);
                    navigate("/branches/".concat(branch.id));
                }} role="button" tabIndex={0} onKeyDown={function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate("/branches/".concat(branch.id));
                    }
                }}>
                    <CardTitle className="text-xl font-heading flex items-center gap-2 group-hover:text-primary transition-colors pointer-events-none">
                      <Building2 className="h-5 w-5 text-primary"/>
                      {branch.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 pointer-events-none">
                      <MapPin className="h-3 w-3"/>
                      {branch.location}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 shrink-0 relative z-50">
                        <MoreHorizontal className="h-4 w-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={function () { return openViewDetailsModal(branch); }}>
                        <Eye className="mr-2 h-4 w-4"/> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={function () { return openEditModal(branch); }}>
                        <Edit className="mr-2 h-4 w-4"/> Edit Branch
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={function () { return openAssignManagerModal(branch); }}>
                        <UserCheck className="mr-2 h-4 w-4"/> Assign Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={function () { return openViewStaffModal(branch); }}>
                        <Users className="mr-2 h-4 w-4"/> View Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={function () { return openDeleteDialog(branch); }}>
                        <Trash2 className="mr-2 h-4 w-4"/> Delete Branch
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Manager ID</span>
                      <span className="font-medium">
                        {branch.managerId || "Unassigned"}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm" onClick={function () { return openViewStaffModal(branch); }}>
                      <Users className="mr-2 h-4 w-4"/> View Staff
                    </Button>
                  </div>
                </CardContent>
              </Card>); })}
          </div>)}
      </div>

      {/* Add Branch Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch in your organization
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input id="branch-name" placeholder="e.g., Main Branch" value={formData.name} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { name: e.target.value }));
        }}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-location">Location</Label>
              <Input id="branch-location" placeholder="e.g., Nairobi, Kenya" value={formData.location} onChange={function (e) {
            return setFormData(__assign(__assign({}, formData), { location: e.target.value }));
        }}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={function () { return setIsAddOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAddBranch} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Branch Name</Label>
              <Input id="edit-name" value={editFormData.name} onChange={function (e) {
            return setEditFormData(__assign(__assign({}, editFormData), { name: e.target.value }));
        }}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" value={editFormData.location} onChange={function (e) {
            return setEditFormData(__assign(__assign({}, editFormData), { location: e.target.value }));
        }}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editFormData.isActive ? "active" : "inactive"} onValueChange={function (value) {
            return setEditFormData(__assign(__assign({}, editFormData), { isActive: value === "active" }));
        }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={function () { return setIsEditOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleEditBranch} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Branch Details</DialogTitle>
          </DialogHeader>
          {selectedBranch && (<div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Branch Name</Label>
                <p className="text-sm font-medium">{selectedBranch.name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Location</Label>
                <p className="text-sm font-medium">{selectedBranch.location}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={selectedBranch.isActive ? "default" : "secondary"}>
                  {selectedBranch.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Manager ID</Label>
                <p className="text-sm font-medium">
                  {selectedBranch.managerId || "Not assigned"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Created At</Label>
                <p className="text-sm font-medium">
                  {new Date(selectedBranch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>)}
          <DialogFooter>
            <Button onClick={function () { return setIsViewDetailsOpen(false); }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Manager Modal */}
      <Dialog open={isAssignManagerOpen} onOpenChange={setIsAssignManagerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Manager</DialogTitle>
            <DialogDescription>
              Assign a manager to {selectedBranch === null || selectedBranch === void 0 ? void 0 : selectedBranch.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="manager-select">Select Manager</Label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {users.map(function (user) { return (<SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>); })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={function () { return setIsAssignManagerOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleAssignManager} disabled={assignManagerMutation.isPending}>
              {assignManagerMutation.isPending ? "Assigning..." : "Assign Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Staff Modal */}
      <Dialog open={isViewStaffOpen} onOpenChange={setIsViewStaffOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Branch Staff</DialogTitle>
            <DialogDescription>
              Staff members working at {selectedBranch === null || selectedBranch === void 0 ? void 0 : selectedBranch.name}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            {branchStaff.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                No staff assigned to this branch
              </div>) : (<Table>
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
                        <Badge variant={staff.isActive ? "default" : "secondary"}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>); })}
                </TableBody>
              </Table>)}
          </div>
          <DialogFooter>
            <Button onClick={function () { return setIsViewStaffOpen(false); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedBranch === null || selectedBranch === void 0 ? void 0 : selectedBranch.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={function () {
            if (selectedBranch) {
                deleteMutation.mutate(selectedBranch.id);
            }
        }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>);
}
