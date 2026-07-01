import { Box, Button, TextField, IconButton, Typography, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import useCollabsphere from "../../../src/hooks/useCollabsphere";
import Cookies from "js-cookie";

const AddProductForm = () => {
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useFormContext();
  const onSubmit = async (data) => {
    const formPayload = new FormData();
    if (data.productimage && data.productimage[0] instanceof File) {
      formPayload.append("productimage", data.productimage[0]);
    }
    formPayload.append("title", data.title);
    formPayload.append("price", data.price);
    formPayload.append("description", data.description);

    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/products`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`,
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

  const productImage = watch("productimage");

  let productImageUrl = null;
  if (productImage && productImage[0] && productImage[0] instanceof File) {
    try {
      productImageUrl = URL.createObjectURL(productImage[0]);
    } catch (error) {
      console.error("Error creating object URL:", error);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField
          label="Product Title"
          placeholder="Enter Product Title"
          fullWidth
          {...register("title", { required: "Product title is required" })}
          error={!!errors.title}
          helperText={errors.title ? errors.title.message : ""}
        />

        <Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => document.getElementById("productimage").click()}
          >
            Upload Images
          </Button>
          <input
            id="productimage"
            style={{ display: "none" }}
            type="file"
            {...register("productimage", {
              required: "File is required",
              validate: {
                validFileType: (value) =>
                  (value &&
                    value.length > 0 &&
                    ["image/jpeg", "image/png"].includes(value[0].type)) ||
                  "Only JPEG and PNG files are allowed",
              },
            })}
          />
          {errors.productimage && (
            <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
              {errors.productimage.message}
            </Typography>
          )}

          {productImageUrl && (
            <Box sx={{ position: "relative", display: "inline-block", mt: 1 }}>
              <Box
                component="img"
                src={productImageUrl}
                alt="Product preview"
                sx={{
                  width: 120,
                  height: 70,
                  objectFit: "cover",
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                }}
              />
              <IconButton
                aria-label="delete"
                size="small"
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  backgroundColor: "white",
                  boxShadow: 1,
                  color: "error.main",
                  "&:hover": { backgroundColor: "white" },
                }}
                onClick={() => {
                  setValue("productimage", null);
                  document.getElementById("productimage").value = "";
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <TextField
          label="Product Price"
          placeholder="Enter Product Price"
          fullWidth
          {...register("price", { required: "Product price is required" })}
          error={!!errors.price}
          helperText={errors.price ? errors.price.message : ""}
        />

        <TextField
          label="Description"
          multiline
          rows={4}
          fullWidth
          {...register("description", { required: "Description is required" })}
          error={!!errors.description}
          helperText={errors.description ? errors.description.message : ""}
        />

        <Button variant="contained" color="primary" fullWidth type="submit" sx={{ py: 1.25 }}>
          Add
        </Button>
      </Stack>
    </Box>
  );
};

export default AddProductForm;
