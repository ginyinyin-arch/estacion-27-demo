import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Clock, Image, Store, LogOut, Tag, BookOpen, CalendarDays, Bell, Settings } from "lucide-react";

const navItems = [
  { to: "/admin/carta", label: "Carta", icon: UtensilsCrossed },
  { to: "/admin/menu-del-dia", label: "Menú del Día", icon: BookOpen },
  { to: "/admin/promociones", label: "Promociones", icon: Tag },
  { to: "/admin/intereses", label: "Intereses", icon: Bell },
  { to: "/admin/horarios", label: "Horarios", icon: Clock },
  { to: "/admin/estado", label: "Estado", icon: Store },
  { to: "/admin/galeria", label: "Galería", icon: Image },
  { to: "/admin/eventos", label: "Eventos", icon: CalendarDays },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/admin");
        return;
      }
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#111] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a0a0a] border-r border-[#222] flex flex-col shrink-0 fixed h-full z-10 lg:relative">
        <div className="p-4 border-b border-[#222]">
          <h1 className="text-[#f0e8d0] font-semibold text-sm">Panel Estación 27</h1>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
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
          className="flex items-center gap-3 px-4 py-3 text-sm text-[#666] hover:text-red-400 transition-colors border-t border-[#222]"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 ml-56 lg:ml-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
