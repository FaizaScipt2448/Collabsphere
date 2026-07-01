import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PollIcon from "@mui/icons-material/Poll";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

import DashboardSidebar from "./DashboardSidebar";

const navItems = [
  { label: "Dashboard", url: "/dashboard", icon: <DashboardIcon /> },
  { label: "Users", url: "/dashboard/users", icon: <GroupIcon /> },
  { label: "Assignments", url: "/dashboard/assignments", icon: <AssignmentIcon /> },
  { label: "Polls", url: "/dashboard/polls", icon: <PollIcon /> },
  { label: "Resources", url: "/dashboard/resources", icon: <LibraryBooksIcon /> },
];

const AdminSideBar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (!token || !role) {
      Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
      Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
      navigate("/login");
    } else if (role === "user") {
      navigate("/profile");
    }
  }, [navigate]);

  return (
    <DashboardSidebar navItems={navItems}>
      <Outlet />
    </DashboardSidebar>
  );
};

export default AdminSideBar;
