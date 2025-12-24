import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, Download, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { CreateMemberDialog } from "@/components/ui/CreateMemberDialog";
export default function Members() {
    var _a = useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = useQuery({
        queryKey: ["members"],
        queryFn: api.getMembers,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    }), _c = _b.data, members = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var filteredMembers = members.filter(function (member) {
        var _a, _b, _c;
        var searchLower = searchQuery.toLowerCase();
        return (((_a = member.memberCode) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
            ((_b = member.id) === null || _b === void 0 ? void 0 : _b.toString().includes(searchLower)) ||
            ((_c = member.groupId) === null || _c === void 0 ? void 0 : _c.toString().includes(searchLower)));
    });
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Members</h1>
              <p className="text-muted-foreground mt-1">Manage customer profiles and status.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4"/> Export
              </Button>
              <CreateMemberDialog />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search by member code, ID, or group..." className="pl-9 bg-background" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4"/> Filter
            </Button>
          </div>

          {isLoading ? (<div className="text-center py-12">Loading members...</div>) : filteredMembers.length === 0 ? (<Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4"/>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No members found" : "No members yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                ? "Try adjusting your search criteria"
                : "Register your first member to get started."}
                </p>
                {!searchQuery && <CreateMemberDialog />}
              </CardContent>
            </Card>) : (<div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Group ID</TableHead>
                    <TableHead>Registration Fee</TableHead>
                    <TableHead>Fee Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map(function (member) { return (<TableRow key={member.id} data-testid={"row-member-".concat(member.id)}>
                      <TableCell className="font-medium">{member.memberCode}</TableCell>
                      <TableCell>{member.groupId || "None"}</TableCell>
                      <TableCell className="font-mono">KES {parseFloat(member.registrationFee).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={member.registrationFeePaid ? "default" : "destructive"}>
                          {member.registrationFeePaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={member.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                    member.status === "pending" ? "bg-accent/10 text-yellow-700 border-accent/30" :
                        "bg-destructive/10 text-red-700 border-destructive/30"}>
                          {member.status}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem>View loans</DropdownMenuItem>
                            <DropdownMenuItem>View savings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Block member</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>); })}
                </TableBody>
              </Table>
            </div>)}
        </div>
    </Layout>);
}
