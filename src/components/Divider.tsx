const Divider = () => {
  const text = "LOMOS · PARRILLA · TEX MEX · PIZZAS · ENSALADAS · GIN & VERMOUTH · CAFETERÍA";
  const separator = " \u00A0\u00A0\u00A0 ";

  return (
    <div className="h-[52px] bg-carbon overflow-hidden flex items-center">
      <div className="whitespace-nowrap flex ticker-track">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-body font-normal text-[0.70rem] uppercase tracking-[0.30em] px-4"
            style={{ color: "rgba(240,232,208,0.35)" }}
          >
            {text}{separator}{text}{separator}{text}{separator}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Divider;
