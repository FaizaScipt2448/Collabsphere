import { Box, Grid, TextField, Typography, Stack, Chip } from '@mui/material';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

const trendingTags = ['vr-gaming', 'blockchain', 'crypto-currency', 'machine-learning', 'cyber-security'];

const Banner = () => {
    return (
        <Grid
            container
            spacing={{ xs: 4, md: 2 }}
            minHeight={{ xs: 'auto', md: '88vh' }}
            maxWidth="1280px"
            mx="auto"
            px={{ xs: 2, md: 4 }}
            py={{ xs: 6, md: 0 }}
            justifyContent="center"
            alignItems="center"
        >
            <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                    <ConnectWithoutContactIcon fontSize="small" />
                    <Typography variant="body2">Connecting Ideas, Inspiring Perspectives</Typography>
                </Stack>
                <Typography
                    sx={{
                        fontFamily: 'Platypi',
                        color: 'secondary.main',
                        my: 2,
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    }}
                    variant="h1"
                    component="h1"
                    fontWeight={700}
                >
                    Collabsphere
                </Typography>
                <Typography color="text.secondary" variant="body1" sx={{ maxWidth: 480 }}>
                    At Collabsphere, our mission is to provide a dynamic and intuitive platform that empowers
                    individuals to transform their ideas into actionable tasks.
                </Typography>
                <Box component="form" sx={{ my: 4 }}>
                    <TextField placeholder="Search Here ..." fullWidth sx={{ maxWidth: 420 }} />
                </Box>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {trendingTags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            sx={{
                                backgroundColor: 'secondary.main',
                                color: 'white',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'secondary.light' },
                            }}
                        />
                    ))}
                </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box
                    component="img"
                    src="/images/banner.jpg"
                    alt="Collabsphere"
                    sx={{ width: '100%', borderRadius: 4 }}
                />
            </Grid>
        </Grid>
    );
};

export default Banner;
