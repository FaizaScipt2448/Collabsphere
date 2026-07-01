/* eslint-disable react/prop-types */
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  LinearProgress, Checkbox, Radio, FormControlLabel,
  CircularProgress, Grid
} from "@mui/material";
import PollIcon from "@mui/icons-material/Poll";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";

const api = import.meta.env.VITE_SERVER_ENDPOINT;
const authHeader = () => ({ Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}` });

const PollCard = ({ poll, onVote, onDelete, currentUserId, isAdmin }) => {
  const [selectedOptions, setSelectedOptions] = useState(poll.myVotes || []);
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const isPast = poll.deadline && dayjs().isAfter(dayjs(poll.deadline));
  const closed = poll.status === "closed" || isPast;
  const hasVoted = (poll.myVotes || []).length > 0;
  const showResults = hasVoted || closed;

  const handleChange = (optionId) => {
    if (poll.type === "single") {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      );
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" fontWeight={700}>{poll.title}</Typography>
            {poll.description && (
              <Typography variant="body2" color="text.secondary">{poll.description}</Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5} flexShrink={0}>
            <Chip label={poll.status} size="small" color={poll.status === "open" ? "success" : "default"} />
            {closed && <Chip label="Closed" size="small" color="error" />}
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          By {poll.createdBy?.fullName}
          {poll.deadline && ` • Due: ${dayjs(poll.deadline).format("MMM D, YYYY")}`}
          {` • ${totalVotes} vote${totalVotes !== 1 ? "s" : ""}`}
        </Typography>

        <Box mt={2}>
          {poll.options.map(option => {
            const pct = totalVotes ? Math.round((option.votes.length / totalVotes) * 100) : 0;
            const isSelected = (poll.myVotes || []).includes(option._id) || selectedOptions.includes(option._id);
            return (
              <Box key={option._id} mb={1.5}>
                {!showResults ? (
                  <FormControlLabel
                    control={
                      poll.type === "single"
                        ? <Radio checked={selectedOptions.includes(option._id)}
                            onChange={() => handleChange(option._id)} size="small" color="primary" />
                        : <Checkbox checked={selectedOptions.includes(option._id)}
                            onChange={() => handleChange(option._id)} size="small" color="primary" />
                    }
                    label={option.text}
                    sx={{ ml: 0 }}
                  />
                ) : (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.25}>
                      <Typography variant="body2" fontWeight={isSelected ? 700 : 400}>
                        {option.text}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{pct}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height: 8, borderRadius: 1, bgcolor: "background.default",
                        "& .MuiLinearProgress-bar": { bgcolor: isSelected ? "primary.main" : "primary.light" } }} />
                    <Typography variant="caption" color="text.secondary">
                      {option.votes.length} vote{option.votes.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={1} mt={2}>
          {!showResults && !closed && (
            <Button variant="contained" color="primary" size="small"
              disabled={selectedOptions.length === 0}
              onClick={() => onVote(poll._id, selectedOptions, setSelectedOptions)}>
              Vote
            </Button>
          )}
          {(isAdmin || poll.createdBy?._id === currentUserId) && (
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
              onClick={() => onDelete(poll._id)}>
              Delete
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const Polls = () => {
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useCollabsphere();
  const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
  const isAdmin = role === "admin" || role === "teacher";

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "single", deadline: "",
    anonymous: false, audience: "all", options: ["", ""]
  });

  const showAlert = (msg, sev = "error") => {
    setAlertBoxOpenStatus(true); setAlertSeverity(sev); setAlertMessage(msg);
  };

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (search) params.search = search;
      const res = await axios.get(`${api}/polls`, { headers: authHeader(), params });
      if (res.data.status) setPolls(res.data.polls);
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPolls(); }, [search]);

  const handleVote = async (pollId, optionIds) => {
    try {
      const res = await axios.post(`${api}/polls/${pollId}/vote`, { optionIds }, { headers: authHeader() });
      if (res.data.status) {
        showAlert("Vote recorded!", "success");
        setPolls(prev => prev.map(p =>
          p._id === pollId ? { ...p, myVotes: optionIds } : p
        ));
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    }
  };

  const handleDelete = async (pollId) => {
    try {
      const res = await axios.delete(`${api}/polls/${pollId}`, { headers: authHeader() });
      if (res.data.status) {
        setPolls(prev => prev.filter(p => p._id !== pollId));
        showAlert("Poll deleted", "success");
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    }
  };

  const handleCreate = async () => {
    const validOptions = form.options.filter(o => o.trim());
    if (!form.title.trim() || validOptions.length < 2) {
      return showAlert("Title and at least 2 options are required");
    }
    setCreating(true);
    try {
      const res = await axios.post(`${api}/polls`,
        { ...form, options: validOptions },
        { headers: authHeader() }
      );
      if (res.data.status) {
        showAlert("Poll created!", "success");
        setCreateOpen(false);
        setForm({ title: "", description: "", type: "single", deadline: "", anonymous: false, audience: "all", options: ["", ""] });
        fetchPolls();
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setCreating(false); }
  };

  return (
    <Box>
      <AlertBox />
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PollIcon color="primary" />
          <Typography variant="h5" fontWeight={700} color="secondary.main">Polls</Typography>
        </Stack>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}>
          Create Poll
        </Button>
      </Stack>

      <TextField placeholder="Search polls..." size="small" fullWidth sx={{ mb: 2 }}
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : polls.length === 0 ? (
        <Box textAlign="center" py={6}>
          <PollIcon sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography color="text.secondary" mt={1}>No polls found.</Typography>
        </Box>
      ) : (
        polls.map(poll => (
          <PollCard key={poll._id} poll={poll}
            onVote={handleVote} onDelete={handleDelete}
            isAdmin={isAdmin} currentUserId={null} />
        ))
      )}

      {/* Create Poll Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Poll</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField label="Title" fullWidth value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={form.type} label="Type"
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <MenuItem value="single">Single Choice</MenuItem>
                    <MenuItem value="multiple">Multiple Choice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField type="datetime-local" label="Deadline" fullWidth InputLabelProps={{ shrink: true }}
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </Grid>
            </Grid>
            <Typography variant="body2" fontWeight={600}>Options</Typography>
            {form.options.map((opt, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField fullWidth size="small" label={`Option ${idx + 1}`} value={opt}
                  onChange={e => setForm(f => ({ ...f, options: f.options.map((o, i) => i === idx ? e.target.value : o) }))} />
                {form.options.length > 2 && (
                  <Button size="small" color="error"
                    onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))}>
                    ✕
                  </Button>
                )}
              </Stack>
            ))}
            <Button size="small" onClick={() => setForm(f => ({ ...f, options: [...f.options, ""] }))}>
              + Add Option
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Poll"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Polls;
