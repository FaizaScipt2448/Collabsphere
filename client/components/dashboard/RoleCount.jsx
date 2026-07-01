import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import useCollabsphere from "../../src/hooks/useCollabsphere";
import { Typography, Card } from "@mui/material";

const COLORS = ["#1b2e35", "#59e3a7", "#3fc98c", "#2c4750"];

const RoleCount = () => {
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
          `${import.meta.env.VITE_SERVER_ENDPOINT}/admin/users/role-count`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setCountData(response.data.roleCounts);
        } else {
          setAlertBoxOpenStatus(true);
          setAlertSeverity("error");
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
        Distribution of Users
      </Typography>
      {!countData.length ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No data found.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={countData}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ role, count }) => `${role}: ${count}`}
            >
              {countData.map((entry, index) => (
                <Cell key={entry.role} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RoleCount;
