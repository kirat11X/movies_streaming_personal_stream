import Movie from '../movie/Movie';
import Icon from '../ui/Icon';
import './Movies.css';

/** Responsive poster grid used by Browse, My List and Recommended. */
const Movies = ({ movies, message, onOpen, emptyIcon = 'film', emptyTitle, emptyText }) => {
    if (!movies || movies.length === 0) {
        return (
            <div className="empty">
                <span className="empty__icon"><Icon name={emptyIcon} size={30} /></span>
                <h2 className="empty__title">{emptyTitle || message || 'Nothing here yet'}</h2>
                <p className="empty__text">
                    {emptyText || 'New titles are added to the library regularly — check back soon.'}
                </p>
            </div>
        );
    }

    return (
        <div className="poster-grid">
            {movies.map((movie, i) => (
                <Movie key={movie._id ?? movie.imdb_id} movie={movie} onOpen={onOpen} index={i} />
            ))}
        </div>
    );
};

export default Movies;
