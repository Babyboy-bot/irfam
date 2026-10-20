import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuration pour les PDF
const PDF_CONFIG = {
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4',
};

// En-tête IRFAM pour les PDF
const addPDFHeader = (doc, title) => {
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('IRFAM', 14, 15);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Institut de Réhabilitation et de Formation des Aveugles du Mont Carmel', 14, 21);
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const today = new Date().toLocaleDateString('fr-FR');
  doc.text(`Date: ${today}`, doc.internal.pageSize.width - 14, 15, { align: 'right' });
};

// ============================================
// EXPORTS DÉPENSES
// ============================================

export const exportDepensesToExcel = (depenses, categories) => {
  const data = depenses.map(dep => {
    const cat = categories.find(c => c.id === dep.categorie);
    return {
      'Date': new Date(dep.date).toLocaleDateString('fr-FR'),
      'Catégorie': cat?.nom || 'N/A',
      'Description': dep.description || '',
      'Montant (FCFA)': parseFloat(dep.montant || 0),
      'Bénéficiaire': dep.beneficiaire || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Largeur des colonnes
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 20 },  // Catégorie
    { wch: 40 },  // Description
    { wch: 15 },  // Montant
    { wch: 25 },  // Bénéficiaire
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dépenses');
  
  const fileName = `Depenses_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportDepensesToPDF = (depenses, categories) => {
  const doc = new jsPDF(PDF_CONFIG);
  addPDFHeader(doc, 'LISTE DES DÉPENSES');

  const tableData = depenses.map(dep => {
    const cat = categories.find(c => c.id === dep.categorie);
    return [
      new Date(dep.date).toLocaleDateString('fr-FR'),
      cat?.nom || 'N/A',
      dep.description || '',
      `${parseFloat(dep.montant || 0).toLocaleString('fr-FR')} FCFA`,
      dep.beneficiaire || '',
    ];
  });

  // Total
  const total = depenses.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0);

  doc.autoTable({
    startY: 30,
    head: [['Date', 'Catégorie', 'Description', 'Montant', 'Bénéficiaire']],
    body: tableData,
    foot: [['', '', 'TOTAL', `${total.toLocaleString('fr-FR')} FCFA`, '']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
  });

  const fileName = `Depenses_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ============================================
// EXPORTS RESSOURCES
// ============================================

export const exportRessourcesToExcel = (ressources) => {
  const data = ressources.map(res => ({
    'Date': new Date(res.date).toLocaleDateString('fr-FR'),
    'Type': res.type_ressource === 'subvention' ? 'Subvention' : 
            res.type_ressource === 'don_especes' ? 'Don en espèces' : 
            res.type_ressource === 'don_nature' ? 'Don en nature' : 'Autre',
    'Source/Donateur': res.donateur_detail?.nom || res.source || '',
    'Montant (FCFA)': res.est_don_nature ? 0 : parseFloat(res.montant || 0),
    'Articles (dons nature)': res.articles_dons || '',
    'Valeur estimée (FCFA)': res.est_don_nature ? parseFloat(res.valeur_estimee || 0) : 0,
    'Description': res.description || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 18 },  // Type
    { wch: 25 },  // Source
    { wch: 15 },  // Montant
    { wch: 30 },  // Articles
    { wch: 15 },  // Valeur estimée
    { wch: 35 },  // Description
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ressources');
  
  const fileName = `Ressources_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportRessourcesToPDF = (ressources) => {
  const doc = new jsPDF(PDF_CONFIG);
  addPDFHeader(doc, 'LISTE DES RESSOURCES');

  const tableData = ressources.map(res => [
    new Date(res.date).toLocaleDateString('fr-FR'),
    res.type_ressource === 'subvention' ? 'Subvention' : 
    res.type_ressource === 'don_especes' ? 'Don espèces' : 'Don nature',
    res.donateur_detail?.nom || res.source || '',
    res.est_don_nature ? 
      `Nature: ${res.articles_dons?.substring(0, 30) || ''}...` : 
      `${parseFloat(res.montant || 0).toLocaleString('fr-FR')} FCFA`,
  ]);

  const total = ressources
    .filter(r => !r.est_don_nature)
    .reduce((sum, r) => sum + parseFloat(r.montant || 0), 0);

  doc.autoTable({
    startY: 30,
    head: [['Date', 'Type', 'Source/Donateur', 'Montant/Articles']],
    body: tableData,
    foot: [['', '', 'TOTAL (espèces)', `${total.toLocaleString('fr-FR')} FCFA`]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 142, 35], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [107, 142, 35], textColor: 255, fontStyle: 'bold' },
  });

  const fileName = `Ressources_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ============================================
// EXPORTS PENSIONNAIRES
// ============================================

export const exportPensionnairesToExcel = (pensionnaires) => {
  const data = pensionnaires.map(p => ({
    'Nom': p.nom || '',
    'Prénom': p.prenom || '',
    'Date de naissance': p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-FR') : '',
    'Âge': p.age || '',
    'Sexe': p.sexe === 'M' ? 'Masculin' : 'Féminin',
    'Date d\'entrée': new Date(p.date_entree).toLocaleDateString('fr-FR'),
    'Statut': p.statut === 'actif' ? 'Actif' : 'Sorti',
    'Formation': p.formation || '',
    'Niveau d\'étude': p.niveau_etude || '',
    'Pathologie': p.pathologie || '',
    'Contact urgence': p.contact_urgence || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 20 },  // Nom
    { wch: 20 },  // Prénom
    { wch: 15 },  // Date naissance
    { wch: 8 },   // Âge
    { wch: 10 },  // Sexe
    { wch: 15 },  // Date entrée
    { wch: 10 },  // Statut
    { wch: 20 },  // Formation
    { wch: 15 },  // Niveau
    { wch: 25 },  // Pathologie
    { wch: 20 },  // Contact
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pensionnaires');
  
  const fileName = `Pensionnaires_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportPensionnairesToPDF = (pensionnaires) => {
  const doc = new jsPDF(PDF_CONFIG);
  addPDFHeader(doc, 'LISTE DES PENSIONNAIRES');

  const tableData = pensionnaires.map(p => [
    `${p.nom || ''} ${p.prenom || ''}`,
    p.age || '',
    p.sexe === 'M' ? 'M' : 'F',
    new Date(p.date_entree).toLocaleDateString('fr-FR'),
    p.statut === 'actif' ? 'Actif' : 'Sorti',
    p.formation || '',
    p.pathologie?.substring(0, 25) || '',
  ]);

  doc.autoTable({
    startY: 30,
    head: [['Nom & Prénom', 'Âge', 'Sexe', 'Entrée', 'Statut', 'Formation', 'Pathologie']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
  });

  const fileName = `Pensionnaires_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ============================================
// EXPORTS DONATEURS
// ============================================

export const exportDonateursToPDF = (donateurs) => {
  const doc = new jsPDF(PDF_CONFIG);
  addPDFHeader(doc, 'LISTE DES DONATEURS');

  const tableData = donateurs.map(d => [
    d.nom || '',
    d.type_donateur === 'particulier' ? 'Particulier' : 
    d.type_donateur === 'entreprise' ? 'Entreprise' : 'Organisation',
    d.email || '',
    d.telephone || '',
    `${parseFloat(d.total_dons || 0).toLocaleString('fr-FR')} FCFA`,
    d.nombre_dons || 0,
  ]);

  const total = donateurs.reduce((sum, d) => sum + parseFloat(d.total_dons || 0), 0);

  doc.autoTable({
    startY: 30,
    head: [['Nom', 'Type', 'Email', 'Téléphone', 'Total dons', 'Nb']],
    body: tableData,
    foot: [['', '', '', '', `${total.toLocaleString('fr-FR')} FCFA`, '']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [205, 133, 63], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [205, 133, 63], textColor: 255, fontStyle: 'bold' },
  });

  const fileName = `Donateurs_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ============================================
// EXPORTS INVENTAIRE
// ============================================

export const exportInventaireToExcel = (articles) => {
  const data = articles.map(a => ({
    'Article': a.nom || '',
    'Catégorie': a.categorie || '',
    'Quantité en stock': a.quantite_stock || 0,
    'Unité': a.unite || '',
    'Quantité minimale': a.quantite_min || 0,
    'Prix unitaire (FCFA)': parseFloat(a.prix_unitaire || 0),
    'Valeur totale (FCFA)': (a.quantite_stock || 0) * parseFloat(a.prix_unitaire || 0),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 25 },  // Article
    { wch: 20 },  // Catégorie
    { wch: 15 },  // Quantité
    { wch: 12 },  // Unité
    { wch: 15 },  // Qté min
    { wch: 15 },  // Prix
    { wch: 18 },  // Valeur
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
  
  const fileName = `Inventaire_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportInventaireToPDF = (articles) => {
  const doc = new jsPDF(PDF_CONFIG);
  addPDFHeader(doc, 'INVENTAIRE');

  const tableData = articles.map(a => [
    a.nom || '',
    a.categorie || '',
    `${a.quantite_stock || 0} ${a.unite || ''}`,
    `${parseFloat(a.prix_unitaire || 0).toLocaleString('fr-FR')} FCFA`,
    `${((a.quantite_stock || 0) * parseFloat(a.prix_unitaire || 0)).toLocaleString('fr-FR')} FCFA`,
  ]);

  const valeurTotale = articles.reduce((sum, a) => 
    sum + ((a.quantite_stock || 0) * parseFloat(a.prix_unitaire || 0)), 0
  );

  doc.autoTable({
    startY: 30,
    head: [['Article', 'Catégorie', 'Stock', 'Prix unitaire', 'Valeur totale']],
    body: tableData,
    foot: [['', '', '', 'VALEUR TOTALE', `${valeurTotale.toLocaleString('fr-FR')} FCFA`]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [107, 142, 35], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [107, 142, 35], textColor: 255, fontStyle: 'bold' },
  });

  const fileName = `Inventaire_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ============================================
// RAPPORT FINANCIER COMPLET
// ============================================

export const exportRapportFinancierPDF = (stats, ressources, depenses, categories) => {
  const doc = new jsPDF(PDF_CONFIG);
  
  // Page 1 : Résumé
  addPDFHeader(doc, 'RAPPORT FINANCIER COMPLET');
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('RÉSUMÉ FINANCIER', 14, 40);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Ressources: ${stats.totalRessources.toLocaleString('fr-FR')} FCFA`, 14, 50);
  doc.text(`Total Dépenses: ${stats.totalDepenses.toLocaleString('fr-FR')} FCFA`, 14, 57);
  doc.text(`Solde: ${stats.balance.toLocaleString('fr-FR')} FCFA`, 14, 64);
  
  // Dépenses par catégorie
  doc.setFont(undefined, 'bold');
  doc.text('DÉPENSES PAR CATÉGORIE', 14, 80);
  
  const catData = categories.map(cat => {
    const total = depenses
      .filter(d => d.categorie === cat.id)
      .reduce((sum, d) => sum + parseFloat(d.montant || 0), 0);
    return [
      cat.nom,
      `${total.toLocaleString('fr-FR')} FCFA`,
      `${((total / stats.totalDepenses) * 100).toFixed(1)}%`
    ];
  }).filter(([, total]) => parseFloat(total.replace(/[^0-9]/g, '')) > 0);

  doc.autoTable({
    startY: 85,
    head: [['Catégorie', 'Montant', '% Total']],
    body: catData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 69, 19], textColor: 255 },
  });

  const fileName = `Rapport_Financier_IRFAM_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
