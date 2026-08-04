import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import useMyList from '../../hooks/useMyList';
import { getYouTubeId } from '../../utils/youtube';
import './Movie.css';

/**
 * Poster tile. Clicking the card opens the detail sheet; the inline play button
 * jumps straight to the player.
 */
const Movie = ({ movie, onOpen, index = 0 }) => {
    const navigate = useNavigate();
    const { inList, toggleList, recordWatch } = useMyList();
    const [imageFailed, setImageFailed] = useState(false);

    const youtubeId = getYouTubeId(movie.youtube_id);
    const saved = inList(movie.imdb_id);
    const genres = (movie.genre ?? []).map((g) => g.genre_name).filter(Boolean);

    const play = (e) => {
        e?.stopPropagation();
        if (!youtubeId) return;
        recordWatch(movie.imdb_id);
        navigate(`/stream/${youtubeId}`, { state: { movie } });
    };

    return (
        <article
            className="poster-card animate-rise"
            style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
            onClick={() => onOpen?.(movie)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen?.(movie);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${movie.title} — view details`}
        >
            <div className="poster-card__frame">
                {imageFailed || !movie.poster_path ? (
                    <div className="poster-card__fallback">
                        <Icon name="film" size={30} />
                        <span>{movie.title}</span>
                    </div>
                ) : (
                    <img
                        className="poster-card__img"
                        src={movie.poster_path}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                    />
                )}

                <div className="poster-card__scrim" />

                {movie.ranking?.ranking_name && (
                    <span className="poster-card__rank">
                        <Icon name="star" size={12} /> {movie.ranking.ranking_name}
                    </span>
                )}

                <button
                    type="button"
                    className={`poster-card__save ${saved ? 'is-saved' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleList(movie.imdb_id);
                    }}
                    aria-label={saved ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
                    title={saved ? 'Remove from My List' : 'Add to My List'}
                >
                    <Icon name={saved ? 'check' : 'plus'} size={16} strokeWidth={2.4} />
                </button>

                <div className="poster-card__hover">
                    <button
                        type="button"
                        className="poster-card__play"
                        onClick={play}
                        disabled={!youtubeId}
                        aria-label={`Play ${movie.title}`}
                    >
                        <Icon name="play" size={22} />
                    </button>
                </div>
            </div>

            <div className="poster-card__meta">
                <h3 className="poster-card__title">{movie.title}</h3>
                <p className="poster-card__sub">
                    {genres.length > 0 ? genres.slice(0, 2).join(' • ') : movie.imdb_id}
                </p>
                {!youtubeId && <span className="poster-card__warn">Video unavailable</span>}
            </div>
        </article>
    );
};

export default Movie;
