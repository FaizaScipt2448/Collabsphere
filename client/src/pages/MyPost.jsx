import { Box, Typography, IconButton, Paper } from "@mui/material";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

import useCollabsphere from "../hooks/useCollabsphere";

const MyPost = () => {
  const [data, setData] = useState([]);
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/posts`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setData(response.data.posts);
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

  const handleDelete = async (postId) => {
    try {
      setLoadingStatus(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        setData(data.filter((item) => item._id !== postId));
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
  const handleVisibility = async (postId) => {
    try {
      setLoadingStatus(true);
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/change-visibility/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        setData((prevData) =>
          prevData.map((post) =>
            post._id === postId
              ? { ...post, visibility: post.visibility === "public" ? "private" : "public" }
              : post
          )
        );
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

  if (data.length === 0) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h5" fontWeight={700} color="secondary.main">
          No Post Available
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Posts you create will show up here.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
      <Table stickyHeader aria-label="my posts table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              #
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              Title
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              Reactions
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              Comments
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              Visibility
            </TableCell>
            <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item._id} hover>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography component={Link} to={`/posts/${item._id}`} sx={{ color: "inherit", fontWeight: 500 }}>
                  {item.title}
                </Typography>
              </TableCell>
              <TableCell align="center">{item.reactions.length || "0"}</TableCell>
              <TableCell align="center">{item.comments.length || "0"}</TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={() => handleVisibility(item._id)}>
                  {item.visibility === "private" ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ border: "1px solid", borderColor: "divider", "&:hover": { color: "error.main" } }}
                    onClick={() => handleDelete(item._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyPost;
