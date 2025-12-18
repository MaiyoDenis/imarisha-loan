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
import BranchDetail from "@/pages/BranchDetail";
import Users from "@/pages/Users";
import Savings from "@/pages/Savings";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import ExecutiveDashboard from "@/pages/dashboards/ExecutiveDashboard";
import OperationsDashboard from "@/pages/dashboards/OperationsDashboard";
import RiskDashboard from "@/pages/dashboards/RiskDashboard";
import MemberAnalyticsDashboard from "@/pages/dashboards/MemberAnalyticsDashboard";
import ForecastDashboard from "@/pages/dashboards/ForecastDashboard";
import { AIAnalyticsDashboard } from "@/pages/dashboards/AIAnalyticsDashboard";
import { GamificationDashboard } from "@/pages/gamification/GamificationDashboard";
import { FieldOperationsPage } from "@/pages/field-operations/FieldOperationsPage";
import { MobileFeaturesDashboard } from "@/pages/mobile-features/MobileFeaturesDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboards/executive" component={ExecutiveDashboard} />
      <Route path="/dashboards/operations" component={OperationsDashboard} />
      <Route path="/dashboards/risk" component={RiskDashboard} />
      <Route path="/dashboards/member-analytics" component={MemberAnalyticsDashboard} />
      <Route path="/dashboards/forecast" component={ForecastDashboard} />
      <Route path="/dashboards/ai-analytics" component={AIAnalyticsDashboard} />
      <Route path="/gamification" component={GamificationDashboard} />
      <Route path="/field-operations" component={FieldOperationsPage} />
      <Route path="/mobile-features" component={MobileFeaturesDashboard} />
      <Route path="/users" component={Users} />
      <Route path="/branches" component={Branches} />
      <Route path="/branches/:branchId" component={BranchDetail} />
      <Route path="/groups" component={Groups} />
      <Route path="/members" component={Members} />
      <Route path="/loans" component={Loans} />
      <Route path="/products" component={LoanProducts} />
      <Route path="/savings" component={Savings} />
      <Route path="/reports" component={Reports} />
      <Route path="/reports/advanced" component={ReportsPage} />
      <Route path="/settings" component={Settings} />
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
