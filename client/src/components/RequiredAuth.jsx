import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './spinner/Spinner';

const RequiredAuth = () => {
    const { auth, loading } = useAuth();
    const location = useLocation();

    /* Wait for the stored session to be restored before deciding. */
    if (loading) {
        return (
            <div className="page page--offset">
                <Spinner label="Checking your session" full />
            </div>
        );
    }

    return auth
        ? <Outlet />
        : <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequiredAuth;
