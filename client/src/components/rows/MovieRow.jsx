import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Movie from '../movie/Movie';
import Icon from '../ui/Icon';
import './MovieRow.css';

/**
 * Horizontally scrolling carousel of poster tiles with edge fades and
 * arrow controls that hide themselves at either end of the track.
 */
const MovieRow = ({ title, subtitle, icon = 'film', movies = [], onOpen, viewAllTo }) => {
    const trackRef = useRef(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const measure = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setAtStart(el.scrollLeft <= 4);
        setAtEnd(el.scrollLeft >= max - 4);
    }, []);

    useEffect(() => {
        measure();
        const el = trackRef.current;
        if (!el) return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [measure, movies]);

    const scrollByPage = (direction) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
    };

    if (movies.length === 0) return null;

    return (
        <section className="movie-row">
            <div className="movie-row__head shell">
                <div>
                    <span className="section-eyebrow"><Icon name={icon} size={13} /> {title}</span>
                    {subtitle && <p className="movie-row__subtitle">{subtitle}</p>}
                </div>
                {viewAllTo && (
                    <Link to={viewAllTo} className="movie-row__all">
                        View all <Icon name="chevronRight" size={15} />
                    </Link>
                )}
            </div>

            <div className={`movie-row__viewport ${atStart ? 'at-start' : ''} ${atEnd ? 'at-end' : ''}`}>
                <button
                    type="button"
                    className="movie-row__arrow movie-row__arrow--prev"
                    onClick={() => scrollByPage(-1)}
                    aria-label={`Scroll ${title} left`}
                    tabIndex={atStart ? -1 : 0}
                >
                    <Icon name="chevronLeft" size={22} strokeWidth={2.2} />
                </button>

                <div className="movie-row__track" ref={trackRef} onScroll={measure}>
                    {movies.map((movie, i) => (
                        <div className="movie-row__item" key={movie._id ?? movie.imdb_id}>
                            <Movie movie={movie} onOpen={onOpen} index={i} />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="movie-row__arrow movie-row__arrow--next"
                    onClick={() => scrollByPage(1)}
                    aria-label={`Scroll ${title} right`}
                    tabIndex={atEnd ? -1 : 0}
                >
                    <Icon name="chevronRight" size={22} strokeWidth={2.2} />
                </button>
            </div>
        </section>
    );
};

export default MovieRow;
