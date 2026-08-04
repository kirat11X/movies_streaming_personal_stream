import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Movies from '../movies/Movies';
import MovieModal from '../movie/MovieModal';
import MovieRow from '../rows/MovieRow';
import PageHeader from '../ui/PageHeader';
import Skeleton from '../spinner/Skeleton';
import Icon from '../ui/Icon';
import useMovies from '../../hooks/useMovies';
import useMyList from '../../hooks/useMyList';

/** Locally saved bookmarks plus recent watch history. */
const MyList = () => {
    const { movies, loading } = useMovies();
    const { listIds, historyIds, resolve, clearList } = useMyList();
    const [selected, setSelected] = useState(null);

    const saved = useMemo(() => resolve(listIds, movies), [listIds, movies, resolve]);
    const recent = useMemo(() => resolve(historyIds, movies), [historyIds, movies, resolve]);

    return (
        <div className="page page--offset">
            <div className="shell">
                <PageHeader
                    eyebrow="Saved on this device"
                    icon="bookmark"
                    title="My List"
                    count={loading ? undefined : saved.length}
                    description="Titles you've bookmarked, kept in this browser. Add anything to your list with the + button on a poster."
                >
                    {saved.length > 0 && (
                        <button className="btn btn--ghost btn--sm" onClick={clearList}>
                            <Icon name="trash" size={16} /> Clear list
                        </button>
                    )}
                </PageHeader>

                {loading ? (
                    <Skeleton count={10} />
                ) : (
                    <Movies
                        movies={saved}
                        onOpen={setSelected}
                        emptyIcon="bookmark"
                        emptyTitle="Your list is empty"
                        emptyText="Hover any poster and press + to save it here for later."
                    />
                )}

                {!loading && saved.length === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Link className="btn btn--primary" to="/browse">Browse the library</Link>
                    </div>
                )}
            </div>

            {!loading && recent.length > 0 && (
                <div style={{ marginTop: '3.5rem' }}>
                    <MovieRow
                        title="Recently watched"
                        icon="clock"
                        subtitle="From your viewing history on this device"
                        movies={recent}
                        onOpen={setSelected}
                    />
                </div>
            )}

            <MovieModal movie={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

export default MyList;
