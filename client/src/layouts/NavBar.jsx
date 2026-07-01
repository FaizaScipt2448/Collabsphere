import { AppBar, Toolbar, Box, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import AlertBox from '../../components/common/AlertBox';

export default function NavBar() {
    const cookie = Cookies.get(import.meta.env.VITE_COOKIE_KEY)
    return (
        <Box>
            <AppBar
                position="sticky"
                color="transparent"
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
                elevation={0}
            >
                <Toolbar disableGutters sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
                    <Box sx={{ maxWidth: '1280px', width: '100%', mx: 'auto' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box component="img" src="/images/favicon.ico" width={42} alt="Collabsphere" />
                                    <Typography
                                        sx={{ fontFamily: 'Platypi', color: 'secondary.main' }}
                                        variant="h5"
                                        component="h1"
                                        fontWeight={700}
                                    >
                                        Collabsphere
                                    </Typography>
                                </Stack>
                            </Box>
                            {!cookie && (
                                <Stack direction="row" spacing={1.5}>
                                    <Button component={Link} to="/registration" variant="outlined" color="secondary">
                                        Join
                                    </Button>
                                    <Button component={Link} to="/login" variant="contained" color="secondary">
                                        Login
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                </Toolbar>
            </AppBar>
            <AlertBox />
        </Box>
    );
}
