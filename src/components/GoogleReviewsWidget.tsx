const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/estacion+27+cordoba/data=!4m2!3m1!1s0x9432a2818788c5bd:0xe90868ad3279c90b?sa=X&ved=1t:242&ictx=111";

const GoogleReviewsWidget = () => {
  return (
    <div className="flex flex-col items-center md:items-start gap-3">
      {/* Google Maps pin + "by Google" link */}
      <a
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 transition-opacity hover:opacity-75"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 92.3 132.3">
          <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
          <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.8-21.8-18.3z"/>
          <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-34.3-5.6-10.8-15.3-19-27-21.1L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
          <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.6-8.3 4.2-11.4L4.6 68.1C11 83.8 25.3 108.5 46.1 132.3c16.8-23.1 28.4-42.7 36.9-60.1L59.6 57.6c-3.3 3.7-8.1 5.9-13.5 5.9z"/>
          <path fill="#34a853" d="M59.6 57.6c7.7-6.1 12.7-15.3 12.7-25.5 0-3-0.4-5.8-1.2-8.5L32.6 34.8c-2.6 3.1-4.2 7.1-4.2 11.4 0 9.8 7.9 17.7 17.7 17.7 5.4 0 10.2-2.2 13.5-6.3z"/>
        </svg>
        <span className="font-body text-[0.82rem] text-crema2/60">by Google</span>
      </a>

      {/* Rating number */}
      <span className="font-display font-bold text-crema leading-none" style={{ fontSize: "2.5rem" }}>
        4.4
      </span>

      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 24 24" width="24" height="24" fill="hsl(var(--ambar))">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
          </svg>
        ))}
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="hsl(var(--ambar))" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
        </svg>
      </div>

      {/* Review count */}
      <span className="font-body text-[0.82rem] text-gris tracking-wide">
        +3.500 reseñas
      </span>
    </div>
  );
};

export default GoogleReviewsWidget;
