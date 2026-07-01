import { Box } from "@mui/material";
import PropTypes from "prop-types";
import AlertBox from "../common/AlertBox";

const AuthLayout = ({ image, children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          p: 4,
        }}
      >
        <Box component="img" src={image} alt="" sx={{ maxWidth: "100%" }} />
      </Box>
      <Box
        sx={{
          flex: 1,
          backgroundColor: "secondary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          px: { xs: 3, sm: 6 },
          py: 6,
        }}
      >
        <AlertBox />
        <Box sx={{ width: "100%", maxWidth: 420 }}>{children}</Box>
      </Box>
    </Box>
  );
};

AuthLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
