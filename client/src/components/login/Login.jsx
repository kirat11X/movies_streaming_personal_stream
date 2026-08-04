import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../auth/AuthLayout';
import Icon from '../ui/Icon';

const Login = () => {
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post('/login', { email, password });
            if (response.data.error) {
                setError(response.data.error);
                return;
            }
            setAuth(response.data);
            navigate(from, { replace: true });
        } catch (err) {
            const backendMsg = err.response?.data?.error || err.response?.data?.message;
            setError(backendMsg || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to pick up where you left off."
            footer={
                <>
                    Don't have an account? <Link to="/register" className="auth__link">Create one</Link>
                </>
            }
        >
            <div className="auth__hint">
                <div className="auth__hint-title"><Icon name="sparkle" size={13} /> First time here?</div>
                <ul>
                    <li>
                        <Link to="/register" className="auth__link">Create an account</Link> and pick your
                        favourite genres — that's what powers your Recommended page.
                    </li>
                </ul>
            </div>

            {error && (
                <div className="notice notice--error" role="alert">
                    <Icon name="alert" size={17} /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate={false}>
                <div className="field">
                    <label className="field__label" htmlFor="login-email">Email address</label>
                    <input
                        id="login-email"
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        autoFocus
                    />
                </div>

                <div className="field">
                    <label className="field__label" htmlFor="login-password">Password</label>
                    <div className="auth__password">
                        <input
                            id="login-password"
                            className="input"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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
                </div>

                <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
