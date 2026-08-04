import { Route, Routes } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import RequiredAuth from './components/RequiredAuth';
import Home from './components/home/Home';
import Browse from './components/browse/Browse';
import Recommended from './components/recommended/Recommended';
import MyList from './components/mylist/MyList';
import StreamMovie from './components/stream/StreamMovie';
import AdminPanel from './components/admin/AdminPanel';
import SuggestMovie from './components/suggestions/SuggestMovie';
import Login from './components/login/Login';
import Register from './components/register/Register';
import NotFound from './components/notfound/NotFound';

import useAuth from './hooks/useAuth';
import useAxiosPrivate from './hooks/useAxiosPrivate';

function App() {
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const handleLogout = async () => {
        try {
            // /logout sits behind AuthMiddleware, so use the authenticated instance.
            await axiosPrivate.post('/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            // Clear the session locally even if the server call failed.
            setAuth(null);
        }
    };

    return (
        <Routes>
            {/* Auth screens use their own full-bleed layout. */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout handleLogout={handleLogout} />}>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/my-list" element={<MyList />} />

                <Route element={<RequiredAuth />}>
                    <Route path="/recommended" element={<Recommended />} />
                    <Route path="/stream/:yt_id" element={<StreamMovie />} />
                    <Route path="/suggest" element={<SuggestMovie />} />
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
