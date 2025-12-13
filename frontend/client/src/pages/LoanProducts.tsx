import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Battery, Smartphone, Sun, Zap, Package } from "lucide-react";
import { api } from "@/lib/api";

const iconMap: Record<string, any> = {
  "Battery": Battery,
  "Phone": Smartphone,
  "Solar": Sun,
  "Pump": Zap,
  "Default": Package,
};

function getProductIcon(name: string) {
  const key = Object.keys(iconMap).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return key ? iconMap[key] : iconMap.Default;
}

const categoryColors: Record<string, string> = {
  "Energy": "bg-yellow-500/10 text-yellow-500",
  "Electronics": "bg-blue-500/10 text-blue-500",
  "Agriculture": "bg-green-500/10 text-green-500",
};

export default function LoanProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["loan-products"],
    queryFn: api.getLoanProducts,
  });

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Loan Products</h1>
              <p className="text-muted-foreground mt-1">Manage physical inventory available for lending.</p>
            </div>
            <Button className="shadow-lg shadow-primary/20" data-testid="button-add-product">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9 bg-background" data-testid="input-search" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => {
                const Icon = getProductIcon(product.name);
                const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                const colorClass = categoryColors[product.categoryId === 1 ? "Energy" : product.categoryId === 2 ? "Electronics" : "Agriculture"] || "bg-gray-500/10 text-gray-500";
                
                return (
                  <Card key={product.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-200 group" data-testid={`card-product-${product.id}`}>
                    <div className="h-48 bg-muted/30 flex items-center justify-center relative group-hover:bg-muted/50 transition-colors">
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-10 w-10" />
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
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
