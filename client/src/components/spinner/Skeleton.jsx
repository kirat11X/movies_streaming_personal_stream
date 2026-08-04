import './Spinner.css';

const Card = () => (
    <div className="skeleton-card">
        <div className="skeleton-block skeleton-block--poster" />
        <div className="skeleton-block skeleton-block--line" />
        <div className="skeleton-block skeleton-block--line is-short" />
    </div>
);

/** Placeholder posters shown while the catalogue loads. */
const Skeleton = ({ count = 10, variant = 'grid' }) => (
    <div className={variant === 'row' ? 'skeleton-row' : 'skeleton-grid'} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => <Card key={i} />)}
    </div>
);

export default Skeleton;
