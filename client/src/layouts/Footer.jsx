import {
  Grid,
  Typography,
  Box,
  Divider,
  Button,
  ListItemButton,
  ListItemText,
  List,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const footerLinks = {
  Solutions: [
    { label: "Facebook", to: "/case-studies" },
    { label: "Linkedin", to: "/blogs" },
    { label: "You Tube", to: "/blogs" },
  ],
  Products: [
    { label: "Community", to: "/community" },
    { label: "Forums", to: "/forums" },
  ],
  Resources: [
    { label: "Case Studies", to: "/case-studies" },
    { label: "Blogs", to: "/blogs" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/career" },
    { label: "Contact Us", to: "/contact" },
  ],
};

const FooterColumn = ({ title, links }) => (
  <Grid item xs={6} sm={4} md={2}>
    <Typography variant="subtitle1" fontWeight={700} mb={1}>
      {title}
    </Typography>
    <List disablePadding>
      {links.map(({ label, to }) => (
        <ListItemButton
          key={label}
          component={Link}
          to={to}
          disableGutters
          sx={{
            py: 0.5,
            color: "rgba(255,255,255,0.75)",
            "&:hover": { color: "primary.main", backgroundColor: "transparent" },
          }}
        >
          <ListItemText primary={label} sx={{ m: 0 }} />
        </ListItemButton>
      ))}
    </List>
  </Grid>
);

FooterColumn.propTypes = {
  title: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{ backgroundColor: "secondary.main", color: "white", pt: 8, pb: 3 }}
    >
      <Box maxWidth="1280px" mx="auto" px={{ xs: 2, md: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box component="img" src="/images/favicon.ico" width={42} alt="Collabsphere" />
          <Typography sx={{ fontFamily: "Platypi", color: "primary.main" }} variant="h5" fontWeight={700}>
            Collabsphere
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mt: 1 }}>
          Connecting Ideas, Inspiring Perspectives
        </Typography>

        <Grid container spacing={4} my={2}>
          {Object.entries(footerLinks).map(([title, links]) => (
            <FooterColumn key={title} title={title} links={links} />
          ))}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                backgroundColor: "primary.main",
                color: "secondary.main",
                borderRadius: 2,
                borderTopLeftRadius: 48,
                p: 2.5,
                textAlign: { xs: "left", md: "right" },
              }}
            >
              <Typography fontWeight={600}>1-800-600-0464</Typography>
              <Typography>support@collabsphere.com</Typography>
              <Typography>900-140 10th Avenue SE</Typography>
              <Typography>Calgary, AB TG 0R1</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", mb: 2 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Copyright {new Date().getFullYear()} Collabsphere. All rights reserved
          </Typography>
          <Stack direction="row">
            <Button sx={{ color: "primary.main", "&:hover": { backgroundColor: "transparent" } }}>
              Privacy Policy
            </Button>
            <Button sx={{ color: "primary.main", "&:hover": { backgroundColor: "transparent" } }}>
              Terms of Services
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
