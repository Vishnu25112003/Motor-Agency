// src/App.tsx
import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminMSMEs from "@/pages/admin/MSMEs";
import AdminAgencies from "@/pages/admin/Agencies";
import AdminJobs from "@/pages/admin/Jobs";
import AdminJobDetail from "@/pages/admin/JobDetail";
import AdminReviews from "@/pages/admin/Reviews";
import AdminAnalytics from "@/pages/admin/Analytics";
import MSMEDashboard from "@/pages/msme/Dashboard";
import MSMEJobs from "@/pages/msme/Jobs";
import MSMECreateJob from "@/pages/msme/CreateJob";
import MSMEJobDetail from "@/pages/msme/JobDetail";
import AgencyDashboard from "@/pages/agency/Dashboard";
import AgencyJobs from "@/pages/agency/Jobs";
import AgencyJobDetail from "@/pages/agency/JobDetail";
import AgencySubmissions from "@/pages/agency/Submissions";

function ProtectedRoute({ component: Component, allowedTypes }: { component: React.ComponentType; allowedTypes: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // debug to inspect what router sees
  // eslint-disable-next-line no-console
  console.debug('[ProtectedRoute] render:', { isLoading, isAuthenticated, user });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user && !allowedTypes.includes(user.type as string)) {
    return <Redirect to={`/${(user.type as string).toLowerCase()}`} />;
  }

  return <Component />;
}

function AuthRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect to={`/${(user.type as string).toLowerCase()}`} />;
  }

  return <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthRedirect} />
      <Route path="/login" component={Login} />
      
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={AdminProducts} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/msmes">
        <ProtectedRoute component={AdminMSMEs} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/agencies">
        <ProtectedRoute component={AdminAgencies} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/jobs">
        <ProtectedRoute component={AdminJobs} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/jobs/:id">
        <ProtectedRoute component={AdminJobDetail} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/reviews">
        <ProtectedRoute component={AdminReviews} allowedTypes={["ADMIN"]} />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute component={AdminAnalytics} allowedTypes={["ADMIN"]} />
      </Route>
      
      <Route path="/msme">
        <ProtectedRoute component={MSMEDashboard} allowedTypes={["MSME"]} />
      </Route>
      <Route path="/msme/jobs">
        <ProtectedRoute component={MSMEJobs} allowedTypes={["MSME"]} />
      </Route>
      <Route path="/msme/jobs/new">
        <ProtectedRoute component={MSMECreateJob} allowedTypes={["MSME"]} />
      </Route>
      <Route path="/msme/jobs/:id">
        <ProtectedRoute component={MSMEJobDetail} allowedTypes={["MSME"]} />
      </Route>
      
      <Route path="/agency">
        <ProtectedRoute component={AgencyDashboard} allowedTypes={["AGENCY"]} />
      </Route>
      <Route path="/agency/jobs">
        <ProtectedRoute component={AgencyJobs} allowedTypes={["AGENCY"]} />
      </Route>
      <Route path="/agency/jobs/:id">
        <ProtectedRoute component={AgencyJobDetail} allowedTypes={["AGENCY"]} />
      </Route>
      <Route path="/agency/submissions">
        <ProtectedRoute component={AgencySubmissions} allowedTypes={["AGENCY"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
