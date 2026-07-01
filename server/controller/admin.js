import bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import UserModel from "../models/userSchema.js";
import PostModel from '../models/postSchema.js';
import ProductModel from '../models/productSchema.js';
import AssignmentModel from '../models/assignmentSchema.js';
import SubmissionModel from '../models/assignmentSubmissionSchema.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (!existingUser || existingUser.role !== "user") {
            return res.status(401).json({ status: false, message: "Invalid Email or User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: "Wrong Password" });
        }

        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRES || '1h' });
        const expires = new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRES)) * 24 * 60 * 60 * 1000);
        res.cookie(process.env.COOKIE_KEY, token, {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            expires
        }).status(200).json({ status: true, message: "Login Successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const getUserData = async (req, res) => {
    try {
        res.status(200).json({ status: true, message: "Data Fetched Successfully", user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const logOut = async (req, res) => {
    try {
        res.clearCookie(process.env.COOKIE_KEY, {
            httpOnly: false,
            secure: true,
            sameSite: 'none'
        });

        res.status(200).json({ status: true, message: "Logout Successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }

}

const userList = async (req, res) => {
    try {
        const users = await UserModel.find({}).select("-password");
        res.status(200).json({ status: true, message: "Data Fetched Successfully", users });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const getLastMonthNewUsersCount = async (req, res) => {
    try {
        const currentDate = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(currentDate.getMonth() - 1);

        const userCount = await UserModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneMonthAgo, $lt: currentDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        res.status(200).json({ status: true, message: "Data Fetched Successfully", userCount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const getRoleBasedUserCount = async (req, res) => {
    try {
        const roleCounts = await UserModel.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    role: "$_id",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({ status: true, message: "Data Fetched Successfully", roleCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

const getAnalytics = async (req, res) => {
    try {
        const [
            totalUsers, totalPosts, totalProducts,
            totalAssignments, totalSubmissions
        ] = await Promise.all([
            UserModel.countDocuments(),
            PostModel.countDocuments(),
            ProductModel.countDocuments(),
            AssignmentModel.countDocuments(),
            SubmissionModel.countDocuments()
        ]);

        const totalComments = await PostModel.aggregate([
            { $project: { commentCount: { $size: '$comments' } } },
            { $group: { _id: null, total: { $sum: '$commentCount' } } }
        ]);

        return res.status(200).json({
            status: true,
            message: "Analytics fetched",
            analytics: {
                totalUsers,
                totalPosts,
                totalComments: totalComments[0]?.total || 0,
                totalProducts,
                totalAssignments,
                totalSubmissions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── MODERATION ───────────────────────────────────────────────────────────────

const getAllPosts = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const filter = {};
        if (search) filter.title = { $regex: search, $options: 'i' };
        const [posts, total] = await Promise.all([
            PostModel.find(filter)
                .populate('authorId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PostModel.countDocuments(filter)
        ]);
        return res.status(200).json({ status: true, message: "Fetched", posts, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const adminDeletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const deleted = await PostModel.findByIdAndDelete(postId);
        if (!deleted) return res.status(404).json({ status: false, message: "Post not found" });
        return res.status(200).json({ status: true, message: "Post deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find()
            .populate('authorId', 'fullName email')
            .sort({ createdAt: -1 });
        return res.status(200).json({ status: true, message: "Fetched", products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const adminDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const deleted = await ProductModel.findByIdAndDelete(productId);
        if (!deleted) return res.status(404).json({ status: false, message: "Product not found" });
        return res.status(200).json({ status: true, message: "Product deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

export {
    login, getUserData, logOut, userList, getLastMonthNewUsersCount, getRoleBasedUserCount,
    getAnalytics, getAllPosts, adminDeletePost, getAllProducts, adminDeleteProduct
};