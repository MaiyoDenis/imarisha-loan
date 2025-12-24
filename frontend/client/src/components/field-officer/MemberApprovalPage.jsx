var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Phone, Users, Building, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { LoadingSpinner } from "@/components/ui/loading";
export function MemberApprovalPage() {
    var _a = useState([]), selectedMembers = _a[0], setSelectedMembers = _a[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useQuery({
        queryKey: ["pendingMembers"],
        queryFn: api.getPendingMembers,
        refetchInterval: 30000, // Refresh every 30 seconds
    }), _c = _b.data, pendingMembers = _c === void 0 ? [] : _c, isLoading = _b.isLoading, error = _b.error;
    var approveMutation = useMutation({
        mutationFn: function (memberId) { return api.approveMember(memberId); },
        onSuccess: function (data, memberId) {
            toast({
                title: "Success",
                description: "Member ".concat(memberId, " approved successfully"),
            });
            queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
            setSelectedMembers(function (prev) { return prev.filter(function (id) { return id !== memberId; }); });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var rejectMutation = useMutation({
        mutationFn: function (memberId) { return api.rejectMember(memberId); },
        onSuccess: function (data, memberId) {
            toast({
                title: "Success",
                description: "Member ".concat(memberId, " rejected"),
            });
            queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
            setSelectedMembers(function (prev) { return prev.filter(function (id) { return id !== memberId; }); });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var bulkApproveMutation = useMutation({
        mutationFn: function (memberIds) { return api.bulkApproveMembers(memberIds); },
        onSuccess: function (data) {
            toast({
                title: "Success",
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
            setSelectedMembers([]);
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var handleSelectMember = function (memberId) {
        setSelectedMembers(function (prev) {
            return prev.includes(memberId)
                ? prev.filter(function (id) { return id !== memberId; })
                : __spreadArray(__spreadArray([], prev, true), [memberId], false);
        });
    };
    var handleSelectAll = function () {
        if (selectedMembers.length === pendingMembers.length) {
            setSelectedMembers([]);
        }
        else {
            setSelectedMembers(pendingMembers.map(function (member) { return member.id; }));
        }
    };
    if (isLoading) {
        return (<Layout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Layout>);
    }
    if (error) {
        return (<Layout>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load pending members</p>
        </div>
      </Layout>);
    }
    return (<Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Member Approval
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve pending member applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSelectAll} variant="outline" size="lg">
              {selectedMembers.length === pendingMembers.length ? "Deselect All" : "Select All"}
            </Button>
            <Button onClick={function () { return bulkApproveMutation.mutate(selectedMembers); }} disabled={selectedMembers.length === 0 || bulkApproveMutation.isPending} className="bg-green-600 hover:bg-green-700" size="lg">
              <CheckCircle className="mr-2 h-5 w-5"/>
              Approve Selected ({selectedMembers.length})
            </Button>
          </div>
        </div>

        {pendingMembers.length === 0 ? (<Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4"/>
              <h3 className="text-lg font-semibold mb-2">
                No pending members
              </h3>
              <p className="text-muted-foreground text-center">
                All member applications have been reviewed.
              </p>
            </CardContent>
          </Card>) : (<div className="grid gap-4">
            {pendingMembers.map(function (member) { return (<Card key={member.id} className={"hover:shadow-lg transition-all duration-300 border-2 cursor-pointer ".concat(selectedMembers.includes(member.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300')} onClick={function () { return handleSelectMember(member.id); }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {member.user.firstName} {member.user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Member Code: {member.memberCode}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3"/>
                          Pending
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground"/>
                          <span>{member.user.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground"/>
                          <span>{member.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground"/>
                          <span>ID: {member.idNumber || 'Not provided'}</span>
                        </div>
                      </div>

                      {member.group && (<div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground"/>
                          <span>Group: {member.group.name}</span>
                        </div>)}

                      {member.branch && (<div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground"/>
                          <span>Branch: {member.branch.name} - {member.branch.location}</span>
                        </div>)}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Button onClick={function (e) {
                    e.stopPropagation();
                    approveMutation.mutate(member.id);
                }} disabled={approveMutation.isPending || rejectMutation.isPending} className="bg-green-600 hover:bg-green-700" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4"/>
                        Approve
                      </Button>
                      <Button onClick={function (e) {
                    e.stopPropagation();
                    rejectMutation.mutate(member.id);
                }} disabled={approveMutation.isPending || rejectMutation.isPending} variant="destructive" size="sm">
                        <XCircle className="mr-2 h-4 w-4"/>
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>); })}
          </div>)}
      </div>
    </Layout>);
}
