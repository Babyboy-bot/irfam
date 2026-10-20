import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, IconButton, Typography,
  Chip, Alert, Snackbar, MenuItem, Avatar,
} from '@mui/material';
import { Add, Edit, Delete, CardGiftcard, Email, Phone, Business, PictureAsPdf } from '@mui/icons-material';
import { irfamColors, moduleColors } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';
import { exportDonateursToPDF } from '../utils/exportUtils';

export default function DonateursPage({ token }) {
  const [donateurs, setDonateurs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDonateur, setCurrentDonateur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', type_donateur: 'particulier', email: '',
    telephone: '', adresse: '', observations: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    fetchDonateurs();
  }, []);

  const fetchDonateurs = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/donateurs/', { headers });
      setDonateurs(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement', 'error');
    }
  };

  const handleOpen = (donateur = null) => {
    if (donateur) {
      setEditMode(true);
      setCurrentDonateur(donateur);
      setFormData({
        nom: donateur.nom, type_donateur: donateur.type_donateur,
        email: donateur.email || '', telephone: donateur.telephone || '',
        adresse: donateur.adresse || '', observations: donateur.observations || '',
      });
    } else {
      setEditMode(false);
      setCurrentDonateur(null);
      setFormData({ nom: '', type_donateur: 'particulier', email: '', telephone: '', adresse: '', observations: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditMode(false); setCurrentDonateur(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      if (editMode && currentDonateur) {
        await axios.put(`/donateurs/${currentDonateur.id}/`, formData, { headers });
        showSnackbar('Donateur modifié avec succès', 'success');
      } else {
        await axios.post('/donateurs/', formData, { headers });
        showSnackbar('Donateur ajouté avec succès', 'success');
      }
      fetchDonateurs();
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
    try {
      const headers = { Authorization: `Token ${token}` };
      await axios.delete(`/donateurs/${id}/`, { headers });
      showSnackbar('Donateur supprimé', 'success');
      fetchDonateurs();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => { setSnackbar({ open: true, message, severity }); };
  const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, open: false }); };

  const getTypeColor = (type) => {
    switch(type) {
      case 'particulier': return irfamColors.primary.main;
      case 'entreprise': return moduleColors.ressources;
      case 'association': return irfamColors.secondary.main;
      case 'institution': return moduleColors.budgets;
      default: return irfamColors.text.secondary;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'particulier': return 'Particulier';
      case 'entreprise': return 'Entreprise';
      case 'association': return 'Association';
      case 'institution': return 'Institution';
      default: return type;
    }
  };

  const totalDons = donateurs.reduce((sum, d) => sum + parseFloat(d.total_dons || 0), 0);

  // Filtrer les donateurs selon la recherche
  const filteredDonateurs = donateurs.filter(donateur => {
    const query = searchQuery.toLowerCase();
    return (
      (donateur.nom || '').toLowerCase().includes(query) ||
      (donateur.email || '').toLowerCase().includes(query) ||
      (donateur.telephone || '').toLowerCase().includes(query) ||
      (donateur.type_donateur || '').toLowerCase().includes(query) ||
      (donateur.adresse || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredDonateurs, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Liste des donateurs
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <CardGiftcard sx={{ color: irfamColors.primary.main, fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total des contributions
              </Typography>
              <Typography variant="h5" fontWeight={700} color={irfamColors.primary.main}>
                {totalDons.toLocaleString()} FCFA
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {donateurs.length} donateur(s) • Créez de nouveaux donateurs depuis la page Ressources
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={() => exportDonateursToPDF(donateurs)}
          sx={{
            borderColor: irfamColors.primary.main,
            color: irfamColors.primary.main,
            '&:hover': { borderColor: irfamColors.primary.main, bgcolor: `${irfamColors.primary.main}10` },
            borderRadius: 2,
            px: 2,
          }}
        >
          Export PDF
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un donateur (nom, email, téléphone, type...)"
        />
      </Box>

      <Grid container spacing={3}>
        {pagination.currentData.map((donateur) => (
          <Grid item xs={12} sm={6} md={4} key={donateur.id}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" gap={2} alignItems="center" flex={1}>
                    <Avatar sx={{ bgcolor: irfamColors.primary.main, width: 50, height: 50 }}>
                      {donateur.type_donateur === 'entreprise' ? <Business /> : <CardGiftcard />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{donateur.nom}</Typography>
                      <Chip label={getTypeLabel(donateur.type_donateur)} size="small"
                        sx={{ bgcolor: `${getTypeColor(donateur.type_donateur)}15`, color: getTypeColor(donateur.type_donateur), mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(donateur)} sx={{ color: irfamColors.primary.main }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(donateur.id)} sx={{ color: moduleColors.depenses }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap={1} mt={2}>
                  {donateur.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{donateur.email}</Typography>
                    </Box>
                  )}
                  {donateur.telephone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{donateur.telephone}</Typography>
                    </Box>
                  )}
                  <Box sx={{ bgcolor: irfamColors.background.brownLight, p: 1.5, borderRadius: 1, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Total contributions</Typography>
                    
                    {/* Afficher le montant en espèces si > 0 */}
                    {parseFloat(donateur.total_dons || 0) > 0 && (
                      <>
                        <Typography variant="h6" fontWeight={700} color={irfamColors.primary.main}>
                          {parseFloat(donateur.total_dons || 0).toLocaleString()} FCFA
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{donateur.nombre_dons || 0} don(s)</Typography>
                      </>
                    )}
                    
                    {/* Afficher les articles donnés en nature */}
                    {donateur.articles_dons && (
                      <Box sx={{ mt: parseFloat(donateur.total_dons || 0) > 0 ? 1.5 : 0 }}>
                        <Typography variant="body2" fontWeight={600} color={moduleColors.ressources} sx={{ mb: 0.5 }}>
                          Dons en nature :
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                          {donateur.articles_dons}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Message si aucune contribution */}
                    {!donateur.articles_dons && parseFloat(donateur.total_dons || 0) === 0 && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Aucune contribution enregistrée
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          pagination.reset();
        }}
        totalItems={filteredDonateurs.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editMode ? 'Modifier le donateur' : 'Nouveau donateur'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required /></Grid>
              <Grid item xs={12}>
                <TextField fullWidth select label="Type" value={formData.type_donateur} onChange={(e) => setFormData({ ...formData, type_donateur: e.target.value })}>
                  <MenuItem value="particulier">Particulier</MenuItem>
                  <MenuItem value="entreprise">Entreprise</MenuItem>
                  <MenuItem value="association">Association</MenuItem>
                  <MenuItem value="institution">Institution</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} multiline rows={2} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Observations" value={formData.observations} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: irfamColors.primary.main, '&:hover': { bgcolor: irfamColors.primary.light } }}>
              {editMode ? 'Modifier' : 'Ajouter'}
            </Button>
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
        title="Supprimer le donateur"
        message="Êtes-vous sûr de vouloir supprimer ce donateur ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
