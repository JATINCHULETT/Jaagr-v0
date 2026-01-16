import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, title, subtitle }) => {
    return (
        <div className="layout">
            <Sidebar />
            <Header title={title} subtitle={subtitle} />
            <main className="layout-main">
                {children}
            </main>
        </div>
    );
};

export default Layout;
