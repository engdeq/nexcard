export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nxg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#3478F6" />
          <stop offset="1" stopColor="#7657F6" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#nxg)" />
      <path
        d="M9 9h7.2v7.2H9V9zm10.8 0H27v2.8h-4.4v1.6h3.6v2.8h-7.2V9zM9 19.8h2.8V22H9v-2.2zm4.4 0H16v7.2h-2.6v-7.2zM9 24.8h2.8v2.2H9v-2.2zm10.8 0H27v2.2h-7.2v-2.2z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({ compact = false, showTagline = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={compact ? 32 : 36} />
      {!compact && (
        <div className="min-w-0">
          <div className="font-display text-[17px] font-bold leading-none tracking-tight text-text">
            Nexa<span className="text-primary">Card</span>
          </div>
          {showTagline && (
            <p className="mt-1 truncate text-[11px] font-medium text-muted">
              QR & Digital Profiles
            </p>
          )}
        </div>
      )}
    </div>
  );
}
