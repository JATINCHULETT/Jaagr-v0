import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faEnvelope, faShieldHalved, faKey, faSave } from '@fortawesome/free-solid-svg-icons';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Settings.css';

const Settings = () => {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            // Determine endpoint based on role
            const endpoint = user.role === 'admin'
                ? '/api/admin/change-password'
                : '/api/school/change-password';

            await api.put(endpoint, {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error updating password'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <Layout title="Settings" subtitle="Manage your profile and security">
            <div className="settings-container">
                {/* Profile Card */}
                <motion.div
                    className="settings-card profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-header">
                        <h2><FontAwesomeIcon icon={faUser} /> Profile Information</h2>
                    </div>
                    <div className="profile-details">
                        <div className="profile-item">
                            <span className="profile-label">
                                <FontAwesomeIcon icon={user?.role === 'school' ? faBuilding : faUser} />
                                {user?.role === 'school' ? ' School Name' : ' Name'}
                            </span>
                            <span className="profile-value">{user?.name || user?.schoolId}</span>
                        </div>

                        <div className="profile-item">
                            <span className="profile-label">
                                <FontAwesomeIcon icon={faEnvelope} /> Email / ID
                            </span>
                            <span className="profile-value">{user?.email || user?.schoolId}</span>
                        </div>

                        <div className="profile-item">
                            <span className="profile-label">
                                <FontAwesomeIcon icon={faShieldHalved} /> Role
                            </span>
                            <span className="profile-value badge">{user?.role?.toUpperCase()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Password Card */}
                <motion.div
                    className="settings-card password-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="card-header">
                        <h2><FontAwesomeIcon icon={faKey} /> Change Password</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current"
                                value={passwords.current}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="new"
                                value={passwords.new}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Enter new password"
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm"
                                value={passwords.confirm}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Confirm new password"
                            />
                        </div>

                        {message.text && (
                            <div className={`message-alert ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Updating...' : <>
                                    <FontAwesomeIcon icon={faSave} /> Update Password
                                </>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Settings;
