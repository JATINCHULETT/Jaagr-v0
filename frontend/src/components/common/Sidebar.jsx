import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import './Sidebar.css';

const adminMenuItems = [
    { path: '/admin', icon: '🏠', label: 'Dashboard', exact: true },
    { path: '/admin/schools', icon: '🏫', label: 'Schools' },
    { path: '/admin/assessments', icon: '📝', label: 'Assessments' },
    { path: '/admin/analytics', icon: '📊', label: 'Analytics' },
];

const schoolMenuItems = [
    { path: '/school', icon: '🏠', label: 'Dashboard', exact: true },
    { path: '/school/students', icon: '👨‍🎓', label: 'Students' },
    { path: '/school/tests', icon: '📝', label: 'Tests' },
    { path: '/school/analytics', icon: '📊', label: 'Analytics' },
];

const Sidebar = () => {
    const { user, logout, isAdmin, isSchool } = useAuth();
    const navigate = useNavigate();

    const menuItems = isAdmin ? adminMenuItems : isSchool ? schoolMenuItems : [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <motion.div
                    className="sidebar-logo"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <img src={logoImg} alt="JaagrMind" className="sidebar-logo-img" />
                </motion.div>
            </div>

            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                                end={item.exact}
                            >
                                <motion.div
                                    className="sidebar-link-content"
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    <span className="sidebar-label">{item.label}</span>
                                </motion.div>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* School Logo if logged in as school */}
            {isSchool && user?.logo && (
                <div className="sidebar-school-logo">
                    <img src={user.logo} alt={user.name} />
                    <span className="sidebar-school-name">{user.name}</span>
                </div>
            )}

            <div className="sidebar-footer">
                <button className="sidebar-logout-btn" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
