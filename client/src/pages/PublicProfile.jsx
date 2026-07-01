import {
  Box, Typography, Avatar, Button, Chip, Card, CardContent,
  Grid, Stack, CircularProgress, Divider
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";
import { jwtDecode } from "jwt-decode";

const PublicProfile = () => {
  const { userId } = useParams();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useCollabsphere();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
  let currentUserId = null;
  try { if (token) currentUserId = jwtDecode(token).userId; } catch { /* ignore */ }

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/public/${userId}`,
          { headers: authHeader }
        );
        if (res.data.status) {
          setProfile(res.data.profile);
          // Check if current user is already following
          if (currentUserId && res.data.profile.followers) {
            setIsFollowing(false); // Will be checked separately if needed
          }
        }
      } catch (error) {
        console.error(error);
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    // Also check following status
    const checkFollowing = async () => {
      if (!currentUserId || currentUserId === userId) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/${userId}/followers`,
          { headers: authHeader }
        );
        if (res.data.status) {
          setIsFollowing(res.data.followers.some(f => f._id === currentUserId));
        }
      } catch { /* ignore */ }
    };

    fetchProfile();
    if (token) checkFollowing();
  }, [userId]);

  const handleFollow = async () => {
    if (!token) {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("info");
      setAlertMessage("Please log in to follow users");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/${userId}/follow`,
          { headers: authHeader }
        );
        setIsFollowing(false);
        setProfile(p => ({ ...p, followersCount: p.followersCount - 1 }));
      } else {
        await axios.post(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/${userId}/follow`,
          {},
          { headers: authHeader }
        );
        setIsFollowing(true);
        setProfile(p => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } catch (error) {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <Box textAlign="center" py={8}><CircularProgress /></Box>;
  if (!profile) return null;

  const isSelf = currentUserId === userId;

  return (
    <Box>
      <AlertBox />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <Avatar
              src={profile.image || ""}
              alt={profile.fullName}
              sx={{ width: 90, height: 90, fontSize: 36, bgcolor: "primary.main", color: "secondary.main" }}
            >
              {profile.fullName?.[0]?.toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {profile.fullName}
              </Typography>
              <Chip
                label={profile.role}
                size="small"
                sx={{ mt: 0.5, textTransform: "capitalize",
                  bgcolor: profile.role === "admin" ? "secondary.main" : "primary.main",
                  color: profile.role === "admin" ? "white" : "secondary.main"
                }}
              />
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Joined {dayjs(profile.createdAt).format("MMMM YYYY")}
              </Typography>
            </Box>
            {!isSelf && token && (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                color={isFollowing ? "secondary" : "primary"}
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700}>{profile.followersCount}</Typography>
              <Typography variant="caption" color="text.secondary">Followers</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700}>{profile.followingCount}</Typography>
              <Typography variant="caption" color="text.secondary">Following</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700}>{profile.postsCount}</Typography>
              <Typography variant="caption" color="text.secondary">Posts</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700}>{profile.productsCount}</Typography>
              <Typography variant="caption" color="text.secondary">Products</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Recent Posts */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} color="secondary.main" mb={1.5}>
            <ArticleIcon sx={{ mr: 0.5, verticalAlign: "middle" }} />
            Recent Posts
          </Typography>
          {profile.recentPosts?.length ? (
            profile.recentPosts.map(post => (
              <Card key={post._id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    component={Link}
                    to={`/posts/${post._id}`}
                    sx={{ textDecoration: "none", color: "secondary.main", "&:hover": { color: "primary.dark" } }}
                  >
                    {post.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                    {post.tags?.slice(0, 3).map(tag => (
                      <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: "0.65rem" }} />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(post.createdAt).format("MMM D, YYYY")}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No public posts yet.</Typography>
          )}
        </Grid>

        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} color="secondary.main" mb={1.5}>
            <ShoppingCartIcon sx={{ mr: 0.5, verticalAlign: "middle" }} />
            Products
          </Typography>
          {profile.recentProducts?.length ? (
            profile.recentProducts.map(product => (
              <Card key={product._id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {product.image && (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_SERVER_ENDPOINT}/productimage/${product.image}`}
                        alt={product.title}
                        sx={{ width: 48, height: 48, objectFit: "cover", borderRadius: 1 }}
                      />
                    )}
                    <Box flex={1}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        component={Link}
                        to={`/products/${product._id}`}
                        sx={{ textDecoration: "none", color: "secondary.main", "&:hover": { color: "primary.dark" } }}
                      >
                        {product.title}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.dark">
                        ${product.price}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No products yet.</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PublicProfile;
