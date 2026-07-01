import express from 'express';
import {
    getUserData, login, registration, changePassword, getUsers, removeUser, getUserActivity,
    getPublicProfile, followUser, unfollowUser, getFollowers, getFollowing
} from '../controller/user.js';
import userAuthentication from '../middleware/userAuthentication.js';
import adminAuthentication from '../middleware/adminAuthentication.js';

const user = express.Router();

// Auth
user.post("/registration", registration);
user.post("/login", login);

// Own profile
user.get("/profile", userAuthentication, getUserData);
user.get("/activity", userAuthentication, getUserActivity);
user.put("/change-password", userAuthentication, changePassword);

// Admin management
user.get("", adminAuthentication, getUsers);
user.delete("/:userId", adminAuthentication, removeUser);

// Public profile
user.get("/public/:userId", getPublicProfile);

// Follow system
user.post("/:userId/follow", userAuthentication, followUser);
user.delete("/:userId/follow", userAuthentication, unfollowUser);
user.get("/:userId/followers", getFollowers);
user.get("/:userId/following", getFollowing);

export default user;
