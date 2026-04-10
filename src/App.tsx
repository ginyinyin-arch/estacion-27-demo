import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/contexts/LangContext";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./pages/AdminLayout.tsx";
import AdminCarta from "./pages/admin/AdminCarta.tsx";
import AdminHorarios from "./pages/admin/AdminHorarios.tsx";
import AdminGaleria from "./pages/admin/AdminGaleria.tsx";
import AdminEstado from "./pages/admin/AdminEstado.tsx";
import AdminPromociones from "./pages/admin/AdminPromociones.tsx";
import AdminMenuDelDia from "./pages/admin/AdminMenuDelDia.tsx";
import AdminEventos from "./pages/admin/AdminEventos.tsx";
import AdminIntereses from "./pages/admin/AdminIntereses.tsx";
import AdminReservas from "./pages/admin/AdminReservas.tsx";
import AdminConfiguracion from "./pages/admin/AdminConfiguracion.tsx";
import AdminPedidos from "./pages/admin/AdminPedidos.tsx";
import Baja from "./pages/Baja.tsx";
import MpCallback from "./pages/MpCallback.tsx";
import Checkout from "./pages/Checkout.tsx";
import PedidoConfirmado from "./pages/PedidoConfirmado.tsx";
import PedidoFallido from "./pages/PedidoFallido.tsx";
import PedidoPendiente from "./pages/PedidoPendiente.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LangProvider>
        <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/baja" element={<Baja />} />
            <Route path="/mp-callback" element={<MpCallback />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
            <Route path="/pedido-fallido" element={<PedidoFallido />} />
            <Route path="/pedido-pendiente" element={<PedidoPendiente />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/carta" element={<AdminCarta />} />
              <Route path="/admin/horarios" element={<AdminHorarios />} />
              <Route path="/admin/galeria" element={<AdminGaleria />} />
              <Route path="/admin/estado" element={<AdminEstado />} />
              <Route path="/admin/promociones" element={<AdminPromociones />} />
              <Route path="/admin/menu-del-dia" element={<AdminMenuDelDia />} />
              <Route path="/admin/eventos" element={<AdminEventos />} />
              <Route path="/admin/intereses" element={<AdminIntereses />} />
              <Route path="/admin/reservas" element={<AdminReservas />} />
              <Route path="/admin/configuracion" element={<AdminConfiguracion />} />
              <Route path="/admin/pedidos" element={<AdminPedidos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CartDrawer />
        </CartProvider>
      </LangProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
