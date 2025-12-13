

import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import LoanProducts from "@/pages/LoanProducts";
import Members from "@/pages/Members";
import Groups from "@/pages/Groups";
import Loans from "@/pages/Loans";
import Branches from "@/pages/Branches";
import Users from "@/pages/Users";
import Savings from "@/pages/Savings";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/users" component={Users} />
      <Route path="/branches" component={Branches} />
      <Route path="/groups" component={Groups} />
      <Route path="/members" component={Members} />
      <Route path="/loans" component={Loans} />
      <Route path="/products" component={LoanProducts} />
      <Route path="/savings" component={Savings} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
