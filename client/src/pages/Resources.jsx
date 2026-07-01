import {
  Box, Typography, Card, CardContent, Stack, Chip, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid,
  InputAdornment
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";

const api = import.meta.env.VITE_SERVER_ENDPOINT;
const authHeader = () => ({ Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}` });

const Resources = () => {
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useCollabsphere();
  const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
  const isAdmin = role === "admin" || role === "teacher";

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", url: "", subject: "",
    visibility: "public", audience: "all"
  });

  const showAlert = (msg, sev = "error") => {
    setAlertBoxOpenStatus(true); setAlertSeverity(sev); setAlertMessage(msg);
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      const res = await axios.get(`${api}/resources`, { headers: authHeader(), params });
      if (res.data.status) setResources(res.data.resources);
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchResources(); }, [search, subjectFilter]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.url.trim()) return showAlert("Title and URL are required");
    setCreating(true);
    try {
      const res = await axios.post(`${api}/resources`, form, { headers: authHeader() });
      if (res.data.status) {
        showAlert("Resource shared!", "success");
        setCreateOpen(false);
        setForm({ title: "", description: "", url: "", subject: "", visibility: "public", audience: "all" });
        fetchResources();
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${api}/resources/${id}`, { headers: authHeader() });
      if (res.data.status) {
        setResources(prev => prev.filter(r => r._id !== id));
        showAlert("Resource deleted", "success");
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    }
  };

  return (
    <Box>
      <AlertBox />
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LibraryBooksIcon color="primary" />
          <Typography variant="h5" fontWeight={700} color="secondary.main">Resources</Typography>
        </Stack>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}>
          Share Resource
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          placeholder="Search resources..."
          size="small" sx={{ flex: 1 }}
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField
          placeholder="Filter by subject"
          size="small" sx={{ minWidth: 160 }}
          value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
        />
      </Stack>

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : resources.length === 0 ? (
        <Box textAlign="center" py={6}>
          <LibraryBooksIcon sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography color="text.secondary" mt={1}>No resources found.</Typography>
          <Typography variant="body2" color="text.secondary">Be the first to share a resource!</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {resources.map(r => (
            <Grid item xs={12} sm={6} md={4} key={r._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column",
                transition: "box-shadow 0.2s", "&:hover": { boxShadow: 4 } }}>
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
                    <Typography variant="h6" fontWeight={700} sx={{
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                    }}>
                      {r.title}
                    </Typography>
                    {r.subject && <Chip label={r.subject} size="small" color="primary" flexShrink={0} />}
                  </Stack>
                  {r.description && (
                    <Typography variant="body2" color="text.secondary" mb={1} sx={{
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                    }}>
                      {r.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={1.5}>
                    <Chip label={r.audience} size="small" variant="outlined" />
                    <Chip label={r.visibility} size="small" variant="outlined" color={r.visibility === "public" ? "success" : "default"} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Shared by {r.createdBy?.fullName} • {dayjs(r.createdAt).format("MMM D, YYYY")}
                  </Typography>
                </CardContent>
                <Stack direction="row" spacing={1} p={1.5} pt={0}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    fullWidth
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    component="a"
                  >
                    Open
                  </Button>
                  {isAdmin && (
                    <Button variant="outlined" color="error" size="small"
                      onClick={() => handleDelete(r._id)}>
                      <DeleteIcon fontSize="small" />
                    </Button>
                  )}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Resource Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share a Resource</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField label="Title *" fullWidth value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="URL *" fullWidth value={form.url} placeholder="https://..."
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Subject" fullWidth value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Audience</InputLabel>
                  <Select value={form.audience} label="Audience"
                    onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="students">Students</MenuItem>
                    <MenuItem value="teachers">Teachers</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreate} disabled={creating}>
            {creating ? "Sharing..." : "Share Resource"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Resources;
