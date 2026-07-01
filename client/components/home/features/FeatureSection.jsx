import { Box, Grid, Typography } from "@mui/material";
import PropTypes from "prop-types";

const FeatureSection = ({ image, title, subtitle, description, reverse }) => {
  const textAlign = { xs: "left", md: reverse ? "left" : "right" };

  return (
    <Grid
      container
      spacing={{ xs: 4, md: 6 }}
      direction={{ xs: "column-reverse", md: reverse ? "row-reverse" : "row" }}
      alignItems="center"
      sx={{ maxWidth: "1280px", mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 5, md: 8 } }}
    >
      <Grid item xs={12} md={6} data-aos="fade-up">
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{ width: "100%", borderRadius: 3, objectFit: "cover" }}
        />
      </Grid>
      <Grid item xs={12} md={6} data-aos="fade-up">
        <Box sx={{ textAlign }}>
          <Typography variant="h4" component="h2" fontWeight={700} color="secondary.main" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

FeatureSection.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  reverse: PropTypes.bool,
};

export default FeatureSection;
