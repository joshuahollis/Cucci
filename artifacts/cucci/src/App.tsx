import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CartDropdown from "@/components/CartDropdown";
import { CartProvider } from "@/context/CartContext";
import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import Gallery from "@/pages/Gallery";
import CucciCare from "@/pages/CucciCare";
import Intimates from "@/pages/Intimates";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Policy from "@/pages/Policy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collections" component={Collections} />
      <Route path="/products" component={Collections} />
      <Route path="/products/:handle" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/privacy">{() => <Policy kind="privacy" />}</Route>
      <Route path="/terms">{() => <Policy kind="terms" />}</Route>
      <Route path="/shipping">{() => <Policy kind="shipping" />}</Route>
      <Route path="/returns">{() => <Policy kind="returns" />}</Route>
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
      <CartProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <CartDropdown />
        </WouterRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
