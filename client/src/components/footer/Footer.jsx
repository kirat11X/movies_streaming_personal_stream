import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';
import './Footer.css';

const ADMIN_EMAIL = 'kritansh.11.sss@gmail.com';
const ADMIN_MAILTO =
    `mailto:${ADMIN_EMAIL}` +
    '?subject=Personal%20Stream%20%E2%80%94%20Admin%20access%20request' +
    '&body=Hi%2C%0A%0AI%27d%20like%20to%20request%20admin%20access%20to%20Personal%20Stream.%0A%0AAccount%20email%3A%20%0AReason%3A%20%0A%0AThanks!';

const Footer = () => (
    <footer className="site-footer">
        <div className="shell">
            {/* Admin access request */}
            <div className="site-footer__admin">
                <span className="site-footer__admin-icon"><Icon name="shield" size={20} /></span>
                <div className="site-footer__admin-copy">
                    <strong>Need admin rights?</strong>
                    <p>
                        Admin accounts can add titles and publish curator reviews.
                        To request the role, email <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>.
                    </p>
                </div>
                <a className="btn btn--outline" href={ADMIN_MAILTO}>
                    <Icon name="mail" size={17} /> Request admin access
                </a>
            </div>
        </div>

        <div className="shell site-footer__inner">
            <div className="site-footer__brand">
                <Logo size={34} withWordmark />
                <p>A private streaming library with AI-ranked curator reviews.</p>
            </div>

            <nav className="site-footer__links" aria-label="Footer">
                <div>
                    <h3>Watch</h3>
                    <Link to="/">Home</Link>
                    <Link to="/browse">Browse</Link>
                    <Link to="/recommended">Recommended</Link>
                    <Link to="/my-list">My List</Link>
                </div>
                <div>
                    <h3>Account</h3>
                    <Link to="/login">Sign in</Link>
                    <Link to="/register">Create account</Link>
                    <a href={ADMIN_MAILTO}>Request admin role</a>
                </div>
            </nav>
        </div>

        <div className="shell site-footer__base">
            <span>© {new Date().getFullYear()} Personal Stream</span>
            <span>Built with React, Go and MongoDB</span>
        </div>
    </footer>
);

export default Footer;
