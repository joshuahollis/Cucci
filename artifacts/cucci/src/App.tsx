import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import Gallery from "@/pages/Gallery";
import CucciCare from "@/pages/CucciCare";
import Intimates from "@/pages/Intimates";
import Product from "@/pages/Product";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collections" component={Collections} />
      <Route path="/products/:handle" component={Product} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/cuccicare" component={CucciCare} />
      <Route path="/intimates" component={Intimates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
