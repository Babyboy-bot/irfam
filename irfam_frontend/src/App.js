import React, { useState, useEffect } from "react";
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
import SplashScreen from "./components/SplashScreen";
import DashboardPage from "./pages/DashboardPage";
import RessourcesPage from "./pages/RessourcesPage";
import DepensesPage from "./pages/DepensesPage";
import CategoriesPage from "./pages/CategoriesPage";
import RapportsPage from "./pages/RapportsPage";
import PensionnairesPage from "./pages/PensionnairesPage";
import PersonnelPage from "./pages/PersonnelPage";
import DonateursPage from "./pages/DonateursPage";
// FournisseursPage supprimé - Module non nécessaire
import BudgetsPage from "./pages/BudgetsPage";
import InventairePage from "./pages/InventairePage";
import { irfamColors, moduleColors } from "./theme";

// Thème Material-UI personnalisé avec les couleurs IRFAM
const theme = createTheme({
  palette: {
    primary: { 
      main: irfamColors.primary.main,      // #8B4513 Marron
      light: irfamColors.primary.light,     // #A0522D
      dark: irfamColors.primary.dark,       // #5C2E0A
    },
    secondary: { 
      main: irfamColors.secondary.main,     // #D2691E Chocolate
      light: irfamColors.secondary.light,   // #CD853F
    },
    success: {
      main: moduleColors.ressources,        // #6B8E23 Vert olive
    },
    error: {
      main: moduleColors.depenses,          // #A0522D Sienna
    },
    background: {
      default: irfamColors.background.default,
      paper: irfamColors.neutral.white,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const [splash, setSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [alerts, setAlerts] = useState({ budgets: 0, stock: 0 });

  // Le splash screen gère sa propre durée maintenant
  const handleSplashFinish = () => {
    setSplash(false);
  };

  // Récupérer les alertes
  useEffect(() => {
    if (token) {
      fetchAlerts();
      // Rafraîchir les alertes toutes les 5 minutes
      const interval = setInterval(fetchAlerts, 300000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchAlerts = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/statistiques/', { headers });
      setAlerts({
        budgets: res.data?.alertes?.budgets_depasses || 0,
        stock: res.data?.alertes?.stock || 0,
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des alertes', err);
    }
  };

  if (splash) {
    return (
      <SplashScreen 
        onFinish={handleSplashFinish}
        logoUrl="/logo-irfam.png"
      />
    );
  }

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
      case 'ressources':
        return <RessourcesPage token={token} />;
      case 'depenses':
        return <DepensesPage token={token} />;
      case 'categories':
        return <CategoriesPage token={token} />;
      case 'rapports':
        return <RapportsPage token={token} />;
      case 'pensionnaires':
        return <PensionnairesPage token={token} />;
      case 'personnel':
        return <PersonnelPage token={token} />;
      case 'donateurs':
        return <DonateursPage token={token} />;
      // fournisseurs supprimé - Module non nécessaire
      case 'budgets':
        return <BudgetsPage token={token} />;
      case 'inventaire':
        return <InventairePage token={token} />;
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
          alerts={alerts}
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
            background: `linear-gradient(135deg, ${irfamColors.background.brownLight} 0%, ${irfamColors.background.brown} 100%)`,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: `0 8px 32px ${irfamColors.primary.main}30`,
                border: `1px solid ${irfamColors.border.light}`,
              }}
            >
              <Box textAlign="center" mb={4}>
                <Typography variant="h3" fontWeight={800} sx={{ color: irfamColors.primary.main }} gutterBottom>
                  IRFAM
                </Typography>
                <Typography variant="h6" sx={{ color: irfamColors.text.primary }}>
                  Institut de Réhabilitation et de Formation Des Aveugles du Mont Carmel
                </Typography>
                <Typography variant="body2" sx={{ color: irfamColors.text.secondary, mt: 1 }}>
                  Plateforme de gestion comptable
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
