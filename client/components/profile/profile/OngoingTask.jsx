import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCollabsphere from "../../../src/hooks/useCollabsphere";
import ProfileListCard from "./ProfileListCard";

const OngoingTask = () => {
  const [tasks, setTasks] = useState([]);
  const {
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
    setLoadingStatus,
  } = useCollabsphere();

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/tasks?taskStatus=ongoing`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setTasks(response.data.tasks);
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
    <ProfileListCard
      title="Ongoing Task"
      items={tasks}
      emptyMessage="No ongoing tasks right now."
      renderItem={(task) => ({
        key: task._id,
        primary: task.title,
        secondary: `Deadline: ${new Date(task.deadline).toLocaleDateString()}`,
      })}
    />
  );
};

export default OngoingTask;
