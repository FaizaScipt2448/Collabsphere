import { forwardRef } from "react";
import { TextField } from "@mui/material";
import PropTypes from "prop-types";

// TextField styled to sit on the dark auth-panel background used by Login/Registration.
// Must forward its ref so react-hook-form's register() can bind to the real input.
const AuthTextField = forwardRef(({ error, ...props }, ref) => (
  <TextField
    inputRef={ref}
    fullWidth
    error={!!error}
    helperText={error?.message}
    sx={{
      mb: 2,
      "& .MuiOutlinedInput-root": {
        color: "white",
        "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
        "&:hover fieldset": { borderColor: "white" },
        "&.Mui-focused fieldset": { borderColor: "primary.main" },
      },
      "& .MuiInputBase-input::placeholder": {
        color: "rgba(255,255,255,0.6)",
        opacity: 1,
      },
      "& .MuiFormHelperText-root": { color: "#ff8a8a" },
    }}
    {...props}
  />
));

AuthTextField.displayName = "AuthTextField";

AuthTextField.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
};

export default AuthTextField;
