import express from 'express';
import post from './post.js';
import tag from './tag.js';
import user from './user.js';
import admin from './admin.js';
import task from './task.js';
import product from './product.js';
import assignment from './assignment.js';
import poll from './poll.js';
import resource from './resource.js';

const router = express.Router();

router.use("/posts", post);
router.use("/tags", tag);
router.use("/users", user);
router.use("/admin", admin);
router.use("/tasks", task);
router.use("/products", product);
router.use("/assignments", assignment);
router.use("/polls", poll);
router.use("/resources", resource);

export default router;
