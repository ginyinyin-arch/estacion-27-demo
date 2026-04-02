import { useState, useCallback, useMemo } from "react";
import { useLang } from "@/contexts/LangContext";

const COUNTRIES = [
  { code: "AR", flag: "🇦🇷", name: "Argentina", prefix: "+549" },
  { code: "AU", flag: "🇦🇺", name: "Australia", prefix: "+61" },
  { code: "AT", flag: "🇦🇹", name: "Austria", prefix: "+43" },
  { code: "BE", flag: "🇧🇪", name: "Belgium", prefix: "+32" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia", prefix: "+591" },
  { code: "BR", flag: "🇧🇷", name: "Brazil", prefix: "+55" },
  { code: "CA", flag: "🇨🇦", name: "Canada", prefix: "+1" },
  { code: "CL", flag: "🇨🇱", name: "Chile", prefix: "+56" },
  { code: "CO", flag: "🇨🇴", name: "Colombia", prefix: "+57" },
  { code: "CR", flag: "🇨🇷", name: "Costa Rica", prefix: "+506" },
  { code: "CU", flag: "🇨🇺", name: "Cuba", prefix: "+53" },
  { code: "CZ", flag: "🇨🇿", name: "Czechia", prefix: "+420" },
  { code: "DK", flag: "🇩🇰", name: "Denmark", prefix: "+45" },
  { code: "DO", flag: "🇩🇴", name: "Dom. Republic", prefix: "+1809" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador", prefix: "+593" },
  { code: "SV", flag: "🇸🇻", name: "El Salvador", prefix: "+503" },
  { code: "FI", flag: "🇫🇮", name: "Finland", prefix: "+358" },
  { code: "FR", flag: "🇫🇷", name: "France", prefix: "+33" },
  { code: "DE", flag: "🇩🇪", name: "Germany", prefix: "+49" },
  { code: "GR", flag: "🇬🇷", name: "Greece", prefix: "+30" },
  { code: "GT", flag: "🇬🇹", name: "Guatemala", prefix: "+502" },
  { code: "HN", flag: "🇭🇳", name: "Honduras", prefix: "+504" },
  { code: "HU", flag: "🇭🇺", name: "Hungary", prefix: "+36" },
  { code: "IE", flag: "🇮🇪", name: "Ireland", prefix: "+353" },
  { code: "IT", flag: "🇮🇹", name: "Italy", prefix: "+39" },
  { code: "JP", flag: "🇯🇵", name: "Japan", prefix: "+81" },
  { code: "KR", flag: "🇰🇷", name: "South Korea", prefix: "+82" },
  { code: "MX", flag: "🇲🇽", name: "Mexico", prefix: "+52" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", prefix: "+31" },
  { code: "NI", flag: "🇳🇮", name: "Nicaragua", prefix: "+505" },
  { code: "NO", flag: "🇳🇴", name: "Norway", prefix: "+47" },
  { code: "PA", flag: "🇵🇦", name: "Panama", prefix: "+507" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay", prefix: "+595" },
  { code: "PE", flag: "🇵🇪", name: "Peru", prefix: "+51" },
  { code: "PL", flag: "🇵🇱", name: "Poland", prefix: "+48" },
  { code: "PT", flag: "🇵🇹", name: "Portugal", prefix: "+351" },
  { code: "RO", flag: "🇷🇴", name: "Romania", prefix: "+40" },
  { code: "ES", flag: "🇪🇸", name: "Spain", prefix: "+34" },
  { code: "SE", flag: "🇸🇪", name: "Sweden", prefix: "+46" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland", prefix: "+41" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", prefix: "+44" },
  { code: "US", flag: "🇺🇸", name: "United States", prefix: "+1" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay", prefix: "+598" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela", prefix: "+58" },
];

interface SmartPhoneInputProps {
  onChange: (fullNumber: string) => void;
  error?: string;
}

const SmartPhoneInput = ({ onChange, error }: SmartPhoneInputProps) => {
  const { lang } = useLang();
  const [countryCode, setCountryCode] = useState("AR");
  const [prefix, setPrefix] = useState("+549");
  const [area, setArea] = useState("351");
  const [local, setLocal] = useState("");

  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode)!,
    [countryCode]
  );

  const emitChange = useCallback(
    (p: string, a: string, l: string) => {
      const clean = (p + a + l).replace(/[^+\d]/g, "");
      onChange(clean);
    },
    [onChange]
  );

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find((co) => co.code === code);
    if (!c) return;
    setCountryCode(code);
    setPrefix(c.prefix);
    emitChange(c.prefix, area, local);
  };

  const handlePrefixChange = (v: string) => {
    const cleaned = v.replace(/[^+\d]/g, "");
    setPrefix(cleaned);
    emitChange(cleaned, area, local);
  };

  const handleAreaChange = (v: string) => {
    const cleaned = v.replace(/\D/g, "");
    setArea(cleaned);
    emitChange(prefix, cleaned, local);
  };

  const handleLocalChange = (v: string) => {
    const cleaned = v.replace(/\D/g, "");
    setLocal(cleaned);
    emitChange(prefix, area, cleaned);
  };

  const inputClass =
    "bg-negro border border-crema/10 text-crema font-body text-sm placeholder:text-gris focus:outline-none focus:border-ambar/50 transition-colors rounded px-2 py-2.5";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5 items-stretch">
        {/* Country selector + editable prefix */}
        <div className="flex items-stretch">
          <select
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="bg-negro border border-crema/10 border-r-0 text-crema font-body text-sm rounded-l px-1.5 py-2.5 focus:outline-none focus:border-ambar/50 transition-colors cursor-pointer appearance-none"
            style={{ width: "52px" }}
            title={country.name}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={prefix}
            onChange={(e) => handlePrefixChange(e.target.value)}
            className={`${inputClass} rounded-l-none border-l-0 w-[60px] text-center`}
            maxLength={6}
          />
        </div>

        {/* Area code */}
        <input
          type="text"
          value={area}
          onChange={(e) => handleAreaChange(e.target.value)}
          placeholder={lang === "en" ? "Area" : "Área"}
          className={`${inputClass} w-[60px] text-center`}
          maxLength={5}
        />

        {/* Local number */}
        <input
          type="text"
          value={local}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={lang === "en" ? "Number" : "Número"}
          className={`${inputClass} flex-1 min-w-0`}
          maxLength={10}
        />
      </div>
      {error && <p className="text-red-400 text-xs font-body">{error}</p>}
    </div>
  );
};

export default SmartPhoneInput;
