import { useCallback, useEffect, useRef, useState } from 'react';
import useAxiosPrivate from './useAxiosPrivate';

/** Curator's inbox: every title suggestion submitted by signed-in viewers, newest first. */
const useSuggestions = (enabled = true) => {
    const axiosPrivate = useAxiosPrivate();

    /* useAxiosPrivate hands back a fresh instance each render, so keep it in a
       ref rather than listing it as an effect dependency. */
    const clientRef = useRef(axiosPrivate);
    clientRef.current = axiosPrivate;

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        try {
            const response = await clientRef.current.get('/suggestions');
            const list = response.data?.data ?? response.data ?? [];
            if (!signal?.aborted) setSuggestions(Array.isArray(list) ? list : []);
        } catch (err) {
            if (signal?.aborted) return;
            setError(err.response?.data?.error ?? 'Could not load suggestions right now.');
            setSuggestions([]);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [enabled, load]);

    return { suggestions, loading, error, refresh: () => load() };
};

export default useSuggestions;
