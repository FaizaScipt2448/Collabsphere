import PropTypes from "prop-types";
import { useDrop } from "react-dnd";
import { Box } from "@mui/material";
import BallotOutlinedIcon from "@mui/icons-material/BallotOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const statusIcons = {
  todo: BallotOutlinedIcon,
  ongoing: RocketLaunchIcon,
  completed: CheckCircleIcon,
};

const TaskStatus = ({ onDrop, status }) => {
  const [, drop] = useDrop({
    accept: "TASK_ITEM",
    drop: (item) => onDrop(item.taskId, status),
  });

  const StatusIcon = statusIcons[status];

  return (
    <div ref={drop}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {StatusIcon && <StatusIcon sx={{ fontSize: 56, color: "white" }} />}
      </Box>
    </div>
  );
};

TaskStatus.propTypes = {
  onDrop: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

export default TaskStatus;
