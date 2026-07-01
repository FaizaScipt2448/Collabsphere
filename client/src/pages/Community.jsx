/* eslint-disable react/prop-types */
import {
  Box, Typography, Card, CardContent, CardActionArea, Chip, Avatar,
  Stack, TextField, MenuItem, Select, FormControl, InputLabel,
  Button, CircularProgress, InputAdornment, Pagination
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";

dayjs.extend(relativeTime);

const reactionEmoji = { like: "👍", love: "❤️", angry: "😠" };

const PostCard = ({ post }) => (
  <Card sx={{ mb: 2, transition: "box-shadow 0.2s", "&:hover": { boxShadow: 4 } }}>
    <CardActionArea component={Link} to={`/posts/${post._id}`}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          <Avatar
            src={post.author?.image || ""}
            alt={post.author?.fullName}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", color: "secondary.main" }}
          >
            {post.author?.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              component={Link}
              to={`/users/${post.author?._id}`}
              onClick={e => e.stopPropagation()}
              sx={{ textDecoration: "none", color: "secondary.main", "&:hover": { color: "primary.dark" } }}
            >
              {post.author?.fullName || "Unknown"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {dayjs(post.createdAt).fromNow()}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h6" fontWeight={700} gutterBottom>{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {post.description?.replace(/[#*_]/g, "")}
        </Typography>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mt={1.5}>
          {post.tags?.slice(0, 4).map(tag => (
            <Chip key={tag} label={`#${tag}`} size="small"
              sx={{ fontSize: "0.7rem", backgroundColor: "background.default" }} />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} mt={1.5} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {Object.values(reactionEmoji).map((emoji) => {
              const count = post.reactionCount || 0;
              return count > 0 ? `${emoji} ${count}` : null;
            }).filter(Boolean).join("  ") || `${post.reactionCount || 0} reactions`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            💬 {post.commentCount || 0} comments
          </Typography>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

const Community = () => {
  const navigate = useNavigate();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useCollabsphere();

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");

  const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (tag) params.tag = tag;

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/public`,
        { params, headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.data.status) {
        setPosts(response.data.posts);
        setTotal(response.data.total);
        setPages(response.data.pages);
      }
    } catch (error) {
      console.error(error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tag, sort, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <Box>
      <AlertBox />
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <PeopleIcon color="primary" />
        <Typography variant="h5" fontWeight={700} color="secondary.main">
          Community Feed
        </Typography>
        <Chip label={`${total} posts`} size="small" color="primary" />
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}
        component="form" onSubmit={handleSearch}>
        <TextField
          placeholder="Search posts..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            )
          }}
        />
        <TextField
          placeholder="Filter by tag"
          value={tag}
          onChange={e => { setTag(e.target.value); setPage(1); }}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            value={sort}
            label="Sort"
            onChange={e => { setSort(e.target.value); setPage(1); }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="mostReacted">Most Reacted</MenuItem>
            <MenuItem value="mostCommented">Most Commented</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">Search</Button>
      </Stack>

      {/* Posts */}
      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : posts.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" fontWeight={500}>No posts found.</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Try a different search term or tag.
          </Typography>
          {token && (
            <Button variant="contained" color="primary" sx={{ mt: 2 }}
              onClick={() => navigate("/add-post")}>
              Be the first to post
            </Button>
          )}
        </Box>
      ) : (
        <>
          {posts.map(post => <PostCard key={post._id} post={post} />)}
          {pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo(0, 0); }}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Community;
