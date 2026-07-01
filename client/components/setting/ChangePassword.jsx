import { forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, IconButton, InputAdornment, Card } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import useCollabsphere from "../../src/hooks/useCollabsphere";
import axios from "axios";
import Cookies from "js-cookie";

// Must forward its ref so react-hook-form's register() can bind to the real input.
const PasswordField = forwardRef(({ visible, onToggleVisible, ...props }, ref) => (
  <TextField
    inputRef={ref}
    type={visible ? "text" : "password"}
    fullWidth
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={onToggleVisible}
            onMouseDown={(event) => event.preventDefault()}
          >
            {visible ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    {...props}
  />
));

PasswordField.displayName = "PasswordField";

PasswordField.propTypes = {
  visible: PropTypes.bool.isRequired,
  onToggleVisible: PropTypes.func.isRequired,
};

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoadingStatus(true);
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/change-password`,
        data,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );
      if (response.data.status) {
        reset();
      }
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity(response.data.status ? "success" : "error");
      setAlertMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(error.response?.data?.message || error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const validateNewPassword = (value) => {
    if (!value || value.length < 8) return "Password must be at least 8 characters long";
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    return (
      regex.test(value) ||
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  };

  const validateRetypePassword = (value) => {
    return value === watch("newPassword") || "Passwords do not match";
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <PasswordField
          label="Old Password"
          visible={showOldPassword}
          onToggleVisible={() => setShowOldPassword(!showOldPassword)}
          {...register("oldPassword", { required: "Old password is required" })}
          error={!!errors.oldPassword}
          helperText={errors.oldPassword ? errors.oldPassword.message : ""}
        />

        <PasswordField
          label="New Password"
          visible={showNewPassword}
          onToggleVisible={() => setShowNewPassword(!showNewPassword)}
          {...register("newPassword", {
            required: "New password is required",
            validate: validateNewPassword,
          })}
          error={!!errors.newPassword}
          helperText={errors.newPassword ? errors.newPassword.message : ""}
        />

        <PasswordField
          label="Retype New Password"
          visible={showRetypePassword}
          onToggleVisible={() => setShowRetypePassword(!showRetypePassword)}
          {...register("retypePassword", {
            required: "Please retype your new password",
            validate: validateRetypePassword,
          })}
          error={!!errors.retypePassword}
          helperText={errors.retypePassword ? errors.retypePassword.message : ""}
        />

        <Button variant="contained" color="primary" type="submit" sx={{ py: 1.25 }}>
          Change Password
        </Button>
      </Box>
    </Card>
  );
};

export default ChangePassword;
