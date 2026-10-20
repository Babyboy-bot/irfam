import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Chip, Alert, Snackbar, MenuItem,
  LinearProgress, Grid, Card, CardContent,
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, Warning } from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';

export default function BudgetsPage({ token }) {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [formData, setFormData] = useState({
    categorie: '', montant_prevu: '', periode: 'mensuel',
    annee: new Date().getFullYear(), mois: new Date().getMonth() + 1, responsable: '', description: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchPersonnel();
  }, []);

  const fetchBudgets = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/budgets/', { headers });
      
      // Convertir les anciens budgets trimestriels (mois > 4) en trimestres (1-4)
      const budgetsConverted = res.data.map(budget => {
        if (budget.periode === 'trimestriel' && budget.mois > 4) {
          return {
            ...budget,
            mois: Math.ceil(budget.mois / 3) // Convertir mois en trimestre
          };
        }
        return budget;
      });
      
      setBudgets(budgetsConverted);
    } catch (err) {
      showSnackbar('Erreur lors du chargement', 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/categories/', { headers });
      setCategories(res.data);
    } catch (err) {}
  };

  const fetchPersonnel = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/personnel/', { headers });
      setPersonnel(res.data);
    } catch (err) {}
  };

  const handleOpen = (budget = null) => {
    if (budget) {
      setEditMode(true);
      setCurrentBudget(budget);
      
      // Convertir les anciens budgets trimestriels (mois > 4) en trimestres (1-4)
      let moisValue = budget.mois || 1;
      if (budget.periode === 'trimestriel' && budget.mois > 4) {
        moisValue = Math.ceil(budget.mois / 3);
      }
      
      setFormData({
        categorie: budget.categorie, 
        montant_prevu: budget.montant_prevu,
        periode: budget.periode, 
        annee: budget.annee,
        mois: moisValue,
        responsable: budget.responsable || '',
        description: budget.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentBudget(null);
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentTrimestre = Math.ceil(currentMonth / 3); // 1-4
      setFormData({
        categorie: '', 
        montant_prevu: '', 
        periode: 'mensuel',
        annee: new Date().getFullYear(), 
        mois: currentMonth,
        trimestre: currentTrimestre,
        responsable: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditMode(false); setCurrentBudget(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      const dataToSend = { ...formData };
      // Supprimer mois SEULEMENT pour les budgets annuels
      if (dataToSend.periode === 'annuel') delete dataToSend.mois;
      
      if (editMode && currentBudget) {
        await axios.put(`/budgets/${currentBudget.id}/`, dataToSend, { headers });
        showSnackbar('Budget modifié avec succès', 'success');
      } else {
        await axios.post('/budgets/', dataToSend, { headers });
        showSnackbar('Budget ajouté avec succès', 'success');
      }
      fetchBudgets();
      handleClose();
    } catch (err) {
      showSnackbar('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDialog.id;
    setConfirmDialog({ open: false, id: null });
    try{
      const headers = { Authorization: `Token ${token}` };
      await axios.delete(`/budgets/${id}/`, { headers });
      showSnackbar('Budget supprimé', 'success');
      fetchBudgets();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => { setSnackbar({ open: true, message, severity }); };
  const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, open: false }); };

  const budgetsDepasses = budgets.filter(b => b.pourcentage_utilise > 100).length;
  const budgetsAlertes = budgets.filter(b => b.pourcentage_utilise >= 80 && b.pourcentage_utilise <= 100).length;

  // Filtrer les budgets selon la recherche
  const filteredBudgets = budgets.filter(budget => {
    const query = searchQuery.toLowerCase();
    return (
      (budget.categorie_detail?.nom || '').toLowerCase().includes(query) ||
      (budget.periode || '').toLowerCase().includes(query) ||
      (budget.montant_prevu || '').toString().includes(query) ||
      (budget.description || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredBudgets, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Budgets prévisionnels</Typography>
          <Typography variant="body1" color="text.secondary">Suivi et contrôle des budgets</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ bgcolor: irfamColors.primary.main, '&:hover': { bgcolor: irfamColors.primary.light }, borderRadius: 2, px: 3, py: 1.5 }}>
          Nouveau budget
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.depenses} 0%, ${moduleColors.depenses}80 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Budgets dépassés</Typography>
              <Typography variant="h3" fontWeight={800} color={moduleColors.depenses}>{budgetsDepasses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${irfamColors.secondary.main} 0%, ${irfamColors.secondary.light} 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Alertes</Typography>
              <Typography variant="h3" fontWeight={800} color={irfamColors.secondary.main}>{budgetsAlertes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.budgets} 0%, ${moduleColors.budgets}80 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total budgets</Typography>
              <Typography variant="h3" fontWeight={800} color={moduleColors.budgets}>{budgets.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un budget (catégorie, période, montant...)"
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: irfamColors.background.brownLight }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Prévu</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Dépensé</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagination.currentData.map((budget) => {
              const pourcentage = budget.pourcentage_utilise || 0;
              const color = pourcentage > 100 ? moduleColors.depenses : pourcentage >= 80 ? '#D2691E' : moduleColors.ressources;
              return (
                <TableRow key={budget.id} hover>
                  <TableCell>{budget.categorie_detail?.nom || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        budget.periode === 'mensuel' && budget.mois
                          ? `Mensuel ${budget.annee} - Mois ${budget.mois}`
                          : budget.periode === 'trimestriel' && budget.mois
                          ? `Trimestriel ${budget.annee} - T${budget.mois}`
                          : `${budget.periode} ${budget.annee}`
                      }
                      size="small" 
                      sx={{ bgcolor: irfamColors.background.brown, color: irfamColors.text.primary, fontWeight: 500 }} 
                    />
                  </TableCell>
                  <TableCell>
                    {budget.responsable_nom ? (
                      <Chip label={budget.responsable_nom} size="small" sx={{ bgcolor: moduleColors.budgets + '15', color: moduleColors.budgets, fontWeight: 500 }} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" fontWeight={600}>{parseInt(budget.montant_prevu, 10).toLocaleString()} FCFA</TableCell>
                  <TableCell align="right">{parseInt(budget.montant_depense || 0, 10).toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box flex={1}>
                        <LinearProgress variant="determinate" value={Math.min(pourcentage, 100)}
                          sx={{ height: 8, borderRadius: 4, bgcolor: `${color}15`,
                            '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600} color={color} sx={{ minWidth: 50 }}>
                        {pourcentage.toFixed(0)}%
                      </Typography>
                      {pourcentage >= 80 && <Warning sx={{ color, fontSize: 20 }} />}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(budget)} sx={{ color: irfamColors.primary.main, mr: 1 }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(budget.id)} sx={{ color: moduleColors.depenses }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          pagination.reset();
        }}
        totalItems={filteredBudgets.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editMode ? 'Modifier le budget' : 'Nouveau budget'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth select label="Catégorie" value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} required>
                  {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.nom}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Montant prévu (FCFA)" type="number" value={formData.montant_prevu}
                  onChange={(e) => setFormData({ ...formData, montant_prevu: e.target.value })} 
                  inputProps={{ min: 0, step: 1 }} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth select label="Responsable (optionnel)" value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}>
                  <MenuItem value="">Aucun</MenuItem>
                  {personnel.filter(p => p.statut === 'actif').map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom} - {p.fonction}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  select 
                  label="Période" 
                  value={formData.periode}
                  onChange={(e) => setFormData({ ...formData, periode: e.target.value })} 
                  required
                >
                  <MenuItem value="mensuel">Mensuel</MenuItem>
                  <MenuItem value="trimestriel">Trimestriel</MenuItem>
                  <MenuItem value="annuel">Annuel</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Année" type="number" value={formData.annee}
                  onChange={(e) => setFormData({ ...formData, annee: e.target.value })} required />
              </Grid>
              {formData.periode === 'mensuel' && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Mois (1-12)" type="number" value={formData.mois}
                    onChange={(e) => setFormData({ ...formData, mois: e.target.value })} 
                    required
                    inputProps={{ min: 1, max: 12 }} 
                    helperText="Sélectionnez le mois de 1 (janvier) à 12 (décembre)" />
                </Grid>
              )}
              {formData.periode === 'trimestriel' && (
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    select 
                    label="Trimestre" 
                    value={formData.mois || ''} 
                    onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                    required
                    helperText="Sélectionnez le trimestre de l'année"
                  >
                    <MenuItem value={1}>Trimestre 1 (Jan-Fév-Mar)</MenuItem>
                    <MenuItem value={2}>Trimestre 2 (Avr-Mai-Jui)</MenuItem>
                    <MenuItem value={3}>Trimestre 3 (Jul-Aoû-Sep)</MenuItem>
                    <MenuItem value={4}>Trimestre 4 (Oct-Nov-Déc)</MenuItem>
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField fullWidth label="Description" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: irfamColors.primary.main }}>{editMode ? 'Modifier' : 'Ajouter'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le budget"
        message="Êtes-vous sûr de vouloir supprimer ce budget ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
