import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Container,
  CssBaseline,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

function Dashboard({ token }) {
  const [revenus, setRevenus] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [source, setSource] = useState("");
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const [revRes, depRes, catRes] = await Promise.all([
        axios.get("/revenus/", { headers }),
        axios.get("/depenses/", { headers }),
        axios.get("/categories/", { headers })
      ]);
      setRevenus(revRes.data);
      setDepenses(depRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    }
  };

  const handleAddRevenu = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const headers = { Authorization: `Token ${token}` };
      await axios.post("/revenus/", { source, montant, description }, { headers });
      setSource("");
      setMontant("");
      setDescription("");
      fetchData();
    } catch (err) {
      setError("Erreur lors de l'ajout du revenu.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Tableau de Bord
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Ajouter un revenu</Typography>
        <Box component="form" onSubmit={handleAddRevenu} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Source" value={source} onChange={e => setSource(e.target.value)} required />
          <TextField label="Montant" type="number" value={montant} onChange={e => setMontant(e.target.value)} required />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Button type="submit" variant="contained">Ajouter</Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Revenus</Typography>
      <List>
        {revenus.map((rev, idx) => (
          <ListItem key={rev.id || idx}>
            <ListItemText primary={`${rev.source} : ${rev.montant} Fcfa`} secondary={rev.description} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Dépenses</Typography>
      <List>
        {depenses.map((dep, idx) => (
          <ListItem key={dep.id || idx}>
            <ListItemText primary={`${dep.categorie?.nom || 'Catégorie'} : ${dep.montant} Fcfa`} secondary={dep.description} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Dashboard;
