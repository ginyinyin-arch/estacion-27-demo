import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartDrawer = () => {
  const { items, drawerOpen, setDrawerOpen, updateQuantity, removeItem, total } = useCart();

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[1101] h-full w-full max-w-md bg-negro border-l border-crema/10 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-crema/10">
          <h2 className="font-display font-bold text-lg text-crema">Tu pedido</h2>
          <button onClick={() => setDrawerOpen(false)} className="text-crema/60 hover:text-crema transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <p className="text-crema2 font-body text-sm text-center mt-12">El carrito está vacío</p>
          )}
          {items.map((item) => (
            <div key={item.plato_id} className="flex items-center gap-3 bg-carbon rounded p-3 border border-crema/5">
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-crema truncate">{item.nombre}</p>
                <p className="font-body text-xs text-crema2">${item.precio.toLocaleString()} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.plato_id, item.cantidad - 1)} className="w-7 h-7 flex items-center justify-center rounded bg-crema/10 text-crema hover:bg-ambar hover:text-negro transition-colors">
                  <Minus size={14} />
                </button>
                <span className="font-body font-semibold text-sm text-crema w-5 text-center">{item.cantidad}</span>
                <button onClick={() => updateQuantity(item.plato_id, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center rounded bg-crema/10 text-crema hover:bg-ambar hover:text-negro transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-body font-semibold text-sm text-ambar w-16 text-right">${(item.precio * item.cantidad).toLocaleString()}</span>
              <button onClick={() => removeItem(item.plato_id)} className="text-gris hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-crema/10 space-y-3">
          <div className="flex justify-between font-display font-bold text-crema">
            <span>Total</span>
            <span className="text-ambar">${total.toLocaleString()}</span>
          </div>
          <a
            href="/checkout"
            className={`block text-center font-body font-semibold text-sm uppercase tracking-wider py-3 rounded transition-colors ${items.length === 0 ? "bg-gris/30 text-gris pointer-events-none" : "bg-ambar text-negro hover:bg-ambar/90"}`}
          >
            Ir al pago →
          </a>
          <button onClick={() => setDrawerOpen(false)} className="w-full text-center font-body text-sm text-crema2 hover:text-crema transition-colors py-2">
            Seguir eligiendo
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
