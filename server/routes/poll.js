import express from 'express';
import { createPoll, getPolls, getPoll, votePoll, deletePoll } from '../controller/poll.js';
import userAuthentication from '../middleware/userAuthentication.js';

const poll = express.Router();

poll.get('/', userAuthentication, getPolls);
poll.post('/', userAuthentication, createPoll);
poll.get('/:pollId', userAuthentication, getPoll);
poll.post('/:pollId/vote', userAuthentication, votePoll);
poll.delete('/:pollId', userAuthentication, deletePoll);

export default poll;
