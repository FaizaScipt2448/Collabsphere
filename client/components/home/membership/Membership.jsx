import { Box, Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const packages = [
  {
    icon: "./icons/rocket.svg",
    title: "Starter Pack",
    text: "Affordable services to kickstart your journey.",
  },
  {
    icon: "./icons/vip.svg",
    title: "Pro Bundle",
    text: "Advanced features for growing your business.",
  },
  {
    icon: "./icons/diamond.svg",
    title: "Elite Suite",
    text: "Premium solutions for ultimate success and scale.",
  },
];

const Membership = () => {
  return (
    <Box maxWidth="1280px" mx="auto" px={{ xs: 2, md: 4 }} py={{ xs: 6, md: 10 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, color: "primary.dark", letterSpacing: 1 }}
          >
            How we work
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={700} color="secondary.main">
            Get some premium services at a fraction of the cost.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1" color="text.secondary">
            Unlock premium services tailored to your needs at unbeatable prices! Whether
            you&apos;re just starting out or looking to scale, our packages offer the perfect
            blend of affordability and value.
          </Typography>
          <Button component={Link} to="/subscription" variant="contained" color="primary" sx={{ mt: 3 }}>
            See Pricing
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4} mt={{ xs: 2, md: 4 }}>
        {packages.map((item) => (
          <Grid item xs={12} sm={4} key={item.title}>
            <Box
              sx={{
                textAlign: "center",
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(27, 46, 53, 0.08)",
                },
              }}
            >
              <Box component="img" src={item.icon} alt={item.title} sx={{ width: 56 }} />
              <Typography
                variant="h6"
                component="h3"
                color="secondary.main"
                textTransform="uppercase"
                fontWeight={700}
                mt={2}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.text}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Membership;
