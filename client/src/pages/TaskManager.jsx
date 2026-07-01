import { Grid, Box, List, Fab, Modal, Typography } from "@mui/material";
import TaskStatus from "../../components/profile/task-management/TaskStatus";
import Task from "../../components/profile/task-management/Task";

import AddIcon from "@mui/icons-material/Add";
import AddTask from "../../components/profile/task-management/AddTask";
import { useEffect, useState } from "react";
import axios from "axios";
import useCollabsphere from "../hooks/useCollabsphere";
import dayjs from "dayjs";
import { useForm, FormProvider } from "react-hook-form";
import Cookies from "js-cookie";

const columns = [
  { status: "todo", label: "To Do", color: "primary.main" },
  { status: "ongoing", label: "Ongoing", color: "primary.dark" },
  { status: "completed", label: "Completed", color: "secondary.main" },
];

const TaskManager = () => {
  const [allTask, setAllTask] = useState([]);
  const [todo, setTodo] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const methods = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setAllTask(response.data.tasks);
        } else {
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    setTodo(allTask.filter((task) => task.taskStatus === "todo"));
    setOngoing(allTask.filter((task) => task.taskStatus === "ongoing"));
    setCompleted(allTask.filter((task) => task.taskStatus === "completed"));
  }, [allTask]);
  const onSubmit = async (data) => {
    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/tasks`,
        { ...data, selectedDate },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );

      setAllTask((prevTasks) => [
        ...prevTasks,
        { ...data, selectedDate, taskStatus: "todo" },
      ]);
      if (response.data.status) {
        setOpenModal(false);
        methods.reset();
        setSelectedDate(dayjs());
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

  const handleDrop = async (taskId, status) => {
    try {
      setLoadingStatus(true);
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/tasks/${taskId}/${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      const updatedTasks = allTask.map((task) =>
        task._id === taskId ? { ...task, taskStatus: status } : task
      );
      setAllTask(updatedTasks);
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
  const handleDelete = async (taskId) => {
    try {
      setLoadingStatus(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        setAllTask(allTask.filter((item) => item._id !== taskId));
        setAlertBoxOpenStatus(true);
        setAlertSeverity("success");
        setAlertMessage(response.data.message);
      } else {
        setLoadingStatus(false);
        console.log(response.data);
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    }
  };

  const tasksByStatus = { todo, ongoing, completed };

  return (
    <Box sx={{ position: "relative" }}>
      <Grid container spacing={3}>
        {columns.map(({ status, label, color }) => (
          <Grid item xs={12} sm={4} key={status}>
            <Box sx={{ borderRadius: 2, p: 2, backgroundColor: color }}>
              <TaskStatus status={status} onDrop={handleDrop} />
              <Typography align="center" color="white" fontWeight={700} mt={1}>
                {label}
              </Typography>
            </Box>
            <List sx={{ minHeight: { xs: "auto", sm: "60vh" } }}>
              {tasksByStatus[status].map((item) => (
                <Task
                  key={item._id}
                  text={item.title}
                  taskId={item._id}
                  handleDelete={handleDelete}
                />
              ))}
            </List>
          </Grid>
        ))}
      </Grid>

      <Fab
        aria-label="add"
        color="primary"
        sx={{
          position: "fixed",
          bottom: { xs: 24, sm: 50 },
          right: { xs: 24, sm: 70 },
        }}
        onClick={() => setOpenModal(!openModal)}
      >
        <AddIcon />
      </Fab>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <AddTask setSelectedDate={setSelectedDate} selectedDate={selectedDate} />
            </form>
          </FormProvider>
        </Box>
      </Modal>
    </Box>
  );
};

export default TaskManager;
