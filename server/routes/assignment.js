import express from 'express';
import {
    createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment,
    submitAssignment, getSubmissions, reviewSubmission, getMySubmissions
} from '../controller/assignment.js';
import userAuthentication from '../middleware/userAuthentication.js';

const assignment = express.Router();

// Assignments CRUD
assignment.get('/', userAuthentication, getAssignments);
assignment.post('/', userAuthentication, createAssignment);
assignment.get('/my-submissions', userAuthentication, getMySubmissions);
assignment.get('/:assignmentId', userAuthentication, getAssignment);
assignment.patch('/:assignmentId', userAuthentication, updateAssignment);
assignment.delete('/:assignmentId', userAuthentication, deleteAssignment);

// Submissions
assignment.post('/:assignmentId/submit', userAuthentication, submitAssignment);
assignment.get('/:assignmentId/submissions', userAuthentication, getSubmissions);
assignment.patch('/:assignmentId/submissions/:submissionId/review', userAuthentication, reviewSubmission);

export default assignment;
