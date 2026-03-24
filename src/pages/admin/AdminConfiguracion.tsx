import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminConfiguracion = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [savingWa, setSavingWa] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    supabase.from("configuracion").select("whatsapp_numero").limit(1).single().then(({ data }) => {
      if (data?.whatsapp_numero) setWhatsapp(data.whatsapp_numero);
    });
  }, []);

  const handleSaveWhatsapp = async () => {
    setSavingWa(true);
    const { error } = await supabase.from("configuracion").update({ whatsapp_numero: whatsapp, updated_at: new Date().toISOString() }).not("id", "is", null);
    if (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } else {
      toast({ title: "Número actualizado correctamente" });
    }
    setSavingWa(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Verify old password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });
    if (signInError) {
      toast({ title: "Contraseña actual incorrecta", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error al cambiar la contraseña", variant: "destructive" });
    } else {
      toast({ title: "Contraseña actualizada correctamente" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Configuración</h1>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-6 max-w-md">
        <div>
          <label className="block text-sm text-[#999] mb-1">Usuario</label>
          <p className="text-[#f0e8d0] text-sm bg-[#111] border border-[#333] rounded px-3 py-2">{email}</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[#999] mb-1">Número de WhatsApp para reservas</label>
          <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
            placeholder="+54 351 XXXXXXX"
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          <button type="button" onClick={handleSaveWhatsapp} disabled={savingWa}
            className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50">
            {savingWa ? "Guardando..." : "GUARDAR NÚMERO"}
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <h2 className="text-sm font-medium text-[#999]">Cambiar contraseña</h2>
          <div>
            <label className="block text-sm text-[#999] mb-1">Contraseña actual</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Nueva contraseña</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Repetir nueva contraseña</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50">
            {loading ? "Guardando..." : "CAMBIAR CONTRASEÑA"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
