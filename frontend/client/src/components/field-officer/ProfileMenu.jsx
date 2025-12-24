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
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ProfileMenu() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(null), user = _b[0], setUser = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var toast = useToast().toast;
    useEffect(function () {
        var fetchUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, api.me()];
                    case 1:
                        response = _a.sent();
                        setUser(response.user);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Failed to fetch user profile:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchUser();
    }, []);
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, api.logout()];
                case 2:
                    _a.sent();
                    localStorage.removeItem("user");
                    localStorage.removeItem("auth_token");
                    toast({
                        title: "Logged Out",
                        description: "You have been successfully logged out",
                    });
                    setLocation("/");
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to logout",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getInitials = function (firstName, lastName) {
        var first = (firstName === null || firstName === void 0 ? void 0 : firstName[0]) || "";
        var last = (lastName === null || lastName === void 0 ? void 0 : lastName[0]) || "";
        return "".concat(first).concat(last).toUpperCase() || "U";
    };
    var displayName = (user === null || user === void 0 ? void 0 : user.first_name) && (user === null || user === void 0 ? void 0 : user.last_name) ? "".concat(user.first_name, " ").concat(user.last_name) : "User";
    var initials = getInitials(user === null || user === void 0 ? void 0 : user.first_name, user === null || user === void 0 ? void 0 : user.last_name);
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {displayName}
            </p>
            {user && (<>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email || user.phone || "No email"}
                </p>
                {user.role && (<p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role.name}
                  </p>)}
              </>)}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={function () { return setLocation("/field-officer/profile"); }}>
          <User className="mr-2 h-4 w-4"/>
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={function () { return setLocation("/settings"); }}>
          <Settings className="mr-2 h-4 w-4"/>
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4"/>
          <span>{isLoading ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
