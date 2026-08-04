import { useState } from 'react';
import { Link } from 'react-router-dom';
import Movies from '../movies/Movies';
import MovieModal from '../movie/MovieModal';
import PageHeader from '../ui/PageHeader';
import Skeleton from '../spinner/Skeleton';
import Icon from '../ui/Icon';
import useAuth from '../../hooks/useAuth';
import useRecommended from '../../hooks/useRecommended';
import './Recommended.css';

/**
 * Personalised picks page, backed by the protected `/recommended` endpoint:
 * the server filters on the user's favourite genres and orders by the ranking
 * value Gemini derives from each curator review.
 */
const Recommended = () => {
    const { auth } = useAuth();
    const { movies, loading, error, refresh } = useRecommended();
    const [selected, setSelected] = useState(null);

    const favourites = auth?.favourite_genres ?? [];

    return (
        <div className="page page--offset">
            <div className="shell">
                <PageHeader
                    eyebrow="Personalised"
                    icon="sparkle"
                    title="Recommended for you"
                    count={loading ? undefined : movies.length}
                    description={
                        <>
                            Titles matched to the genres you picked when you signed up, ordered by the
                            sentiment score our Gemini-powered reviewer assigns to each curator write-up.
                        </>
                    }
                >
                    {favourites.length > 0 && (
                        <div className="recommended__genres">
                            <span className="recommended__genres-label">Your genres</span>
                            {favourites.map((g) => (
                                <span className="chip chip--brand" key={g.genre_name}>
                                    {g.genre_name}
                                </span>
                            ))}
                        </div>
                    )}
                </PageHeader>

                {/* How the ranking is produced — makes the AI step legible. */}
                <ol className="recommended__how">
                    <li>
                        <span className="recommended__step">1</span>
                        <div>
                            <strong>Your taste profile</strong>
                            <p>We start from the favourite genres on your account.</p>
                        </div>
                    </li>
                    <li>
                        <span className="recommended__step">2</span>
                        <div>
                            <strong>AI-scored reviews</strong>
                            <p>Gemini classifies each curator review into a ranking sentiment.</p>
                        </div>
                    </li>
                    <li>
                        <span className="recommended__step">3</span>
                        <div>
                            <strong>Best matches first</strong>
                            <p>Matching titles are sorted by that score and surfaced here.</p>
                        </div>
                    </li>
                </ol>

                {loading && <Skeleton count={10} />}

                {!loading && error && (
                    <div className="empty">
                        <span className="empty__icon"><Icon name="alert" size={30} /></span>
                        <h2 className="empty__title">Recommendations unavailable</h2>
                        <p className="empty__text">{error}</p>
                        <button className="btn btn--primary" onClick={refresh} style={{ marginTop: '1rem' }}>
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && favourites.length === 0 && movies.length === 0 && (
                    <div className="empty">
                        <span className="empty__icon"><Icon name="user" size={30} /></span>
                        <h2 className="empty__title">No taste profile yet</h2>
                        <p className="empty__text">
                            Your account has no favourite genres saved, so there is nothing to match against.
                            Browse the full library in the meantime.
                        </p>
                        <Link className="btn btn--primary" to="/browse" style={{ marginTop: '1rem' }}>
                            Browse all titles
                        </Link>
                    </div>
                )}

                {!loading && !error && favourites.length > 0 && (
                    <Movies
                        movies={movies}
                        onOpen={setSelected}
                        emptyIcon="sparkle"
                        emptyTitle="No matches in your genres yet"
                        emptyText="Nothing in the library matches your favourite genres right now. New titles are added regularly — or browse everything instead."
                    />
                )}
            </div>

            <MovieModal movie={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default Recommended;
