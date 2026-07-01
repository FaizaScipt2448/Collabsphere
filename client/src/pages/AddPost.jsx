import {
  Box,
  TextField,
  Button,
  InputBase,
  Chip,
  Typography,
  Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";

import SimpleMdeReact from "react-simplemde-editor";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "easymde/dist/easymde.min.css";
import useCollabsphere from "../hooks/useCollabsphere";
import axios from "axios";
import Cookies from "js-cookie";

const fieldLabelSx = { fontWeight: 700, mb: 1, display: "block" };

const AddPost = () => {
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useCollabsphere();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState("");

  const handleKeyDown = (event) => {
    if ((event.key === "Enter" || event.key === " ") && tag.trim() !== "") {
      event.preventDefault();
      const newTags = tag
        .split(/\s+/)
        .map((value) => value.trim())
        .filter((value) => value !== "" && !tags.includes(value));
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
        clearErrors("tags");
      }
      setTag("");
    }
  };

  const renderMarkdown = () => {
    const html = marked(description);
    return { __html: DOMPurify.sanitize(html) };
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
  };

  const onSubmit = async (data) => {
    const pendingTags = tag
      .split(/\s+/)
      .map((value) => value.trim())
      .filter((value) => value !== "" && !tags.includes(value));
    const allTags = [...tags, ...pendingTags];
    if (allTags.length === 0) {
      setError("tags", {
        type: "manual",
        message: "At least one tag is required",
      });
      return;
    }
    if (pendingTags.length > 0) {
      setTags(allTags);
      setTag("");
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      setError("description", {
        type: "manual",
        message: "Description is required",
      });
      return;
    }

    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts`,
        {
          title: data.title,
          tags: allTags,
          description: trimmedDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`,
          },
        }
      );

      if (response.data.status) {
        reset();
        setTags([]);
        setDescription("");
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

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="subtitle1" sx={fieldLabelSx}>
              Title
            </Typography>
            <TextField
              placeholder="Enter Post Title"
              fullWidth
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title ? errors.title.message : ""}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" sx={fieldLabelSx}>
              Tags
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                p: 1,
                borderRadius: 1,
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {tags.map((item, index) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    "& .MuiChip-deleteIcon": { color: "white" },
                  }}
                  onDelete={() => handleRemoveTag(index)}
                />
              ))}

              <InputBase
                sx={{ px: 1, minWidth: 120, flex: 1 }}
                placeholder="Enter Your Tag"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Box>
            {errors.tags && (
              <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
                {errors.tags.message}
              </Typography>
            )}
          </Box>

          {description.trim() !== "" && (
            <Box>
              <Typography variant="subtitle1" sx={fieldLabelSx}>
                Preview
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
                dangerouslySetInnerHTML={renderMarkdown()}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={fieldLabelSx}>
            Description
          </Typography>
          <SimpleMdeReact id="description" value={description} onChange={setDescription} />
          {errors.description && (
            <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
              {errors.description.message}
            </Typography>
          )}
        </Grid>
      </Grid>

      <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, py: 1.25 }}>
        Post
      </Button>
    </Box>
  );
};

export default AddPost;
