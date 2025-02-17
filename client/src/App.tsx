import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Interview from "@/pages/interview";
import Results from "@/pages/results";
import Login from "./pages/login";
import Signup from "./pages/signup";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const [, navigate] = useLocation();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return localStorage.getItem('token') ? <Component {...rest} /> : null;
}

function Router() {
  const token = localStorage.getItem('token');
  const [location] = useLocation();

  React.useEffect(() => {
    if (!token && location !== '/login' && location !== '/signup') {
      window.location.href = '/login';
    }
  }, [token, location]);

  if (!token) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="*" component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/interview/:id" component={Interview} />
      <Route path="/results/:id" component={Results} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;