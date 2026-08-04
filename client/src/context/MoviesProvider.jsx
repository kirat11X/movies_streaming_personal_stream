import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosConfig';

const MoviesContext = createContext({});

/**
 * Fetches the catalogue once and shares it across Home / Browse / My List so
 * navigating between pages doesn't re-hit the API.
 */
export const MoviesProvider = ({ children }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosClient.get('/movies');
            const list = response.data?.data ?? response.data ?? [];
            setMovies(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError(
                err.response?.data?.error ??
                'We could not reach the library. Check that the server is running and try again.'
            );
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    /**
     * Every distinct genre in the catalogue, alphabetised. Deduplicated on a
     * lowercased name because the collection contains casing variants of the
     * same genre (e.g. "Sci-Fi" and "Sci-fi"), which would otherwise surface as
     * two separate filters.
     */
    const genres = useMemo(() => {
        const seen = new Map();
        movies.forEach((movie) => {
            (movie.genre ?? []).forEach((g) => {
                const key = g?.genre_name?.toLowerCase();
                if (key && !seen.has(key)) seen.set(key, g);
            });
        });
        return [...seen.values()].sort((a, b) => a.genre_name.localeCompare(b.genre_name));
    }, [movies]);

    const value = useMemo(
        () => ({ movies, genres, loading, error, refresh: load }),
        [movies, genres, loading, error, load]
    );

    return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
};

export default MoviesContext;
