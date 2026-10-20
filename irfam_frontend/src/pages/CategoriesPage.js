import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';

export default function CategoriesPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategorie, setCurrentCategorie] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/categories/', { headers });
      setCategories(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement des catégories', 'error');
    }
  };

  const handleOpen = (categorie = null) => {
    if (categorie) {
      setEditMode(true);
      setCurrentCategorie(categorie);
      setFormData({ nom: categorie.nom, description: categorie.description || '' });
    } else {
      setEditMode(false);
      setCurrentCategorie(null);
      setFormData({ nom: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentCategorie(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      if (editMode && currentCategorie) {
        await axios.put(`/categories/${currentCategorie.id}/`, formData, { headers });
        showSnackbar('Catégorie modifiée avec succès', 'success');
      } else {
        await axios.post('/categories/', formData, { headers });
        showSnackbar('Catégorie ajoutée avec succès', 'success');
      }
      fetchCategories();
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
      await axios.delete(`/categories/${id}/`, { headers });
      showSnackbar('Catégorie supprimée avec succès', 'success');
      fetchCategories();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(categorie => {
    const query = searchQuery.toLowerCase();
    return (
      (categorie.nom || '').toLowerCase().includes(query) ||
      (categorie.description || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredCategories, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestion des catégories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez les catégories de dépenses de l'IRFAM
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={buttonStyles.primary}
        >
          Nouvelle catégorie
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une catégorie (nom, description...)"
        />
      </Box>

      <Grid container spacing={3}>
        {pagination.currentData.length > 0 ? (
          pagination.currentData.map((categorie) => (
            <Grid item xs={12} sm={6} md={4} key={categorie.id}>
              <Card
                sx={{
                  ...cardStyles.base,
                  height: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${moduleColors.categories} 0%, ${moduleColors.categories}80 100%)`,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box
                      sx={{
                        bgcolor: `${moduleColors.categories}15`,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        border: `2px solid ${moduleColors.categories}30`,
                      }}
                    >
                      <CategoryIcon sx={{ color: moduleColors.categories, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(categorie)}
                        sx={{ color: irfamColors.primary.main, mr: 0.5 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(categorie.id)}
                        sx={{ color: moduleColors.depenses }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {categorie.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {categorie.description || 'Aucune description'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <CategoryIcon sx={{ fontSize: 64, color: irfamColors.border.light, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucune catégorie enregistrée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Commencez par créer une catégorie pour organiser vos dépenses
              </Typography>
            </Box>
          </Grid>
        )}
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
        totalItems={filteredCategories.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom de la catégorie"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={buttonStyles.primary}>
              {editMode ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
