import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Clock, Image, Store, LogOut, Tag, BookOpen, CalendarDays, Bell, Settings, CalendarCheck, Menu, X, ShoppingBag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const baseNavItems = [
  { to: "/admin/carta", label: "Carta", icon: UtensilsCrossed },
  { to: "/admin/menu-del-dia", label: "Menú del Día", icon: BookOpen },
  { to: "/admin/promociones", label: "Promociones", icon: Tag },
  { to: "/admin/intereses", label: "Intereses", icon: Bell },
  { to: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { to: "/admin/horarios", label: "Horarios", icon: Clock },
  { to: "/admin/estado", label: "Estado", icon: Store },
  { to: "/admin/galeria", label: "Galería", icon: Image },
  { to: "/admin/eventos", label: "Eventos", icon: CalendarDays },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [takeawayActivo, setTakeawayActivo] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const navItems = [
    ...baseNavItems,
    ...(takeawayActivo ? [{ to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag }] : []),
  ];

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/admin");
        return;
      }
      setLoading(false);
      // Fetch takeaway status
      const { data: config } = await supabase.from("configuracion").select("takeaway_activo").limit(1).single();
      if (config) setTakeawayActivo(config.takeaway_activo);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="min-h-screen bg-[#111]" />;

  const sidebarContent = (
    <>
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 text-sm transition-colors ${
                isActive
                  ? "text-[#C8860A] bg-[#C8860A]/10"
                  : "text-[#999] hover:text-[#f0e8d0] hover:bg-[#ffffff08]"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
        <div className="mt-4 pt-4 border-t border-[#222]">
          <NavLink
            to="/admin/configuracion"
            onClick={() => isMobile && setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 text-sm transition-colors ${
                isActive
                  ? "text-[#C8860A] bg-[#C8860A]/10"
                  : "text-[#999] hover:text-[#f0e8d0] hover:bg-[#ffffff08]"
              }`
            }
          >
            <Settings size={18} />
            Configuración
          </NavLink>
        </div>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3.5 text-sm text-[#666] hover:text-red-400 transition-colors border-t border-[#222]"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#111] flex">
      {/* Mobile header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-[#f0e8d0] p-2 -ml-2"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-[#f0e8d0] font-semibold text-sm">Panel Estación 27</h1>
          <div className="w-[38px]" />
        </header>
      )}

      {/* Mobile overlay menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 h-14 border-b border-[#222]">
            <h1 className="text-[#f0e8d0] font-semibold text-sm">Panel Estación 27</h1>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#f0e8d0] p-2 -mr-2"
              aria-label="Cerrar menú"
            >
              <X size={22} />
            </button>
          </div>
          {sidebarContent}
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-56 bg-[#0a0a0a] border-r border-[#222] flex flex-col shrink-0 sticky top-0 h-screen">
          <div className="p-4 border-b border-[#222]">
            <h1 className="text-[#f0e8d0] font-semibold text-sm">Panel Estación 27</h1>
          </div>
          {sidebarContent}
        </aside>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-auto ${isMobile ? "pt-14 px-4 pb-6" : "p-6 lg:p-8"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
