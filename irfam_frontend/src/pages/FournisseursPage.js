import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, IconButton, Typography,
  Chip, Alert, Snackbar, Rating,
} from '@mui/material';
import { Add, Edit, Delete, Store, Email, Phone, Star } from '@mui/icons-material';

export default function FournisseursPage({ token }) {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFournisseur, setCurrentFournisseur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', categorie: '', email: '', telephone: '',
    adresse: '', conditions_paiement: '', evaluation: 3, observations: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/fournisseurs/', { headers });
      setFournisseurs(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement', 'error');
    }
  };

  const handleOpen = (fournisseur = null) => {
    if (fournisseur) {
      setEditMode(true);
      setCurrentFournisseur(fournisseur);
      setFormData({
        nom: fournisseur.nom, categorie: fournisseur.categorie,
        email: fournisseur.email || '', telephone: fournisseur.telephone || '',
        adresse: fournisseur.adresse || '', conditions_paiement: fournisseur.conditions_paiement || '',
        evaluation: fournisseur.evaluation, observations: fournisseur.observations || '',
      });
    } else {
      setEditMode(false);
      setCurrentFournisseur(null);
      setFormData({ nom: '', categorie: '', email: '', telephone: '', adresse: '', conditions_paiement: '', evaluation: 3, observations: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditMode(false); setCurrentFournisseur(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      if (editMode && currentFournisseur) {
        await axios.put(`/fournisseurs/${currentFournisseur.id}/`, formData, { headers });
        showSnackbar('Fournisseur modifié avec succès', 'success');
      } else {
        await axios.post('/fournisseurs/', formData, { headers });
        showSnackbar('Fournisseur ajouté avec succès', 'success');
      }
      fetchFournisseurs();
      handleClose();
    } catch (err) {
      showSnackbar('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce fournisseur ?')) return;
    try {
      const headers = { Authorization: `Token ${token}` };
      await axios.delete(`/fournisseurs/${id}/`, { headers });
      showSnackbar('Fournisseur supprimé', 'success');
      fetchFournisseurs();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => { setSnackbar({ open: true, message, severity }); };
  const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, open: false }); };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Fournisseurs</Typography>
          <Typography variant="body1" color="text.secondary">{fournisseurs.length} fournisseur(s) enregistré(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: 2, px: 3, py: 1.5 }}>
          Nouveau fournisseur
        </Button>
      </Box>

      <Grid container spacing={3}>
        {fournisseurs.map((fournisseur) => (
          <Grid item xs={12} sm={6} md={4} key={fournisseur.id}>
            <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }, transition: 'all 0.3s' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                    <Box sx={{ bgcolor: '#3b82f615', borderRadius: 2, p: 1.5, display: 'flex' }}>
                      <Store sx={{ color: '#3b82f6', fontSize: 28 }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>{fournisseur.nom}</Typography>
                      <Chip label={fournisseur.categorie} size="small"
                        sx={{ bgcolor: '#f3f4f6', mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(fournisseur)} sx={{ color: '#3b82f6' }}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(fournisseur.id)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Rating value={fournisseur.evaluation} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">({fournisseur.evaluation}/5)</Typography>
                  </Box>
                  {fournisseur.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="body2" color="text.secondary">{fournisseur.email}</Typography>
                    </Box>
                  )}
                  {fournisseur.telephone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="body2" color="text.secondary">{fournisseur.telephone}</Typography>
                    </Box>
                  )}
                  {fournisseur.conditions_paiement && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      💳 {fournisseur.conditions_paiement}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Catégorie" value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} multiline rows={2} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Conditions de paiement" value={formData.conditions_paiement} onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })} /></Grid>
              <Grid item xs={12}>
                <Typography component="legend">Évaluation</Typography>
                <Rating value={formData.evaluation} onChange={(e, newValue) => setFormData({ ...formData, evaluation: newValue || 3 })} />
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Observations" value={formData.observations} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#3b82f6' }}>{editMode ? 'Modifier' : 'Ajouter'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
