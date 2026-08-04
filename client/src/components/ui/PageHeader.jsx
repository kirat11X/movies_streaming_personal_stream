import Icon from './Icon';
import './PageHeader.css';

/** Shared masthead for the Browse / Recommended / My List pages. */
const PageHeader = ({ eyebrow, title, description, icon, children, count }) => (
    <header className="page-header">
        <div className="page-header__glow" aria-hidden="true" />
        <div className="page-header__text">
            {eyebrow && (
                <span className="section-eyebrow">
                    {icon && <Icon name={icon} size={13} />} {eyebrow}
                </span>
            )}
            <h1 className="page-header__title">
                {title}
                {typeof count === 'number' && <span className="page-header__count">{count}</span>}
            </h1>
            {description && <p className="page-header__desc">{description}</p>}
        </div>
        {children && <div className="page-header__extra">{children}</div>}
    </header>
);

export default PageHeader;
