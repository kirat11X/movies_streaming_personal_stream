import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import './Auth.css';

const HIGHLIGHTS = [
    { icon: 'sparkle', title: 'Picks built for you', text: 'Recommendations matched to your favourite genres.' },
    { icon: 'star', title: 'AI-ranked reviews', text: 'Every curator review is scored to surface the best titles first.' },
    { icon: 'shield', title: 'Private by design', text: 'Your own library, behind your own account.' },
];

/** Split-screen shell shared by the sign-in and registration pages. */
const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="auth">
        <aside className="auth__showcase">
            <div className="auth__showcase-inner">
                <Link to="/" className="auth__brand">
                    <Logo size={40} withWordmark />
                </Link>

                <h2 className="auth__tagline">
                    Your own cinema,<br />curated and always on.
                </h2>

                <ul className="auth__highlights">
                    {HIGHLIGHTS.map(({ icon, title: t, text }) => (
                        <li key={t}>
                            <span className="auth__highlight-icon"><Icon name={icon} size={17} /></span>
                            <div>
                                <strong>{t}</strong>
                                <p>{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>

        <main className="auth__panel">
            <div className="auth__card">
                <Link to="/" className="auth__card-brand">
                    <Logo size={38} />
                </Link>
                <h1 className="auth__title">{title}</h1>
                <p className="auth__subtitle">{subtitle}</p>
                {children}
                {footer && <div className="auth__footer">{footer}</div>}
            </div>
        </main>
    </div>
);

export default AuthLayout;
