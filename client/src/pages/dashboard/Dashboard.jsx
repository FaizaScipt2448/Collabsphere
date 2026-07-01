/* eslint-disable react/prop-types */
import { Grid, Card, CardContent, Typography, Stack, CircularProgress, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CommentIcon from "@mui/icons-material/Comment";
import TaskIcon from "@mui/icons-material/Task";
import LastMonthActivity from "../../../components/dashboard/LastMonthActivity";
import RoleCount from "../../../components/dashboard/RoleCount";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.dark` }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value ?? "—"}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(
      `${import.meta.env.VITE_SERVER_ENDPOINT}/admin/analytics`,
      { headers: { Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}` } }
    ).then(res => {
      if (res.data.status) setAnalytics(res.data.analytics);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="secondary.main" mb={3}>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box textAlign="center" py={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<PeopleIcon />} label="Users" value={analytics?.totalUsers} color="primary" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<ArticleIcon />} label="Posts" value={analytics?.totalPosts} color="info" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<CommentIcon />} label="Comments" value={analytics?.totalComments} color="warning" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<ShoppingCartIcon />} label="Products" value={analytics?.totalProducts} color="success" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<AssignmentIcon />} label="Assignments" value={analytics?.totalAssignments} color="secondary" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<TaskIcon />} label="Submissions" value={analytics?.totalSubmissions} color="error" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LastMonthActivity />
        </Grid>
        <Grid item xs={12} md={6}>
          <RoleCount />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
