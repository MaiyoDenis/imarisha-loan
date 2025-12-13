
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MoreHorizontal, UserPlus, ArrowRight, Eye, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useState } from "react";


export default function Groups() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: api.getGroups,
  });

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const { data: groupMembers = [] } = useQuery({
    queryKey: ["group-members", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      // Simulate fetching members for the selected group
      return [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          memberCode: "M001",
          phone: "+254700000001",
          status: "active",
          joinDate: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          memberCode: "M002",
          phone: "+254700000002",
          status: "active",
          joinDate: "2024-01-20T14:15:00Z"
        },
        {
          id: 3,
          firstName: "Mike",
          lastName: "Johnson",
          memberCode: "M003",
          phone: "+254700000003",
          status: "active",
          joinDate: "2024-02-01T09:45:00Z"
        }
      ];
    },
    enabled: !!selectedGroup && isMembersOpen,
  });

  const handleViewMembers = (group: any) => {
    setSelectedGroup(group);
    setIsMembersOpen(true);
  };

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
                        <Button 
                          variant="outline" 
                          className="w-full text-xs"
                          onClick={() => handleViewMembers(group)}
                        >
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

      {/* Group Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Group Members - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              View all members in this lending group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupMembers.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.memberCode}</TableCell>
                    <TableCell>{member.firstName} {member.lastName}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {groupMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No members found in this group.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
