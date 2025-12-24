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
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Download, Users as UsersIcon, UserPlus, Shield, MapPin, ShoppingBag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
export default function Users() {
    var _this = this;
    var _a;
    var _b = useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = useState(""), roleFilter = _c[0], setRoleFilter = _c[1];
    var _d = useState(""), branchFilter = _d[0], setBranchFilter = _d[1];
    var _e = useState(false), isCreateOpen = _e[0], setIsCreateOpen = _e[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _f = useState({
        username: "",
        phone: "",
        password: "",
        role: "",
        firstName: "",
        lastName: "",
        branchId: undefined,
    }), createForm = _f[0], setCreateForm = _f[1];
    var _g = useQuery({
        queryKey: ["users", roleFilter, branchFilter],
        queryFn: function () { return api.getUsers(1, 20, roleFilter || undefined, branchFilter ? parseInt(branchFilter) : undefined); },
    }), _h = _g.data, usersData = _h === void 0 ? { users: [] } : _h, isLoading = _g.isLoading;
    var users = usersData.users || [];
    var mockUsers = [
        {
            id: 1,
            username: "admin",
            phone: "+254700000001",
            role: "admin",
            firstName: "System",
            lastName: "Administrator",
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
            branch: { id: 1, name: "Head Office", location: "Nairobi" }
        },
        {
            id: 2,
            username: "jane.doe",
            phone: "+254700000002",
            role: "branch_manager",
            firstName: "Jane",
            lastName: "Doe",
            branchId: 1,
            isActive: true,
            createdAt: "2024-01-15T10:30:00Z",
            branch: { id: 1, name: "Head Office", location: "Nairobi" }
        },
        {
            id: 3,
            username: "john.smith",
            phone: "+254700000003",
            role: "loan_officer",
            firstName: "John",
            lastName: "Smith",
            branchId: 2,
            isActive: true,
            createdAt: "2024-02-01T14:15:00Z",
            branch: { id: 2, name: "Mombasa Branch", location: "Mombasa" }
        },
        {
            id: 4,
            username: "sarah.wilson",
            phone: "+254700000004",
            role: "customer",
            firstName: "Sarah",
            lastName: "Wilson",
            branchId: 1,
            isActive: false,
            createdAt: "2024-02-10T09:45:00Z",
            branch: { id: 1, name: "Head Office", location: "Nairobi" }
        }
    ];
    var _j = useQuery({
        queryKey: ["branches"],
        queryFn: function () { return api.getBranches(); },
    }).data, branches = _j === void 0 ? [] : _j;
    var filteredUsers = users.filter(function (user) {
        var _a;
        var matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        var matchesRole = roleFilter === "all" || !roleFilter || user.role === roleFilter;
        var matchesBranch = branchFilter === "all" || !branchFilter || ((_a = user.branchId) === null || _a === void 0 ? void 0 : _a.toString()) === branchFilter;
        return matchesSearch && matchesRole && matchesBranch;
    });
    var createUserMutation = useMutation({
        mutationFn: function (data) { return api.createUser(data); },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "User created successfully",
            });
            setIsCreateOpen(false);
            setCreateForm({
                username: "",
                phone: "",
                password: "",
                role: "",
                firstName: "",
                lastName: "",
                branchId: undefined,
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create user",
                variant: "destructive",
            });
        },
    });
    var handleCreateUser = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            createUserMutation.mutate(createForm);
            return [2 /*return*/];
        });
    }); };
    var getRoleBadgeColor = function (role) {
        switch (role) {
            case 'admin':
                return "bg-destructive/15 text-destructive";
            case 'branch_manager':
                return "bg-primary/15 text-primary";
            case 'loan_officer':
                return "bg-secondary/15 text-secondary";
            case 'field_officer':
                return "bg-emerald-500/15 text-emerald-500";
            case 'procurement_officer':
                return "bg-amber-500/15 text-amber-500";
            case 'customer':
                return "bg-muted text-muted-foreground";
            default:
                return "bg-muted text-muted-foreground";
        }
    };
    var getRoleIcon = function (role) {
        switch (role) {
            case 'admin':
                return <Shield className="h-4 w-4"/>;
            case 'branch_manager':
            case 'loan_officer':
                return <UserPlus className="h-4 w-4"/>;
            case 'field_officer':
                return <MapPin className="h-4 w-4"/>;
            case 'procurement_officer':
                return <ShoppingBag className="h-4 w-4"/>;
            default:
                return <UsersIcon className="h-4 w-4"/>;
        }
    };
    var activeUsers = users.filter(function (user) { return user.isActive; }).length;
    var totalUsers = users.length;
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4"/> Export
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4"/> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with appropriate roles and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={createForm.firstName} onChange={function (e) { return setCreateForm(__assign(__assign({}, createForm), { firstName: e.target.value })); }} required/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={createForm.lastName} onChange={function (e) { return setCreateForm(__assign(__assign({}, createForm), { lastName: e.target.value })); }} required/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={createForm.username} onChange={function (e) { return setCreateForm(__assign(__assign({}, createForm), { username: e.target.value })); }} required/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={createForm.phone} onChange={function (e) { return setCreateForm(__assign(__assign({}, createForm), { phone: e.target.value })); }} required/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={createForm.password} onChange={function (e) { return setCreateForm(__assign(__assign({}, createForm), { password: e.target.value })); }} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={createForm.role} onValueChange={function (value) { return setCreateForm(__assign(__assign({}, createForm), { role: value })); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="branch_manager">Branch Manager</SelectItem>
                            <SelectItem value="loan_officer">Loan Officer</SelectItem>
                            <SelectItem value="field_officer">Field Officer</SelectItem>
                            <SelectItem value="procurement_officer">Procurement Officer</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={((_a = createForm.branchId) === null || _a === void 0 ? void 0 : _a.toString()) || ""} onValueChange={function (value) { return setCreateForm(__assign(__assign({}, createForm), { branchId: value ? parseInt(value) : undefined })); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch"/>
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map(function (branch) { return (<SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name}
                              </SelectItem>); })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create User</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search by name, username, or phone..." className="pl-9 bg-background" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2"/>
                <SelectValue placeholder="Filter by role"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="branch_manager">Branch Manager</SelectItem>
                <SelectItem value="loan_officer">Loan Officer</SelectItem>
                <SelectItem value="field_officer">Field Officer</SelectItem>
                <SelectItem value="procurement_officer">Procurement Officer</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2"/>
                <SelectValue placeholder="Filter by branch"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(function (branch) { return (<SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>); })}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Shield className="h-4 w-4 text-secondary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <Shield className="h-4 w-4 text-destructive"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {users.filter(function (u) { return u.role === 'admin'; }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loan Officers</CardTitle>
                <UserPlus className="h-4 w-4 text-primary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {users.filter(function (u) { return u.role === 'loan_officer'; }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <div className="rounded-md border border-border bg-card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">System Users</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(function (user) { return (<TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell>
                      <Badge className={"".concat(getRoleBadgeColor(user.role), " border-0")}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.branch ? (<div>
                          <div className="font-medium">{user.branch.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3"/>
                            {user.branch.location}
                          </div>
                        </div>) : (<span className="text-muted-foreground">No branch assigned</span>)}
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit user</DropdownMenuItem>
                          <DropdownMenuItem>Change role</DropdownMenuItem>
                          <DropdownMenuItem>Reset password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {user.isActive ? "Deactivate" : "Activate"} user
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
        </div>
    </Layout>);
}
