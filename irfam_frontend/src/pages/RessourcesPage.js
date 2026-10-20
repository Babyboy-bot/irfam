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
  Autocomplete,
  Divider,
  Collapse,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  PersonAdd,
  ExpandMore,
  ExpandLess,
  FileDownload,
  PictureAsPdf,
} from '@mui/icons-material';
import { irfamColors, moduleColors } from '../theme';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import PaginationControls from '../components/PaginationControls';
import usePagination from '../hooks/usePagination';
import { exportRessourcesToExcel, exportRessourcesToPDF } from '../utils/exportUtils';

export default function RessourcesPage({ token }) {
  const [ressources, setRessources] = useState([]);
  const [donateurs, setDonateurs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRessource, setCurrentRessource] = useState(null);
  const [showNewDonateur, setShowNewDonateur] = useState(false);
  const [selectedDonateur, setSelectedDonateur] = useState(null);
  
  const [formData, setFormData] = useState({
    type_ressource: '',
    donateur: null,
    source: '',
    montant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    est_don_nature: false,
    articles_dons: '',
    valeur_estimee: '',
    ajouter_inventaire: false,
  });
  
  const [articlesInventaire, setArticlesInventaire] = useState([{
    nom: '',
    quantite: '',
    unite: 'sac',
    categorie: 'Dons',
    prix_unitaire: ''
  }]);
  
  const [nouveauDonateur, setNouveauDonateur] = useState({
    nom: '',
    type_donateur: 'particulier',
    email: '',
    telephone: '',
    adresse: '',
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const typeRessources = [
    { value: 'subvention', label: 'Subvention de l\'État' },
    { value: 'don_especes', label: 'Don en espèces' },
    { value: 'don_nature', label: 'Don en nature (vivres, matériel...)' },
    { value: 'partenariat', label: 'Partenariat' },
    { value: 'autre', label: 'Autre financement' },
  ];

  useEffect(() => {
    fetchRessources();
    fetchDonateurs();
  }, []);

  const fetchRessources = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/ressources/', { headers });
      setRessources(res.data);
    } catch (err) {
      showSnackbar('Erreur lors du chargement des ressources', 'error');
    }
  };

  const fetchDonateurs = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const res = await axios.get('/donateurs/', { headers });
      setDonateurs(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des donateurs', err);
    }
  };

  const handleOpen = (ressource = null) => {
    if (ressource) {
      setEditMode(true);
      setCurrentRessource(ressource);
      
      // Trouver le donateur lié si existant
      const donateurLie = ressource.donateur_detail ? 
        donateurs.find(d => d.id === ressource.donateur_detail.id) : null;
      
      setSelectedDonateur(donateurLie);
      setShowNewDonateur(false);
      
      setFormData({
        type_ressource: ressource.type_ressource,
        donateur: ressource.donateur || null,
        source: ressource.source || '',
        montant: ressource.montant || '',
        description: ressource.description || '',
        date: ressource.date || new Date().toISOString().split('T')[0],
        est_don_nature: ressource.est_don_nature || false,
        articles_dons: ressource.articles_dons || '',
        valeur_estimee: ressource.valeur_estimee || '',
        ajouter_inventaire: false,
      });
    } else {
      setEditMode(false);
      setCurrentRessource(null);
      setSelectedDonateur(null);
      setShowNewDonateur(false);
      
      setFormData({
        type_ressource: '',
        donateur: null,
        source: '',
        montant: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        est_don_nature: false,
        articles_dons: '',
        valeur_estimee: '',
        ajouter_inventaire: false,
      });
      
      setNouveauDonateur({
        nom: '',
        type_donateur: 'particulier',
        email: '',
        telephone: '',
        adresse: '',
      });
    }
    setOpen(true);
  };
  
  // Détecter automatiquement si c'est un don en nature
  const handleTypeChange = (e) => {
    const nouveauType = e.target.value;
    const estDonNature = nouveauType === 'don_nature';
    setFormData({ 
      ...formData, 
      type_ressource: nouveauType,
      est_don_nature: estDonNature,
      // Réinitialiser les champs selon le type
      montant: estDonNature ? '0' : formData.montant,
      valeur_estimee: estDonNature ? formData.valeur_estimee : '',
      articles_dons: estDonNature ? formData.articles_dons : '',
      ajouter_inventaire: estDonNature ? formData.ajouter_inventaire : false,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentRessource(null);
    setArticlesInventaire([{
      nom: '',
      quantite: '',
      unite: 'sac',
      categorie: 'Dons',
      prix_unitaire: ''
    }]);
  };
  
  // Gestion des articles d'inventaire
  const ajouterArticle = () => {
    setArticlesInventaire([...articlesInventaire, {
      nom: '',
      quantite: '',
      unite: 'sac',
      categorie: 'Dons',
      prix_unitaire: ''
    }]);
  };
  
  const supprimerArticle = (index) => {
    if (articlesInventaire.length > 1) {
      setArticlesInventaire(articlesInventaire.filter((_, i) => i !== index));
    }
  };
  
  const updateArticle = (index, field, value) => {
    const nouveaux = [...articlesInventaire];
    nouveaux[index] = { ...nouveaux[index], [field]: value };
    setArticlesInventaire(nouveaux);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Token ${token}` };
      
      // Préparer les données à envoyer
      const dataToSend = { ...formData };
      
      // Si on crée un nouveau donateur
      if (showNewDonateur && nouveauDonateur.nom) {
        dataToSend.nouveau_donateur = nouveauDonateur;
        dataToSend.donateur = null; // Pas de donateur existant
      } else if (selectedDonateur) {
        dataToSend.donateur = selectedDonateur.id;
      }
      
      // Ajouter les articles d'inventaire si nécessaire
      if (formData.ajouter_inventaire && formData.est_don_nature) {
        const articlesValides = articlesInventaire.filter(a => a.nom && a.quantite);
        if (articlesValides.length > 0) {
          dataToSend.articles_inventaire = articlesValides;
        }
      }
      
      if (editMode && currentRessource) {
        await axios.put(`/ressources/${currentRessource.id}/`, dataToSend, { headers });
        showSnackbar('Ressource modifiée avec succès', 'success');
      } else {
        const response = await axios.post('/ressources/', dataToSend, { headers });
        
        // Message personnalisé selon si des articles ont été ajoutés à l'inventaire
        if (response.data.inventaire_info && response.data.inventaire_info.total > 0) {
          const info = response.data.inventaire_info;
          let message = 'Ressource ajoutée avec succès ! ';
          if (info.articles_crees.length > 0) {
            message += `${info.articles_crees.length} article(s) créé(s) dans l'inventaire. `;
          }
          if (info.articles_mis_a_jour.length > 0) {
            message += `${info.articles_mis_a_jour.length} article(s) mis à jour.`;
          }
          showSnackbar(message, 'success');
        } else {
          showSnackbar('Ressource ajoutée avec succès', 'success');
        }
        
        // Recharger aussi les donateurs (si nouveau créé)
        if (showNewDonateur) {
          fetchDonateurs();
        }
      }
      
      fetchRessources();
      handleClose();
    } catch (err) {
      console.error('Erreur:', err.response?.data || err);
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
      await axios.delete(`/ressources/${id}/`, { headers });
      showSnackbar('Ressource supprimée avec succès', 'success');
      fetchRessources();
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

  const getTypeLabel = (type) => {
    const found = typeRessources.find(t => t.value === type);
    return found ? found.label : type;
  };

  const totalRessources = ressources.reduce((sum, r) => sum + parseInt(r.montant || 0, 10), 0);

  // Filtrer les ressources selon la recherche
  const filteredRessources = ressources.filter(ressource => {
    const query = searchQuery.toLowerCase();
    return (
      (ressource.source || '').toLowerCase().includes(query) ||
      (ressource.type_ressource || '').toLowerCase().includes(query) ||
      (ressource.description || '').toLowerCase().includes(query) ||
      (ressource.montant || '').toString().includes(query) ||
      (ressource.date || '').includes(query) ||
      (ressource.donateur_detail?.nom || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const pagination = usePagination(filteredRessources, itemsPerPage);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestion des ressources
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Subventions, dons et financements pour l'IRFAM
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <TrendingUp sx={{ color: '#10b981', fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total des ressources
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#10b981">
                {totalRessources.toLocaleString()} FCFA
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
            Nouvelle ressource
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => exportRessourcesToExcel(ressources)}
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
            onClick={() => exportRessourcesToPDF(ressources)}
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

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une ressource (source, type, montant, donateur...)"
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: irfamColors.background.brownLight }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Source / Donateur</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Montant</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagination.currentData.length > 0 ? (
              pagination.currentData.map((ressource) => (
                <TableRow key={ressource.id} hover>
                  <TableCell>{ressource.date || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(ressource.type_ressource)}
                      size="small"
                      sx={{ 
                        bgcolor: ressource.type_ressource === 'subvention' ? `${irfamColors.secondary.main}20` : `${moduleColors.ressources}20`,
                        color: ressource.type_ressource === 'subvention' ? irfamColors.secondary.main : moduleColors.ressources,
                        fontWeight: 600,
                        border: `1px solid ${ressource.type_ressource === 'subvention' ? irfamColors.secondary.main : moduleColors.ressources}40`
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {ressource.donateur_detail ? (
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {ressource.donateur_detail.nom}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ressource.donateur_detail.type_donateur}
                          {ressource.donateur_detail.telephone && ` • ${ressource.donateur_detail.telephone}`}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {ressource.source || 'N/A'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {ressource.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {ressource.est_don_nature ? (
                      <Box>
                        <Chip
                          label="Don en nature"
                          size="small"
                          sx={{
                            bgcolor: irfamColors.background.brown,
                            color: irfamColors.secondary.main,
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        />
                        {ressource.valeur_estimee && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Valeur: {parseInt(ressource.valeur_estimee, 10).toLocaleString()} FCFA
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Chip
                        label={`${parseInt(ressource.montant || 0, 10).toLocaleString()} FCFA`}
                        sx={{
                          bgcolor: irfamColors.background.brown,
                          color: moduleColors.ressources,
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(ressource)}
                      sx={{ color: irfamColors.primary.main, mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(ressource.id)}
                      sx={{ color: moduleColors.depenses }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune ressource enregistrée
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
        totalItems={filteredRessources.length}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editMode ? 'Modifier la ressource' : 'Nouvelle ressource'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type de ressource</InputLabel>
              <Select
                value={formData.type_ressource}
                onChange={handleTypeChange}
                label="Type de ressource"
              >
                {typeRessources.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Sélection du donateur avec autocomplete */}
            {(formData.type_ressource === 'don_especes' || formData.type_ressource === 'don_nature') && (
              <>
                <Autocomplete
                  fullWidth
                  options={donateurs}
                  getOptionLabel={(option) => option.nom || ''}
                  value={selectedDonateur}
                  onChange={(event, newValue) => {
                    setSelectedDonateur(newValue);
                    setShowNewDonateur(false);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sélectionner un donateur"
                      margin="normal"
                      helperText="Choisir un donateur existant ou créer un nouveau"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.nom}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.type_donateur} {option.telephone && `• ${option.telephone}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  sx={{ mt: 2 }}
                />
                
                <Button
                  startIcon={showNewDonateur ? <ExpandLess /> : <PersonAdd />}
                  onClick={() => {
                    setShowNewDonateur(!showNewDonateur);
                    if (!showNewDonateur) {
                      setSelectedDonateur(null);
                    }
                  }}
                  sx={{ mt: 1, mb: 1 }}
                  variant="outlined"
                  size="small"
                >
                  {showNewDonateur ? 'Annuler' : 'Créer un nouveau donateur'}
                </Button>
                
                {/* Formulaire nouveau donateur */}
                <Collapse in={showNewDonateur}>
                  <Box sx={{ p: 2, bgcolor: irfamColors.background.brownLight, borderRadius: 2, mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Informations du nouveau donateur
                    </Typography>
                    <TextField
                      fullWidth
                      label="Nom complet"
                      value={nouveauDonateur.nom}
                      onChange={(e) => setNouveauDonateur({ ...nouveauDonateur, nom: e.target.value })}
                      required={showNewDonateur}
                      margin="dense"
                      size="small"
                    />
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={nouveauDonateur.type_donateur}
                        onChange={(e) => setNouveauDonateur({ ...nouveauDonateur, type_donateur: e.target.value })}
                        label="Type"
                      >
                        <MenuItem value="particulier">Particulier</MenuItem>
                        <MenuItem value="entreprise">Entreprise</MenuItem>
                        <MenuItem value="association">Association</MenuItem>
                        <MenuItem value="institution">Institution</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={nouveauDonateur.telephone}
                      onChange={(e) => setNouveauDonateur({ ...nouveauDonateur, telephone: e.target.value })}
                      margin="dense"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={nouveauDonateur.email}
                      onChange={(e) => setNouveauDonateur({ ...nouveauDonateur, email: e.target.value })}
                      margin="dense"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={nouveauDonateur.adresse}
                      onChange={(e) => setNouveauDonateur({ ...nouveauDonateur, adresse: e.target.value })}
                      margin="dense"
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Box>
                </Collapse>
              </>
            )}
            
            {/* Pour les autres types (subventions, etc.), garder champ texte simple */}
            {formData.type_ressource !== 'don_especes' && formData.type_ressource !== 'don_nature' && formData.type_ressource && (
              <TextField
                fullWidth
                label="Source / Organisme"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                required
                margin="normal"
                helperText="Nom de l'organisme ou de la source"
              />
            )}
            
            {/* Champs pour dons en espèces ou subventions */}
            {!formData.est_don_nature && (
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
            )}
            
            {/* Champs pour dons en nature */}
            {formData.est_don_nature && (
              <>
                <TextField
                  fullWidth
                  label="Articles donnés (détails)"
                  value={formData.articles_dons}
                  onChange={(e) => setFormData({ ...formData, articles_dons: e.target.value })}
                  multiline
                  rows={3}
                  margin="normal"
                  required
                  helperText="Ex: 50 sacs de riz de 25kg, 20 cartons de savon, 30 couvertures..."
                />
                <TextField
                  fullWidth
                  label="Valeur estimée (FCFA)"
                  type="number"
                  value={formData.valeur_estimee}
                  onChange={(e) => setFormData({ ...formData, valeur_estimee: e.target.value })}
                  margin="normal"
                  helperText="Valeur approximative de la donation (optionnel)"
                />
                
                {/* Option pour ajouter à l'inventaire */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ajouter_inventaire}
                      onChange={(e) => setFormData({ ...formData, ajouter_inventaire: e.target.checked })}
                      sx={{ color: irfamColors.primary.main, '&.Mui-checked': { color: irfamColors.primary.main } }}
                    />
                  }
                  label="Ajouter ces articles à l'inventaire"
                  sx={{ mt: 2 }}
                />
                
                {/* Formulaire des articles pour l'inventaire */}
                <Collapse in={formData.ajouter_inventaire}>
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: irfamColors.background.brownLight, 
                    borderRadius: 2,
                    border: `1px solid ${irfamColors.border.main}`
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: moduleColors.ressources }}>
                      📦 Articles pour l'inventaire
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Détaillez chaque article pour l'ajouter automatiquement à l'inventaire
                    </Typography>
                    
                    {articlesInventaire.map((article, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight={600}>Article {index + 1}</Typography>
                          {articlesInventaire.length > 1 && (
                            <IconButton size="small" onClick={() => supprimerArticle(index)} sx={{ color: moduleColors.depenses }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nom de l'article"
                              value={article.nom}
                              onChange={(e) => updateArticle(index, 'nom', e.target.value)}
                              required={formData.ajouter_inventaire}
                              placeholder="Ex: Riz"
                            />
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Quantité"
                              value={article.quantite}
                              onChange={(e) => updateArticle(index, 'quantite', e.target.value)}
                              required={formData.ajouter_inventaire}
                              inputProps={{ min: 0, step: 1 }}
                            />
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <TextField
                              fullWidth
                              size="small"
                              select
                              label="Unité"
                              value={article.unite}
                              onChange={(e) => updateArticle(index, 'unite', e.target.value)}
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
                              size="small"
                              label="Catégorie"
                              value={article.categorie}
                              onChange={(e) => updateArticle(index, 'categorie', e.target.value)}
                              placeholder="Ex: Vivres, Matériel, Vêtements..."
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Prix unitaire (FCFA)"
                              value={article.prix_unitaire}
                              onChange={(e) => updateArticle(index, 'prix_unitaire', e.target.value)}
                              inputProps={{ min: 0, step: 1 }}
                              helperText="Optionnel"
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={ajouterArticle}
                      sx={{ 
                        mt: 1,
                        borderColor: irfamColors.primary.main,
                        color: irfamColors.primary.main,
                        '&:hover': { borderColor: irfamColors.primary.light, bgcolor: `${irfamColors.primary.main}10` }
                      }}
                    >
                      Ajouter un autre article
                    </Button>
                  </Box>
                </Collapse>
              </>
            )}
            
            <TextField
              fullWidth
              label={formData.est_don_nature ? "Description complémentaire" : "Description"}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              margin="normal"
              helperText="Informations complémentaires (facultatif)"
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
            <Button type="submit" variant="contained" sx={{ bgcolor: irfamColors.primary.main, '&:hover': { bgcolor: irfamColors.primary.light } }}>
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
        title="Supprimer la ressource"
        message="Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />
    </Box>
  );
}
