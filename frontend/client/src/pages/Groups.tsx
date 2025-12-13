import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MoreHorizontal, UserPlus, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function Groups() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: api.getGroups,
  });

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Groups</h1>
              <p className="text-muted-foreground mt-1">Manage lending groups and their schedules.</p>
            </div>
            <Button className="shadow-lg shadow-primary/20" data-testid="button-create-group">
              <UserPlus className="mr-2 h-4 w-4" /> Create New Group
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading groups...</div>
          ) : groups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground text-center mb-4">Create your first lending group to get started.</p>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Create Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group: any) => (
                <Card key={group.id} className="border-border/50 hover:border-primary/50 transition-colors" data-testid={`card-group-${group.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-heading">{group.name}</CardTitle>
                      <CardDescription>Branch ID: {group.branchId}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Members</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Dissolve Group</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          Max Members
                        </div>
                        <div className="font-medium">{group.maxMembers}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Status</div>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="w-full text-xs">
                          View Members <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
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
