import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/contexts/LangContext";
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
import Baja from "./pages/Baja.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LangProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
