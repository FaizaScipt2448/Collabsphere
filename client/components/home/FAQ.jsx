import { useState } from "react";
import { Typography, Button, Paper, Stack } from "@mui/material";
import faqData from "./faqData";

const FAQ = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(faqData[0]);

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        p: { xs: 2, md: 3 },
        maxWidth: "1280px",
        mx: { xs: 2, md: "auto" },
        my: { xs: 6, md: 8 },
      }}
    >
      <Stack spacing={1} sx={{ width: { xs: "100%", md: "40%" } }}>
        {faqData.map((faq) => {
          const isSelected = selectedQuestion.question === faq.question;
          return (
            <Button
              key={faq.question}
              onClick={() => setSelectedQuestion(faq)}
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                backgroundColor: isSelected ? "secondary.main" : "transparent",
                color: isSelected ? "white" : "secondary.main",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: isSelected ? "secondary.main" : "background.default",
                },
              }}
            >
              {faq.question}
            </Button>
          );
        })}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", md: "60%" },
          p: 3,
          backgroundColor: "secondary.main",
          borderRadius: 3,
          color: "white",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Answer
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: "rgba(255,255,255,0.85)" }}>
          {selectedQuestion.answer}
        </Typography>
      </Paper>
    </Stack>
  );
};

export default FAQ;
