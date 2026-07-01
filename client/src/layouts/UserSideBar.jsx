import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SettingsIcon from "@mui/icons-material/Settings";
import SellIcon from "@mui/icons-material/Sell";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PollIcon from "@mui/icons-material/Poll";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

import DashboardSidebar from "./DashboardSidebar";

const navItems = [
  { label: "My Profile", url: "/profile", icon: <DashboardIcon /> },
  { label: "Community", url: "/community", icon: <PeopleIcon /> },
  { label: "My Post", url: "/my-post", icon: <ListAltIcon /> },
  { label: "Add Post", url: "/add-post", icon: <AddBoxIcon /> },
  { label: "Add Product", url: "/add-product", icon: <AddShoppingCartIcon /> },
  { label: "My Product", url: "/my-product", icon: <SellIcon /> },
  { label: "Task Manager", url: "/task-management", icon: <PlaylistAddCheckIcon /> },
  { label: "Assignments", url: "/assignments", icon: <AssignmentIcon /> },
  { label: "Polls", url: "/polls", icon: <PollIcon /> },
  { label: "Resources", url: "/resources", icon: <LibraryBooksIcon /> },
  { label: "Setting", url: "/setting", icon: <SettingsIcon /> },
];

const UserSideBar = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (!token || !role) {
      Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
      Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
      navigate("/login");
    } else if (role === "admin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <DashboardSidebar navItems={navItems}>{children}</DashboardSidebar>;
};

UserSideBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSideBar;
