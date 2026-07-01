import { Typography, Button, Divider, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useEffect } from "react";
import Cookies from "js-cookie";
import useCollabsphere from "../hooks/useCollabsphere";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthTextField from "../../components/auth/AuthTextField";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const Registration = () => {
  // alert message
  const navigate = useNavigate();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } =
    useCollabsphere();
  // form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });
  // form submit
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/registration`,
        data
      );
      if (response.data.status) {
        Cookies.set(import.meta.env.VITE_TOKEN_KEY, response.data.token, {
          expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
          path: "",
        });
        Cookies.set(import.meta.env.VITE_USER_ROLE, response.data.user.role, {
          expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
          path: "",
        });
        if (response.data.user.role === "user") {
          navigate("/profile");
        } else if (response.data.user.role === "admin") {
          navigate("/dashboard");
        } else {
          setAlertBoxOpenStatus(true);
          setAlertSeverity("error");
          setAlertMessage("Something Went Wrong");
        }
      } else {
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    }
  };
  // check if user is already logged in
  useEffect(() => {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (token && role) {
      if (role === "user") {
        navigate("/profile");
      } else if (role === "admin") {
        navigate("/dashboard");
      }
    } else {
      Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
      Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
    }
  }, [navigate]);

  return (
    <AuthLayout image="/images/auth.jpg">
      <Typography variant="h4" component="h2" color="white" fontWeight={700} gutterBottom>
        Join Now
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
        <AuthTextField
          placeholder="Enter Full Name"
          error={errors.fullName}
          {...register("fullName", { required: true })}
        />
        <AuthTextField
          placeholder="Enter Email"
          error={errors.email}
          {...register("email", { required: true })}
        />
        <AuthTextField
          placeholder="Enter Password"
          type="password"
          error={errors.password}
          {...register("password", { required: true })}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.25 }}>
          Join
        </Button>
      </Box>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
        OR
      </Divider>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", "&:hover": { borderColor: "white" } }}
      >
        Continue With Google
      </Button>

      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 4 }}>
        Already Have an Account?{" "}
        <Box component={Link} to="/login" sx={{ color: "primary.main", fontWeight: 600 }}>
          Log In
        </Box>
      </Typography>
    </AuthLayout>
  );
};

export default Registration;
