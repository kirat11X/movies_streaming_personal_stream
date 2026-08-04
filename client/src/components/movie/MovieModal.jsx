import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import useMyList from '../../hooks/useMyList';
import useAuth from '../../hooks/useAuth';
import useMovies from '../../hooks/useMovies';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { getYouTubeId } from '../../utils/youtube';
import './MovieModal.css';

/** Detail sheet shown when a poster is clicked. */
const MovieModal = ({ movie, onClose }) => {
    const navigate = useNavigate();
    const { inList, toggleList, recordWatch } = useMyList();
    const { auth } = useAuth();
    const { refresh } = useMovies();
    const axiosPrivate = useAxiosPrivate();
    const isAdmin = auth?.role === 'ADMIN';

    const [editingReview, setEditingReview] = useState(false);
    const [reviewDraft, setReviewDraft] = useState('');
    const [liveReview, setLiveReview] = useState('');
    const [savingReview, setSavingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    /* Lock the page behind the dialog and wire up Escape. */
    useEffect(() => {
        if (!movie) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [movie, onClose]);

    /* Reset the curator-review editor whenever a different title is opened. */
    useEffect(() => {
        setLiveReview(movie?.admin_review ?? '');
        setReviewDraft(movie?.admin_review ?? '');
        setEditingReview(false);
        setReviewError('');
    }, [movie?.imdb_id, movie?.admin_review]);

    if (!movie) return null;

    const youtubeId = getYouTubeId(movie.youtube_id);
    const saved = inList(movie.imdb_id);
    const genres = (movie.genre ?? []).map((g) => g.genre_name).filter(Boolean);

    const play = () => {
        if (!youtubeId) return;
        recordWatch(movie.imdb_id);
        onClose();
        navigate(`/stream/${youtubeId}`, { state: { movie } });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!movie.imdb_id || savingReview) return;
        setSavingReview(true);
        setReviewError('');
        try {
            const trimmed = reviewDraft.trim();
            const response = await axiosPrivate.patch(`/movie/${movie.imdb_id}/review`, {
                admin_review: trimmed,
            });
            setLiveReview(response.data?.admin_review ?? trimmed);
            setEditingReview(false);
            refresh();
        } catch (err) {
            setReviewError(err.response?.data?.error || 'Could not publish the review. Please try again.');
        } finally {
            setSavingReview(false);
        }
    };

    return (
        <div className="sheet" role="presentation" onClick={onClose}>
            <div
                className="sheet__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sheet-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className="sheet__close" onClick={onClose} aria-label="Close details">
                    <Icon name="close" size={20} strokeWidth={2.2} />
                </button>

                <div className="sheet__banner">
                    {movie.poster_path && <img src={movie.poster_path} alt="" aria-hidden="true" />}
                    <div className="sheet__banner-veil" />
                </div>

                <div className="sheet__body">
                    <div className="sheet__poster">
                        {movie.poster_path
                            ? <img src={movie.poster_path} alt={`${movie.title} poster`} />
                            : <div className="sheet__poster-fallback"><Icon name="film" size={28} /></div>}
                    </div>

                    <div className="sheet__content">
                        <h2 className="sheet__title" id="sheet-title">{movie.title}</h2>

                        <div className="sheet__facts">
                            {movie.ranking?.ranking_name && (
                                <span className="chip chip--rank">
                                    <Icon name="star" size={12} /> {movie.ranking.ranking_name}
                                </span>
                            )}
                            {genres.map((g) => <span className="chip" key={g}>{g}</span>)}
                        </div>

                        {isAdmin ? (
                            <div className="sheet__review sheet__review--admin">
                                <span className="sheet__review-label">
                                    <Icon name="sparkle" size={13} /> Curator's review
                                </span>

                                {editingReview ? (
                                    <form className="sheet__review-form" onSubmit={submitReview}>
                                        <textarea
                                            className="input sheet__review-input"
                                            rows={4}
                                            maxLength={2000}
                                            value={reviewDraft}
                                            onChange={(e) => setReviewDraft(e.target.value)}
                                            placeholder="Write a curator review for this title…"
                                            disabled={savingReview}
                                            autoFocus
                                        />
                                        {reviewError && (
                                            <div className="notice notice--error" role="alert">
                                                <Icon name="alert" size={15} /> <span>{reviewError}</span>
                                            </div>
                                        )}
                                        <div className="sheet__review-actions">
                                            <button
                                                type="submit"
                                                className="btn btn--primary btn--sm"
                                                disabled={savingReview || !reviewDraft.trim()}
                                            >
                                                <Icon name="check" size={15} />
                                                {savingReview ? 'Publishing…' : 'Publish review'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--ghost btn--sm"
                                                disabled={savingReview}
                                                onClick={() => {
                                                    setReviewDraft(liveReview);
                                                    setReviewError('');
                                                    setEditingReview(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {liveReview
                                            ? <p>{liveReview}</p>
                                            : <p className="sheet__no-review">No review has been written for this title yet.</p>}
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm sheet__review-edit"
                                            onClick={() => setEditingReview(true)}
                                        >
                                            <Icon name="sparkle" size={14} /> {liveReview ? 'Edit review' : 'Write a review'}
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : liveReview ? (
                            <div className="sheet__review">
                                <span className="sheet__review-label">
                                    <Icon name="sparkle" size={13} /> Curator's review
                                </span>
                                <p>{liveReview}</p>
                            </div>
                        ) : (
                            <p className="sheet__no-review">No review has been written for this title yet.</p>
                        )}

                        <dl className="sheet__specs">
                            <div>
                                <dt>IMDb ID</dt>
                                <dd>{movie.imdb_id || '—'}</dd>
                            </div>
                            <div>
                                <dt>Genres</dt>
                                <dd>{genres.length ? genres.join(', ') : '—'}</dd>
                            </div>
                            <div>
                                <dt>Rating signal</dt>
                                <dd>{movie.ranking?.ranking_name || 'Unrated'}</dd>
                            </div>
                        </dl>

                        <div className="sheet__actions">
                            <button className="btn btn--primary" onClick={play} disabled={!youtubeId}>
                                <Icon name="play" size={17} /> {youtubeId ? 'Play now' : 'Video unavailable'}
                            </button>
                            <button className="btn btn--ghost" onClick={() => toggleList(movie.imdb_id)}>
                                <Icon name={saved ? 'check' : 'plus'} size={17} strokeWidth={2.2} />
                                {saved ? 'In My List' : 'Add to My List'}
                            </button>
                            {movie.imdb_id && (
                                <a
                                    className="btn btn--outline"
                                    href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    View on IMDb
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieModal;
