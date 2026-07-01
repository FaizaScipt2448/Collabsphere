import { createTheme } from "@mui/material/styles";

// Collabsphere brand: mint green accent on a dark teal/navy neutral,
// "Platypi" for display headings, "Inter" for everything else.
const colors = {
  mint: "#59e3a7",
  mintDark: "#3fc98c",
  navy: "#1b2e35",
  navyLight: "#2c4750",
  paper: "#ffffff",
  background: "#f6f8f7",
  border: "#e3e8e6",
  textSecondary: "#5b6b6e",
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.mint,
      dark: colors.mintDark,
      contrastText: colors.navy,
    },
    secondary: {
      main: colors.navy,
      light: colors.navyLight,
      contrastText: "#ffffff",
    },
    background: {
      default: colors.background,
      paper: colors.paper,
    },
    text: {
      primary: colors.navy,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
    error: { main: "#e35959" },
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontFamily: "'Platypi', serif", fontWeight: 700 },
    h2: { fontFamily: "'Platypi', serif", fontWeight: 700 },
    h3: { fontFamily: "'Platypi', serif", fontWeight: 700 },
    h4: { fontFamily: "'Platypi', serif", fontWeight: 700 },
    h5: { fontFamily: "'Platypi', serif", fontWeight: 600 },
    h6: { fontFamily: "'Platypi', serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "9px 22px",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        },
        containedPrimary: {
          color: colors.navy,
          "&:hover": {
            backgroundColor: colors.mintDark,
            boxShadow: "0 6px 16px rgba(89, 227, 167, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: colors.navyLight,
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": { borderWidth: "1.5px" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 2px 10px rgba(27, 46, 53, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 10px rgba(27, 46, 53, 0.05)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
