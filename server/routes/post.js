import express from 'express';
import {
    addComment, addPost, addReaction, editPost, editComment,
    getAllPost, getSinglePost, getPublicPosts,
    handleVisibility, removePost, deleteComment
} from '../controller/post.js';
import userAuthentication from '../middleware/userAuthentication.js';

const post = express.Router();

// Public community feed (no auth required)
post.get("/public", getPublicPosts);

// My posts (auth required)
post.get("/", userAuthentication, getAllPost);

// Single post (public — no auth)
post.get("/:postId", getSinglePost);

// Create
post.post("/", userAuthentication, addPost);

// Comments
post.post("/:postId/comment", userAuthentication, addComment);
post.delete("/:postId/comments/:commentId", userAuthentication, deleteComment);
post.patch("/:postId/comments/:commentId", userAuthentication, editComment);

// Reactions
post.post("/:postId/reaction", userAuthentication, addReaction);

// Moderation / update
post.delete("/:postId", userAuthentication, removePost);
post.patch("/change-visibility/:postId", userAuthentication, handleVisibility);
post.patch("/:postId", userAuthentication, editPost);

export default post;
