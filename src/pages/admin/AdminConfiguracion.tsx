import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, ExternalLink, Unplug } from "lucide-react";

const AdminConfiguracion = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [savingWa, setSavingWa] = useState(false);

  // Takeaway / MP state
  const [mpConnected, setMpConnected] = useState(false);
  const [mpUserId, setMpUserId] = useState<string | null>(null);
  const [takeawayActivo, setTakeawayActivo] = useState(false);
  const [savingTakeaway, setSavingTakeaway] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [loadingMpUrl, setLoadingMpUrl] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    supabase
      .from("configuracion")
      .select("whatsapp_numero, mp_connected, mp_user_id, takeaway_activo")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          if (data.whatsapp_numero) setWhatsapp(data.whatsapp_numero);
          setMpConnected(data.mp_connected);
          setMpUserId(data.mp_user_id);
          setTakeawayActivo(data.takeaway_activo);
        }
      });
  }, []);

  const handleSaveWhatsapp = async () => {
    setSavingWa(true);
    const { error } = await supabase
      .from("configuracion")
      .update({ whatsapp_numero: whatsapp, updated_at: new Date().toISOString() })
      .not("id", "is", null);
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

  const handleConnectMP = async () => {
    setLoadingMpUrl(true);
    try {
      const { data, error } = await supabase.functions.invoke("mp-auth-url");
      if (error || !data?.url) {
        toast({ title: "Error al obtener URL de MercadoPago", variant: "destructive" });
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error al conectar con MercadoPago", variant: "destructive" });
    } finally {
      setLoadingMpUrl(false);
    }
  };

  const handleDisconnectMP = async () => {
    setDisconnecting(true);
    const { error } = await supabase
      .from("configuracion")
      .update({
        mp_connected: false,
        mp_access_token: null,
        mp_refresh_token: null,
        mp_user_id: null,
        updated_at: new Date().toISOString(),
      })
      .not("id", "is", null);
    if (error) {
      toast({ title: "Error al desconectar", variant: "destructive" });
    } else {
      setMpConnected(false);
      setMpUserId(null);
      // Also disable takeaway if MP is disconnected
      setTakeawayActivo(false);
      await supabase
        .from("configuracion")
        .update({ takeaway_activo: false, updated_at: new Date().toISOString() })
        .not("id", "is", null);
      toast({ title: "MercadoPago desconectado" });
    }
    setDisconnecting(false);
  };

  const handleToggleTakeaway = async (checked: boolean) => {
    if (checked && !mpConnected) return;
    setSavingTakeaway(true);
    const { error } = await supabase
      .from("configuracion")
      .update({ takeaway_activo: checked, updated_at: new Date().toISOString() })
      .not("id", "is", null);
    if (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } else {
      setTakeawayActivo(checked);
      toast({ title: checked ? "Take Away activado ✓" : "Take Away desactivado" });
    }
    setSavingTakeaway(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Configuración</h1>

      <div className="space-y-6 max-w-md">
        {/* General config */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-6">
          <div>
            <label className="block text-sm text-[#999] mb-1">Usuario</label>
            <p className="text-[#f0e8d0] text-sm bg-[#111] border border-[#333] rounded px-3 py-2">{email}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-[#999] mb-1">Número de WhatsApp para reservas</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+54 351 XXXXXXX"
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSaveWhatsapp}
              disabled={savingWa}
              className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
            >
              {savingWa ? "Guardando..." : "GUARDAR NÚMERO"}
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <h2 className="text-sm font-medium text-[#999]">Cambiar contraseña</h2>
            <div>
              <label className="block text-sm text-[#999] mb-1">Contraseña actual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#999] mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#999] mb-1">Repetir nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "CAMBIAR CONTRASEÑA"}
            </button>
          </form>
        </div>

        {/* Take Away config */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-5">
          <h2 className="text-sm font-semibold text-[#f0e8d0] uppercase tracking-wide">Configuración Take Away</h2>

          {/* Block 1: MercadoPago */}
          <div className="space-y-3">
            <label className="block text-sm text-[#999]">Conexión MercadoPago</label>

            {mpConnected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/20">
                    <CheckCircle size={14} className="mr-1" />
                    MercadoPago conectado
                  </Badge>
                </div>
                {mpUserId && (
                  <p className="text-xs text-[#666]">ID de usuario: {mpUserId}</p>
                )}
                <button
                  type="button"
                  onClick={handleDisconnectMP}
                  disabled={disconnecting}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  <Unplug size={14} />
                  {disconnecting ? "Desconectando..." : "Desconectar"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleConnectMP}
                  disabled={loadingMpUrl}
                  className="flex items-center gap-2 bg-[#009ee3] hover:bg-[#007eb5] text-white font-semibold py-2.5 px-4 rounded transition-colors text-sm disabled:opacity-50"
                >
                  <ExternalLink size={16} />
                  {loadingMpUrl ? "Cargando..." : "Conectar MercadoPago"}
                </button>
                <p className="text-xs text-[#666]">
                  El restaurante debe autorizar el acceso con su cuenta de MercadoPago
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#222]" />

          {/* Block 2: Toggle Take Away */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#999]">Activar Take Away</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Switch
                        checked={takeawayActivo}
                        onCheckedChange={handleToggleTakeaway}
                        disabled={!mpConnected || savingTakeaway}
                      />
                    </span>
                  </TooltipTrigger>
                  {!mpConnected && (
                    <TooltipContent side="left" className="bg-[#222] text-[#f0e8d0] border-[#333]">
                      <p className="text-xs">Conectá MercadoPago primero para activar Take Away</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-[#666]">Requiere MercadoPago conectado para activar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
