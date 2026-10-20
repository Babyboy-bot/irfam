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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  PictureAsPdf,
} from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import { exportRapportPDF } from '../utils/exportPDF';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function RapportsPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ressources: [],
    depenses: [],
    categories: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const [resRes, depRes, catRes] = await Promise.all([
        axios.get('/ressources/', { headers }),
        axios.get('/depenses/', { headers }),
        axios.get('/categories/', { headers }),
      ]);
      setData({
        ressources: resRes.data,
        depenses: depRes.data,
        categories: catRes.data,
      });
      setLoading(false);
    } catch (err) {
      console.error('Erreur', err);
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

  const totalRessources = data.ressources.reduce((sum, r) => sum + parseInt(r.montant || 0, 10), 0);
  const totalDepenses = data.depenses.reduce((sum, d) => sum + parseInt(d.montant || 0, 10), 0);
  const balance = totalRessources - totalDepenses;

  // Statistiques par catégorie
  const categoriesStats = data.categories.map(cat => {
    const total = data.depenses
      .filter(d => d.categorie === cat.id)
      .reduce((sum, d) => sum + parseInt(d.montant || 0, 10), 0);
    const count = data.depenses.filter(d => d.categorie === cat.id).length;
    return {
      nom: cat.nom,
      total,
      count,
      moyenne: count > 0 ? total / count : 0,
    };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  // Données mensuelles (simulation)
  const monthlyData = [
    { mois: 'Jan', ressources: totalRessources * 0.08, depenses: totalDepenses * 0.07 },
    { mois: 'Fév', ressources: totalRessources * 0.09, depenses: totalDepenses * 0.08 },
    { mois: 'Mar', ressources: totalRessources * 0.10, depenses: totalDepenses * 0.09 },
    { mois: 'Avr', ressources: totalRessources * 0.08, depenses: totalDepenses * 0.10 },
    { mois: 'Mai', ressources: totalRessources * 0.11, depenses: totalDepenses * 0.11 },
    { mois: 'Juin', ressources: totalRessources * 0.12, depenses: totalDepenses * 0.12 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Rapports & Statistiques
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyse détaillée de la comptabilité de l'IRFAM
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => exportRapportPDF({ totalRessources, totalDepenses, balance }, monthlyData)}
          sx={{ ...buttonStyles.primary, bgcolor: '#D32F2F', '&:hover': { bgcolor: '#B71C1C' } }}
        >
          Exporter PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.ressources} 0%, ${moduleColors.ressources}80 100%)` } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Ressources
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color={moduleColors.ressources}>
                    {totalRessources.toLocaleString()} FCFA
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: moduleColors.ressources }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.depenses} 0%, ${moduleColors.depenses}80 100%)` } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Dépenses
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color={moduleColors.depenses}>
                    {totalDepenses.toLocaleString()} FCFA
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: moduleColors.depenses }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: balance >= 0 ? `linear-gradient(90deg, ${irfamColors.primary.main} 0%, ${irfamColors.primary.light} 100%)` : `linear-gradient(90deg, ${moduleColors.depenses} 0%, ${moduleColors.depenses}80 100%)` } }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Solde Net
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color={balance >= 0 ? irfamColors.primary.main : moduleColors.depenses}>
                    {balance.toLocaleString()} FCFA
                  </Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, color: balance >= 0 ? irfamColors.primary.main : moduleColors.depenses }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Évolution mensuelle
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={moduleColors.ressources} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={moduleColors.ressources} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={moduleColors.depenses} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={moduleColors.depenses} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="ressources" stroke={moduleColors.ressources} fillOpacity={1} fill="url(#colorRevenus)" name="Ressources" />
                <Area type="monotone" dataKey="depenses" stroke={moduleColors.depenses} fillOpacity={1} fill="url(#colorDepenses)" name="Dépenses" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Statistiques par catégorie
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Moyenne</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>% du total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesStats.length > 0 ? (
                    categoriesStats.map((stat, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight={500}>
                            {stat.nom}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{stat.count}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="#ef4444">
                            {stat.total.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {stat.moyenne.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {((stat.total / totalDepenses) * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Aucune donnée disponible
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
