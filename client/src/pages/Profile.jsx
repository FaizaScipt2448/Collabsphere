import { Grid, Stack } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArticleIcon from "@mui/icons-material/Article";
import TaskIcon from "@mui/icons-material/Task";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import ProfileCardDetails from "../../components/profile/profile/ProfileCardDetails";
import StatCard from "../../components/profile/profile/StatCard";
import ActivityGrid from "../../components/profile/profile/ActivityGrid";
import useCollabsphere from "../hooks/useCollabsphere";
import RecentPost from "../../components/profile/profile/RecentPost";
import LatestProduct from "../../components/profile/profile/LatestProduct";
import OngoingTask from "../../components/profile/profile/OngoingTask";

const Profile = () => {
  const [data, setData] = useState(null);
  const {
    setAlertBoxOpenStatus,
    setLoadingStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setData(response.data.user);
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
  }, [setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus]);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <StatCard icon={<ArticleIcon />} label="Total Post" value={data?.totalPosts ?? 0} />
            </Grid>
            <Grid item xs={4}>
              <StatCard icon={<TaskIcon />} label="Ongoing Task" value={data?.ongoingTasks ?? 0} />
            </Grid>
            <Grid item xs={4}>
              <StatCard icon={<ShoppingCartIcon />} label="Total Product" value={data?.totalProducts ?? 0} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <ProfileCardDetails data={data} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <OngoingTask />
        </Grid>
        <Grid item xs={12} md={4}>
          <LatestProduct />
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentPost />
        </Grid>
      </Grid>

      <ActivityGrid />
    </Stack>
  );
};

export default Profile;
