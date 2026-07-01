import { Box, Typography } from "@mui/material";
import ChangePassword from "../../components/setting/ChangePassword";

const Setting = () => {
  return (
    <Box maxWidth={420}>
      <Typography variant="h5" fontWeight={700} color="secondary.main" gutterBottom>
        Account Settings
      </Typography>
      <ChangePassword />
    </Box>
  );
};

export default Setting;
