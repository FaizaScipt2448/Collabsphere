import {
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Box,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { useEffect } from "react";
import axios from "axios";
import useCollabsphere from "../hooks/useCollabsphere";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthTextField from "../../components/auth/AuthTextField";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  // alert message
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } =
    useCollabsphere();
  // form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });

  // form submit
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/login`,
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
        Welcome Back
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
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

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="Remember me"
            sx={{ color: "rgba(255,255,255,0.75)" }}
          />
          <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            sx={{ color: "white", "&:hover": { color: "primary.main" } }}
          >
            Forgot Password
          </Typography>
        </Stack>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.25 }}>
          Log In
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
        {`Don't`} Have an Account?{" "}
        <Box component={Link} to="/registration" sx={{ color: "primary.main", fontWeight: 600 }}>
          Join Now
        </Box>
      </Typography>
    </AuthLayout>
  );
};

export default Login;
