import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useCollabsphere from "../hooks/useCollabsphere";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

const Product = () => {
  const { productId } = useParams();
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertSeverity,
    setAlertMessage,
  } = useCollabsphere();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/products/${productId}`
        );
        if (response.data.status) {
          setProduct(response.data.product);
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
  }, [
    productId,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
    setLoadingStatus,
  ]);

  if (!product) {
    return (
      <Container sx={{ maxWidth: 1280, my: 4 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" fontWeight={700} color="secondary.main">
            Product not found
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container sx={{ maxWidth: 1280, my: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="320"
          image={`${import.meta.env.VITE_SERVER_ENDPOINT}/productimage/${product.image}`}
          alt={product.title}
        />
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              {product.title}
            </Typography>
            <Box textAlign={{ xs: "left", sm: "right" }} color="text.secondary">
              <Typography>{product.authorName}</Typography>
              <Typography variant="body2">{product.authorEmail}</Typography>
            </Box>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
            {product.description}
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              Price: ${product.price}
            </Typography>
            <Button variant="contained" color="primary" startIcon={<ShoppingCart />} sx={{ px: 3 }}>
              Buy
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Product;
