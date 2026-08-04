import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../hero/Hero';
import MovieRow from '../rows/MovieRow';
import MovieModal from '../movie/MovieModal';
import Skeleton from '../spinner/Skeleton';
import Icon from '../ui/Icon';
import useMovies from '../../hooks/useMovies';
import useMyList from '../../hooks/useMyList';
import useAuth from '../../hooks/useAuth';
import useRecommended from '../../hooks/useRecommended';
import { hasGenre } from '../../utils/genres';
import './Home.css';

/** Lower ranking_value means a stronger review, matching the backend sort. */
const byRank = (a, b) => (a.ranking?.ranking_value ?? 999) - (b.ranking?.ranking_value ?? 999);

const GENRE_ROW_LIMIT = 6;

const Home = () => {
    const { movies, genres, loading, error, refresh } = useMovies();
    const { auth } = useAuth();
    const { listIds, historyIds, resolve } = useMyList();
    const { movies: recommended } = useRecommended(Boolean(auth));
    const [selected, setSelected] = useState(null);

    const topRated = useMemo(() => [...movies].sort(byRank), [movies]);
    const featured = useMemo(() => topRated.slice(0, 5), [topRated]);
    const continueWatching = useMemo(() => resolve(historyIds, movies), [historyIds, movies, resolve]);
    const myList = useMemo(() => resolve(listIds, movies), [listIds, movies, resolve]);

    const genreRows = useMemo(() => (
        genres.slice(0, GENRE_ROW_LIMIT).map((genre) => ({
            genre,
            movies: movies.filter((m) => hasGenre(m, genre.genre_name)),
        })).filter((row) => row.movies.length > 0)
    ), [genres, movies]);

    if (loading) {
        return (
            <div className="page page--offset">
                <div className="shell">
                    <div className="home__loading-hero skeleton-block" />
                    <Skeleton count={8} variant="row" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page page--offset">
                <div className="shell empty">
                    <span className="empty__icon"><Icon name="alert" size={30} /></span>
                    <h2 className="empty__title">The library is out of reach</h2>
                    <p className="empty__text">{error}</p>
                    <button className="btn btn--primary" onClick={refresh} style={{ marginTop: '1rem' }}>
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="page page--offset">
                <div className="shell empty">
                    <span className="empty__icon"><Icon name="film" size={30} /></span>
                    <h2 className="empty__title">No titles in the library yet</h2>
                    <p className="empty__text">
                        Once movies are added to the collection they will show up here, sorted into rows by genre.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Hero movies={featured} onOpen={setSelected} />

            <div className="home__rows">
                {continueWatching.length > 0 && (
                    <MovieRow
                        title="Continue watching"
                        icon="clock"
                        subtitle="Pick up where you left off"
                        movies={continueWatching}
                        onOpen={setSelected}
                    />
                )}

                {auth && recommended.length > 0 && (
                    <MovieRow
                        title="Recommended for you"
                        icon="sparkle"
                        subtitle="Matched to your favourite genres and ranked by review sentiment"
                        movies={recommended}
                        onOpen={setSelected}
                        viewAllTo="/recommended"
                    />
                )}

                <MovieRow
                    title="Top rated"
                    icon="flame"
                    subtitle="The highest-scoring titles in the collection"
                    movies={topRated.slice(0, 12)}
                    onOpen={setSelected}
                    viewAllTo="/browse"
                />

                {myList.length > 0 && (
                    <MovieRow
                        title="My list"
                        icon="bookmark"
                        subtitle="Saved for later"
                        movies={myList}
                        onOpen={setSelected}
                        viewAllTo="/my-list"
                    />
                )}

                {genreRows.map(({ genre, movies: rowMovies }) => (
                    <MovieRow
                        key={genre.genre_name}
                        title={genre.genre_name}
                        icon="film"
                        movies={rowMovies}
                        onOpen={setSelected}
                        viewAllTo={`/browse?genre=${encodeURIComponent(genre.genre_name)}`}
                    />
                ))}
            </div>

            {!auth && (
                <section className="shell">
                    <div className="home__cta">
                        <div>
                            <span className="section-eyebrow">Personalised streaming</span>
                            <h2>Get picks chosen for your taste</h2>
                            <p>
                                Create an account, tell us the genres you love, and Personal Stream will surface
                                titles ranked by our AI-scored curator reviews.
                            </p>
                        </div>
                        <div className="home__cta-actions">
                            <Link className="btn btn--primary btn--lg" to="/register">Create free account</Link>
                            <Link className="btn btn--ghost btn--lg" to="/login">Sign in</Link>
                        </div>
                    </div>
                </section>
            )}

            <MovieModal movie={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default Home;
