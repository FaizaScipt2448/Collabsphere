import { useParams, Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  ThumbUp,
  Favorite,
  SentimentVeryDissatisfied,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Print,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  Typography,
  Chip,
  Button,
  TextField,
  Avatar,
  Box,
  Stack,
  Container,
  IconButton,
} from "@mui/material";
import useCollabsphere from "../hooks/useCollabsphere";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
} from "react-share";
import { marked } from "marked";
import DOMPurify from "dompurify";

const reactionsList = [
  { type: "like", icon: <ThumbUp />, color: "primary" },
  { type: "love", icon: <Favorite />, color: "error" },
  { type: "angry", icon: <SentimentVeryDissatisfied />, color: "warning" },
];

const Post = () => {
  const { postId } = useParams();
  const shareUrl = `https://collabsphere.vercel.app/posts/${postId}`;
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertSeverity,
    setAlertMessage,
  } = useCollabsphere();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const renderMarkdown = (description) => {
    const html = marked(description);
    return { __html: DOMPurify.sanitize(html) };
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}`
        );
        if (response.data.status) {
          setPost(response.data.post);
        } else {
          setLoadingStatus(false);
          setAlertBoxOpenStatus(true);
          setAlertSeverity(response.data.status ? "success" : "error");
          setAlertMessage(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingStatus(false);
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(error.response?.data?.message || error.message);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchData();
  }, [postId, setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus]);

  const handleComment = async () => {
    if (!commentText.trim()) {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage("Comment Required");
      return;
    }
    setLoadingStatus(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}/comment`,
        { comment: commentText },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`,
          },
        }
      );
      if (response.data.status) {
        // server returns the full comment object with commenter info
        const newComment = response.data.comment || {
          comment: commentText,
          createdAt: new Date().toISOString(),
          commenter: "You",
          commenterImage: null,
          commenter_id: null
        };
        setPost((prevPost) => ({ ...prevPost, comments: [...prevPost.comments, newComment] }));
        setCommentText("");
      }
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity(response.data.status ? "success" : "error");
      setAlertMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleReact = async (reactionType) => {
    setLoadingStatus(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}/reaction`,
        { reactionType },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`,
          },
        }
      );
      if (response.data.status) {
        setPost((prevPost) => {
          const authorizedUser = jwtDecode(
            Cookies.get(import.meta.env.VITE_TOKEN_KEY)
          ).userId;
          const userReaction = prevPost.reactions.find(
            (r) => r.reactor_id === authorizedUser
          );

          if (!userReaction) {
            return {
              ...prevPost,
              reactions: [
                ...prevPost.reactions,
                { reactor_id: authorizedUser, reaction: reactionType },
              ],
            };
          } else if (userReaction.reaction === reactionType) {
            return {
              ...prevPost,
              reactions: prevPost.reactions.filter(
                (r) => r.reactor_id !== authorizedUser
              ),
            };
          } else {
            return {
              ...prevPost,
              reactions: prevPost.reactions.map((r) =>
                r.reactor_id === authorizedUser
                  ? { ...r, reaction: reactionType }
                  : r
              ),
            };
          }
        });
        setAlertBoxOpenStatus(true);
        setAlertSeverity("success");
        setAlertMessage(response.data.message);
      } else {
        setLoadingStatus(false);
        setAlertBoxOpenStatus(true);
        setAlertSeverity(response.data.status ? "success" : "error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Decode current user from token
  let currentUserId = null;
  let currentUserRole = null;
  try {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    if (token) {
      currentUserId = jwtDecode(token).userId;
      currentUserRole = Cookies.get(import.meta.env.VITE_USER_ROLE);
    }
  } catch { /* ignore */ }

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}` } }
      );
      if (response.data.status) {
        setPost(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
      }
    } catch (error) {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    }
  };

  const cardRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    documentTitle: post?.title || "Post Print",
    removeAfterPrint: true,
    contentRef: cardRef,
  });

  if (!post) {
    return (
      <Container sx={{ maxWidth: 1280, my: 4 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight={700} color="secondary.main">
            Post Not Available
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container sx={{ maxWidth: 1280, my: 4 }}>
      <Card ref={cardRef} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" fontWeight={700} color="secondary.main" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {`Author: ${post.author}`}
          {post.createdAt !== null && ` | ${new Date(post.createdAt).toLocaleString()}`}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} className="no-print">
          <FacebookShareButton url={shareUrl} quote={post.title}>
            <Facebook sx={{ fontSize: 30, cursor: "pointer", color: "#1877F2" }} />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={post.title}>
            <Twitter sx={{ fontSize: 30, cursor: "pointer", color: "#1DA1F2" }} />
          </TwitterShareButton>
          <LinkedinShareButton url={shareUrl} title={post.title} source={shareUrl}>
            <LinkedIn sx={{ fontSize: 30, cursor: "pointer", color: "#0077B5" }} />
          </LinkedinShareButton>
          <WhatsappShareButton url={shareUrl} title={post.title} separator=" - ">
            <WhatsApp sx={{ fontSize: 30, cursor: "pointer", color: "#25D366" }} />
          </WhatsappShareButton>
          <Print onClick={handlePrint} sx={{ fontSize: 30, cursor: "pointer", color: "text.secondary" }} />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2, mt: 2 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              variant="outlined"
              sx={{ cursor: "pointer", borderColor: "secondary.main", color: "secondary.main" }}
            />
          ))}
        </Stack>

        <Typography
          variant="body1"
          my={3}
          sx={{ lineHeight: 1.8 }}
          dangerouslySetInnerHTML={renderMarkdown(post.description)}
        />

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          {reactionsList.map((reaction) => {
            const myReaction = post.reactions.find(r => r.reactor_id?.toString() === currentUserId?.toString());
            const isActive = myReaction?.reaction === reaction.type;
            return (
              <Button
                key={reaction.type}
                variant={isActive ? "contained" : "outlined"}
                color={reaction.color}
                startIcon={reaction.icon}
                onClick={() => handleReact(reaction.type)}
                sx={isActive ? { boxShadow: 3 } : {}}
              >
                {post.reactions.filter((r) => r.reaction === reaction.type).length}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ mt: 4 }}>
          {/* Author link */}
          <Typography variant="body2" color="text.secondary" mb={2}>
            By{" "}
            <Box
              component={Link}
              to={post.authorId ? `/users/${post.authorId}` : "#"}
              sx={{ fontWeight: 600, color: "secondary.main", textDecoration: "none", "&:hover": { color: "primary.dark" } }}
            >
              {post.author}
            </Box>
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 1.5 }}
            className="no-print"
          />
          <Button variant="contained" color="secondary" onClick={handleComment} className="no-print">
            Comment
          </Button>

          {post.comments.length > 0 && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              {post.comments.map((comment, index) => {
                const canDelete = currentUserId &&
                  (comment.commenter_id?.toString() === currentUserId || currentUserRole === "admin");
                return (
                  <Box key={comment._id || index} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Avatar
                      src={comment.commenterImage || ""}
                      alt={comment.commenter || ""}
                      sx={{ width: 36, height: 36, bgcolor: "primary.main", color: "secondary.main" }}
                    >
                      {comment.commenter?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Box flex={1} p={1.5} bgcolor="background.default" borderRadius={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {comment.commenter || "Anonymous"}
                          </Typography>
                          <Typography variant="body2">{comment.comment}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {canDelete && (
                          <IconButton size="small" color="error"
                            onClick={() => handleDeleteComment(comment._id)}
                            sx={{ ml: 1 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default Post;
