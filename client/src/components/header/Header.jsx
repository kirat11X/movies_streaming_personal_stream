import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import './Header.css';

const BASE_NAV_LINKS = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/browse', label: 'Browse', icon: 'grid' },
    { to: '/my-list', label: 'My List', icon: 'bookmark' },
];

const Header = ({ handleLogout }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const searchInputRef = useRef(null);
    const menuRef = useRef(null);

    /* Solidify the bar once the hero starts scrolling underneath it. */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close the transient surfaces whenever the route changes. */
    useEffect(() => {
        setMenuOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

    /* Keep the field in sync when the query changes elsewhere (e.g. back button). */
    useEffect(() => {
        setQuery(searchParams.get('q') ?? '');
    }, [searchParams]);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const onClickAway = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickAway);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onClickAway);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);

    const runSearch = (value) => {
        setQuery(value);
        const target = value.trim() ? `/browse?q=${encodeURIComponent(value.trim())}` : '/browse';
        navigate(target, { replace: location.pathname === '/browse' });
    };

    const initials =
        `${auth?.first_name?.[0] ?? ''}${auth?.last_name?.[0] ?? ''}`.toUpperCase() || 'PS';

    const navLinks = [
        ...BASE_NAV_LINKS,
        ...(auth ? [{ to: '/suggest', label: 'Suggest a title', icon: 'message' }] : []),
        ...(auth?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin', icon: 'shield' }] : []),
    ];

    return (
        <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
            <div className="site-header__inner shell">
                <NavLink to="/" className="site-header__brand" aria-label="Personal Stream — home">
                    <Logo size={36} withWordmark />
                </NavLink>

                <nav className="site-header__nav" aria-label="Primary">
                    {navLinks.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="site-header__actions">
                    <div className={`header-search ${searchOpen ? 'is-open' : ''}`}>
                        <button
                            type="button"
                            className="header-search__toggle"
                            onClick={() => (searchOpen ? runSearch(query) : setSearchOpen(true))}
                            aria-label="Search titles"
                        >
                            <Icon name="search" size={19} />
                        </button>
                        <input
                            ref={searchInputRef}
                            className="header-search__input"
                            type="search"
                            value={query}
                            placeholder="Search titles, genres…"
                            aria-label="Search titles"
                            onChange={(e) => runSearch(e.target.value)}
                            onBlur={() => !query && setSearchOpen(false)}
                        />
                    </div>

                    {auth ? (
                        <div className="user-menu" ref={menuRef}>
                            <button
                                type="button"
                                className="user-menu__trigger"
                                onClick={() => setMenuOpen((o) => !o)}
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                            >
                                <span className="avatar">{initials}</span>
                                <Icon name="chevronDown" size={15} className={menuOpen ? 'is-flipped' : ''} />
                            </button>

                            {menuOpen && (
                                <div className="user-menu__panel" role="menu">
                                    <div className="user-menu__head">
                                        <span className="avatar avatar--lg">{initials}</span>
                                        <div className="user-menu__id">
                                            <strong>{auth.first_name} {auth.last_name}</strong>
                                            <span>{auth.email}</span>
                                        </div>
                                    </div>

                                    {auth.role === 'ADMIN' && (
                                        <span className="user-menu__role">
                                            <Icon name="shield" size={14} /> Administrator
                                        </span>
                                    )}

                                    {auth.favourite_genres?.length > 0 && (
                                        <div className="user-menu__genres">
                                            {auth.favourite_genres.slice(0, 4).map((g) => (
                                                <span className="chip" key={g.genre_id}>{g.genre_name}</span>
                                            ))}
                                        </div>
                                    )}

                                    <button type="button" className="user-menu__item" role="menuitem" onClick={handleLogout}>
                                        <Icon name="logout" size={17} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="site-header__auth">
                            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/login')}>
                                Sign in
                            </button>
                            <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
                                Get started
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className={`site-header__burger ${mobileOpen ? 'is-open' : ''}`}
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileOpen}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav className="mobile-nav" aria-label="Mobile">
                    {navLinks.map(({ to, label, icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
                        >
                            <Icon name={icon} size={18} /> {label}
                        </NavLink>
                    ))}
                    {!auth && (
                        <div className="mobile-nav__auth">
                            <button className="btn btn--ghost btn--block" onClick={() => navigate('/login')}>Sign in</button>
                            <button className="btn btn--primary btn--block" onClick={() => navigate('/register')}>Get started</button>
                        </div>
                    )}
                </nav>
            )}
        </header>
    );
};

export default Header;
