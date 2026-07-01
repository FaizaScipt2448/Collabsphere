import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Task = ({ text, taskId, handleDelete }) => {
  const [, drag] = useDrag({
    type: "TASK_ITEM",
    item: { taskId },
  });

  return (
    <div ref={drag}>
      <ListItem
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          backgroundColor: "background.paper",
          mb: 1,
          cursor: "grab",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <ListItemText primary={text} />
        <IconButton size="small" color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(taskId)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItem>
    </div>
  );
};

Task.propTypes = {
  text: PropTypes.string.isRequired,
  taskId: PropTypes.string.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default Task;
