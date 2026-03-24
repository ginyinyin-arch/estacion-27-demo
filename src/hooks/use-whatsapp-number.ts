import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_NUMBER = "543515511843";

let cachedNumber: string | null = null;

export function useWhatsappNumber() {
  const [number, setNumber] = useState(cachedNumber || DEFAULT_NUMBER);

  useEffect(() => {
    if (cachedNumber) return;
    supabase
      .from("configuracion")
      .select("whatsapp_numero")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_numero) {
          const clean = data.whatsapp_numero.replace(/\D/g, "");
          cachedNumber = clean;
          setNumber(clean);
        }
      });
  }, []);

  return number;
}
