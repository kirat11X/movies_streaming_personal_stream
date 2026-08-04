/**
 * Inline SVG icon set — keeps the UI dependency-free and lets every glyph
 * inherit `currentColor` so icons pick up the surrounding text colour.
 */

const paths = {
    play: <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.14-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" fill="currentColor" stroke="none" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.75h.01" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    chevronLeft: <path d="m15 5-7 7 7 7" />,
    chevronRight: <path d="m9 5 7 7-7 7" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 13 4 4L19 7" />,
    bookmark: <path d="M6 4.5h12a1 1 0 0 1 1 1V20l-7-4-7 4V5.5a1 1 0 0 1 1-1Z" />,
    logout: <><path d="M15 17v1.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H13a2 2 0 0 1 2 2V7" /><path d="M10 12h10m0 0-3-3m3 3-3 3" /></>,
    user: <><circle cx="12" cy="8" r="3.75" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    film: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M16 4v16M3 12h18M3 8h5M3 16h5M16 8h5M16 16h5" /></>,
    sparkle: <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9 12 3.5Z" />,
    flame: <path d="M12 3c.6 3.2 3.4 4.2 3.4 7.2 0 1-.4 1.9-1 2.5.2-1.9-1-3.6-2.6-4.6.3 2.6-1.4 3.6-2.4 5-.6.8-1 1.8-1 2.9a5.6 5.6 0 0 0 11.2 0C19.6 10.6 15.6 6.2 12 3Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.3 2" /></>,
    star: <path d="m12 3.8 2.6 5.3 5.9.85-4.25 4.14 1 5.86L12 17.19l-5.25 2.76 1-5.86L3.5 9.95l5.9-.85L12 3.8Z" />,
    arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
    shield: <path d="M12 3.2 19 6v5.4c0 4.2-2.8 7.6-7 9.4-4.2-1.8-7-5.2-7-9.4V6l7-2.8Z" />,
    alert: <><path d="M12 8.5v4.2M12 16.2h.01" /><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
    trash: <><path d="M4 7h16M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7" /><path d="M6.5 7 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7" /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    home: <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />,
    mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></>,
    eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M10.7 6.1A8.9 8.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.65M6.4 7.9A16.7 16.7 0 0 0 2.5 12S6 18 12 18a9.3 9.3 0 0 0 3.6-.7" /><path d="M4 4l16 16" /></>,
    message: <path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.5 4V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />,
};

const Icon = ({ name, size = 20, strokeWidth = 1.8, className = '', ...rest }) => {
    const glyph = paths[name];
    if (!glyph) return null;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            {glyph}
        </svg>
    );
};

export default Icon;
