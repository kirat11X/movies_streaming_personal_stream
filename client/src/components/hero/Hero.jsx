import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import useMyList from '../../hooks/useMyList';
import { getYouTubeId } from '../../utils/youtube';
import './Hero.css';

const ROTATE_MS = 9000;

/** Full-bleed spotlight that cycles through the top-ranked titles. */
const Hero = ({ movies = [], onOpen }) => {
    const navigate = useNavigate();
    const { inList, toggleList, recordWatch } = useMyList();
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        setActive(0);
    }, [movies]);

    useEffect(() => {
        if (paused || movies.length < 2) return;
        const id = setInterval(() => setActive((i) => (i + 1) % movies.length), ROTATE_MS);
        return () => clearInterval(id);
    }, [paused, movies.length]);

    if (movies.length === 0) return null;

    const movie = movies[active];
    const youtubeId = getYouTubeId(movie.youtube_id);
    const saved = inList(movie.imdb_id);
    const genres = (movie.genre ?? []).map((g) => g.genre_name).filter(Boolean);

    const play = () => {
        if (!youtubeId) return;
        recordWatch(movie.imdb_id);
        navigate(`/stream/${youtubeId}`, { state: { movie } });
    };

    return (
        <section
            className="hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Featured titles"
        >
            {/* Backdrop is the poster, blown up and blurred behind the copy. */}
            <div className="hero__backdrop" key={movie.imdb_id}>
                {movie.poster_path && <img src={movie.poster_path} alt="" aria-hidden="true" />}
            </div>
            <div className="hero__veil" />

            <div className="hero__inner shell">
                <div className="hero__copy" key={`copy-${movie.imdb_id}`}>
                    <span className="hero__eyebrow">
                        <Icon name="sparkle" size={14} /> Featured on Personal Stream
                    </span>

                    <h1 className="hero__title">{movie.title}</h1>

                    <div className="hero__facts">
                        {movie.ranking?.ranking_name && (
                            <span className="chip chip--rank">
                                <Icon name="star" size={12} /> {movie.ranking.ranking_name}
                            </span>
                        )}
                        {genres.slice(0, 3).map((g) => (
                            <span className="chip" key={g}>{g}</span>
                        ))}
                        {movie.imdb_id && <span className="hero__imdb">{movie.imdb_id}</span>}
                    </div>

                    {movie.admin_review && <p className="hero__review">{movie.admin_review}</p>}

                    <div className="hero__actions">
                        <button className="btn btn--light btn--lg" onClick={play} disabled={!youtubeId}>
                            <Icon name="play" size={18} /> Play now
                        </button>
                        <button className="btn btn--ghost btn--lg" onClick={() => onOpen?.(movie)}>
                            <Icon name="info" size={18} /> More info
                        </button>
                        <button
                            className="btn btn--ghost btn--lg btn--icon"
                            onClick={() => toggleList(movie.imdb_id)}
                            aria-label={saved ? 'Remove from My List' : 'Add to My List'}
                            title={saved ? 'Remove from My List' : 'Add to My List'}
                        >
                            <Icon name={saved ? 'check' : 'plus'} size={20} strokeWidth={2.2} />
                        </button>
                    </div>
                </div>

                <div className="hero__poster" key={`poster-${movie.imdb_id}`}>
                    {movie.poster_path && (
                        <img src={movie.poster_path} alt={`${movie.title} poster`} />
                    )}
                </div>
            </div>

            {movies.length > 1 && (
                <div className="hero__dots" role="tablist" aria-label="Choose a featured title">
                    {movies.map((m, i) => (
                        <button
                            key={m.imdb_id}
                            type="button"
                            role="tab"
                            aria-selected={i === active}
                            aria-label={m.title}
                            className={`hero__dot ${i === active ? 'is-active' : ''}`}
                            onClick={() => setActive(i)}
                        >
                            <span style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;
