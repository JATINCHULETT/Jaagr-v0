import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './StudentAssessment.css';

const QUESTIONS_PER_SECTION = 8;
const TIME_PER_QUESTION = 30;

const sectionEmojis = ['🎯', '💪', '🤝', '📱'];
const sectionColors = ['#B993E9', '#D4BFFF', '#9B6DD4', '#C7A6F5'];

const StudentAssessment = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        if (!assessment) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Show warning when time runs out but no option selected
                    if (!answers[currentQuestion]) {
                        setShowWarning(true);
                        return 10; // Give 10 more seconds
                    }
                    handleNext();
                    return TIME_PER_QUESTION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [assessment, currentQuestion, answers]);

    const fetchTests = async () => {
        try {
            const response = await api.get('/api/student/tests');
            const availableTests = response.data.tests.filter(t => !t.isCompleted);
            setTests(availableTests);
            if (availableTests.length === 1) {
                startAssessment(availableTests[0].assessmentId);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const startAssessment = async (assessmentId) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/student/assessment/${assessmentId}`);
            setAssessment(response.data);
            setAnswers(new Array(response.data.questions.length).fill(null));
            setStartTime(Date.now());
            setQuestionStartTime(Date.now());
            setTimeLeft(TIME_PER_QUESTION);
        } catch (error) {
            alert(error.response?.data?.message || 'Error loading assessment');
        } finally {
            setLoading(false);
        }
    };

    const selectOption = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = {
            selectedOption: optionIndex,
            timeTaken: Math.round((Date.now() - questionStartTime) / 1000)
        };
        setAnswers(newAnswers);
        setShowWarning(false); // Clear warning when option selected
    };

    const handleNext = useCallback(() => {
        // Check if current question is answered
        if (!answers[currentQuestion]) {
            setShowWarning(true);
            return;
        }

        setShowWarning(false);

        if (currentQuestion < assessment.questions.length - 1) {
            const nextQuestion = currentQuestion + 1;

            // Check for level up (every 8 questions)
            if (nextQuestion % QUESTIONS_PER_SECTION === 0 && nextQuestion > 0) {
                setShowLevelUp(true);
                setCurrentLevel(prev => prev + 1);
                setTimeout(() => {
                    setShowLevelUp(false);
                    setCurrentQuestion(nextQuestion);
                    setTimeLeft(TIME_PER_QUESTION);
                    setQuestionStartTime(Date.now());
                }, 2500);
            } else {
                setCurrentQuestion(nextQuestion);
                setTimeLeft(TIME_PER_QUESTION);
                setQuestionStartTime(Date.now());
            }
        } else {
            // Submit assessment
            handleSubmit();
        }
    }, [currentQuestion, assessment, answers]);

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setTimeLeft(TIME_PER_QUESTION);
            setQuestionStartTime(Date.now());
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const timeTaken = Math.round((Date.now() - startTime) / 1000);

            await api.post('/api/student/submit', {
                assessmentId: assessment._id,
                answers,
                timeTaken,
                mobileNumber: user.mobileNumber,
                email: user.email
            });

            navigate('/student/thankyou');
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting assessment');
            setSubmitting(false);
        }
    };

    // Test Selection Screen
    if (!assessment && !loading) {
        if (tests.length === 0) {
            return (
                <div className="assessment-container">
                    <div className="no-tests-card">
                        <div className="no-tests-icon">📝</div>
                        <h2>No Tests Available</h2>
                        <p>You don't have any pending assessments.</p>
                        <button className="btn btn-secondary" onClick={() => { logout(); navigate('/student/login'); }}>
                            Logout
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="assessment-container">
                <motion.div
                    className="test-selection-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2>Welcome, {user?.name}!</h2>
                    <p>Select an assessment to begin:</p>

                    <div className="test-list">
                        {tests.map((test, index) => (
                            <motion.button
                                key={test.assessmentId}
                                className="test-option"
                                onClick={() => startAssessment(test.assessmentId)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <span className="test-icon">📝</span>
                                <span className="test-title">{test.title}</span>
                                <span className="test-meta">{test.questionCount} questions</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="assessment-container">
                <div className="loading-card">
                    <div className="spinner large"></div>
                    <p>Loading assessment...</p>
                </div>
            </div>
        );
    }

    const currentSection = Math.floor(currentQuestion / QUESTIONS_PER_SECTION);
    const progressInSection = (currentQuestion % QUESTIONS_PER_SECTION) + 1;
    const totalProgress = ((currentQuestion + 1) / assessment.questions.length) * 100;

    return (
        <div className="assessment-container">
            {/* Level Up Animation */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        className="level-up-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="level-up-content"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", duration: 0.8 }}
                        >
                            <div className="level-up-ribbon">🎉</div>
                            <h2>Level {currentLevel} Complete!</h2>
                            <p>Great job! Keep going!</p>
                            <div className="level-up-stars">⭐⭐⭐</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Assessment Card */}
            <motion.div
                className="assessment-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Header */}
                <div className="assessment-header">
                    <div className="header-left">
                        <span className="level-badge" style={{ background: sectionColors[currentSection] }}>
                            {sectionEmojis[currentSection]} Level {currentLevel}
                        </span>
                    </div>
                    <div className="header-center">
                        <div className="progress-info">
                            Question {currentQuestion + 1} of {assessment.questions.length}
                        </div>
                    </div>
                    <div className="header-right">
                        <div className={`timer ${timeLeft <= 10 ? 'warning' : ''} ${timeLeft <= 5 ? 'danger' : ''}`}>
                            <span className="timer-icon">⏱️</span>
                            <span className="timer-value">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                    <div className="section-indicators">
                        {[0, 1, 2, 3].map((section) => (
                            <div
                                key={section}
                                className={`section-dot ${section < currentSection ? 'completed' : ''} ${section === currentSection ? 'active' : ''}`}
                                style={{ background: section <= currentSection ? sectionColors[section] : undefined }}
                            >
                                {section < currentSection ? '✓' : sectionEmojis[section]}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalProgress}%` }}
                            style={{ background: sectionColors[currentSection] }}
                        />
                    </div>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        className="question-section"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="question-text">
                            {assessment.questions[currentQuestion].text}
                        </h3>

                        {showWarning && (
                            <motion.div
                                className="question-warning"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                ⚠️ Please select an option to continue
                            </motion.div>
                        )}

                        <div className="options-grid">
                            {assessment.questions[currentQuestion].options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    className={`option-btn ${answers[currentQuestion]?.selectedOption === index ? 'selected' : ''}`}
                                    onClick={() => selectOption(index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span className="option-number">{index + 1}</span>
                                    <span className="option-label">{option.label}</span>
                                    {answers[currentQuestion]?.selectedOption === index && (
                                        <motion.span
                                            className="option-check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="navigation-section">
                    <button
                        className="nav-btn prev"
                        onClick={handlePrev}
                        disabled={currentQuestion === 0}
                    >
                        ← Previous
                    </button>

                    <div className="question-dots">
                        {Array.from({ length: QUESTIONS_PER_SECTION }).map((_, i) => {
                            const questionIndex = currentSection * QUESTIONS_PER_SECTION + i;
                            if (questionIndex >= assessment.questions.length) return null;
                            return (
                                <span
                                    key={i}
                                    className={`q-dot ${questionIndex === currentQuestion ? 'current' : ''} ${answers[questionIndex] ? 'answered' : ''}`}
                                />
                            );
                        })}
                    </div>

                    <motion.button
                        className={`nav-btn next ${currentQuestion === assessment.questions.length - 1 ? 'submit' : ''} ${!answers[currentQuestion] ? 'disabled-look' : ''}`}
                        onClick={handleNext}
                        disabled={submitting}
                        whileHover={answers[currentQuestion] ? { scale: 1.05 } : {}}
                        whileTap={answers[currentQuestion] ? { scale: 0.95 } : {}}
                    >
                        {submitting ? (
                            <span className="btn-spinner"></span>
                        ) : currentQuestion === assessment.questions.length - 1 ? (
                            'Submit ✓'
                        ) : (
                            'Next →'
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentAssessment;
