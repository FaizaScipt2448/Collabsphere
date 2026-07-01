import mongoose from "mongoose";
import PostModel from "../models/postSchema.js";

// ─── CREATE ───────────────────────────────────────────────────────────────────

const addPost = async (req, res) => {
    try {
        const { title, tags, description } = req.body;
        const authorId = req.user._id.toString();

        if (!title || !tags || !tags.length || !description) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        const newPost = new PostModel({ title, tags, description, authorId, createdAt: new Date() });
        const savedPost = await newPost.save();
        if (savedPost) {
            return res.status(201).json({ status: true, message: "Post created successfully" });
        }
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── READ ─────────────────────────────────────────────────────────────────────

/** My posts (authenticated user's own posts) */
const getAllPost = async (req, res) => {
    try {
        const { limit, sort } = req.query;
        const authorId = req.user._id.toString();

        let postsQuery = PostModel.find({ authorId });
        if (sort === 'createdAt') postsQuery = postsQuery.sort({ createdAt: -1 });
        if (limit) postsQuery = postsQuery.limit(parseInt(limit));

        const posts = await postsQuery;
        res.status(200).json({ status: true, message: "Data Fetched Successfully", posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/** Public community feed — all public posts with author info */
const getPublicPosts = async (req, res) => {
    try {
        const { search, tag, sort, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build match stage
        const matchStage = { visibility: "public" };
        if (tag) matchStage.tags = { $in: [tag] };
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } }
            ];
        }

        // Build sort stage
        let sortStage = { createdAt: -1 };
        if (sort === 'mostReacted') sortStage = { reactionCount: -1 };
        if (sort === 'mostCommented') sortStage = { commentCount: -1 };

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorData'
                }
            },
            { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    reactionCount: { $size: '$reactions' },
                    commentCount: { $size: '$comments' }
                }
            },
            {
                $project: {
                    title: 1,
                    tags: 1,
                    description: 1,
                    visibility: 1,
                    createdAt: 1,
                    reactionCount: 1,
                    commentCount: 1,
                    authorId: 1,
                    author: {
                        _id: '$authorData._id',
                        fullName: '$authorData.fullName',
                        image: '$authorData.image',
                        email: '$authorData.email'
                    }
                }
            },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ];

        const posts = await PostModel.aggregate(pipeline);
        const total = await PostModel.countDocuments(matchStage);

        res.status(200).json({
            status: true,
            message: "Data Fetched Successfully",
            posts,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/** Single post detail with full author + comment author info */
const getSinglePost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ status: false, message: "Invalid post ID" });
        }

        const post = await PostModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(postId), visibility: "public" } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorData'
                }
            },
            { $unwind: '$authorData' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reactions.userId',
                    foreignField: '_id',
                    as: 'reactors'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'commenters'
                }
            },
            {
                $project: {
                    title: 1,
                    tags: 1,
                    description: 1,
                    createdAt: 1,
                    authorId: 1,
                    author: '$authorData.fullName',
                    authorImage: '$authorData.image',
                    reactions: {
                        $map: {
                            input: '$reactions',
                            as: 'r',
                            in: {
                                reactor: { $arrayElemAt: ['$reactors.fullName', { $indexOfArray: ['$reactors._id', '$$r.userId'] }] },
                                reaction: '$$r.reaction',
                                createdAt: '$$r.createdAt',
                                reactor_id: '$$r.userId'
                            }
                        }
                    },
                    comments: {
                        $map: {
                            input: '$comments',
                            as: 'c',
                            in: {
                                _id: '$$c._id',
                                commenter: { $arrayElemAt: ['$commenters.fullName', { $indexOfArray: ['$commenters._id', '$$c.userId'] }] },
                                commenterImage: { $arrayElemAt: ['$commenters.image', { $indexOfArray: ['$commenters._id', '$$c.userId'] }] },
                                comment: '$$c.comment',
                                createdAt: '$$c.createdAt',
                                commenter_id: '$$c.userId'
                            }
                        }
                    }
                }
            }
        ]);

        if (!post || post.length === 0) {
            return res.status(404).json({ status: false, message: "Post not found" });
        }
        return res.status(200).json({ status: true, message: "Data Fetched Successfully", post: post[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/** Add a comment — multiple comments per user allowed */
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userId = req.user._id;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ status: false, message: "Comment is required" });
        }

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        post.comments.push({ userId, comment: comment.trim() });
        await post.save();

        const user = req.user;
        const newComment = post.comments[post.comments.length - 1];

        return res.status(201).json({
            status: true,
            message: "Comment added successfully",
            comment: {
                _id: newComment._id,
                comment: newComment.comment,
                createdAt: newComment.createdAt,
                commenter_id: userId,
                commenter: user.fullName,
                commenterImage: user.image
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/** Delete a comment — own comment or admin */
const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id.toString();
        const userRole = req.user.role;

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ status: false, message: "Comment not found" });

        if (comment.userId.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised to delete this comment" });
        }

        post.comments.pull({ _id: commentId });
        await post.save();
        return res.status(200).json({ status: true, message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/** Edit own comment */
const editComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { comment } = req.body;
        const userId = req.user._id.toString();

        if (!comment || !comment.trim()) {
            return res.status(400).json({ status: false, message: "Comment text is required" });
        }

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        const existingComment = post.comments.id(commentId);
        if (!existingComment) return res.status(404).json({ status: false, message: "Comment not found" });

        if (existingComment.userId.toString() !== userId) {
            return res.status(403).json({ status: false, message: "Not authorised to edit this comment" });
        }

        existingComment.comment = comment.trim();
        await post.save();
        return res.status(200).json({ status: true, message: "Comment updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── REACTIONS ────────────────────────────────────────────────────────────────

const addReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reactionType } = req.body;
        const userId = req.user._id.toString();

        if (!reactionType) {
            return res.status(400).json({ status: false, message: "Reaction is required" });
        }

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        const existing = post.reactions.find(r => r.userId.toString() === userId);
        if (existing) {
            if (existing.reaction === reactionType) {
                post.reactions = post.reactions.filter(r => r.userId.toString() !== userId);
            } else {
                existing.reaction = reactionType;
            }
        } else {
            post.reactions.push({ userId, reaction: reactionType });
        }

        await post.save();
        return res.status(200).json({ status: true, message: "Reaction updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── VISIBILITY ───────────────────────────────────────────────────────────────

const handleVisibility = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        post.visibility = post.visibility === "public" ? "private" : "public";
        await post.save();
        res.status(200).json({ status: true, message: "Visibility Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── REMOVE ───────────────────────────────────────────────────────────────────

const removePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id.toString();
        const userRole = req.user.role;

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });

        // Allow author or admin to delete
        if (post.authorId.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        await PostModel.findByIdAndDelete(postId);
        return res.status(200).json({ status: true, message: "Post Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, description, tags } = req.body;
        const userId = req.user._id.toString();

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ status: false, message: "Post not found" });
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        if (title) post.title = title;
        if (description) post.description = description;
        if (tags) post.tags = tags;
        await post.save();

        return res.status(200).json({ status: true, message: "Post updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

export {
    addPost, removePost, editPost, getAllPost, getSinglePost,
    getPublicPosts,
    addComment, deleteComment, editComment,
    addReaction,
    handleVisibility
};
