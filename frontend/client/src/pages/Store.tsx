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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Trash2, Edit, Star, Package, Truck, AlertTriangle, TrendingDown, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  companyName?: string;
  contactPerson?: string;
  isActive: boolean;
  rating: string;
  totalSupplies: number;
}

interface SupplierProduct {
  id: number;
  supplierId: number;
  productId: number;
  costPrice: string;
  minimumOrder: number;
  deliveryDays: number;
  isActive: boolean;
}

interface LowStockProduct {
  product: {
    id: number;
    name: string;
    stockQuantity: number;
    lowStockThreshold: number;
  };
  status: "low" | "critical";
}

interface CriticalStockProduct {
  product: {
    id: number;
    name: string;
    stockQuantity: number;
    lowStockThreshold: number;
  };
  status: "critical";
}

export default function Store() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [ratingValue, setRatingValue] = useState<string>("5");

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    companyName: "",
    contactPerson: "",
  });

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.getSuppliers(),
  });

  const suppliers = suppliersData?.suppliers || [];

  const { data: lowStockProducts = [] } = useQuery<LowStockProduct[]>({
    queryKey: ["low-stock-products"],
    queryFn: () => api.getLowStockProducts(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: criticalStockProducts = [] } = useQuery<CriticalStockProduct[]>({
    queryKey: ["critical-stock-products"],
    queryFn: () => api.getCriticalStockProducts(),
    staleTime: 5 * 60 * 1000,
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data) => api.createSupplier(data),
    onSuccess: () => {
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create supplier",
        variant: "destructive",
      });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: (data) => api.updateSupplier(selectedSupplier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsEditSupplierOpen(false);
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update supplier",
        variant: "destructive",
      });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => api.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsDeleteOpen(false);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete supplier",
        variant: "destructive",
      });
    },
  });

  const rateSupplierMutation = useMutation({
    mutationFn: () => api.rateSupplier(selectedSupplier!.id, parseFloat(ratingValue)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier rated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to rate supplier",
        variant: "destructive",
      });
    },
  });

  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.phone.includes(searchLower) ||
      supplier.location?.toLowerCase().includes(searchLower)
    );
  });

  const getRatingColor = (rating: string) => {
    const rate = parseFloat(rating);
    if (rate >= 4.5) return "text-green-500";
    if (rate >= 3.5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">Store & Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage suppliers, products, and inventory levels.</p>
          </div>
          <Button className="btn-neon" onClick={() => setIsAddSupplierOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search suppliers by name, phone, or location..." 
                  className="pl-9 bg-background neon-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {suppliersLoading ? (
              <div className="text-center py-12">Loading suppliers...</div>
            ) : filteredSuppliers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No suppliers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSuppliers.map((supplier: Supplier) => (
                  <Card key={supplier.id} className="relative overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                    <span className="aura"></span>
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          {supplier.companyName && (
                            <p className="text-sm text-muted-foreground">{supplier.companyName}</p>
                          )}
                        </div>
                        <Badge variant={supplier.isActive ? "default" : "outline"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      
                      {supplier.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      
                      {supplier.location && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{supplier.location}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 fill-current ${getRatingColor(supplier.rating)}`} />
                            <span className="font-semibold">{supplier.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{supplier.totalSupplies} products supplied</p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
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
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setRatingValue(supplier.rating.toString());
                          }}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Low Stock Products
                </CardTitle>
                <CardDescription>Products approaching minimum stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">All products have adequate stock</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((item: any) => (
                        <TableRow key={item.product.id}>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.stockQuantity}</TableCell>
                          <TableCell>{item.product.lowStockThreshold}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === "critical" ? "destructive" : "outline"}>
                              {item.status}
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

          <TabsContent value="critical-stock" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Critical Stock Alert
                </CardTitle>
                <CardDescription>Products at critical stock levels - immediate restock required</CardDescription>
              </CardHeader>
              <CardContent>
                {criticalStockProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No critical stock alerts</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Critical Level</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalStockProducts.map((item: any) => (
                        <TableRow key={item.product.id} className="bg-red-50 dark:bg-red-950/10">
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.stockQuantity}</TableCell>
                          <TableCell>{item.product.criticalStockThreshold}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm">Restock Now</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSupplierMutation.mutate(supplierForm as any);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={supplierForm.location}
                    onChange={(e) => setSupplierForm({ ...supplierForm, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={supplierForm.companyName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                  />
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSupplierMutation.mutate(supplierForm as any);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Supplier Name</Label>
                  <Input
                    id="edit-name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={supplierForm.location}
                    onChange={(e) => setSupplierForm({ ...supplierForm, location: e.target.value })}
                  />
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
                Are you sure you want to delete {selectedSupplier?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedSupplier) {
                    deleteSupplierMutation.mutate(selectedSupplier.id);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
