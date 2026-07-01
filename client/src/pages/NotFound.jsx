import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import NavBar from "../layouts/NavBar";
import Footer from "../layouts/Footer";

const NotFound = () => {
  return (
    <>
      <NavBar />
      <Box maxWidth="1280px" mx="auto" px={{ xs: 2, md: 4 }} py={{ xs: 4, md: 6 }} textAlign="center">
        <Box component="img" src="/images/error.jpg" alt="Page not found" sx={{ width: "100%", maxWidth: 480, mx: "auto" }} />
        <Typography variant="h5" fontWeight={700} color="secondary.main" mt={2}>
          We can&apos;t find the page you&apos;re looking for.
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary" sx={{ mt: 3 }}>
          Back to Home
        </Button>
      </Box>
      <Footer />
    </>
  );
};

export default NotFound;
