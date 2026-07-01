import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Toolbar,
} from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import Cookies from "js-cookie";

import NavBar from "./NavBar";
import Footer from "./Footer";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";

const DRAWER_WIDTH = 240;

const DashboardSidebar = ({ navItems, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } =
    useCollabsphere();

  const handleLogOut = () => {
    setAlertBoxOpenStatus(true);
    setAlertSeverity("success");
    setAlertMessage("Logged Out Successfully");
    Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
    Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
    navigate("/login");
  };

  const drawerContent = (
    <List sx={{ p: 0 }} onClick={() => setMobileOpen(false)}>
      {navItems.map(({ label, url, icon }) => {
        const active = location.pathname === url;
        return (
          <ListItem key={url} disablePadding sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <ListItemButton
              component={NavLink}
              to={url}
              sx={{
                py: 1.5,
                color: active ? "primary.dark" : "text.primary",
                backgroundColor: active ? "background.default" : "transparent",
                "&:hover": { backgroundColor: "background.default" },
              }}
            >
              <ListItemIcon sx={{ color: active ? "primary.dark" : "text.secondary", minWidth: 40 }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 600 : 500 }} />
            </ListItemButton>
          </ListItem>
        );
      })}
      <ListItem disablePadding sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <ListItemButton onClick={handleLogOut} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <AlertBox />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Box
          component="nav"
          sx={{ display: { xs: "flex", md: "block" }, alignItems: "flex-start" }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, m: 1 }}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
            }}
          >
            <Toolbar />
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              width: DRAWER_WIDTH,
              "& .MuiDrawer-paper": { width: DRAWER_WIDTH, position: "static" },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box sx={{ width: "100%", minWidth: 0, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
      <Footer />
    </Box>
  );
};

DashboardSidebar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ).isRequired,
  children: PropTypes.node.isRequired,
};

export default DashboardSidebar;
