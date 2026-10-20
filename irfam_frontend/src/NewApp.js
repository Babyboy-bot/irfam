import React, { useState } from "react";
import axios from "axios";
import {
  CssBaseline,
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import RevenusPage from "./pages/RevenusPage";
import DepensesPage from "./pages/DepensesPage";
import CategoriesPage from "./pages/CategoriesPage";
import RapportsPage from "./pages/RapportsPage";

const theme = createTheme({
  palette: {
    primary: { main: "#3b82f6" },
    secondary: { main: "#10b981" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function SplashScreen() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        zIndex: 9999,
      }}
    >
      <Typography variant="h2" fontWeight={800} sx={{ mb: 2, letterSpacing: 2 }}>
        IRFAM
      </Typography>
      <Typography variant="h6" sx={{ opacity: 0.9 }}>
        Gestion Comptable
      </Typography>
    </Box>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const [splash, setSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  React.useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (splash) return <SplashScreen />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/login/", { username, password });
      setToken(res.data.token);
      setCurrentUser(res.data.username || username);
      setShowLogin(false);
    } catch (err) {
      setError("Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser("");
    setShowLogin(false);
    setCurrentPage("dashboard");
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'revenus':
        return <RevenusPage token={token} />;
      case 'depenses':
        return <DepensesPage token={token} />;
      case 'categories':
        return <CategoriesPage token={token} />;
      case 'rapports':
        return <RapportsPage token={token} />;
      default:
        return <DashboardPage token={token} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {token ? (
        <Layout
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          username={currentUser}
        >
          {renderPage()}
        </Layout>
      ) : (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
                  IRFAM
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Gestion Comptable
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Plateforme moderne et accessible pour la gestion de l'institut
                </Typography>
              </Box>
              {showLogin ? (
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                  />
                  {error && (
                    <Typography color="error" sx={{ mt: 2 }} align="center">
                      {error}
                    </Typography>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setShowLogin(false)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Retour à l'accueil
                  </Button>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setShowLogin(true)}
                  sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                  Se connecter
                </Button>
              )}
            </Paper>
          </Container>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
