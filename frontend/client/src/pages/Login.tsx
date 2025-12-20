import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import logo from "/minimalist_fintech_logo_with_geometric_shapes_in_blue_and_teal..png";

function getRoleRedirectPath(role: string): string {
  const roleRedirects: Record<string, string> = {
    'field_officer': '/field-officer',
    'loan_officer': '/dashboard',
    'branch_manager': '/dashboards/branch-manager',
    'admin': '/dashboards/admin',
    'procurement_officer': '/store',
    'customer': '/dashboard',
  };
  
  return roleRedirects[role] || '/dashboard';
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.login(username, password);
      
      if (response.tokens) {
        localStorage.setItem('auth_token', response.tokens.access_token);
        localStorage.setItem('refresh_token', response.tokens.refresh_token);
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        
        const redirectPath = getRoleRedirectPath(response.user.role);
        setLocation(redirectPath);
      } else {
        setLocation("/dashboard");
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-xl relative z-10 backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-lg">
            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Imarisha" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Imarisha Loan Management account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="username" 
                  placeholder="admin" 
                  className="pl-9" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-9" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base shadow-lg shadow-primary/20" 
              disabled={loading}
              data-testid="button-login"
            >
              {loading ? "Signing in..." : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground bg-muted/30 py-6 border-t border-border/50">
          <p>Protected by enterprise-grade security.</p>
          <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            Demo: <strong>admin</strong> / <strong>admin123</strong>
          </div>
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
