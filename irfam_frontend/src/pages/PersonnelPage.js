import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, IconButton, Typography, Chip, Alert, Snackbar,
  MenuItem, Avatar, Divider,
} from '@mui/material';
import {
  Add, Edit, Delete, People, Person, Email, Phone, Work, AttachMoney,
} from '@mui/icons-material';
import { irfamColors, moduleColors, shadows, cardStyles, buttonStyles } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';

export default function PersonnelPage({ token }) {
  const [personnel, setPersonnel] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPersonnel, setCurrentPersonnel] = useState(null);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', date_naissance: '', email: '', telephone: '', adresse: '',
    fonction: 'education', type_contrat: 'CDI', date_embauche: new Date().toISOString().split('T')[0],
    date_fin_contrat: '', salaire: '', statut: 'actif', notes: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/personnel/', { headers });
      setPersonnel(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement', 'error');
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

  const handleOpen = (person = null) => {
    if (person) {
      setEditMode(true);
      setCurrentPersonnel(person);
      setFormData({
        nom: person.nom, prenom: person.prenom, date_naissance: person.date_naissance || '',
        email: person.email || '', telephone: person.telephone || '', adresse: person.adresse || '',
        fonction: person.fonction, type_contrat: person.type_contrat, date_embauche: person.date_embauche,
        date_fin_contrat: person.date_fin_contrat || '', salaire: person.salaire || '', statut: person.statut,
        notes: person.notes || '',
      });
      if (person.photo) {
        setPhotoPreview(person.photo);
      }
    } else {
      setEditMode(false);
      setCurrentPersonnel(null);
      setFormData({
        nom: '', prenom: '', date_naissance: '', email: '', telephone: '', adresse: '',
        fonction: 'education', type_contrat: 'CDI', date_embauche: new Date().toISOString().split('T')[0],
        date_fin_contrat: '', salaire: '', statut: 'actif', notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentPersonnel(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      if (editMode && currentPersonnel) {
        await axios.put(`/personnel/${currentPersonnel.id}/`, formDataToSend, { headers });
        showSnackbar('Personnel modifié avec succès', 'success');
      } else {
        await axios.post('/personnel/', formDataToSend, { headers });
        showSnackbar('Personnel ajouté avec succès', 'success');
      }
      fetchPersonnel();
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
      await axios.delete(`/personnel/${id}/`, { headers });
      showSnackbar('Personnel supprimé', 'success');
      fetchPersonnel();
    } catch (err) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const showSnackbar = (message, severity) => { setSnackbar({ open: true, message, severity }); };
  const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, open: false }); };

  const getFonctionColor = (fonction) => {
    switch (fonction) {
      case 'direction': return moduleColors.budgets;
      case 'administration': return irfamColors.primary.main;
      case 'comptabilite': return moduleColors.ressources;
      case 'education': return moduleColors.pensionnaires;
      case 'sante': return moduleColors.depenses;
      default: return irfamColors.text.secondary;
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return moduleColors.ressources;
      case 'conge': return moduleColors.budgets;
      case 'suspendu': return '#f97316';
      case 'depart': return moduleColors.depenses;
      default: return irfamColors.text.secondary;
    }
  };

  const filteredPersonnel = personnel.filter(person => {
    const query = searchQuery.toLowerCase();
    return (
      (person.nom || '').toLowerCase().includes(query) ||
      (person.prenom || '').toLowerCase().includes(query) ||
      (person.fonction || '').toLowerCase().includes(query) ||
      (person.telephone || '').toLowerCase().includes(query)
    );
  });

  const pagination = usePagination(filteredPersonnel, itemsPerPage);

  const personnelActif = personnel.filter(p => p.statut === 'actif').length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Personnel</Typography>
          <Typography variant="body1" color="text.secondary">Gestion des employés et de l'administration</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={buttonStyles.primary}>
          Nouveau membre
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${moduleColors.ressources} 0%, ${moduleColors.ressources}80 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Personnel actif</Typography>
              <Typography variant="h3" fontWeight={800} color={moduleColors.ressources}>{personnelActif}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardStyles.stat, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${irfamColors.primary.main} 0%, ${irfamColors.primary.light} 100%)` } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total membres</Typography>
              <Typography variant="h3" fontWeight={800} color={irfamColors.primary.main}>{personnel.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher (nom, fonction, téléphone...)" />
      </Box>

      <Grid container spacing={3}>
        {pagination.currentData.length > 0 ? (
          pagination.currentData.map((person) => (
            <Grid item xs={12} sm={6} md={4} key={person.id}>
              <Card sx={{ height: '100%', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar src={person.photo} sx={{ bgcolor: getFonctionColor(person.fonction), width: 48, height: 48 }}>
                        {!person.photo && <Person />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{person.prenom} {person.nom}</Typography>
                        <Chip label={person.fonction} size="small" sx={{ bgcolor: `${getFonctionColor(person.fonction)}15`, color: getFonctionColor(person.fonction), fontWeight: 500, mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpen(person)} sx={{ color: irfamColors.primary.main }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(person.id)} sx={{ color: moduleColors.depenses }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Work sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Typography variant="body2" color="text.secondary">{person.type_contrat}</Typography>
                    </Box>
                    {person.email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email sx={{ fontSize: 16, color: moduleColors.ressources }} />
                        <Typography variant="body2" color="text.secondary">{person.email}</Typography>
                      </Box>
                    )}
                    {person.telephone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone sx={{ fontSize: 16, color: moduleColors.budgets }} />
                        <Typography variant="body2" color="text.secondary">{person.telephone}</Typography>
                      </Box>
                    )}
                    {person.salaire && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney sx={{ fontSize: 16, color: moduleColors.depenses }} />
                        <Typography variant="body2" color="text.secondary">{person.salaire.toLocaleString()} FCFA</Typography>
                      </Box>
                    )}
                    <Chip label={person.statut} size="small" sx={{ bgcolor: `${getStatutColor(person.statut)}15`, color: getStatutColor(person.statut), fontWeight: 500, mt: 0.5, alignSelf: 'flex-start' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <People sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Aucun membre du personnel trouvé</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.goToPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => { setItemsPerPage(value); pagination.reset(); }}
        totalItems={filteredPersonnel.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editMode ? 'Modifier le personnel' : 'Nouveau membre du personnel'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2}>
                  {photoPreview && <Avatar src={photoPreview} sx={{ width: 80, height: 80 }} />}
                  <Button variant="outlined" component="label">
                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Fonction" value={formData.fonction} onChange={(e) => setFormData({ ...formData, fonction: e.target.value })} required>
                  <MenuItem value="direction">Direction</MenuItem>
                  <MenuItem value="administration">Administration</MenuItem>
                  <MenuItem value="comptabilite">Comptabilité</MenuItem>
                  <MenuItem value="education">Éducation/Formation</MenuItem>
                  <MenuItem value="sante">Santé</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="cuisine">Cuisine</MenuItem>
                  <MenuItem value="securite">Sécurité</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Type de contrat" value={formData.type_contrat} onChange={(e) => setFormData({ ...formData, type_contrat: e.target.value })} required>
                  <MenuItem value="CDI">CDI</MenuItem>
                  <MenuItem value="CDD">CDD</MenuItem>
                  <MenuItem value="stage">Stage</MenuItem>
                  <MenuItem value="benevole">Bénévole</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Date de naissance" type="date" value={formData.date_naissance} onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Date d'embauche" type="date" value={formData.date_embauche} onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })} InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Salaire (FCFA)" type="number" value={formData.salaire} onChange={(e) => setFormData({ ...formData, salaire: e.target.value })} inputProps={{ min: 0, step: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Statut" value={formData.statut} onChange={(e) => setFormData({ ...formData, statut: e.target.value })} required>
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="conge">En congé</MenuItem>
                  <MenuItem value="suspendu">Suspendu</MenuItem>
                  <MenuItem value="depart">Parti</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} multiline rows={3} />
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
        title="Supprimer le membre du personnel"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
