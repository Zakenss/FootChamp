import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Stats from "@/pages/Stats";
import TournoiRamadan from "@/pages/TournoiRamadan";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";

function Router() {
  return (
    <Switch>
      <Route path="/marrakech">
        <LanguageProvider>
          <Home city="Marrakech" />
        </LanguageProvider>
      </Route>
      <Route path="/toulouse" component={() => <Home city="Toulouse" />} />
      <Route path="/tournoi-ramadan" component={TournoiRamadan} />
      <Route path="/stats" component={Stats} />
      <Route path="/admin" component={Admin} />
      <Route path="/" component={Landing} />
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
