import { useCallback, useEffect, useRef, useState } from 'react';
import useAuth from './useAuth';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Personalised picks from the protected `/recommended` endpoint. The backend
 * matches the signed-in user's favourite genres and orders by the ranking value
 * that Gemini assigns to each curator review.
 */
const useRecommended = (enabled = true) => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    /* useAxiosPrivate hands back a fresh instance each render, so keep it in a
       ref rather than listing it as an effect dependency. */
    const clientRef = useRef(axiosPrivate);
    clientRef.current = axiosPrivate;

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userId = auth?.user_id;

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        try {
            const response = await clientRef.current.get('/recommended');
            const list = response.data?.data ?? response.data ?? [];
            if (!signal?.aborted) setMovies(Array.isArray(list) ? list : []);
        } catch (err) {
            if (signal?.aborted) return;
            console.error('Error fetching recommendations:', err);
            setError(
                err.response?.data?.error ??
                'We could not load your recommendations right now.'
            );
            setMovies([]);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled || !userId) {
            setMovies([]);
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [enabled, userId, load]);

    return { movies, loading, error, refresh: () => load() };
};

export default useRecommended;
