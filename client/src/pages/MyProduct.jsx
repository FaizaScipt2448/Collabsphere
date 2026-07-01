import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import useCollabsphere from "../hooks/useCollabsphere";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Delete, Edit } from "@mui/icons-material";

const MyProduct = () => {
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
          `${import.meta.env.VITE_SERVER_ENDPOINT}/products`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get(
                import.meta.env.VITE_TOKEN_KEY
              )}`,
            },
          }
        );
        if (response.data.status) {
          setData(response.data.products);
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

  const handleRemove = async (productId) => {
    try {
      setLoadingStatus(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        setData(data.filter((item) => item._id !== productId));
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

  const handleEdit = (productId) => {
    console.log(`Edit button clicked for ${productId}`);
  };

  if (data.length === 0) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h5" fontWeight={700} color="secondary.main">
          No Product Available
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Products you list will show up here.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {data.map((product) => (
        <Grid item key={product._id} xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(27,46,53,0.12)" },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                height="160"
                image={`${import.meta.env.VITE_SERVER_ENDPOINT}/productimage/${product.image}`}
                alt={product.title}
              />
              <Box sx={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  sx={{ backgroundColor: "white", boxShadow: 1, "&:hover": { backgroundColor: "primary.main" } }}
                  onClick={() => handleEdit(product._id)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ backgroundColor: "white", boxShadow: 1, color: "error.main", "&:hover": { backgroundColor: "error.main", color: "white" } }}
                  onClick={() => handleRemove(product._id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <CardContent component={Link} to={`/products/${product._id}`} sx={{ display: "block", textDecoration: "none" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} color="secondary.main" noWrap>
                  {product.title}
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary.dark">
                  ${product.price}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MyProduct;
