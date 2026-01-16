import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import './Login.css';

const Login = () => {
    const [loginType, setLoginType] = useState('admin'); // admin or school
    const [email, setEmail] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = loginType === 'admin'
            ? { email, password }
            : { schoolId, password };

        const result = await login(credentials, loginType);

        setLoading(false);

        if (result.success) {
            navigate(`/${loginType}`);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Theme Toggle */}
                <button
                    className="login-theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Logo */}
                <motion.div
                    className="login-logo"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <img src={logoImg} alt="JaagrMind" className="login-logo-img" />
                </motion.div>

                <p className="login-subtitle">
                    Student Mental Wellness Platform
                </p>

                {/* Login Type Tabs */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
                        onClick={() => setLoginType('admin')}
                    >
                        🔑 Admin
                    </button>
                    <button
                        className={`login-tab ${loginType === 'school' ? 'active' : ''}`}
                        onClick={() => setLoginType('school')}
                    >
                        🏫 School
                    </button>
                </div>

                {error && (
                    <motion.div
                        className="login-error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {loginType === 'admin' ? (
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">School ID</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="SCHOOL ID"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg login-btn"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span className="login-spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                <div className="login-footer">
                    <p>Students? <a href="/student/login">Enter with Access ID →</a></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
