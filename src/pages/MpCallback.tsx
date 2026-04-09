import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "success" | "error" | "invalid";

const MpCallback = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setStatus("invalid");
      return;
    }

    supabase.functions
      .invoke("mp-oauth-exchange", { body: { code } })
      .then(({ data, error }) => {
        if (error || !data?.ok) {
          setErrorMsg(data?.error || error?.message || "Error desconocido");
          setStatus("error");
        } else {
          setStatus("success");
        }
      })
      .catch((err) => {
        setErrorMsg(String(err));
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-4">
        {status === "loading" && (
          <p className="text-muted-foreground text-lg">Conectando con MercadoPago…</p>
        )}
        {status === "success" && (
          <>
            <p className="text-4xl">✓</p>
            <h1 className="text-2xl font-bold text-foreground">
              MercadoPago conectado correctamente
            </h1>
            <p className="text-muted-foreground">
              Podés cerrar esta pestaña y volver al panel de administración.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-4xl">✗</p>
            <h1 className="text-2xl font-bold text-destructive">
              Error al conectar
            </h1>
            <p className="text-muted-foreground">
              {errorMsg || "Intentá de nuevo."}
            </p>
          </>
        )}
        {status === "invalid" && (
          <>
            <p className="text-4xl">⚠</p>
            <h1 className="text-2xl font-bold text-foreground">
              Enlace inválido
            </h1>
            <p className="text-muted-foreground">
              Este enlace no contiene un código de autorización válido.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MpCallback;
