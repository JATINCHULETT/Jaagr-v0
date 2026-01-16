const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true
    },
    section: {
        type: String,
        enum: ['A', 'B', 'C', 'D']
    },
    selectedOption: {
        type: Number,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    timeTakenForQuestion: {
        type: Number,
        default: 0 // in seconds
    }
});

const submissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    totalScore: {
        type: Number,
        required: true
    },
    sectionScores: {
        A: { type: Number, default: 0 },
        B: { type: Number, default: 0 },
        C: { type: Number, default: 0 },
        D: { type: Number, default: 0 }
    },
    sectionBuckets: {
        A: { type: String, default: '' },
        B: { type: String, default: '' },
        C: { type: String, default: '' },
        D: { type: String, default: '' }
    },
    primarySkillArea: {
        type: String,
        default: ''
    },
    secondarySkillArea: {
        type: String,
        default: ''
    },
    assignedBucket: {
        type: String,
        required: true
    },
    answers: [answerSchema],
    timeTaken: {
        type: Number,
        required: true // in seconds
    },
    mobileNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for analytics queries
submissionSchema.index({ schoolId: 1, submittedAt: -1 });
submissionSchema.index({ assessmentId: 1 });
submissionSchema.index({ assignedBucket: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
