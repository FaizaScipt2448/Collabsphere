import { Box, Card, Typography, Avatar, Stack } from "@mui/material";
import PropTypes from "prop-types";

const ProfileCardDetails = ({ data }) => {
  return (
    <Card
      sx={{
        backgroundColor: "primary.main",
        height: "100%",
        p: 3,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ width: "100%", color: "secondary.main" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            noWrap
            title={data?.fullName}
          >
            {data?.fullName}
          </Typography>
          <Typography variant="body1" noWrap title={data?.email}>
            {data?.email}
          </Typography>
        </Box>
        <Avatar
          alt={data?.fullName}
          src={data?.image || "https://cdn-icons-png.flaticon.com/512/5556/5556468.png"}
          sx={{
            width: 72,
            height: 72,
            border: "3px solid white",
            flexShrink: 0,
          }}
        />
      </Stack>
    </Card>
  );
};

ProfileCardDetails.propTypes = {
  data: PropTypes.object,
};

export default ProfileCardDetails;
