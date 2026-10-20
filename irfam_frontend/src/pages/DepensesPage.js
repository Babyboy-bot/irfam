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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingDown,
  FileDownload,
  PictureAsPdf,
} from '@mui/icons-material';
import { irfamColors, moduleColors } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';
import { exportDepensesToExcel, exportDepensesToPDF } from '../utils/exportUtils';

export default function DepensesPage({ token }) {
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDepense, setCurrentDepense] = useState(null);
  const [formData, setFormData] = useState({
    categorie: '',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    justification: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const [depRes, catRes] = await Promise.all([
        axios.get('/depenses/', { headers }),
        axios.get('/categories/', { headers }),
      ]);
      setDepenses(depRes.data);
      setCategories(catRes.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement des données', 'error');
    }
  };

  const handleOpen = (depense = null) => {
    if (depense) {
      setEditMode(true);
      setCurrentDepense(depense);
      setFormData({
        categorie: depense.categorie || '',
        montant: depense.montant,
        description: depense.description || '',
        date: depense.date || new Date().toISOString().split('T')[0],
        justification: depense.justification || '',
      });
    } else {
      setEditMode(false);
      setCurrentDepense(null);
      setFormData({
        categorie: '',
        montant: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        justification: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentDepense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      if (editMode && currentDepense) {
        await axios.put(`/depenses/${currentDepense.id}/`, formData, { headers });
        showSnackbar('Dépense modifiée avec succès', 'success');
      } else {
        await axios.post('/depenses/', formData, { headers });
        showSnackbar('Dépense ajoutée avec succès', 'success');
      }
      fetchData();
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
      await axios.delete(`/depenses/${id}/`, { headers });
      showSnackbar('Dépense supprimée avec succès', 'success');
      fetchData();
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

  const totalDepenses = depenses.reduce((sum, d) => sum + parseInt(d.montant || 0, 10), 0);

  // Filtrer les dépenses selon la recherche
  const filteredDepenses = depenses.filter(depense => {
    const query = searchQuery.toLowerCase();
    return (
      (depense.categorie_detail?.nom || '').toLowerCase().includes(query) ||
      (depense.description || '').toLowerCase().includes(query) ||
      (depense.montant || '').toString().includes(query) ||
      (depense.date || '').includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredDepenses, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestion des dépenses
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <TrendingDown sx={{ color: moduleColors.depenses, fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total des dépenses
              </Typography>
              <Typography variant="h5" fontWeight={700} color={moduleColors.depenses}>
                {totalDepenses.toLocaleString()} FCFA
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              bgcolor: irfamColors.primary.main,
              '&:hover': { bgcolor: irfamColors.primary.light },
              borderRadius: 2,
              px: 3,
              py: 1.5,
            }}
          >
            Nouvelle dépense
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => exportDepensesToExcel(depenses, categories)}
            sx={{
              borderColor: moduleColors.depenses,
              color: moduleColors.depenses,
              '&:hover': { borderColor: moduleColors.depenses, bgcolor: `${moduleColors.depenses}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => exportDepensesToPDF(depenses, categories)}
            sx={{
              borderColor: moduleColors.depenses,
              color: moduleColors.depenses,
              '&:hover': { borderColor: moduleColors.depenses, bgcolor: `${moduleColors.depenses}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une dépense (catégorie, description, montant...)"
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: irfamColors.background.brownLight }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Créé par</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Montant</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagination.currentData.length > 0 ? (
              pagination.currentData.map((depense) => (
                <TableRow key={depense.id} hover>
                  <TableCell>{depense.date || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={depense.categorie_detail?.nom || 'Sans catégorie'}
                      size="small"
                      sx={{ bgcolor: irfamColors.background.brown, color: irfamColors.text.primary, fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {depense.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {depense.cree_par_nom ? (
                      <Chip label={depense.cree_par_nom} size="small" sx={{ bgcolor: irfamColors.primary.main + '15', color: irfamColors.primary.main, fontWeight: 500 }} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${parseInt(depense.montant, 10).toLocaleString()} FCFA`}
                      sx={{
                        bgcolor: irfamColors.background.brown,
                        color: moduleColors.depenses,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(depense)}
                      sx={{ color: irfamColors.primary.main, mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(depense.id)}
                      sx={{ color: moduleColors.depenses }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune dépense enregistrée
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
        totalItems={filteredDepenses.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Modifier la dépense' : 'Nouvelle dépense'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                label="Catégorie"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Montant (FCFA)"
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              inputProps={{ min: 0, step: 1 }}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Justification (obligatoire)"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              multiline
              rows={3}
              margin="normal"
              required
              helperText="Expliquez la raison de cette dépense"
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: irfamColors.primary.main }}>
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
        title="Supprimer la dépense"
        message="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
