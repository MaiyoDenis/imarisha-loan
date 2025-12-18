import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, MoreHorizontal, Plus, Users, Trash2, Edit, Eye, UserCheck, Search, Filter, Download, Sheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { downloadCSV, downloadJSON, downloadExcel } from "@/lib/exportUtils";

interface Branch {
  id: number;
  name: string;
  location: string;
  managerId: number | null;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  branchId: number | null;
  isActive: boolean;
}

export default function Branches() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
  const [isViewStaffOpen, setIsViewStaffOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [editFormData, setEditFormData] = useState({ name: "", location: "", isActive: true });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: api.getBranches,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: api.getMembers,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: branchStaff = [] } = useQuery({
    queryKey: ["branch-staff", selectedBranch?.id],
    queryFn: () => selectedBranch ? api.getBranchStaff(selectedBranch.id) : Promise.resolve([]),
    enabled: !!selectedBranch && isViewStaffOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredBranches = branches.filter((branch: Branch) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      branch.name.toLowerCase().includes(searchLower) ||
      branch.location.toLowerCase().includes(searchLower) ||
      branch.id.toString().includes(searchLower)
    );
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsAddOpen(false);
      setFormData({ name: "", location: "" });
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateBranch(selectedBranch!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: (managerId: number | null) =>
      api.updateBranch(selectedBranch!.id, { managerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsAssignManagerOpen(false);
      setSelectedManager("");
      toast({
        title: "Success",
        description: "Manager assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign manager",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsDeleteOpen(false);
      setSelectedBranch(null);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    },
  });

  const handleAddBranch = () => {
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

  const handleEditBranch = () => {
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

  const handleAssignManager = () => {
    const managerId = selectedManager ? parseInt(selectedManager) : null;
    assignManagerMutation.mutate(managerId);
  };

  const handleExportBranches = (format: "csv" | "json" | "excel") => {
    const reportData = branches.map((branch: Branch) => ({
      id: branch.id,
      name: branch.name,
      location: branch.location,
      managerId: branch.managerId || "N/A",
      status: branch.isActive ? "Active" : "Inactive",
      createdAt: new Date(branch.createdAt).toLocaleDateString(),
    }));

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `branches-report-${timestamp}`;

    if (format === "csv") {
      downloadCSV(reportData, filename);
    } else if (format === "json") {
      downloadJSON(reportData, filename);
    } else if (format === "excel") {
      downloadExcel(reportData, filename);
    }

    toast({
      title: "Success",
      description: `Branches report exported as ${format.toUpperCase()}`,
    });
  };

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditFormData({
      name: branch.name,
      location: branch.location,
      isActive: branch.isActive,
    });
    setIsEditOpen(true);
  };

  const openViewDetailsModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewDetailsOpen(true);
  };

  const openAssignManagerModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedManager(branch.managerId?.toString() || "");
    setIsAssignManagerOpen(true);
  };

  const openViewStaffModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewStaffOpen(true);
  };

  const openDeleteDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Branches
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's branch network.
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
                <DropdownMenuItem onClick={() => handleExportBranches("csv")}>
                  <Sheet className="mr-2 h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportBranches("excel")}>
                  <FileText className="mr-2 h-4 w-4" /> Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportBranches("json")}>
                  <Download className="mr-2 h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="shadow-lg shadow-primary/20"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, location, or ID..." 
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
          <div className="text-center py-12">Loading branches...</div>
        ) : filteredBranches.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No branches found" : "No branches yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery 
                  ? "Try adjusting your search criteria"
                  : "Create your first branch to get started."
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch: Branch) => (
              <Card
                key={branch.id}
                className="border-border/50 hover:shadow-lg transition-all"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div
                    className="space-y-1 cursor-pointer flex-1"
                    onClick={() => navigate(`/branches/${branch.id}`)}
                  >
                    <CardTitle className="text-xl font-heading flex items-center gap-2 hover:text-primary transition-colors">
                      <Building2 className="h-5 w-5 text-primary" />
                      {branch.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {branch.location}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDetailsModal(branch)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(branch)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Branch
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAssignManagerModal(branch)}>
                        <UserCheck className="mr-2 h-4 w-4" /> Assign Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openViewStaffModal(branch)}>
                        <Users className="mr-2 h-4 w-4" /> View Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => openDeleteDialog(branch)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Branch
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
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => openViewStaffModal(branch)}
                    >
                      <Users className="mr-2 h-4 w-4" /> View Staff
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              <Input
                id="branch-name"
                placeholder="e.g., Main Branch"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-location">Location</Label>
              <Input
                id="branch-location"
                placeholder="e.g., Nairobi, Kenya"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBranch}
              disabled={createMutation.isPending}
            >
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
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editFormData.location}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    location: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    isActive: value === "active",
                  })
                }
              >
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
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditBranch}
              disabled={updateMutation.isPending}
            >
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
          {selectedBranch && (
            <div className="grid gap-4 py-4">
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
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailsOpen(false)}>
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
              Assign a manager to {selectedBranch?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="manager-select">Select Manager</Label>
              <Select
                value={selectedManager}
                onValueChange={setSelectedManager}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignManagerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={assignManagerMutation.isPending}
            >
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
              Staff members working at {selectedBranch?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            {branchStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No staff assigned to this branch
              </div>
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
                  {branchStaff.map((staff: User) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.isActive ? "default" : "secondary"}
                        >
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewStaffOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedBranch?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedBranch) {
                  deleteMutation.mutate(selectedBranch.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
