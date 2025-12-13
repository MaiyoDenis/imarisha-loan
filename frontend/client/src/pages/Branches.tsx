import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, MoreHorizontal, Plus, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Branches() {
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: api.getBranches,
  });

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Branches</h1>
              <p className="text-muted-foreground mt-1">Manage your organization's branch network.</p>
            </div>
            <Button className="shadow-lg shadow-primary/20" data-testid="button-add-branch">
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading branches...</div>
          ) : branches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
                <p className="text-muted-foreground text-center mb-4">Create your first branch to get started.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch: any) => (
                <Card key={branch.id} className="border-border/50 hover:shadow-lg transition-all" data-testid={`card-branch-${branch.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-heading flex items-center gap-2">
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Branch</DropdownMenuItem>
                        <DropdownMenuItem>Assign Manager</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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
                        <span className="font-medium">{branch.managerId || "Unassigned"}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <Users className="mr-2 h-4 w-4" /> View Staff
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
