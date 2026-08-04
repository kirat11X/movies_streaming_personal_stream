import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';
import AuthLayout from '../auth/AuthLayout';
import Icon from '../ui/Icon';

const FALLBACK_GENRES = [
    { genre_id: 1, genre_name: 'Comedy' },
    { genre_id: 5, genre_name: 'Thriller' },
    { genre_id: 6, genre_name: 'Sci-Fi' },
];

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [favouriteGenres, setFavouriteGenres] = useState([]);
    const [genres, setGenres] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axiosClient.get('/genres');
                const list = response.data?.data ?? response.data ?? [];
                setGenres(Array.isArray(list) && list.length ? list : FALLBACK_GENRES);
            } catch {
                setGenres(FALLBACK_GENRES);
            }
        };
        fetchGenres();
    }, []);

    const toggleGenre = (genre) => {
        setFavouriteGenres((current) =>
            current.some((g) => g.genre_id === genre.genre_id)
                ? current.filter((g) => g.genre_id !== genre.genre_id)
                : [...current, { genre_id: Number(genre.genre_id), genre_name: genre.genre_name }]
        );
    };

    const passwordTooShort = Boolean(password) && password.length < 6;
    const passwordsDiffer = Boolean(confirmPassword) && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (favouriteGenres.length === 0) {
            setError('Pick at least one favourite genre so we can tailor your recommendations.');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosClient.post('/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                favourite_genres: favouriteGenres,
            });
            if (response.data.error) {
                setError(response.data.error);
                return;
            }
            navigate('/login', { replace: true });
        } catch (err) {
            const backendMsg =
                err.response?.data?.error ||
                err.response?.data?.details ||
                err.response?.data?.message;
            setError(backendMsg || 'Registration failed. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Tell us what you like and we'll do the rest."
            footer={
                <>
                    Already have an account? <Link to="/login" className="auth__link">Sign in</Link>
                </>
            }
        >
            {error && (
                <div className="notice notice--error" role="alert">
                    <Icon name="alert" size={17} /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="auth__row">
                    <div className="field">
                        <label className="field__label" htmlFor="reg-first">First name</label>
                        <input
                            id="reg-first"
                            className="input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            minLength={2}
                            maxLength={100}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="reg-last">Last name</label>
                        <input
                            id="reg-last"
                            className="input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            minLength={2}
                            maxLength={100}
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="field__label" htmlFor="reg-email">Email address</label>
                    <input
                        id="reg-email"
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="field">
                    <label className="field__label" htmlFor="reg-password">Password</label>
                    <div className="auth__password">
                        <input
                            id="reg-password"
                            className={`input ${passwordTooShort ? 'input--invalid' : ''}`}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                        <button
                            type="button"
                            className="auth__reveal"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                        </button>
                    </div>
                    {passwordTooShort && <span className="field__error">Must be at least 6 characters.</span>}
                </div>

                <div className="field">
                    <label className="field__label" htmlFor="reg-confirm">Confirm password</label>
                    <input
                        id="reg-confirm"
                        className={`input ${passwordsDiffer ? 'input--invalid' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        required
                    />
                    {passwordsDiffer && <span className="field__error">Passwords do not match.</span>}
                </div>

                <div className="field">
                    <label className="field__label">
                        Favourite genres {favouriteGenres.length > 0 && `(${favouriteGenres.length} selected)`}
                    </label>
                    <div className="genre-picker">
                        {genres.map((genre) => {
                            const selected = favouriteGenres.some((g) => g.genre_id === genre.genre_id);
                            return (
                                <button
                                    key={genre.genre_name}
                                    type="button"
                                    className={`genre-picker__chip ${selected ? 'is-selected' : ''}`}
                                    onClick={() => toggleGenre(genre)}
                                    aria-pressed={selected}
                                >
                                    {selected && <Icon name="check" size={13} strokeWidth={2.6} />}
                                    {genre.genre_name}
                                </button>
                            );
                        })}
                    </div>
                    <span className="field__hint">
                        These drive your personalised Recommended page. Pick as many as you like.
                    </span>
                </div>

                <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Register;
