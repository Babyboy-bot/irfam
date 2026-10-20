import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Chip, Alert, Snackbar, MenuItem, Grid, Card, CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Inventory, Warning, FileDownload, PictureAsPdf, CheckCircle } from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';
import { exportInventaireToExcel, exportInventaireToPDF } from '../utils/exportUtils';

export default function InventairePage({ token }) {
  const [articles, setArticles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', categorie: '', unite: 'sac', quantite_stock: '', quantite_min: '',
    prix_unitaire: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/inventaire/', { headers });
      setArticles(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement', 'error');
    }
  };


  const handleOpen = (article = null) => {
    if (article) {
      setEditMode(true);
      setCurrentArticle(article);
      setFormData({
        nom: article.nom, 
        categorie: article.categorie, 
        unite: article.unite,
        quantite_stock: article.quantite_stock, 
        quantite_min: article.quantite_min,
        prix_unitaire: article.prix_unitaire || '',
      });
    } else {
      setEditMode(false);
      setCurrentArticle(null);
      setFormData({ nom: '', categorie: '', unite: 'sac', quantite_stock: '', quantite_min: '', prix_unitaire: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditMode(false); setCurrentArticle(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      const dataToSend = { ...formData };
      
      // Convertir les champs vides en nombres ou null
      dataToSend.quantite_stock = parseInt(dataToSend.quantite_stock) || 0;
      dataToSend.quantite_min = parseInt(dataToSend.quantite_min) || 0;
      dataToSend.prix_unitaire = dataToSend.prix_unitaire ? parseInt(dataToSend.prix_unitaire) : null;
      
      if (editMode && currentArticle) {
        await axios.put(`/inventaire/${currentArticle.id}/`, dataToSend, { headers });
        showSnackbar('Article modifié avec succès', 'success');
      } else {
        await axios.post('/inventaire/', dataToSend, { headers });
        showSnackbar('Article ajouté avec succès', 'success');
      }
      fetchArticles();
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
      await axios.delete(`/inventaire/${id}/`, { headers });
      showSnackbar('Article supprimé', 'success');
      fetchArticles();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => { setSnackbar({ open: true, message, severity }); };
  const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, open: false }); };

  const articlesAlerte = articles.filter(a => a.alerte_stock).length;
  const valeurTotale = articles.reduce((sum, a) => sum + parseFloat(a.valeur_stock || 0), 0);

  // Filtrer les articles selon la recherche
  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase();
    return (
      (article.nom || '').toLowerCase().includes(query) ||
      (article.categorie || '').toLowerCase().includes(query) ||
      (article.unite || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredArticles, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Inventaire</Typography>
          <Typography variant="body1" color="text.secondary">Gestion du stock</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
            sx={buttonStyles.primary}>
            Nouvel article
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => exportInventaireToExcel(articles)}
            sx={{
              borderColor: moduleColors.ressources,
              color: moduleColors.ressources,
              '&:hover': { borderColor: moduleColors.ressources, bgcolor: `${moduleColors.ressources}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => exportInventaireToPDF(articles)}
            sx={{
              borderColor: moduleColors.ressources,
              color: moduleColors.ressources,
              '&:hover': { borderColor: moduleColors.ressources, bgcolor: `${moduleColors.ressources}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.depenses} 0%, ${moduleColors.depenses}80 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Alertes stock</Typography>
              <Typography variant="h3" fontWeight={800} color={moduleColors.depenses}>{articlesAlerte}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${irfamColors.primary.main} 0%, ${irfamColors.primary.light} 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total articles</Typography>
              <Typography variant="h3" fontWeight={800} color={irfamColors.primary.main}>{articles.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.ressources} 0%, ${moduleColors.ressources}80 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Valeur totale</Typography>
              <Typography 
                fontWeight={800} 
                color={moduleColors.ressources}
                sx={{
                  fontSize: { 
                    xs: '1.5rem', 
                    sm: valeurTotale.toLocaleString('fr-FR').length > 10 ? '1.75rem' : '2.5rem' 
                  },
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                }}
              >
                {valeurTotale.toLocaleString('fr-FR')} FCFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un article (nom, catégorie, unité...)"
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: shadows.card, overflowX: 'auto', border: `1px solid ${irfamColors.border.light}` }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: irfamColors.background.brownLight }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Article</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Stock</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Min</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Prix unitaire</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Valeur</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagination.currentData.map((article) => (
              <TableRow key={article.id} hover sx={{ bgcolor: article.alerte_stock ? '#fef2f2' : 'inherit' }}>
                <TableCell>
                  <Typography variant="body1" fontWeight={500}>{article.nom}</Typography>
                </TableCell>
                <TableCell><Chip label={article.categorie} size="small" sx={{ bgcolor: irfamColors.background.brown, color: irfamColors.text.primary, fontWeight: 500 }} /></TableCell>
                <TableCell align="right" fontWeight={600}>{article.quantite_stock} {article.unite}</TableCell>
                <TableCell align="right">{article.quantite_min} {article.unite}</TableCell>
                <TableCell align="right">{(article.prix_unitaire || 0).toLocaleString()} FCFA</TableCell>
                <TableCell align="right" fontWeight={600}>{(article.valeur_stock || 0).toLocaleString()} FCFA</TableCell>
                <TableCell>
                  {article.alerte_stock ? (
                    <Chip icon={<Warning />} label="Stock faible" size="small"
                      sx={{ bgcolor: `${moduleColors.depenses}20`, color: moduleColors.depenses, fontWeight: 600 }} />
                  ) : (
                    <Chip icon={<CheckCircle />} label="OK" size="small"
                      sx={{ bgcolor: `${moduleColors.ressources}20`, color: moduleColors.ressources, fontWeight: 600 }} />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(article)} sx={{ color: irfamColors.primary.main, mr: 1 }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(article.id)} sx={{ color: moduleColors.depenses }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
        totalItems={filteredArticles.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editMode ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Nom de l'article" 
                  value={formData.nom} 
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                  required 
                  placeholder="Ex: Riz"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  select
                  label="Catégorie" 
                  value={formData.categorie} 
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} 
                  required
                >
                  <MenuItem value="alimentaire">Alimentaire</MenuItem>
                  <MenuItem value="hygiene">Hygiène</MenuItem>
                  <MenuItem value="medical">Médical</MenuItem>
                  <MenuItem value="scolaire">Scolaire</MenuItem>
                  <MenuItem value="vestimentaire">Vestimentaire</MenuItem>
                  <MenuItem value="materiel">Matériel</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  select
                  label="Unité de mesure" 
                  value={formData.unite} 
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })} 
                  required
                >
                  <MenuItem value="sac">Sac</MenuItem>
                  <MenuItem value="carton">Carton</MenuItem>
                  <MenuItem value="paquet">Paquet</MenuItem>
                  <MenuItem value="pièce">Pièce</MenuItem>
                  <MenuItem value="boîte">Boîte</MenuItem>
                  <MenuItem value="unité">Unité</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Quantité en stock" 
                  type="number" 
                  value={formData.quantite_stock} 
                  onChange={(e) => setFormData({ ...formData, quantite_stock: e.target.value })} 
                  required 
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Quantité minimum (alerte)" 
                  type="number" 
                  value={formData.quantite_min} 
                  onChange={(e) => setFormData({ ...formData, quantite_min: e.target.value })} 
                  required 
                  helperText="Seuil d'alerte de stock faible"
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Prix unitaire (FCFA)" 
                  type="number" 
                  value={formData.prix_unitaire} 
                  onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                  inputProps={{ min: 0, step: 1 }}
                  helperText="Prix par unité de mesure (optionnel)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={buttonStyles.primary}>{editMode ? 'Modifier' : 'Ajouter'}</Button>
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
        title="Supprimer l'article"
        message="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
