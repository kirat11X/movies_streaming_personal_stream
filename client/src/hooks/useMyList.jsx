import { useCallback, useEffect, useState } from 'react';

const LIST_KEY = 'ps:my-list';
const HISTORY_KEY = 'ps:watch-history';
const HISTORY_LIMIT = 12;

const read = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* Storage full or unavailable (private mode) — the list is a nicety, not critical. */
    }
};

/** Broadcast so every mounted copy of the hook stays in sync within the tab. */
const notify = (key) => window.dispatchEvent(new CustomEvent('ps:storage', { detail: key }));

const useStoredIds = (key) => {
    const [ids, setIds] = useState(() => read(key));

    useEffect(() => {
        const sync = (e) => {
            if (e.type === 'storage' && e.key !== key) return;
            if (e.type === 'ps:storage' && e.detail !== key) return;
            setIds(read(key));
        };
        window.addEventListener('storage', sync);
        window.addEventListener('ps:storage', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('ps:storage', sync);
        };
    }, [key]);

    const persist = useCallback((next) => {
        write(key, next);
        setIds(next);
        notify(key);
    }, [key]);

    return [ids, persist];
};

/**
 * "My List" bookmarks and "Continue watching" history, both kept client-side in
 * localStorage and keyed by imdb_id.
 */
const useMyList = () => {
    const [listIds, setListIds] = useStoredIds(LIST_KEY);
    const [historyIds, setHistoryIds] = useStoredIds(HISTORY_KEY);

    const inList = useCallback((imdbId) => listIds.includes(imdbId), [listIds]);

    const toggleList = useCallback((imdbId) => {
        if (!imdbId) return;
        setListIds(listIds.includes(imdbId)
            ? listIds.filter((id) => id !== imdbId)
            : [imdbId, ...listIds]);
    }, [listIds, setListIds]);

    const clearList = useCallback(() => setListIds([]), [setListIds]);

    const recordWatch = useCallback((imdbId) => {
        if (!imdbId) return;
        setHistoryIds([imdbId, ...historyIds.filter((id) => id !== imdbId)].slice(0, HISTORY_LIMIT));
    }, [historyIds, setHistoryIds]);

    /** Resolve stored ids back to movie objects, preserving stored order. */
    const resolve = useCallback((ids, movies) => {
        const byId = new Map(movies.map((m) => [m.imdb_id, m]));
        return ids.map((id) => byId.get(id)).filter(Boolean);
    }, []);

    return { listIds, historyIds, inList, toggleList, clearList, recordWatch, resolve };
};

export default useMyList;
