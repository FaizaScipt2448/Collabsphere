import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import PropTypes from "prop-types";

const ProfileListCard = ({ title, items, renderItem, emptyMessage }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          <List disablePadding>
            {items.map((item, index) => {
              const { key, primary, secondary, avatar } = renderItem(item);
              return (
                <div key={key}>
                  <ListItem sx={{ px: 0, py: 1.25 }}>
                    {avatar && (
                      <ListItemAvatar>
                        <Avatar alt={primary} src={avatar} />
                      </ListItemAvatar>
                    )}
                    <ListItemText primary={primary} secondary={secondary} />
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </div>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

ProfileListCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  emptyMessage: PropTypes.string,
};

ProfileListCard.defaultProps = {
  emptyMessage: "Nothing to show yet.",
};

export default ProfileListCard;
