import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Avatar,
  Container,
} from "@mui/material";
import { IoSchoolSharp } from "react-icons/io5";
import { BiSolidInstitution } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";

const plans = [
  {
    title: "Student",
    price: "Free",
    features: ["All features in Basic", "Course creation", "Analytics dashboard"],
    icon: <PiStudentBold fontSize="60px" />,
    color: "linear-gradient(135deg, #1b2e35, #2c4750)",
  },
  {
    title: "Teacher",
    price: "$55/month",
    features: ["All features in Standard", "Advanced analytics", "Dedicated support"],
    icon: <IoSchoolSharp fontSize="60px" />,
    color: "linear-gradient(135deg, #1b2e35, #59e3a7)",
  },
  {
    title: "Business",
    price: "$199/month",
    features: ["All features in Premium", "Unlimited users", "Custom integrations"],
    icon: <BiSolidInstitution fontSize="60px" />,
    color: "linear-gradient(135deg, #3fc98c, #59e3a7)",
  },
];

const Subscription = () => {
  return (
    <Container sx={{ maxWidth: 1280, my: { xs: 4, md: 6 } }}>
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item key={plan.title} xs={12} sm={6} md={4}>
            <Card
              sx={{
                textAlign: "center",
                borderRadius: 4,
                p: 2,
                background: plan.color,
                color: "white",
                border: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 32px rgba(27,46,53,0.25)" },
              }}
            >
              <Avatar sx={{ width: 56, height: 56, mx: "auto", bgcolor: "transparent" }}>
                {plan.icon}
              </Avatar>
              <CardHeader
                title={plan.title}
                titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              />
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {plan.price}
                </Typography>
                <Typography component="ul" sx={{ listStyle: "none", textAlign: "left", p: 0, my: 2 }}>
                  {plan.features.map((feature) => (
                    <Typography component="li" variant="body1" key={feature} sx={{ mb: 0.5 }}>
                      ✔ {feature}
                    </Typography>
                  ))}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "white",
                    color: "secondary.main",
                    fontWeight: 700,
                    borderRadius: 999,
                    "&:hover": { bgcolor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" },
                  }}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Subscription;
