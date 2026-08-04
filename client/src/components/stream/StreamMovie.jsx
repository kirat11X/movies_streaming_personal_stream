import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MovieRow from '../rows/MovieRow';
import MovieModal from '../movie/MovieModal';
import Icon from '../ui/Icon';
import useMovies from '../../hooks/useMovies';
import useMyList from '../../hooks/useMyList';
import { getYouTubeId } from '../../utils/youtube';
import { hasGenre } from '../../utils/genres';
import './StreamMovie.css';

const StreamMovie = () => {
    const { yt_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { movies } = useMovies();
    const { inList, toggleList, recordWatch } = useMyList();
    const [selected, setSelected] = useState(null);

    const youtubeId = getYouTubeId(yt_id);

    /* Prefer the movie handed over on navigation; fall back to a catalogue lookup
       so a deep link or refresh still shows the title and its review. */
    const movie = useMemo(() => {
        if (location.state?.movie) return location.state.movie;
        return movies.find((m) => getYouTubeId(m.youtube_id) === youtubeId) ?? null;
    }, [location.state, movies, youtubeId]);

    useEffect(() => {
        if (movie?.imdb_id) recordWatch(movie.imdb_id);
        // Only record once per title landed on.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movie?.imdb_id]);

    const genres = (movie?.genre ?? []).map((g) => g.genre_name).filter(Boolean);
    const saved = movie ? inList(movie.imdb_id) : false;

    /* "More like this" — same genre, excluding the current title. */
    const related = useMemo(() => {
        if (!movie) return [];
        return movies
            .filter((m) => m.imdb_id !== movie.imdb_id &&
                genres.some((name) => hasGenre(m, name)))
            .sort((a, b) => (a.ranking?.ranking_value ?? 999) - (b.ranking?.ranking_value ?? 999))
            .slice(0, 12);
    }, [movies, movie, genres]);

    if (!youtubeId) {
        return (
            <div className="page page--offset">
                <div className="shell empty">
                    <span className="empty__icon"><Icon name="alert" size={30} /></span>
                    <h2 className="empty__title">This title has no playable video</h2>
                    <p className="empty__text">
                        The stream link for this movie is missing or malformed. Pick another title to keep watching.
                    </p>
                    <button className="btn btn--primary" onClick={() => navigate('/browse')} style={{ marginTop: '1rem' }}>
                        Back to browse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page stream">
            <div className="stream__stage">
                <div className="stream__frame">
                    <iframe
                        className="stream__player"
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={movie ? `${movie.title} — Personal Stream player` : 'Personal Stream player'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>

                <button className="stream__back" onClick={() => navigate(-1)} aria-label="Go back">
                    <Icon name="arrowLeft" size={19} /> Back
                </button>
            </div>

            <div className="shell stream__meta">
                <div className="stream__headline">
                    <h1 className="stream__title">{movie?.title ?? 'Now playing'}</h1>
                    <div className="stream__facts">
                        {movie?.ranking?.ranking_name && (
                            <span className="chip chip--rank">
                                <Icon name="star" size={12} /> {movie.ranking.ranking_name}
                            </span>
                        )}
                        {genres.map((g) => <span className="chip" key={g}>{g}</span>)}
                        {movie?.imdb_id && <span className="stream__imdb">{movie.imdb_id}</span>}
                    </div>
                </div>

                {movie && (
                    <div className="stream__actions">
                        <button className="btn btn--ghost" onClick={() => toggleList(movie.imdb_id)}>
                            <Icon name={saved ? 'check' : 'plus'} size={17} strokeWidth={2.2} />
                            {saved ? 'In My List' : 'Add to My List'}
                        </button>
                        <a
                            className="btn btn--outline"
                            href={`https://www.youtube.com/watch?v=${youtubeId}`}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Open on YouTube
                        </a>
                    </div>
                )}

                {movie?.admin_review && (
                    <div className="stream__review">
                        <span className="stream__review-label">
                            <Icon name="sparkle" size={13} /> Curator's review
                        </span>
                        <p>{movie.admin_review}</p>
                    </div>
                )}
            </div>

            {related.length > 0 && (
                <div className="stream__related">
                    <MovieRow
                        title="More like this"
                        icon="film"
                        subtitle="Sharing a genre with what you're watching"
                        movies={related}
                        onOpen={setSelected}
                    />
                </div>
            )}

            <MovieModal movie={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default StreamMovie;
