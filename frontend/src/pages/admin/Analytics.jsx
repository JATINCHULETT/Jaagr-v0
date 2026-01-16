import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../../components/common/Layout';
import api from '../../services/api';
import './Analytics.css';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        schoolId: '',
        startDate: '',
        endDate: '',
        bucket: '',
        className: ''
    });

    useEffect(() => {
        fetchSchools();
        fetchAnalytics();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await api.get('/api/admin/schools');
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.schoolId) params.append('schoolId', filters.schoolId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.bucket) params.append('bucket', filters.bucket);
            if (filters.className) params.append('className', filters.className);

            const response = await api.get(`/api/admin/analytics?${params}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.schoolId) params.append('schoolId', filters.schoolId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.bucket) params.append('bucket', filters.bucket);

            const response = await api.get(`/api/admin/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'jaagrmind-analytics.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Error exporting data');
        }
    };

    const applyFilters = () => {
        fetchAnalytics();
    };

    const clearFilters = () => {
        setFilters({
            schoolId: '',
            startDate: '',
            endDate: '',
            bucket: '',
            className: ''
        });
        setTimeout(fetchAnalytics, 100);
    };

    // Prepare chart data
    const bucketData = data?.bucketDistribution
        ? Object.entries(data.bucketDistribution).map(([name, value]) => ({
            name: name.replace('Skill ', ''),
            value,
            color: name.includes('Stable') ? '#10B981' :
                name.includes('Emerging') ? '#F59E0B' : '#EF4444'
        }))
        : [];

    const schoolBarData = data?.schoolBreakdown
        ? Object.entries(data.schoolBreakdown).map(([name, stats]) => ({
            name: name.length > 15 ? name.substring(0, 15) + '...' : name,
            total: stats.total
        }))
        : [];

    const classBarData = data?.classBreakdown
        ? Object.entries(data.classBreakdown)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, stats]) => ({
                name,
                total: stats.total,
                avgScore: stats.avgScore
            }))
        : [];

    // Get unique classes from class breakdown
    const uniqueClasses = data?.classBreakdown
        ? Object.keys(data.classBreakdown).sort()
        : [];

    return (
        <Layout title="Analytics" subtitle="View and export student wellness data">
            {/* Filters */}
            <div className="filter-section">
                <div className="filter-bar">
                    <select
                        className="form-input"
                        value={filters.schoolId}
                        onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
                    >
                        <option value="">All Schools</option>
                        {schools.map(school => (
                            <option key={school._id} value={school._id}>{school.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-input"
                        value={filters.className}
                        onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                    >
                        <option value="">All Classes</option>
                        {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="form-input"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        className="form-input"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        placeholder="End Date"
                    />

                    <select
                        className="form-input"
                        value={filters.bucket}
                        onChange={(e) => setFilters({ ...filters, bucket: e.target.value })}
                    >
                        <option value="">All Buckets</option>
                        <option value="Skill Stable">Skill Stable</option>
                        <option value="Skill Emerging">Skill Emerging</option>
                        <option value="Skill Support Needed">Support Needed</option>
                    </select>
                </div>

                <div className="filter-actions">
                    <motion.button
                        className="btn btn-secondary btn-sm"
                        onClick={applyFilters}
                        whileHover={{ scale: 1.02 }}
                    >
                        Apply Filters
                    </motion.button>
                    <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                        Clear
                    </button>
                    <motion.button
                        className="btn btn-primary btn-sm"
                        onClick={handleExport}
                        whileHover={{ scale: 1.02 }}
                    >
                        📥 Export Excel
                    </motion.button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="analytics-stats">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="stat-icon">📊</div>
                            <div className="stat-value">{data?.totalSubmissions || 0}</div>
                            <div className="stat-label">Total Submissions</div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="stat-icon">📈</div>
                            <div className="stat-value">{data?.avgScore || 0}</div>
                            <div className="stat-label">Avg Total Score</div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-value">{Math.round((data?.avgTimeTaken || 0) / 60)}m</div>
                            <div className="stat-label">Avg Time Taken</div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="stat-icon">🎯</div>
                            <div className="stat-value">
                                {data?.bucketDistribution?.['Skill Support Needed'] || 0}
                            </div>
                            <div className="stat-label">Need Support</div>
                        </motion.div>
                    </div>

                    {/* Charts */}
                    <div className="charts-grid">
                        <motion.div
                            className="chart-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="chart-title">Wellness Distribution</h3>
                            {bucketData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={bucketData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {bucketData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">No data available</div>
                            )}
                        </motion.div>

                        <motion.div
                            className="chart-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="chart-title">Submissions by School</h3>
                            {schoolBarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={schoolBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#B993E9" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">No data available</div>
                            )}
                        </motion.div>
                    </div>

                    {/* Class Breakdown */}
                    <motion.div
                        className="chart-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        style={{ marginBottom: '24px' }}
                    >
                        <h3 className="chart-title">Class-wise Breakdown</h3>
                        {classBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={classBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#B993E9" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                                    <Tooltip />
                                    <Bar yAxisId="left" dataKey="total" name="Total Submissions" fill="#B993E9" radius={[8, 8, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="avgScore" name="Avg Score" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="chart-empty">No data available</div>
                        )}
                    </motion.div>

                    {/* Recent Submissions Table */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="card-header">
                            <h3 className="card-title">Recent Submissions</h3>
                        </div>

                        {data?.recentSubmissions?.length > 0 ? (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>School</th>
                                            <th>Class</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentSubmissions.map((sub) => (
                                            <tr key={sub._id}>
                                                <td>{sub.studentId?.name || 'N/A'}</td>
                                                <td>{sub.schoolId?.name || 'N/A'}</td>
                                                <td>{sub.studentId?.class} {sub.studentId?.section}</td>
                                                <td>{sub.totalScore}</td>
                                                <td>
                                                    <span className={`badge ${sub.assignedBucket?.includes('Stable') ? 'badge-success' :
                                                        sub.assignedBucket?.includes('Emerging') ? 'badge-warning' : 'badge-danger'
                                                        }`}>
                                                        {sub.assignedBucket?.replace('Skill ', '')}
                                                    </span>
                                                </td>
                                                <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No submissions yet</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </Layout>
    );
};

export default Analytics;
