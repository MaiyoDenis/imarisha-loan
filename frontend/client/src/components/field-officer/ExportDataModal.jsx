var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, downloadJSON } from "@/lib/exportUtils";
export function ExportDataModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange, _b = _a.groups, groups = _b === void 0 ? [] : _b;
    var _c = useState(false), isExporting = _c[0], setIsExporting = _c[1];
    var toast = useToast().toast;
    var handleExportCSV = function () { return __awaiter(_this, void 0, void 0, function () {
        var exportData;
        return __generator(this, function (_a) {
            if (groups.length === 0) {
                toast({
                    title: "No Data",
                    description: "No groups available to export",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            setIsExporting(true);
            try {
                exportData = groups.map(function (group) { return ({
                    "Group ID": group.id,
                    "Group Name": group.name,
                    "Total Members": group.totalMembers,
                    "Total Savings": parseFloat(group.totalSavings || "0").toLocaleString(),
                    "Outstanding Loans": parseFloat(group.totalLoansOutstanding || "0").toLocaleString(),
                    "Repayment Rate": "".concat(group.repaymentRate, "%"),
                }); });
                downloadCSV(exportData, "groups_report_".concat(new Date().getTime()));
                toast({
                    title: "Success",
                    description: "Groups data exported as CSV",
                });
                onOpenChange(false);
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to export data",
                    variant: "destructive",
                });
            }
            finally {
                setIsExporting(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleExportJSON = function () { return __awaiter(_this, void 0, void 0, function () {
        var exportData;
        return __generator(this, function (_a) {
            if (groups.length === 0) {
                toast({
                    title: "No Data",
                    description: "No groups available to export",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            setIsExporting(true);
            try {
                exportData = {
                    exportDate: new Date().toISOString(),
                    totalGroups: groups.length,
                    totalMembers: groups.reduce(function (sum, g) { return sum + g.totalMembers; }, 0),
                    groups: groups.map(function (group) { return ({
                        id: group.id,
                        name: group.name,
                        totalMembers: group.totalMembers,
                        totalSavings: group.totalSavings,
                        totalLoansOutstanding: group.totalLoansOutstanding,
                        repaymentRate: group.repaymentRate,
                    }); }),
                };
                downloadJSON(exportData, "groups_report_".concat(new Date().getTime()));
                toast({
                    title: "Success",
                    description: "Groups data exported as JSON",
                });
                onOpenChange(false);
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to export data",
                    variant: "destructive",
                });
            }
            finally {
                setIsExporting(false);
            }
            return [2 /*return*/];
        });
    }); };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Groups Data</DialogTitle>
          <DialogDescription>
            Download your groups and members data in your preferred format.
          </DialogDescription>
        </DialogHeader>

        {groups.length === 0 && (<div className="flex items-start gap-3 rounded-lg bg-accent/10 p-3 text-yellow-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
            <span className="text-sm">No groups available to export</span>
          </div>)}

        <div className="space-y-4 py-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Export Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary">Total Groups</p>
                <p className="text-2xl font-bold text-blue-900">
                  {groups.length}
                </p>
              </div>
              <div>
                <p className="text-primary">Total Members</p>
                <p className="text-2xl font-bold text-blue-900">
                  {groups.reduce(function (sum, g) { return sum + g.totalMembers; }, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Select Export Format</p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleExportCSV} disabled={isExporting || groups.length === 0} variant="outline" className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4"/>
                Download CSV
              </Button>
              <Button onClick={handleExportJSON} disabled={isExporting || groups.length === 0} variant="outline" className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4"/>
                Download JSON
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={function () { return onOpenChange(false); }} variant="outline" disabled={isExporting}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
