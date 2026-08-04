import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './header/Header';
import Footer from './footer/Footer';

/** Chrome shared by every in-app page: sticky header, content, footer. */
const Layout = ({ handleLogout }) => {
    const { pathname } = useLocation();

    /* Land at the top of each newly opened page. */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }, [pathname]);

    return (
        <>
            <Header handleLogout={handleLogout} />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Layout;
