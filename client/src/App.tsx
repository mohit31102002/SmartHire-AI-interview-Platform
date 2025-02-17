
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
  const [location] = useLocation();
  const token = localStorage.getItem('token');
  const isAuthRoute = location === '/login' || location === '/signup';

  React.useEffect(() => {
    if (!token && !isAuthRoute) {
      window.location.href = '/login';
    }
  }, [token, isAuthRoute]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/interview/:id">
        <ProtectedRoute component={Interview} />
      </Route>
      <Route path="/results/:id">
        <ProtectedRoute component={Results} />
      </Route>
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
