import express from 'express';
import {
    getLastMonthNewUsersCount, getRoleBasedUserCount, getUserData, logOut, login, userList,
    getAnalytics, getAllPosts, adminDeletePost, getAllProducts, adminDeleteProduct
} from '../controller/admin.js';
import adminAuthentication from '../middleware/adminAuthentication.js';

const admin = express.Router();

admin.post("/login", login);
admin.get("/profile", adminAuthentication, getUserData);
admin.get("/log-out", logOut);

// Users
admin.get("/users", adminAuthentication, userList);
admin.get("/users/last-month-count", adminAuthentication, getLastMonthNewUsersCount);
admin.get("/users/role-count", adminAuthentication, getRoleBasedUserCount);

// Analytics
admin.get("/analytics", adminAuthentication, getAnalytics);

// Post moderation
admin.get("/posts", adminAuthentication, getAllPosts);
admin.delete("/posts/:postId", adminAuthentication, adminDeletePost);

// Product moderation
admin.get("/products", adminAuthentication, getAllProducts);
admin.delete("/products/:productId", adminAuthentication, adminDeleteProduct);

export default admin;
