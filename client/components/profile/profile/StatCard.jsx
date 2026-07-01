import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const StatCard = ({ icon, label, value }) => (
  <Box
    sx={{
      backgroundColor: "secondary.main",
      color: "white",
      borderRadius: 2,
      p: 2,
      height: "100%",
      boxShadow: "0 2px 10px rgba(27, 46, 53, 0.12)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      {icon}
      <Typography variant="body2">{label}</Typography>
    </Box>
    <Box
      sx={{
        width: 56,
        height: 56,
        fontSize: 20,
        fontWeight: 600,
        backgroundColor: "white",
        color: "secondary.main",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 2,
        mx: "auto",
      }}
    >
      {value}
    </Box>
  </Box>
);

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default StatCard;
