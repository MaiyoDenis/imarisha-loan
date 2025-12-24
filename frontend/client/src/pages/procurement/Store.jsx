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
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Edit, Star, Package, Truck, AlertTriangle, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
export default function Store() {
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var _a = useState("suppliers"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState(false), isAddSupplierOpen = _c[0], setIsAddSupplierOpen = _c[1];
    var _d = useState(false), isEditSupplierOpen = _d[0], setIsEditSupplierOpen = _d[1];
    var _e = useState(false), isDeleteOpen = _e[0], setIsDeleteOpen = _e[1];
    var _f = useState(null), selectedSupplier = _f[0], setSelectedSupplier = _f[1];
    var _g = useState("5"), ratingValue = _g[0], setRatingValue = _g[1];
    var _h = useState({
        name: "",
        phone: "",
        email: "",
        location: "",
        companyName: "",
        contactPerson: "",
    }), supplierForm = _h[0], setSupplierForm = _h[1];
    var _j = useQuery({
        queryKey: ["suppliers"],
        queryFn: function () { return api.getSuppliers(); },
    }), suppliersData = _j.data, suppliersLoading = _j.isLoading;
    var suppliers = (suppliersData === null || suppliersData === void 0 ? void 0 : suppliersData.suppliers) || [];
    var _k = useQuery({
        queryKey: ["low-stock-products"],
        queryFn: function () { return api.getLowStockProducts(); },
        staleTime: 5 * 60 * 1000,
    }).data, lowStockProducts = _k === void 0 ? [] : _k;
    var _l = useQuery({
        queryKey: ["critical-stock-products"],
        queryFn: function () { return api.getCriticalStockProducts(); },
        staleTime: 5 * 60 * 1000,
    }).data, criticalStockProducts = _l === void 0 ? [] : _l;
    var createSupplierMutation = useMutation({
        mutationFn: function (data) { return api.createSupplier(data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            setIsAddSupplierOpen(false);
            setSupplierForm({
                name: "",
                phone: "",
                email: "",
                location: "",
                companyName: "",
                contactPerson: "",
            });
            toast({
                title: "Success",
                description: "Supplier created successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to create supplier",
                variant: "destructive",
            });
        },
    });
    var updateSupplierMutation = useMutation({
        mutationFn: function (data) { return api.updateSupplier(selectedSupplier.id, data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            setIsEditSupplierOpen(false);
            toast({
                title: "Success",
                description: "Supplier updated successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update supplier",
                variant: "destructive",
            });
        },
    });
    var deleteSupplierMutation = useMutation({
        mutationFn: function (id) { return api.deleteSupplier(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            setIsDeleteOpen(false);
            toast({
                title: "Success",
                description: "Supplier deleted successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete supplier",
                variant: "destructive",
            });
        },
    });
    var rateSupplierMutation = useMutation({
        mutationFn: function () { return api.rateSupplier(selectedSupplier.id, parseFloat(ratingValue)); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast({
                title: "Success",
                description: "Supplier rated successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to rate supplier",
                variant: "destructive",
            });
        },
    });
    var filteredSuppliers = suppliers.filter(function (supplier) {
        var _a;
        var searchLower = searchQuery.toLowerCase();
        return (supplier.name.toLowerCase().includes(searchLower) ||
            supplier.phone.includes(searchLower) ||
            ((_a = supplier.location) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)));
    });
    var getRatingColor = function (rating) {
        var rate = parseFloat(rating);
        if (rate >= 4.5)
            return "text-green-500";
        if (rate >= 3.5)
            return "text-yellow-500";
        return "text-red-500";
    };
    return (<Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">Store & Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage suppliers, products, and inventory levels.</p>
          </div>
          <Button className="btn-neon" onClick={function () { return setIsAddSupplierOpen(true); }}>
            <Plus className="mr-2 h-4 w-4"/> Add Supplier
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock ({lowStockProducts.length})</TabsTrigger>
            <TabsTrigger value="critical-stock">Critical ({criticalStockProducts.length})</TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-4 mt-6">
            <div className="flex items-center gap-4 glass-card gradient-border p-4 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <Input placeholder="Search suppliers by name, phone, or location..." className="pl-9 bg-background neon-input" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
              </div>
            </div>

            {suppliersLoading ? (<div className="text-center py-12">Loading suppliers...</div>) : filteredSuppliers.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground">No suppliers found</p>
                </CardContent>
              </Card>) : (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSuppliers.map(function (supplier) { return (<Card key={supplier.id} className="relative overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                    <span className="aura"></span>
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          {supplier.companyName && (<p className="text-sm text-muted-foreground">{supplier.companyName}</p>)}
                        </div>
                        <Badge variant={supplier.isActive ? "default" : "outline"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground"/>
                        <span>{supplier.phone}</span>
                      </div>
                      
                      {supplier.email && (<div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground"/>
                          <span>{supplier.email}</span>
                        </div>)}
                      
                      {supplier.location && (<div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground"/>
                          <span>{supplier.location}</span>
                        </div>)}

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className={"h-4 w-4 fill-current ".concat(getRatingColor(supplier.rating))}/>
                            <span className="font-semibold">{supplier.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{supplier.totalSupplies} products supplied</p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={function () {
                    setSelectedSupplier(supplier);
                    setSupplierForm({
                        name: supplier.name,
                        phone: supplier.phone,
                        email: supplier.email || "",
                        location: supplier.location || "",
                        companyName: supplier.companyName || "",
                        contactPerson: supplier.contactPerson || "",
                    });
                    setIsEditSupplierOpen(true);
                }}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={function () {
                    setSelectedSupplier(supplier);
                    setRatingValue(supplier.rating.toString());
                }}>
                          <Star className="h-4 w-4"/>
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1" onClick={function () {
                    setSelectedSupplier(supplier);
                    setIsDeleteOpen(true);
                }}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500"/>
                  Low Stock Products
                </CardTitle>
                <CardDescription>Products approaching minimum stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (<p className="text-muted-foreground text-center py-8">All products have adequate stock</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map(function (item) { return (<TableRow key={item.product.id}>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.stockQuantity}</TableCell>
                          <TableCell>{item.product.lowStockThreshold}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "critical" ? "destructive" : "outline"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="critical-stock" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500"/>
                  Critical Stock Alert
                </CardTitle>
                <CardDescription>Products at critical stock levels - immediate restock required</CardDescription>
              </CardHeader>
              <CardContent>
                {criticalStockProducts.length === 0 ? (<p className="text-muted-foreground text-center py-8">No critical stock alerts</p>) : (<Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Critical Level</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalStockProducts.map(function (item) { return (<TableRow key={item.product.id} className="bg-destructive/10 dark:bg-red-950/10">
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.stockQuantity}</TableCell>
                          <TableCell>{item.product.criticalStockThreshold}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm">Restock Now</Button>
                          </TableCell>
                        </TableRow>); })}
                    </TableBody>
                  </Table>)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5"/>
                  Stock Movements
                </CardTitle>
                <CardDescription>Recent inventory movements and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Stock movement tracking coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Supplier Dialog */}
        <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Create a new supplier in the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={function (e) {
            e.preventDefault();
            createSupplierMutation.mutate(supplierForm);
        }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input id="name" value={supplierForm.name} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { name: e.target.value })); }} required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={supplierForm.phone} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { phone: e.target.value })); }} required/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={supplierForm.email} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { email: e.target.value })); }}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={supplierForm.location} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { location: e.target.value })); }}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={supplierForm.companyName} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { companyName: e.target.value })); }}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" value={supplierForm.contactPerson} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { contactPerson: e.target.value })); }}/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createSupplierMutation.isPending}>
                  {createSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Dialog */}
        <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
              <DialogDescription>Update supplier information</DialogDescription>
            </DialogHeader>
            <form onSubmit={function (e) {
            e.preventDefault();
            updateSupplierMutation.mutate(supplierForm);
        }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Supplier Name</Label>
                  <Input id="edit-name" value={supplierForm.name} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { name: e.target.value })); }}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" value={supplierForm.phone} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { phone: e.target.value })); }}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={supplierForm.email} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { email: e.target.value })); }}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input id="edit-location" value={supplierForm.location} onChange={function (e) { return setSupplierForm(__assign(__assign({}, supplierForm), { location: e.target.value })); }}/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateSupplierMutation.isPending}>
                  {updateSupplierMutation.isPending ? "Updating..." : "Update Supplier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedSupplier === null || selectedSupplier === void 0 ? void 0 : selectedSupplier.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={function () {
            if (selectedSupplier) {
                deleteSupplierMutation.mutate(selectedSupplier.id);
            }
        }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>);
}
