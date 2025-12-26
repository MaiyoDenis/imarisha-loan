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
import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import logo from "/minimalist_fintech_logo_with_geometric_shapes_in_blue_and_teal..png";
function getRoleRedirectPath(role) {
    var roleRedirects = {
        'field_officer': '/field-officer',
        'loan_officer': '/dashboard',
        'branch_manager': '/dashboards/branch-manager',
        'admin': '/dashboards/admin',
        'procurement_officer': '/store',
        'customer': '/dashboard',
        'it_support': '/dashboards/it-support',
    };
    return roleRedirects[role] || '/dashboard';
}
export default function Login() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(""), username = _c[0], setUsername = _c[1];
    var _d = useState(""), password = _d[0], setPassword = _d[1];
    var _e = useState(false), showPassword = _e[0], setShowPassword = _e[1];
    var toast = useToast().toast;
    var handleLogin = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, redirectPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, api.login(username, password)];
                case 2:
                    response = _a.sent();
                    if (response.tokens) {
                        localStorage.setItem('auth_token', response.tokens.access_token);
                        localStorage.setItem('refresh_token', response.tokens.refresh_token);
                    }
                    if (response.user) {
                        localStorage.setItem('user', JSON.stringify(response.user));
                        redirectPath = getRoleRedirectPath(response.user.role);
                        setLocation(redirectPath);
                    }
                    else {
                        setLocation("/dashboard");
                    }
                    toast({
                        title: "Success",
                        description: "Logged in successfully",
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    toast({
                        title: "Login failed",
                        description: error_1 instanceof Error ? error_1.message : "Invalid credentials",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#06142A] via-[#0B1E3A] to-[#101735]">
      <div className="absolute inset-0 -z-10 pointer-events-none" style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(180deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] bg-fuchsia-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] bg-sky-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-[rgba(14,24,44,0.65)] border border-[rgba(99,102,241,0.35)] shadow-[0_10px_60px_rgba(99,102,241,0.25)]">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto h-16 w-16 rounded-xl p-[2px] shadow-lg" style={{
            background: 'linear-gradient(135deg, #60A5FA, #8B5CF6)'
          }}>
            <div className="h-full w-full rounded-[10px] bg-[rgba(10,16,30,0.8)] flex items-center justify-center overflow-hidden border border-white/10">
              <img src={logo} alt="Imarisha" className="h-12 w-12 object-contain"/>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-heading font-extrabold tracking-tight text-white">Welcome, Please Log In</CardTitle>
            <CardDescription className="text-slate-300/80">
              Secure access to your Imarisha account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <Input id="username" placeholder="admin" className="pl-9" required value={username} onChange={function (e) { return setUsername(e.target.value); }} data-testid="input-username"/>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <Input id="password" type={showPassword ? "text" : "password"} className="pl-9 pr-10" required value={password} onChange={function (e) { return setPassword(e.target.value); }} data-testid="input-password"/>
                <button
                  type="button"
                  onClick={function() { setShowPassword(!showPassword); }}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading} data-testid="button-login">
              {loading ? "Signing in..." : (<span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4"/>
                </span>)}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t border-border/50">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/30"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="border-border/50 hover:bg-muted/50">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button type="button" variant="outline" className="border-border/50 hover:bg-muted/50">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>);
}
