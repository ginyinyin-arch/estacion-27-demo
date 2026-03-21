const Divider = () => {
  const text = "LOMOS · PARRILLA · TEX MEX · PIZZAS · ENSALADAS · GIN & VERMOUTH · CAFETERÍA";

  return (
    <div className="h-[52px] bg-carbon overflow-hidden flex items-center">
      <div className="animate-ticker whitespace-nowrap flex">
        <span className="font-body font-normal text-[0.70rem] uppercase tracking-[0.30em] px-8" style={{ color: "rgba(240,232,208,0.35)" }}>
          {text} &nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
};

export default Divider;
