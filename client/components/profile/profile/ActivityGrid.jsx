import { Container, Grid, Card, Box } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCollabsphere from "../../../src/hooks/useCollabsphere";

const ActivityGrid = () => {
  const [activityData, setActivityData] = useState([]);
  const {
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
    setLoadingStatus,
  } = useCollabsphere();
  const weeks = [];
  let week = [];

  // Pad the front so the grid lines up with the actual day of week
  // (column index === date.getDay()), instead of just chunking sequentially.
  const paddedActivityData = [];
  if (activityData.length > 0) {
    const leadingBlanks = activityData[0].date.getDay();
    for (let i = 0; i < leadingBlanks; i++) {
      paddedActivityData.push({ date: null, activity: null });
    }
    paddedActivityData.push(...activityData);
  }

  paddedActivityData.forEach((day) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });

  if (week.length > 0) weeks.push(week);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let lastMonth = -1;

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users/activity`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          const formattedData = response.data.userActivity.map((entry) => ({
            date: new Date(entry.date),
            activity: entry.activity,
          })).sort((a, b) => a.date - b.date);
          setActivityData(formattedData);
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
    <Container maxWidth="lg" sx={{ margin: "30px auto", overflowX: "auto" }}>
      <Grid
        container
        spacing={1}
        wrap="nowrap"
        alignItems="flex-start"
        sx={{ width: "max-content" }}
      >
        <Grid
          item
          container
          sx={{
            margin: "20px 0 0 0",
            paddingLeft: "0px",
            paddingTop: "0px",
            width: "auto",
          }}
          flexDirection="column"
        >
          {dayNames.map((dayName, index) => (
            <Grid
              item
              key={index}
              sx={{
                width: 15,
                height: 15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: "10px", lineHeight: "0" }}>
                {dayName}
              </span>
            </Grid>
          ))}
        </Grid>
        <Grid
          item
          container
          direction="row"
          wrap="nowrap"
          alignItems="flex-start"
        >
          {weeks.map((week, weekIndex) => {
            const firstRealDay = week.find((day) => day.date !== null);
            const currentMonth = firstRealDay?.date.getMonth();
            const isNewMonth =
              firstRealDay !== undefined && lastMonth !== currentMonth;
            if (firstRealDay !== undefined) lastMonth = currentMonth;

            return (
              <Grid
                item
                key={weekIndex}
                container
                direction="column"
                sx={{ margin: "0 5px 0 0", padding: "0", width: "auto" }}
              >
                {isNewMonth ? (
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    {monthNames[currentMonth]}
                  </span>
                ) : (
                  <div style={{ height: "15px", marginBottom: "5px" }} />
                )}
                {week.map((day, dayIndex) =>
                  day.date === null ? (
                    <Grid item key={dayIndex}>
                      <Box sx={{ width: 15, height: 15, marginBottom: "5px" }} />
                    </Grid>
                  ) : (
                    <Grid item key={dayIndex}>
                      <Card
                        sx={{
                          width: 15,
                          height: 15,
                          cursor: "pointer",
                          marginBottom: "5px",
                          border: "1px solid rgba(27, 31, 35, 0.08)",
                          backgroundColor:
                            day.activity === 0
                              ? "#EBEDF0"
                              : `rgba(0, 128, 0, ${Math.min(
                                  day.activity / 5,
                                  1
                                )})`,
                        }}
                        title={`${day.date.toDateString()}: ${
                          day.activity
                        } contributions`}
                      />
                    </Grid>
                  )
                )}
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ActivityGrid;
