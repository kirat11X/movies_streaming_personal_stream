import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

const NotFound = () => (
    <div className="page page--offset">
        <div className="shell empty">
            <span className="empty__icon"><Icon name="film" size={30} /></span>
            <h2 className="empty__title">This page rolled off the reel</h2>
            <p className="empty__text">
                We couldn't find what you were looking for. It may have been moved, or the link is wrong.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link className="btn btn--primary" to="/">Back to home</Link>
                <Link className="btn btn--ghost" to="/browse">Browse the library</Link>
            </div>
        </div>
    </div>
);

export default NotFound;
