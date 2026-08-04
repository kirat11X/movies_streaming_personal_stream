import './Spinner.css';

const Spinner = ({ label = 'Loading', full = false }) => (
    <div className={`ps-loader ${full ? 'ps-loader--full' : ''}`} role="status" aria-live="polite">
        <span className="ps-loader__ring" />
        <span className="ps-loader__label">{label}</span>
    </div>
);

export default Spinner;
