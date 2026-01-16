import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const SchoolAnalytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classes, setClasses] = useState([]);
    const [uniqueClasses, setUniqueClasses] = useState([]);
    const [filters, setFilters] = useState({ class: '', section: '' });

    // Student details view
    const [showStudents, setShowStudents] = useState(false);
    const [studentsData, setStudentsData] = useState(null);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentFilters, setStudentFilters] = useState({ class: '', section: '', assessmentId: '', search: '' });

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/api/school/classes');
            setClasses(response.data.classes || []);
            setUniqueClasses(response.data.uniqueClasses || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.class) params.append('class', filters.class);
            if (filters.section) params.append('section', filters.section);

            const response = await api.get(`/api/school/analytics?${params.toString()}`);
            setData(response.data);
            setError(null);
        } catch (error) {
            if (error.response?.status === 403) {
                setError('Analytics not available for your school. Please contact admin.');
            } else {
                setError('Error loading analytics');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsData = async (appliedFilters = studentFilters) => {
        setStudentsLoading(true);
        try {
            const params = new URLSearchParams();
            if (appliedFilters.class) params.append('class', appliedFilters.class);
            if (appliedFilters.section) params.append('section', appliedFilters.section);
            if (appliedFilters.assessmentId) params.append('assessmentId', appliedFilters.assessmentId);
            if (appliedFilters.search) params.append('search', appliedFilters.search);

            const response = await api.get(`/api/school/students-analytics?${params.toString()}`);
            setStudentsData(response.data);
        } catch (error) {
            console.error('Error fetching students data:', error);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleViewStudents = async () => {
        setShowStudents(true);
        await fetchStudentsData({});
    };

    const handleStudentFilterChange = (key, value) => {
        const newFilters = { ...studentFilters, [key]: value };
        if (key === 'class') newFilters.section = '';
        setStudentFilters(newFilters);
        fetchStudentsData(newFilters);
    };

    const getSectionsForClass = (className) => {
        if (!className) return [];
        return classes
            .filter(c => c._id.class === className)
            .map(c => c._id.section)
            .filter(Boolean);
    };

    const handleClassChange = (e) => {
        setFilters({ class: e.target.value, section: '' });
    };

    const handleSectionChange = (e) => {
        setFilters({ ...filters, section: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ class: '', section: '' });
    };

    if (loading && !data) {
        return (
            <Layout title="Analytics">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Analytics">
                <motion.div
                    className="card text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '60px 24px' }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>🔒</div>
                    <h3 style={{ marginBottom: '8px' }}>Analytics Restricted</h3>
                    <p className="text-muted">{error}</p>
                </motion.div>
            </Layout>
        );
    }

    const bucketData = data?.bucketDistribution
        ? Object.entries(data.bucketDistribution).map(([name, value]) => ({
            name: name.replace('Skill ', ''),
            value,
            color: name.includes('Stable') ? '#10B981' :
                name.includes('Emerging') ? '#F59E0B' : '#EF4444'
        }))
        : [];

    return (
        <Layout title="School Analytics" subtitle="Student wellness overview">
            {/* Filters */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '24px', padding: '16px 24px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>Filters:</span>
                    <select
                        className="form-input"
                        value={filters.class}
                        onChange={handleClassChange}
                        style={{ width: 'auto', minWidth: '150px' }}
                    >
                        <option value="">All Classes</option>
                        {uniqueClasses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        className="form-input"
                        value={filters.section}
                        onChange={handleSectionChange}
                        style={{ width: 'auto', minWidth: '150px' }}
                        disabled={!filters.class}
                    >
                        <option value="">All Sections</option>
                        {getSectionsForClass(filters.class).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {(filters.class || filters.section) && (
                        <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-primary" onClick={handleViewStudents}>
                            👥 View All Students
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-4 mb-6">
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
                    <div className="stat-label">Average Score</div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{Math.round((data?.avgTimeTaken || 0) / 60)}m</div>
                    <div className="stat-label">Avg Time</div>
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

            {/* Pie Chart */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: '24px' }}
            >
                <h3 className="card-title mb-4">Student Wellness Distribution</h3>
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
                    <div className="empty-state">
                        <p>No data available for selected filters</p>
                    </div>
                )}
            </motion.div>

            {/* Recent Submissions */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="card-title mb-4">Recent Submissions</h3>
                {data?.recentSubmissions?.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSubmissions.map((sub) => (
                                    <tr key={sub._id}>
                                        <td className="font-medium">{sub.studentId?.name || 'N/A'}</td>
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

            {/* Students Detail Modal */}
            {showStudents && (
                <div className="modal-overlay" onClick={() => setShowStudents(false)}>
                    <motion.div
                        className="modal"
                        style={{ width: '95%', maxWidth: '1200px', maxHeight: '90vh' }}
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="modal-header">
                            <h2>👥 All Students - Detailed Analytics</h2>
                            <button className="modal-close" onClick={() => setShowStudents(false)}>×</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', padding: '12px', background: 'var(--primary-bg)', borderRadius: '8px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search name or ID..."
                                    value={studentFilters.search}
                                    onChange={(e) => handleStudentFilterChange('search', e.target.value)}
                                    style={{ maxWidth: '200px' }}
                                />
                                <select
                                    className="form-input"
                                    value={studentFilters.class}
                                    onChange={(e) => handleStudentFilterChange('class', e.target.value)}
                                    style={{ maxWidth: '150px' }}
                                >
                                    <option value="">All Classes</option>
                                    {studentsData?.filters?.classes?.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {studentFilters.class && (
                                    <select
                                        className="form-input"
                                        value={studentFilters.section}
                                        onChange={(e) => handleStudentFilterChange('section', e.target.value)}
                                        style={{ maxWidth: '150px' }}
                                    >
                                        <option value="">All Sections</option>
                                        {studentsData?.filters?.sections?.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                )}
                                <select
                                    className="form-input"
                                    value={studentFilters.assessmentId}
                                    onChange={(e) => handleStudentFilterChange('assessmentId', e.target.value)}
                                    style={{ maxWidth: '200px' }}
                                >
                                    <option value="">All Assessments</option>
                                    {studentsData?.filters?.assessments?.map(a => (
                                        <option key={a._id} value={a._id}>{a.title}</option>
                                    ))}
                                </select>
                                <span className="text-muted" style={{ alignSelf: 'center' }}>
                                    {studentsData?.totalStudents || 0} students
                                </span>
                            </div>

                            {/* Table */}
                            {studentsLoading ? (
                                <div className="loading-container" style={{ padding: '40px' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : studentsData?.students?.length > 0 ? (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Access ID</th>
                                                <th>Class</th>
                                                <th>Roll No</th>
                                                <th>Assessment</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsData.students.map(student => (
                                                student.submissions?.length > 0 ? (
                                                    student.submissions.map((sub, idx) => (
                                                        <tr key={`${student._id}-${idx}`}>
                                                            {idx === 0 && (
                                                                <>
                                                                    <td rowSpan={student.submissions.length} className="font-medium">{student.name}</td>
                                                                    <td rowSpan={student.submissions.length}><code style={{ fontSize: '0.8rem' }}>{student.accessId}</code></td>
                                                                    <td rowSpan={student.submissions.length}>{student.class} {student.section}</td>
                                                                    <td rowSpan={student.submissions.length}>{student.rollNo || '-'}</td>
                                                                </>
                                                            )}
                                                            <td>{sub.assessmentTitle}</td>
                                                            <td><strong>{sub.totalScore}</strong></td>
                                                            <td>
                                                                <span className={`badge ${sub.bucket?.includes('Stable') ? 'badge-success' :
                                                                    sub.bucket?.includes('Emerging') ? 'badge-warning' : 'badge-danger'}`}>
                                                                    {sub.bucket?.replace('Skill ', '')}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr key={student._id}>
                                                        <td className="font-medium">{student.name}</td>
                                                        <td><code style={{ fontSize: '0.8rem' }}>{student.accessId}</code></td>
                                                        <td>{student.class} {student.section}</td>
                                                        <td>{student.rollNo || '-'}</td>
                                                        <td colSpan="4" className="text-muted">No submissions yet</td>
                                                    </tr>
                                                )
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No students found</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowStudents(false)}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </Layout>
    );
};

export default SchoolAnalytics;
