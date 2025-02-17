
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
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();
  const token = localStorage.getItem('token');
  const publicPaths = ['/login', '/signup'];

  React.useEffect(() => {
    if (token && publicPaths.includes(location)) {
      window.location.href = '/';
    } else if (!token && !publicPaths.includes(location)) {
      window.location.href = '/login';
    }
  }, [token, location]);

  return (
    <Switch>
      <Route path="/login">
        {token ? <Home /> : <Login />}
      </Route>
      <Route path="/signup">
        {token ? <Home /> : <Signup />}
      </Route>
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
