import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Movies from '../movies/Movies';
import MovieModal from '../movie/MovieModal';
import PageHeader from '../ui/PageHeader';
import Skeleton from '../spinner/Skeleton';
import Icon from '../ui/Icon';
import useMovies from '../../hooks/useMovies';
import { hasGenre } from '../../utils/genres';
import './Browse.css';

const SORTS = {
    rank: { label: 'Best rated', fn: (a, b) => (a.ranking?.ranking_value ?? 999) - (b.ranking?.ranking_value ?? 999) },
    title: { label: 'A–Z', fn: (a, b) => (a.title ?? '').localeCompare(b.title ?? '') },
};

const Browse = () => {
    const { movies, genres, loading, error, refresh } = useMovies();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selected, setSelected] = useState(null);

    const query = searchParams.get('q') ?? '';
    const activeGenre = searchParams.get('genre') ?? '';
    const sortKey = SORTS[searchParams.get('sort')] ? searchParams.get('sort') : 'rank';

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next, { replace: true });
    };

    const results = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return movies
            .filter((movie) => {
                if (activeGenre && !hasGenre(movie, activeGenre)) {
                    return false;
                }
                if (!needle) return true;
                const haystack = [
                    movie.title,
                    movie.imdb_id,
                    movie.admin_review,
                    movie.ranking?.ranking_name,
                    ...(movie.genre ?? []).map((g) => g.genre_name),
                ].filter(Boolean).join(' ').toLowerCase();
                return haystack.includes(needle);
            })
            .sort(SORTS[sortKey].fn);
    }, [movies, query, activeGenre, sortKey]);

    const filtered = Boolean(query || activeGenre);

    return (
        <div className="page page--offset">
            <div className="shell">
                <PageHeader
                    eyebrow="The full library"
                    icon="grid"
                    title="Browse"
                    count={loading ? undefined : results.length}
                    description="Search the whole collection, narrow it down by genre, and open any title for the full curator review."
                >
                    <div className="browse__controls">
                        <div className="browse__search">
                            <Icon name="search" size={18} />
                            <input
                                className="input"
                                type="search"
                                value={query}
                                placeholder="Search by title, genre, review or IMDb ID…"
                                aria-label="Search the library"
                                onChange={(e) => setParam('q', e.target.value)}
                            />
                        </div>

                        <div className="browse__sort">
                            {Object.entries(SORTS).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`browse__sort-btn ${sortKey === key ? 'is-active' : ''}`}
                                    onClick={() => setParam('sort', key === 'rank' ? '' : key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {genres.length > 0 && (
                        <div className="browse__genres">
                            <button
                                type="button"
                                className={`browse__genre ${!activeGenre ? 'is-active' : ''}`}
                                onClick={() => setParam('genre', '')}
                            >
                                All genres
                            </button>
                            {genres.map((genre) => (
                                <button
                                    key={genre.genre_name}
                                    type="button"
                                    className={`browse__genre ${activeGenre === genre.genre_name ? 'is-active' : ''}`}
                                    onClick={() => setParam('genre', activeGenre === genre.genre_name ? '' : genre.genre_name)}
                                >
                                    {genre.genre_name}
                                </button>
                            ))}
                        </div>
                    )}
                </PageHeader>

                {loading && <Skeleton count={12} />}

                {!loading && error && (
                    <div className="empty">
                        <span className="empty__icon"><Icon name="alert" size={30} /></span>
                        <h2 className="empty__title">The library is out of reach</h2>
                        <p className="empty__text">{error}</p>
                        <button className="btn btn--primary" onClick={refresh} style={{ marginTop: '1rem' }}>
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <Movies
                        movies={results}
                        onOpen={setSelected}
                        emptyIcon={filtered ? 'search' : 'film'}
                        emptyTitle={filtered ? 'No titles match those filters' : 'The library is empty'}
                        emptyText={
                            filtered
                                ? 'Try a different search term, or clear the genre filter to see everything.'
                                : 'Once movies are added to the collection they will appear here.'
                        }
                    />
                )}
            </div>

            <MovieModal movie={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default Browse;
