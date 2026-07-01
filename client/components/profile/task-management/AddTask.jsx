import {
  Box,
  TextField,
  Button,
  Typography,
  ButtonGroup,
  FormHelperText,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { useFormContext, Controller } from "react-hook-form";

const accentFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "primary.main",
    "& fieldset": { borderColor: "primary.main" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& .MuiInputLabel-root": { color: "primary.main" },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
  "& .MuiIconButton-root": { color: "primary.main" },
};

const priorityOptions = ["Low", "Moderate", "High"];

const AddTask = ({ setSelectedDate, selectedDate }) => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <Box
      sx={{
        backgroundColor: "secondary.main",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92vw", sm: 560 },
        maxHeight: "90vh",
        overflowY: "auto",
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        boxShadow: 24,
        p: { xs: 2.5, sm: 4 },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          variant="outlined"
          label="Task Title"
          fullWidth
          sx={accentFieldSx}
          {...register("title", { required: "Task title is required" })}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setValue("date", newDate);
            }}
            label="Select a Date"
            sx={{ width: "100%", ...accentFieldSx }}
          />
        </LocalizationProvider>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
        <TextField
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          label="Task Description"
          sx={accentFieldSx}
          {...register("description", { required: "Task description is required" })}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <Box sx={{ width: "100%" }}>
          <Typography variant="body2" sx={{ mb: 1, color: "primary.main" }}>
            Task Priority
          </Typography>
          <Controller
            name="priority"
            control={control}
            rules={{ required: "Please select a priority" }}
            defaultValue=""
            render={({ field }) => (
              <ButtonGroup variant="outlined" fullWidth>
                {priorityOptions.map((option) => (
                  <Button
                    key={option}
                    onClick={() => setValue("priority", option)}
                    sx={{
                      backgroundColor: field.value === option ? "primary.main" : "transparent",
                      borderColor: "primary.main",
                      color: field.value === option ? "secondary.main" : "primary.main",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "primary.main",
                        color: "secondary.main",
                      },
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </ButtonGroup>
            )}
          />
          {errors.priority && (
            <FormHelperText error>{errors.priority.message}</FormHelperText>
          )}
        </Box>
      </Stack>

      <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, py: 1.25 }}>
        Add
      </Button>
    </Box>
  );
};

AddTask.propTypes = {
  setSelectedDate: PropTypes.func.isRequired,
  selectedDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]).isRequired,
};

export default AddTask;
