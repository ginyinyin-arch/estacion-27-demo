import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Credenciales incorrectas");
      setLoading(false);
    } else {
      navigate("/admin/carta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#111" }}>
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded bg-[#1a1a1a] border border-[#333] text-[#f0e8d0] placeholder-[#666] text-sm focus:outline-none focus:border-[#C8860A]"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded bg-[#1a1a1a] border border-[#333] text-[#f0e8d0] placeholder-[#666] text-sm focus:outline-none focus:border-[#C8860A]"
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded bg-[#C8860A] text-[#111] font-semibold text-sm hover:bg-[#d4950f] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
