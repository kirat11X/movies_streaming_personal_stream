import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useMovies from '../../hooks/useMovies';
import useSuggestions from '../../hooks/useSuggestions';
import PageHeader from '../ui/PageHeader';
import Icon from '../ui/Icon';
import Spinner from '../spinner/Spinner';
import './AdminPanel.css';

const EMPTY_FORM = { title: '', imdbId: '', posterPath: '', youtubeId: '', adminReview: '' };

const TABS = [
    { key: 'add', label: 'Add movie', icon: 'plus' },
    { key: 'suggestions', label: 'Suggestions', icon: 'message' },
];

const NOT_RANKED = 999;

/** Curator workspace: add titles to the catalogue and review viewer suggestions. */
const AdminPanel = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const { refresh: refreshMovies } = useMovies();

    const [activeTab, setActiveTab] = useState('add');

    const [genres, setGenres] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [rankingValue, setRankingValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const {
        suggestions,
        loading: suggestionsLoading,
        error: suggestionsError,
        refresh: refreshSuggestions,
    } = useSuggestions(activeTab === 'suggestions');

    /* Genres and ranking tiers come from public reference endpoints — no auth needed to read them. */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [genresRes, rankingsRes] = await Promise.all([
                    axiosClient.get('/genres'),
                    axiosClient.get('/rankings'),
                ]);
                if (cancelled) return;
                const genreList = genresRes.data?.data ?? genresRes.data ?? [];
                const rankingList = rankingsRes.data?.data ?? rankingsRes.data ?? [];
                setGenres(Array.isArray(genreList) ? genreList : []);
                setRankings(Array.isArray(rankingList) ? rankingList : []);
                const fallback = rankingList.find((r) => r.ranking_value === NOT_RANKED) ?? rankingList[0];
                if (fallback) setRankingValue(String(fallback.ranking_value));
            } catch {
                /* Non-fatal — the form still works, just without picker options. */
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (auth?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const toggleGenre = (genre) => {
        setSelectedGenres((current) =>
            current.some((g) => g.genre_id === genre.genre_id)
                ? current.filter((g) => g.genre_id !== genre.genre_id)
                : [...current, { genre_id: Number(genre.genre_id), genre_name: genre.genre_name }]
        );
    };

    const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setSelectedGenres([]);
        const fallback = rankings.find((r) => r.ranking_value === NOT_RANKED) ?? rankings[0];
        setRankingValue(fallback ? String(fallback.ranking_value) : '');
    };

    const submitMovie = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (selectedGenres.length === 0) {
            setFormError('Pick at least one genre.');
            return;
        }
        const ranking = rankings.find((r) => String(r.ranking_value) === rankingValue);
        if (!ranking) {
            setFormError('Choose a rating signal.');
            return;
        }

        setSaving(true);
        try {
            const title = form.title.trim();
            await axiosPrivate.post('/addmovie', {
                imdb_id: form.imdbId.trim(),
                title,
                poster_path: form.posterPath.trim(),
                youtube_id: form.youtubeId.trim(),
                genre: selectedGenres,
                admin_review: form.adminReview.trim(),
                ranking: { ranking_value: ranking.ranking_value, ranking_name: ranking.ranking_name },
            });
            setFormSuccess(`"${title}" was added to the catalogue.`);
            resetForm();
            refreshMovies();
        } catch (err) {
            setFormError(
                err.response?.data?.details ||
                err.response?.data?.error ||
                'Could not add this title. Please check the details and try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page page--offset">
            <div className="shell">
                <PageHeader
                    eyebrow="Curator tools"
                    icon="shield"
                    title="Admin"
                    description="Add new titles with a curator review, and see what viewers are asking for."
                />

                <div className="admin-tabs" role="tablist" aria-label="Admin sections">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            className={`admin-tabs__btn ${activeTab === tab.key ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <Icon name={tab.icon} size={16} /> {tab.label}
                            {tab.key === 'suggestions' && suggestions.length > 0 && (
                                <span className="admin-tabs__count">{suggestions.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'add' && (
                    <form className="admin-form" onSubmit={submitMovie}>
                        {formError && (
                            <div className="notice notice--error" role="alert">
                                <Icon name="alert" size={16} /> <span>{formError}</span>
                            </div>
                        )}
                        {formSuccess && (
                            <div className="notice notice--info" role="status">
                                <Icon name="check" size={16} /> <span>{formSuccess}</span>
                            </div>
                        )}

                        <div className="admin-form__row">
                            <div className="field">
                                <label className="field__label" htmlFor="admin-title">Title</label>
                                <input
                                    id="admin-title"
                                    className="input"
                                    value={form.title}
                                    onChange={updateField('title')}
                                    placeholder="The Hangover"
                                    minLength={2}
                                    maxLength={500}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="admin-imdb">IMDb ID</label>
                                <input
                                    id="admin-imdb"
                                    className="input"
                                    value={form.imdbId}
                                    onChange={updateField('imdbId')}
                                    placeholder="tt1119646"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form__row">
                            <div className="field">
                                <label className="field__label" htmlFor="admin-poster">Poster URL</label>
                                <input
                                    id="admin-poster"
                                    className="input"
                                    type="url"
                                    value={form.posterPath}
                                    onChange={updateField('posterPath')}
                                    placeholder="https://…"
                                    required
                                />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="admin-youtube">YouTube ID</label>
                                <input
                                    id="admin-youtube"
                                    className="input"
                                    value={form.youtubeId}
                                    onChange={updateField('youtubeId')}
                                    placeholder="dQw4w9WgXcQ"
                                    required
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="field__label">
                                Genres {selectedGenres.length > 0 && `(${selectedGenres.length} selected)`}
                            </label>
                            <div className="admin-genres">
                                {genres.map((genre) => {
                                    const selected = selectedGenres.some((g) => g.genre_id === genre.genre_id);
                                    return (
                                        <button
                                            key={genre.genre_id ?? genre.genre_name}
                                            type="button"
                                            className={`admin-genres__chip ${selected ? 'is-selected' : ''}`}
                                            onClick={() => toggleGenre(genre)}
                                            aria-pressed={selected}
                                        >
                                            {selected && <Icon name="check" size={12} strokeWidth={2.6} />}
                                            {genre.genre_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="field">
                            <label className="field__label" htmlFor="admin-ranking">Rating signal</label>
                            <select
                                id="admin-ranking"
                                className="input"
                                value={rankingValue}
                                onChange={(e) => setRankingValue(e.target.value)}
                            >
                                {rankings.map((r) => (
                                    <option key={r.ranking_value} value={r.ranking_value}>
                                        {r.ranking_name.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                            <span className="field__hint">
                                A written review lets viewers see your take right away; leave this as "Not ranked" until you've formed one.
                            </span>
                        </div>

                        <div className="field">
                            <label className="field__label" htmlFor="admin-review">Curator review (optional)</label>
                            <textarea
                                id="admin-review"
                                className="input"
                                rows={4}
                                maxLength={2000}
                                value={form.adminReview}
                                onChange={updateField('adminReview')}
                                placeholder="Write a curator review for this title…"
                            />
                        </div>

                        <button type="submit" className="btn btn--primary btn--lg" disabled={saving}>
                            <Icon name="plus" size={17} /> {saving ? 'Adding…' : 'Add to catalogue'}
                        </button>
                    </form>
                )}

                {activeTab === 'suggestions' && (
                    <div className="admin-suggestions">
                        {suggestionsLoading && <Spinner label="Loading suggestions" />}

                        {!suggestionsLoading && suggestionsError && (
                            <div className="empty">
                                <span className="empty__icon"><Icon name="alert" size={30} /></span>
                                <h2 className="empty__title">Could not load suggestions</h2>
                                <p className="empty__text">{suggestionsError}</p>
                                <button className="btn btn--primary" onClick={refreshSuggestions} style={{ marginTop: '1rem' }}>
                                    Try again
                                </button>
                            </div>
                        )}

                        {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
                            <div className="empty">
                                <span className="empty__icon"><Icon name="message" size={30} /></span>
                                <h2 className="empty__title">No suggestions yet</h2>
                                <p className="empty__text">
                                    Requests viewers submit from "Suggest a title" will show up here.
                                </p>
                            </div>
                        )}

                        {!suggestionsLoading && !suggestionsError && suggestions.length > 0 && (
                            <ul className="admin-suggestions__list">
                                {suggestions.map((s) => (
                                    <li key={s._id ?? `${s.user_id}-${s.created_at}`} className="admin-suggestions__item">
                                        <div className="admin-suggestions__head">
                                            <strong>{s.title}</strong>
                                            {s.created_at && (
                                                <span className="admin-suggestions__date">
                                                    {new Date(s.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        {s.message && <p className="admin-suggestions__message">{s.message}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
