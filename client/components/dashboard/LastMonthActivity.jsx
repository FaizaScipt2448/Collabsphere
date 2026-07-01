import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import axios from "axios";
import Cookies from "js-cookie";
import { Typography, Card } from "@mui/material";
import useCollabsphere from "../../src/hooks/useCollabsphere";

const LastMonthActivity = () => {
  const [countData, setCountData] = useState([]);
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStatus(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/admin/users/last-month-count`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setCountData(response.data.userCount);
        } else {
          setAlertBoxOpenStatus(true);
          setAlertSeverity(response.data.status ? "success" : "error");
          setAlertMessage(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
    <Card sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={700} textAlign="center" color="secondary.main" gutterBottom>
        Last Month User Activity
      </Typography>
      {!countData.length ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No data found.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={countData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="count" stroke="#59e3a7" strokeWidth={2} />
            <CartesianGrid stroke="#e3e8e6" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default LastMonthActivity;
