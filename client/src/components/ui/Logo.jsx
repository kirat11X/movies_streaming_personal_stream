/**
 * Brand mark — a play triangle carved out of a gradient "stream" bolt.
 * Rendered inline so it can pick up sizing/animation from CSS.
 */
const Logo = ({ size = 34, withWordmark = false, className = '' }) => (
    <span className={`brandmark ${className}`}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="Personal Stream">
            <defs>
                <linearGradient id="ps-brand" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B46FF" />
                    <stop offset="0.55" stopColor="#6366F1" />
                    <stop offset="1" stopColor="#47BFFF" />
                </linearGradient>
            </defs>
            <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#ps-brand)" />
            <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <path
                d="M19.5 15.6a1.4 1.4 0 0 1 2.13-1.2l11.4 7.1a1.4 1.4 0 0 1 0 2.38l-11.4 7.1a1.4 1.4 0 0 1-2.13-1.19V15.6Z"
                fill="#fff"
            />
            <path d="M12.5 17.5v13M8 21v6" stroke="rgba(255,255,255,0.75)" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        {withWordmark && (
            <span className="brandmark__word">
                Personal<span>Stream</span>
            </span>
        )}
    </span>
);

export default Logo;
