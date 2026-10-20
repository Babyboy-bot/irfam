import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  People,
  Warning,
  Inventory,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { irfamColors, moduleColors, shadows, cardStyles, gradients } from '../theme';

// Couleurs pour les graphiques - Palette marron harmonieuse
const COLORS = [
  irfamColors.primary.main,    // #8B4513 Marron principal
  irfamColors.secondary.main,  // #D2691E Chocolate
  moduleColors.ressources,     // #6B8E23 Olive
  irfamColors.secondary.light, // #CD853F Peru
  moduleColors.depenses,       // #A0522D Sienna
  moduleColors.fournisseurs,   // #8B7355 Marron grisé
];

export default function DashboardPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRessources: 0,
    totalRessourcesEspeces: 0,
    totalDonsNature: 0,
    totalDepenses: 0,
    balance: 0,
    recentRessources: [],
    recentDepenses: [],
    categoriesData: [],
    pensionnaires: { actifs: 0, total: 0 },
    coutParPensionnaire: 0,
    alertesStock: 0,
    budgetsDepasses: 0,
    nbDonsNature: 0,
    nbDonsEspeces: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const [resRes, depRes, catRes, statsRes] = await Promise.all([
        axios.get('/ressources/', { headers }),
        axios.get('/depenses/', { headers }),
        axios.get('/categories/', { headers }),
        axios.get('/statistiques/', { headers }).catch(() => ({ data: null })),
      ]);

      const ressources = resRes.data;
      const depenses = depRes.data;
      const categories = catRes.data;
      const statsData = statsRes.data;

      const totalRessources = ressources.reduce((sum, r) => sum + parseInt(r.montant || 0, 10), 0);
      const totalDepenses = depenses.reduce((sum, d) => sum + parseInt(d.montant || 0, 10), 0);

      // Préparer les données pour le graphique des catégories
      const categoriesData = categories.map(cat => {
        const total = depenses
          .filter(d => d.categorie === cat.id)
          .reduce((sum, d) => sum + parseInt(d.montant || 0, 10), 0);
        return {
          name: cat.nom,
          value: total,
        };
      }).filter(c => c.value > 0);

      setStats({
        totalRessources,
        totalRessourcesEspeces: statsData?.finances?.total_ressources_especes || totalRessources,
        totalDonsNature: statsData?.finances?.total_dons_nature_valeur || 0,
        totalDepenses,
        balance: totalRessources - totalDepenses,
        recentRessources: ressources.slice(-5).reverse(),
        recentDepenses: depenses.slice(-5).reverse(),
        categoriesData,
        pensionnaires: statsData?.pensionnaires || { actifs: 0, total: 0 },
        coutParPensionnaire: statsData?.finances?.cout_par_pensionnaire || 0,
        alertesStock: statsData?.alertes?.stock || 0,
        budgetsDepasses: statsData?.alertes?.budgets_depasses || 0,
        nbDonsNature: statsData?.dons?.nb_dons_nature || 0,
        nbDonsEspeces: statsData?.dons?.nb_dons_especes || 0,
      });
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des données', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color, trend }) => {
    // Formater le nombre avec des espaces (format français)
    const formattedValue = Math.abs(value).toLocaleString('fr-FR');
    
    // Calculer la taille de police selon la longueur du nombre
    const numberLength = formattedValue.length;
    let fontSize = '2.5rem';
    let iconSize = 36;
    
    if (numberLength > 12) {
      fontSize = '1.5rem';
      iconSize = 30;
    } else if (numberLength > 10) {
      fontSize = '1.75rem';
      iconSize = 32;
    } else if (numberLength > 8) {
      fontSize = '2rem';
      iconSize = 34;
    }
    
    return (
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${irfamColors.neutral.white} 0%, ${color}08 100%)`,
          border: `2px solid ${color}20`,
          borderRadius: 3,
          boxShadow: shadows.card,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: shadows.cardHover,
            border: `2px solid ${color}40`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          },
        }}
      >
        <CardContent sx={{ pt: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600} 
                gutterBottom 
                sx={{ 
                  textTransform: 'uppercase', 
                  letterSpacing: 0.5, 
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              <Typography 
                fontWeight={800} 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: fontSize },
                  color: color,
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                }}
              >
                {value < 0 && '-'}{formattedValue}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontWeight: 500, display: 'block', lineHeight: 1 }}
              >
                FCFA
              </Typography>
              {trend && (
                <Chip
                  label={trend}
                  size="small"
                  sx={{ 
                    mt: 1,
                    fontWeight: 600,
                    bgcolor: trend.startsWith('+') ? `${moduleColors.ressources}20` : `${moduleColors.depenses}20`,
                    color: trend.startsWith('+') ? moduleColors.ressources : moduleColors.depenses,
                    border: `1px solid ${trend.startsWith('+') ? moduleColors.ressources : moduleColors.depenses}40`,
                  }}
                  icon={trend.startsWith('+') ? <TrendingUp /> : <TrendingDown />}
                />
              )}
            </Box>
            <Box
              sx={{
                bgcolor: `${color}15`,
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${color}30`,
                boxShadow: `0 4px 12px ${color}20`,
                transition: 'all 0.3s ease',
                flexShrink: 0,
                '&:hover': {
                  transform: 'rotate(10deg) scale(1.1)',
                  bgcolor: `${color}25`,
                },
              }}
            >
              {React.cloneElement(icon, { 
                sx: { fontSize: { xs: 28, sm: iconSize }, color: color }
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tableau de bord
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Vue d'ensemble de la comptabilité de l'IRFAM
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Ressources"
            value={stats.totalRessources}
            icon={<TrendingUp />}
            color={moduleColors.ressources}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Dépenses"
            value={stats.totalDepenses}
            icon={<TrendingDown />}
            color={moduleColors.depenses}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Solde"
            value={stats.balance}
            icon={<AccountBalance />}
            color={stats.balance >= 0 ? irfamColors.primary.main : irfamColors.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${irfamColors.neutral.white} 0%, ${moduleColors.pensionnaires}08 100%)`,
              border: `2px solid ${moduleColors.pensionnaires}20`,
              borderRadius: 3,
              boxShadow: shadows.card,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: shadows.cardHover,
                border: `2px solid ${moduleColors.pensionnaires}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${moduleColors.pensionnaires} 0%, ${moduleColors.pensionnaires}80 100%)`,
              },
            }}
          >
            <CardContent sx={{ pt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                    Pensionnaires actifs
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ 
                    color: moduleColors.pensionnaires,
                    mb: 1,
                    background: `linear-gradient(135deg, ${moduleColors.pensionnaires} 0%, ${moduleColors.pensionnaires}CC 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stats.pensionnaires.actifs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    sur {stats.pensionnaires.total} total
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: `${moduleColors.pensionnaires}15`,
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${moduleColors.pensionnaires}30`,
                    boxShadow: `0 4px 12px ${moduleColors.pensionnaires}20`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(10deg) scale(1.1)',
                      bgcolor: `${moduleColors.pensionnaires}25`,
                    },
                  }}
                >
                  <People sx={{ fontSize: 36, color: moduleColors.pensionnaires }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${irfamColors.neutral.white} 0%, ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}08 100%)`,
              border: `2px solid ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}20`,
              borderRadius: 3,
              boxShadow: shadows.card,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: shadows.cardHover,
                border: `2px solid ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}40`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources} 0%, ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}80 100%)`,
              },
            }}
          >
            <CardContent sx={{ pt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                    Alertes stock
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ 
                    color: stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources,
                    mb: 1,
                    background: `linear-gradient(135deg, ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources} 0%, ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}CC 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stats.alertesStock}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    article(s) à commander
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: `${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}15`,
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}30`,
                    boxShadow: `0 4px 12px ${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}20`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(10deg) scale(1.1)',
                      bgcolor: `${stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources}25`,
                    },
                  }}
                >
                  <Inventory sx={{ fontSize: 36, color: stats.alertesStock > 0 ? moduleColors.depenses : moduleColors.ressources }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breakdown Ressources */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: irfamColors.background.brownLight, border: `1px solid ${irfamColors.border.light}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: irfamColors.primary.dark }}>
                📊 Détail des Ressources
              </Typography>
              <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ressources en espèces</Typography>
                      <Typography variant="h5" fontWeight={700} color={irfamColors.primary.main}>
                        {stats.totalRessourcesEspeces.toLocaleString()} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.nbDonsEspeces} versement(s)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Dons en nature (valeur estimée)</Typography>
                      <Typography variant="h5" fontWeight={700} color={irfamColors.secondary.main}>
                        {stats.totalDonsNature.toLocaleString()} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.nbDonsNature} don(s) en nature
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total des ressources</Typography>
                      <Typography variant="h5" fontWeight={700} color={moduleColors.ressources}>
                        {stats.totalRessources.toLocaleString()} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.nbDonsEspeces + stats.nbDonsNature} ressource(s) au total
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Dépenses par catégorie
            </Typography>
            {stats.categoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Aucune donnée disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Dernières ressources
            </Typography>
            {stats.recentRessources.length > 0 ? (
              stats.recentRessources.map((res, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: idx < stats.recentRessources.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {res.source}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {res.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600} color="#10b981">
                    +{parseInt(res.montant, 10).toLocaleString()} FCFA
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Aucune ressource enregistrée
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Dernières dépenses
            </Typography>
            {stats.recentDepenses.length > 0 ? (
              stats.recentDepenses.map((dep, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: idx < stats.recentDepenses.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {dep.categorie_detail?.nom || 'Sans catégorie'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dep.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600} color="#ef4444">
                    -{parseInt(dep.montant, 10).toLocaleString()} FCFA
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                Aucune dépense enregistrée
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
