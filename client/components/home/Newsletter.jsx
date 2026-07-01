import { Box, Typography, TextField, Button, Stack } from "@mui/material";

const Newsletter = () => {
  return (
    <Box
      sx={{
        backgroundColor: "secondary.main",
        borderRadius: 4,
        maxWidth: "1280px",
        mx: "auto",
        my: { xs: 6, md: 10 },
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 6 },
      }}
    >
      <Typography variant="h4" component="h2" fontWeight={700} color="white" gutterBottom>
        Subscribe to our Newsletter
      </Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mb: 3, maxWidth: 520 }}>
        Stay updated with the latest trends, insights, and highlights. Enter your email and never
        miss out on exciting news.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} maxWidth={520}>
        <TextField
          placeholder="Enter your email address"
          fullWidth
          sx={{ backgroundColor: "white", borderRadius: 1 }}
        />
        <Button variant="contained" color="primary" sx={{ px: 4 }}>
          Submit
        </Button>
      </Stack>
    </Box>
  );
};

export default Newsletter;
