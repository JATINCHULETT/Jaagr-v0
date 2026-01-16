import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolManagement from './pages/admin/SchoolManagement';
import AssessmentManagement from './pages/admin/AssessmentManagement';
import AdminAnalytics from './pages/admin/Analytics';
import SchoolDashboard from './pages/school/SchoolDashboard';
import StudentManagement from './pages/school/StudentManagement';
import SchoolTests from './pages/school/SchoolTests';
import SchoolAnalytics from './pages/school/SchoolAnalytics';
import StudentLogin from './pages/student/StudentLogin';
import StudentAssessment from './pages/student/StudentAssessment';
import ThankYou from './pages/student/ThankYou';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'school') return <Navigate to="/school" replace />;
        if (user?.role === 'student') return <Navigate to="/student" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                isAuthenticated ? (
                    <Navigate to={`/${user?.role || 'login'}`} replace />
                ) : (
                    <Login />
                )
            } />

            {/* Student Routes - Public login, protected assessment */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentAssessment />
                </ProtectedRoute>
            } />
            <Route path="/student/thankyou" element={<ThankYou />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/schools" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <SchoolManagement />
                </ProtectedRoute>
            } />
            <Route path="/admin/assessments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AssessmentManagement />
                </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalytics />
                </ProtectedRoute>
            } />

            {/* School Routes */}
            <Route path="/school" element={
                <ProtectedRoute allowedRoles={['school']}>
                    <SchoolDashboard />
                </ProtectedRoute>
            } />
            <Route path="/school/students" element={
                <ProtectedRoute allowedRoles={['school']}>
                    <StudentManagement />
                </ProtectedRoute>
            } />
            <Route path="/school/tests" element={
                <ProtectedRoute allowedRoles={['school']}>
                    <SchoolTests />
                </ProtectedRoute>
            } />
            <Route path="/school/analytics" element={
                <ProtectedRoute allowedRoles={['school']}>
                    <SchoolAnalytics />
                </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={
                isAuthenticated ? (
                    <Navigate to={`/${user?.role}`} replace />
                ) : (
                    <Navigate to="/login" replace />
                )
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
