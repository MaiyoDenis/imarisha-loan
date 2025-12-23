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
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
export function GroupVisitsSection(_a) {
    var groupId = _a.groupId;
    var _b = useState(false), showAddVisit = _b[0], setShowAddVisit = _b[1];
    var _c = useState(""), visitDate = _c[0], setVisitDate = _c[1];
    var _d = useState(""), visitNotes = _d[0], setVisitNotes = _d[1];
    var toast = useToast().toast;
    var _e = useQuery({
        queryKey: ["groupVisits", groupId],
        queryFn: function () { return api.get("/field-officer/groups/".concat(groupId, "/visits")); },
        enabled: !!groupId,
    }), visits = _e.data, isLoading = _e.isLoading, refetch = _e.refetch;
    var mutation = useMutation({
        mutationFn: function (data) {
            return api.post("/field-officer/groups/".concat(groupId, "/visits"), data);
        },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Visit recorded successfully",
            });
            setVisitDate("");
            setVisitNotes("");
            setShowAddVisit(false);
            refetch();
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!visitDate.trim()) {
            toast({
                title: "Validation Error",
                description: "Please select a visit date",
                variant: "destructive",
            });
            return;
        }
        if (!visitNotes.trim()) {
            toast({
                title: "Validation Error",
                description: "Please add visit notes",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({
            visitDate: visitDate,
            notes: visitNotes,
        });
    };
    var formatDate = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    var sortedVisits = visits ? __spreadArray([], visits, true).sort(function (a, b) {
        return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
    }) : [];
    return (<>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visit History</CardTitle>
              <CardDescription>
                Record and view group visits
              </CardDescription>
            </div>
            <Button onClick={function () { return setShowAddVisit(true); }} className="gap-2" size="sm">
              <Plus className="h-4 w-4"/>
              Log Visit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (<p className="text-muted-foreground">Loading visits...</p>) : sortedVisits.length === 0 ? (<div className="text-center py-8">
              <p className="text-muted-foreground">No visits recorded yet</p>
            </div>) : (<div className="space-y-4">
              {sortedVisits.map(function (visit) { return (<div key={visit.id} className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary"/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {formatDate(visit.visitDate)}
                        </p>
                        {visit.fieldOfficerName && (<span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {visit.fieldOfficerName}
                          </span>)}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"/>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {visit.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>); })}
            </div>)}
        </CardContent>
      </Card>

      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Group Visit</DialogTitle>
            <DialogDescription>
              Record your observations and notes about the group visit.
            </DialogDescription>
          </DialogHeader>

          {mutation.error && (<div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-red-800">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
              <span className="text-sm">{mutation.error.message}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visit-date">Visit Date</Label>
              <Input id="visit-date" type="date" value={visitDate} onChange={function (e) { return setVisitDate(e.target.value); }} disabled={mutation.isPending} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-notes">Visit Notes</Label>
              <textarea id="visit-notes" placeholder="Write about your observations, group progress, issues discussed, members present, etc." value={visitNotes} onChange={function (e) { return setVisitNotes(e.target.value); }} disabled={mutation.isPending} className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={5}/>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={function () { return setShowAddVisit(false); }} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/80">
                {mutation.isPending ? "Recording..." : "Record Visit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>);
}
