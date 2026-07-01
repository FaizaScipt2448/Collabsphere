import { Box, TextField, Typography, IconButton, Paper, Chip } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCollabsphere from "../../hooks/useCollabsphere";

const Users = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();

  const handleDelete = async (userId) => {
    try {
      setLoadingStatus(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        setData((prevData) => prevData.filter((item) => item._id !== userId));
        setAlertBoxOpenStatus(true);
        setAlertSeverity("success");
        setAlertMessage(response.data.message);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Failed to delete user."
      );
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStatus(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/users`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
            params: { query: search.trim() },
          }
        );
        if (response.data.status) {
          setData(response.data.users);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(error.message || "Failed to fetch users.");
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchData();
  }, [search, setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus]);

  return (
    <Box>
      <TextField
        fullWidth
        label="Search Users"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
      />

      {!data.length ? (
        <Box textAlign="center" mt={5}>
          <Typography variant="h5" fontWeight={700} color="secondary.main">
            No User Available
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: 700, backgroundColor: "primary.main", color: "secondary.main" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item._id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography component={Link} to={`/users/${item._id}`} sx={{ color: "inherit", fontWeight: 500 }}>
                      {item.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.role}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        backgroundColor: item.role === "admin" ? "secondary.main" : "primary.main",
                        color: item.role === "admin" ? "white" : "secondary.main",
                      }}
                    />
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
      )}
    </Box>
  );
};

export default Users;
