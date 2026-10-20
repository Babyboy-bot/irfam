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
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  FileDownload,
  PictureAsPdf,
  Person,
  Male,
  Female,
  CalendarToday,
  Phone,
  MedicalServices,
} from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';
import { exportPensionnairesToExcel, exportPensionnairesToPDF } from '../utils/exportUtils';

export default function PensionnairesPage({ token }) {
  const [pensionnaires, setPensionnaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPensionnaire, setCurrentPensionnaire] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    date_entree: new Date().toISOString().split('T')[0],
    date_sortie: '',
    statut: 'actif',
    niveau_etude: '',
    pathologie: '',
    contact_urgence: '',
    observations: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [stats, setStats] = useState({ actifs: 0, total: 0 });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchPensionnaires();
    fetchStatistiques();
  }, []);

  const fetchPensionnaires = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/pensionnaires/', { headers });
      setPensionnaires(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement des pensionnaires', 'error');
    }
  };

  const fetchStatistiques = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/statistiques/', { headers });
      setStats({
        actifs: res.data.pensionnaires.actifs,
        total: res.data.pensionnaires.total,
      });
    } catch (err) {
      console.error('Erreur stats');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpen = (pensionnaire = null) => {
    if (pensionnaire) {
      setEditMode(true);
      setCurrentPensionnaire(pensionnaire);
      setFormData({
        nom: pensionnaire.nom,
        prenom: pensionnaire.prenom,
        sexe: pensionnaire.sexe,
        date_naissance: pensionnaire.date_naissance,
        date_entree: pensionnaire.date_entree,
        date_sortie: pensionnaire.date_sortie || '',
        statut: pensionnaire.statut,
        niveau_etude: pensionnaire.niveau_etude || '',
        pathologie: pensionnaire.pathologie || '',
        contact_urgence: pensionnaire.contact_urgence || '',
        observations: pensionnaire.observations || '',
      });
      if (pensionnaire.photo) {
        setPhotoPreview(pensionnaire.photo);
      }
    } else {
      setEditMode(false);
      setCurrentPensionnaire(null);
      setFormData({
        nom: '',
        prenom: '',
        sexe: 'M',
        date_naissance: '',
        date_entree: new Date().toISOString().split('T')[0],
        date_sortie: '',
        statut: 'actif',
        niveau_etude: '',
        pathologie: '',
        contact_urgence: '',
        observations: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentPensionnaire(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Ajouter la photo si présente
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      if (editMode && currentPensionnaire) {
        await axios.put(`/pensionnaires/${currentPensionnaire.id}/`, formDataToSend, { headers });
        showSnackbar('Pensionnaire modifié avec succès', 'success');
      } else {
        await axios.post('/pensionnaires/', formDataToSend, { headers });
        showSnackbar('Pensionnaire ajouté avec succès', 'success');
      }
      fetchPensionnaires();
      fetchStatistiques();
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
      await axios.delete(`/pensionnaires/${id}/`, { headers });
      showSnackbar('Pensionnaire supprimé avec succès', 'success');
      fetchPensionnaires();
      fetchStatistiques();
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return '#10b981';
      case 'sorti': return '#6b7280';
      case 'en_attente': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'sorti': return 'Sorti';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  // Filtrer les pensionnaires selon la recherche
  const filteredPensionnaires = pensionnaires.filter(pensionnaire => {
    const query = searchQuery.toLowerCase();
    return (
      (pensionnaire.nom || '').toLowerCase().includes(query) ||
      (pensionnaire.prenom || '').toLowerCase().includes(query) ||
      (pensionnaire.formation || '').toLowerCase().includes(query) ||
      (pensionnaire.pathologie || '').toLowerCase().includes(query) ||
      (pensionnaire.statut || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredPensionnaires, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestion des pensionnaires
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivi des bénéficiaires de l'IRFAM
          </Typography>
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
            Nouveau pensionnaire
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => exportPensionnairesToExcel(pensionnaires)}
            sx={{
              borderColor: irfamColors.primary.main,
              color: irfamColors.primary.main,
              '&:hover': { borderColor: irfamColors.primary.main, bgcolor: `${irfamColors.primary.main}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => exportPensionnairesToPDF(pensionnaires)}
            sx={{
              borderColor: irfamColors.primary.main,
              color: irfamColors.primary.main,
              '&:hover': { borderColor: irfamColors.primary.main, bgcolor: `${irfamColors.primary.main}10` },
              borderRadius: 2,
              px: 2,
            }}
          >
            PDF
          </Button>
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: '#10b98110', border: '1px solid #10b98130' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pensionnaires actifs
              </Typography>
              <Typography variant="h4" fontWeight={700} color={moduleColors.ressources}>
                {stats.actifs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: irfamColors.background.brown, border: `1px solid ${irfamColors.border.main}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total pensionnaires
              </Typography>
              <Typography variant="h4" fontWeight={700} color={irfamColors.primary.main}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un pensionnaire (nom, prénom, formation, pathologie...)"
        />
      </Box>

      {/* Liste des pensionnaires */}
      <Grid container spacing={3}>
        {pagination.currentData.length > 0 ? (
          pagination.currentData.map((pensionnaire) => (
            <Grid item xs={12} sm={6} md={4} key={pensionnaire.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar 
                        src={pensionnaire.photo} 
                        sx={{ 
                          bgcolor: pensionnaire.sexe === 'M' ? irfamColors.primary.main : moduleColors.pensionnaires, 
                          width: 48, 
                          height: 48 
                        }}
                      >
                        {!pensionnaire.photo && (pensionnaire.sexe === 'M' ? <Male /> : <Female />)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {pensionnaire.prenom} {pensionnaire.nom}
                        </Typography>
                        <Chip
                          label={getStatutLabel(pensionnaire.statut)}
                          size="small"
                          sx={{
                            bgcolor: `${getStatutColor(pensionnaire.statut)}15`,
                            color: getStatutColor(pensionnaire.statut),
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpen(pensionnaire)} sx={{ color: irfamColors.primary.main }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(pensionnaire.id)} sx={{ color: moduleColors.depenses }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="body2" color="text.secondary">
                        {pensionnaire.age} ans • {Math.floor(pensionnaire.duree_sejour / 365)} an(s) de présence
                      </Typography>
                    </Box>
                    {pensionnaire.niveau_etude && (
                      <Typography variant="body2" color="text.secondary">
                        📚 {pensionnaire.niveau_etude}
                      </Typography>
                    )}
                    {pensionnaire.pathologie && (
                      <Box display="flex" alignItems="start" gap={1}>
                        <MedicalServices sx={{ fontSize: 16, color: moduleColors.depenses, mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary">
                          {pensionnaire.pathologie.substring(0, 50)}{pensionnaire.pathologie.length > 50 ? '...' : ''}
                        </Typography>
                      </Box>
                    )}
                    {pensionnaire.contact_urgence && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone sx={{ fontSize: 16, color: moduleColors.ressources }} />
                        <Typography variant="body2" color="text.secondary">
                          {pensionnaire.contact_urgence}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <Person sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun pensionnaire enregistré
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Commencez par ajouter un pensionnaire
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
        totalItems={filteredPensionnaires.length}
      />

      {/* Dialog formulaire */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Modifier le pensionnaire' : 'Nouveau pensionnaire'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Photo */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  {photoPreview && (
                    <Avatar src={photoPreview} sx={{ width: 80, height: 80 }} />
                  )}
                  <Button variant="outlined" component="label">
                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Sexe"
                  value={formData.sexe}
                  onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                  required
                >
                  <MenuItem value="M">Masculin</MenuItem>
                  <MenuItem value="F">Féminin</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'entrée"
                  type="date"
                  value={formData.date_entree}
                  onChange={(e) => setFormData({ ...formData, date_entree: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  required
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="sorti">Sorti</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                </TextField>
              </Grid>
              {formData.statut === 'sorti' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de sortie"
                    type="date"
                    value={formData.date_sortie}
                    onChange={(e) => setFormData({ ...formData, date_sortie: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Niveau d'étude"
                  value={formData.niveau_etude}
                  onChange={(e) => setFormData({ ...formData, niveau_etude: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pathologie / Notes médicales"
                  value={formData.pathologie}
                  onChange={(e) => setFormData({ ...formData, pathologie: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact d'urgence"
                  value={formData.contact_urgence}
                  onChange={(e) => setFormData({ ...formData, contact_urgence: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
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
        title="Supprimer le pensionnaire"
        message="Êtes-vous sûr de vouloir supprimer ce pensionnaire ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
