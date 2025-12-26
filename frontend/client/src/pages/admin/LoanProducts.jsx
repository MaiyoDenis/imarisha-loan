import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter, Battery, Smartphone, Sun, Zap, Package, Edit, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
    "Battery": Battery,
    "Phone": Smartphone,
    "Solar": Sun,
    "Pump": Zap,
    "Default": Package,
};

function getProductIcon(name) {
    const key = Object.keys(iconMap).find((k) => name.toLowerCase().includes(k.toLowerCase()));
    return key ? iconMap[key] : iconMap.Default;
}

const categoryColors = {
    "Energy": "bg-accent/100/10 text-yellow-500",
    "Electronics": "bg-primary/10 text-primary",
    "Agriculture": "bg-green-500/10 text-green-500",
};

const CATEGORIES = [
  { id: 1, name: "Energy" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Agriculture" },
];

export default function LoanProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        description: "",
        buyingPrice: "",
        sellingPrice: "",
        stockQuantity: "",
        lowStockThreshold: "",
    });

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["loan-products"],
        queryFn: api.getLoanProducts,
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.createLoanProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["loan-products"]);
            toast({ title: "Success", description: "Product created successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message || "Failed to create product", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.updateLoanProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["loan-products"]);
            toast({ title: "Success", description: "Product updated successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message || "Failed to update product", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.deleteLoanProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["loan-products"]);
            toast({ title: "Success", description: "Product deleted successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" });
        },
    });

    const handleOpenDialog = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                categoryId: product.categoryId.toString(),
                description: product.description || "",
                buyingPrice: product.buyingPrice,
                sellingPrice: product.sellingPrice,
                stockQuantity: product.stockQuantity,
                lowStockThreshold: product.lowStockThreshold,
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                name: "",
                categoryId: "",
                description: "",
                buyingPrice: "",
                sellingPrice: "",
                stockQuantity: "",
                lowStockThreshold: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setCurrentProduct(null);
        setFormData({
            name: "",
            categoryId: "",
            description: "",
            buyingPrice: "",
            sellingPrice: "",
            stockQuantity: "",
            lowStockThreshold: "",
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            categoryId: parseInt(formData.categoryId),
            buyingPrice: parseFloat(formData.buyingPrice),
            sellingPrice: parseFloat(formData.sellingPrice),
            stockQuantity: parseInt(formData.stockQuantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
        };

        if (currentProduct) {
            updateMutation.mutate({ id: currentProduct.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <Layout>
            <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Loan Products</h1>
                        <p className="text-muted-foreground mt-1">Manage physical inventory available for lending.</p>
                    </div>
                    <Button 
                        className="shadow-lg shadow-primary/20" 
                        data-testid="button-add-product"
                        onClick={() => handleOpenDialog()}
                    >
                        <Plus className="mr-2 h-4 w-4"/> Add New Product
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <Input 
                            placeholder="Search products..." 
                            className="pl-9 bg-background" 
                            data-testid="input-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4"/> Filter
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Loading products...</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const Icon = getProductIcon(product.name);
                            const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                            const colorClass = categoryColors[product.categoryId === 1 ? "Energy" : product.categoryId === 2 ? "Electronics" : "Agriculture"] || "bg-background0/10 text-gray-500";
                            return (
                                <Card key={product.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-200 group" data-testid={`card-product-${product.id}`}>
                                    <div className="h-48 bg-muted/30 flex items-center justify-center relative group-hover:bg-muted/50 transition-colors">
                                        <div className={`h-20 w-20 rounded-full flex items-center justify-center ${colorClass}`}>
                                            <Icon className="h-10 w-10"/>
                                        </div>
                                        {isLowStock && (
                                            <Badge variant="destructive" className="absolute top-3 right-3 animate-pulse">Low Stock</Badge>
                                        )}
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-heading">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</p>
                                                <p className="text-xl font-bold text-primary" data-testid={`price-${product.id}`}>
                                                    KES {parseFloat(product.sellingPrice).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stock</p>
                                                <p className={`text-lg font-bold ${isLowStock ? "text-destructive" : "text-foreground"}`} data-testid={`stock-${product.id}`}>
                                                    {product.stockQuantity}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t border-border/50 bg-muted/10">
                                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenDialog(product)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Product
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{currentProduct ? "Edit Loan Product" : "Add Loan Product"}</DialogTitle>
                            <DialogDescription>
                                {currentProduct ? "Update the details of the loan product." : "Add a new loan product to the inventory."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input 
                                    id="name" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={formData.categoryId} 
                                    onValueChange={(value) => setFormData({...formData, categoryId: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="buyingPrice">Buying Price</Label>
                                    <Input 
                                        id="buyingPrice" 
                                        type="number" 
                                        value={formData.buyingPrice} 
                                        onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sellingPrice">Selling Price</Label>
                                    <Input 
                                        id="sellingPrice" 
                                        type="number" 
                                        value={formData.sellingPrice} 
                                        onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                                    <Input 
                                        id="stockQuantity" 
                                        type="number" 
                                        value={formData.stockQuantity} 
                                        onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                    <Input 
                                        id="lowStockThreshold" 
                                        type="number" 
                                        value={formData.lowStockThreshold} 
                                        onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                {currentProduct && (
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        className="sm:mr-auto"
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this product?")) {
                                                deleteMutation.mutate(currentProduct.id);
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Delete Product
                                    </Button>
                                )}
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && !deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {currentProduct ? "Update Product" : "Create Product"}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
