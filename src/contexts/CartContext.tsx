import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  plato_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartContextType {
  items: CartItem[];
  takeawayActivo: boolean;
  takeawayLoading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (plato_id: string, nombre: string, precio: number) => void;
  removeItem: (plato_id: string) => void;
  updateQuantity: (plato_id: string, cantidad: number) => void;
  total: number;
  totalItems: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [takeawayActivo, setTakeawayActivo] = useState(false);
  const [takeawayLoading, setTakeawayLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("configuracion")
      .select("takeaway_activo")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data && typeof (data as any).takeaway_activo === "boolean") {
          setTakeawayActivo((data as any).takeaway_activo);
        }
      })
      .finally(() => setTakeawayLoading(false));
  }, []);

  const addItem = (plato_id: string, nombre: string, precio: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.plato_id === plato_id);
      if (existing) return prev.map((i) => i.plato_id === plato_id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { plato_id, nombre, precio, cantidad: 1 }];
    });
  };

  const removeItem = (plato_id: string) => setItems((prev) => prev.filter((i) => i.plato_id !== plato_id));

  const updateQuantity = (plato_id: string, cantidad: number) => {
    if (cantidad <= 0) return removeItem(plato_id);
    setItems((prev) => prev.map((i) => i.plato_id === plato_id ? { ...i, cantidad } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, takeawayActivo, takeawayLoading, drawerOpen, setDrawerOpen, addItem, removeItem, updateQuantity, total, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
