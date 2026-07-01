/* eslint-disable react/prop-types */
import {
  Box, Typography, Tab, Tabs, Card, CardContent, Chip, Button,
  TextField, Stack, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import useCollabsphere from "../hooks/useCollabsphere";
import AlertBox from "../../components/common/AlertBox";

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusColor = { published: "success", draft: "default", closed: "error" };
const submissionColor = { submitted: "info", late: "warning", reviewed: "success" };

const authHeader = () => ({
  Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`
});

const api = import.meta.env.VITE_SERVER_ENDPOINT;

// ─── Sub-components ──────────────────────────────────────────────────────────

const AssignmentCard = ({ assignment, onSubmit, onView }) => {
  const isPast = assignment.deadline && dayjs().isAfter(dayjs(assignment.deadline));
  const sub = assignment.mySubmission;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" fontWeight={700} noWrap>{assignment.title}</Typography>
            <Typography variant="body2" color="text.secondary">{assignment.subject}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Chip label={assignment.status} size="small" color={statusColor[assignment.status] || "default"} />
            {sub && <Chip label={sub.status} size="small" color={submissionColor[sub.status] || "default"} />}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={1}
          sx={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {assignment.description}
        </Typography>

        <Stack direction="row" spacing={2} mt={1.5} flexWrap="wrap" gap={0.5}>
          <Chip label={`📅 Due: ${dayjs(assignment.deadline).format("MMM D, YYYY HH:mm")}`}
            size="small" color={isPast ? "error" : "default"} variant="outlined" />
          <Chip label={`🏆 ${assignment.totalMarks} marks`} size="small" variant="outlined" />
        </Stack>

        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
          <Button size="small" variant="outlined" color="secondary" onClick={() => onView(assignment)}>
            View Details
          </Button>
          {!sub && !isPast && assignment.status === "published" && (
            <Button size="small" variant="contained" color="primary" onClick={() => onSubmit(assignment)}>
              Submit
            </Button>
          )}
          {sub?.marks !== null && sub?.marks !== undefined && (
            <Chip label={`Marks: ${sub.marks} / ${assignment.totalMarks}`} size="small" color="success" />
          )}
          {sub?.status === "submitted" && <Chip label="Pending Review" size="small" color="info" />}
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Assignments = () => {
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useCollabsphere();
  const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
  const isAdmin = role === "admin" || role === "teacher";

  const [tab, setTab] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  // Submit dialog
  const [submitDialog, setSubmitDialog] = useState({ open: false, assignment: null });
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // View detail dialog
  const [viewDialog, setViewDialog] = useState({ open: false, assignment: null });

  // Create form
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", deadline: "",
    totalMarks: "", status: "published", audience: "all"
  });

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState({ open: false, assignment: null });
  const [submissions, setSubmissions] = useState([]);
  const [reviewData, setReviewData] = useState({});

  const showAlert = (msg, sev = "error") => {
    setAlertBoxOpenStatus(true); setAlertSeverity(sev); setAlertMessage(msg);
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;

      const res = await axios.get(`${api}/assignments`, { headers: authHeader(), params });
      if (res.data.status) setAssignments(res.data.assignments);
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await axios.get(`${api}/assignments/my-submissions`, { headers: authHeader() });
      if (res.data.status) setMySubmissions(res.data.submissions);
    } catch (e) { console.error(e); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAssignments(); }, [search, subjectFilter]);
  useEffect(() => { if (tab === 1) fetchMySubmissions(); }, [tab]);

  const handleSubmit = async () => {
    if (!answerText.trim()) return showAlert("Please write your answer");
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${api}/assignments/${submitDialog.assignment._id}/submit`,
        { answerText },
        { headers: authHeader() }
      );
      if (res.data.status) {
        showAlert("Assignment submitted!", "success");
        setSubmitDialog({ open: false, assignment: null });
        setAnswerText("");
        fetchAssignments();
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setSubmitting(false); }
  };

  const handleCreate = async () => {
    const { title, description, subject, deadline, totalMarks } = form;
    if (!title || !description || !subject || !deadline || !totalMarks) {
      return showAlert("All fields are required");
    }
    setCreating(true);
    try {
      const res = await axios.post(`${api}/assignments`, form, { headers: authHeader() });
      if (res.data.status) {
        showAlert("Assignment created!", "success");
        setForm({ title: "", description: "", subject: "", deadline: "", totalMarks: "", status: "published", audience: "all" });
        fetchAssignments();
      }
    } catch (e) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setCreating(false); }
  };

  const openReview = async (assignment) => {
    setReviewDialog({ open: true, assignment });
    try {
      const res = await axios.get(
        `${api}/assignments/${assignment._id}/submissions`,
        { headers: authHeader() }
      );
      if (res.data.status) setSubmissions(res.data.submissions);
    } catch (e) { showAlert(e.response?.data?.message || e.message); }
  };

  const handleReview = async (submissionId) => {
    const { marks, feedback } = reviewData[submissionId] || {};
    try {
      const res = await axios.patch(
        `${api}/assignments/${reviewDialog.assignment._id}/submissions/${submissionId}/review`,
        { marks: Number(marks), feedback },
        { headers: authHeader() }
      );
      if (res.data.status) {
        showAlert("Review saved", "success");
        setSubmissions(prev => prev.map(s =>
          s._id === submissionId ? { ...s, marks: Number(marks), feedback, status: "reviewed" } : s
        ));
      }
    } catch (e) { showAlert(e.response?.data?.message || e.message); }
  };

  return (
    <Box>
      <AlertBox />
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <AssignmentIcon color="primary" />
        <Typography variant="h5" fontWeight={700} color="secondary.main">Assignments</Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tab label="All Assignments" />
        <Tab label="My Submissions" />
        {isAdmin && <Tab label="Create" />}
        {isAdmin && <Tab label="Review Submissions" />}
      </Tabs>

      {/* ── Tab 0: All Assignments ── */}
      {tab === 0 && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
            <TextField
              placeholder="Search assignments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              placeholder="Filter by subject"
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            />
          </Stack>
          {loading ? (
            <Box textAlign="center" py={4}><CircularProgress /></Box>
          ) : assignments.length === 0 ? (
            <Box textAlign="center" py={6}>
              <AssignmentIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography color="text.secondary" mt={1}>No assignments found.</Typography>
            </Box>
          ) : (
            assignments.map(a => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                onSubmit={assignment => { setSubmitDialog({ open: true, assignment }); setAnswerText(""); }}
                onView={assignment => setViewDialog({ open: true, assignment })}
              />
            ))
          )}
        </>
      )}

      {/* ── Tab 1: My Submissions ── */}
      {tab === 1 && (
        mySubmissions.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary">You haven&apos;t submitted any assignments yet.</Typography>
          </Box>
        ) : (
          mySubmissions.map(sub => (
            <Card key={sub._id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{sub.assignmentId?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{sub.assignmentId?.subject}</Typography>
                  </Box>
                  <Chip label={sub.status} size="small" color={submissionColor[sub.status] || "default"} />
                </Stack>
                <Typography variant="body2" mt={1} color="text.secondary">
                  Submitted: {dayjs(sub.submittedAt).format("MMM D, YYYY HH:mm")}
                </Typography>
                {sub.status === "reviewed" ? (
                  <Box mt={1.5} p={1.5} bgcolor="success.light" borderRadius={1}>
                    <Typography variant="body2" fontWeight={700}>
                      Marks: {sub.marks} / {sub.assignmentId?.totalMarks}
                    </Typography>
                    {sub.feedback && (
                      <Typography variant="body2" mt={0.5}>Feedback: {sub.feedback}</Typography>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 1.5 }}>Pending review</Alert>
                )}
              </CardContent>
            </Card>
          ))
        )
      )}

      {/* ── Tab 2: Create Assignment (admin/teacher) ── */}
      {tab === 2 && isAdmin && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Create New Assignment</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Title" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Subject" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Description" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth type="datetime-local" label="Deadline" InputLabelProps={{ shrink: true }}
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth type="number" label="Total Marks" value={form.totalMarks}
                  onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status"
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}
                  onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create Assignment"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── Tab 3: Review Submissions (admin/teacher) ── */}
      {tab === 3 && isAdmin && (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click an assignment to view and grade submissions.
          </Typography>
          {assignments.map(a => (
            <Card key={a._id} sx={{ mb: 2, cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={() => openReview(a)}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>{a.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{a.subject}</Typography>
                  </Box>
                  <Chip label={a.status} size="small" color={statusColor[a.status] || "default"} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* ── Submit Dialog ── */}
      <Dialog open={submitDialog.open} onClose={() => setSubmitDialog({ open: false, assignment: null })}
        maxWidth="sm" fullWidth>
        <DialogTitle>{submitDialog.assignment?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {submitDialog.assignment?.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Deadline: {dayjs(submitDialog.assignment?.deadline).format("MMM D, YYYY HH:mm")} •{" "}
            Total Marks: {submitDialog.assignment?.totalMarks}
          </Typography>
          <TextField fullWidth multiline rows={6} label="Your Answer" value={answerText}
            onChange={e => setAnswerText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog({ open: false, assignment: null })}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Assignment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Detail Dialog ── */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, assignment: null })}
        maxWidth="sm" fullWidth>
        <DialogTitle>{viewDialog.assignment?.title}</DialogTitle>
        <DialogContent>
          <Chip label={viewDialog.assignment?.subject} size="small" sx={{ mb: 1.5 }} />
          <Typography variant="body1" whiteSpace="pre-line" mb={2}>
            {viewDialog.assignment?.description}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              📅 Deadline: {dayjs(viewDialog.assignment?.deadline).format("MMM D, YYYY HH:mm")}
            </Typography>
            <Typography variant="body2">
              🏆 Total Marks: {viewDialog.assignment?.totalMarks}
            </Typography>
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              👥 Audience: {viewDialog.assignment?.audience}
            </Typography>
            <Typography variant="body2">
              📝 Created by: {viewDialog.assignment?.createdBy?.fullName}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, assignment: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Review Submissions Dialog ── */}
      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, assignment: null })}
        maxWidth="md" fullWidth>
        <DialogTitle>
          Submissions — {reviewDialog.assignment?.title}
          <Typography variant="body2" color="text.secondary">{submissions.length} submissions</Typography>
        </DialogTitle>
        <DialogContent>
          {submissions.length === 0 ? (
            <Typography color="text.secondary" py={2}>No submissions yet.</Typography>
          ) : (
            submissions.map(sub => (
              <Box key={sub._id} mb={3} p={2} bgcolor="background.default" borderRadius={2}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography fontWeight={700}>{sub.studentId?.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{sub.studentId?.email}</Typography>
                  <Chip label={sub.status} size="small" color={submissionColor[sub.status] || "default"} />
                  {dayjs(sub.submittedAt).isAfter(dayjs(reviewDialog.assignment?.deadline)) && (
                    <Chip label="LATE" size="small" color="error" />
                  )}
                </Stack>
                <Typography variant="body2" mb={1}>
                  Submitted: {dayjs(sub.submittedAt).format("MMM D, YYYY HH:mm")}
                </Typography>
                <Typography variant="body2" whiteSpace="pre-line" mb={1.5} p={1}
                  bgcolor="white" borderRadius={1} border="1px solid" borderColor="divider">
                  {sub.answerText || "(No answer text)"}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
                  <TextField
                    label="Marks"
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    defaultValue={sub.marks || ""}
                    onChange={e => setReviewData(d => ({
                      ...d, [sub._id]: { ...(d[sub._id] || {}), marks: e.target.value }
                    }))}
                  />
                  <TextField
                    label="Feedback"
                    size="small"
                    sx={{ flex: 1, minWidth: 160 }}
                    defaultValue={sub.feedback || ""}
                    onChange={e => setReviewData(d => ({
                      ...d, [sub._id]: { ...(d[sub._id] || {}), feedback: e.target.value }
                    }))}
                  />
                  <Button variant="contained" color="primary" size="small"
                    onClick={() => handleReview(sub._id)}
                    startIcon={<CheckCircleIcon />}>
                    Save
                  </Button>
                </Stack>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, assignment: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments;
