import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporter les rapports en PDF
 */
export const exportRapportPDF = (stats, monthlyData) => {
  const doc = new jsPDF();
  
  // En-tête avec logo IRFAM
  doc.setFillColor(139, 69, 19); // Marron IRFAM
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('IRFAM', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Institut de Réhabilitation et de Formation', 105, 22, { align: 'center' });
  doc.text('des Aveugles du Mont Carmel', 105, 28, { align: 'center' });
  
  // Titre du rapport
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Rapport Comptable', 14, 45);
  
  // Date de génération
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const dateStr = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Généré le ${dateStr}`, 14, 52);
  
  // Ligne de séparation
  doc.setDrawColor(210, 105, 30); // Chocolate IRFAM
  doc.setLineWidth(0.5);
  doc.line(14, 55, 196, 55);
  
  // Section 1: Résumé Financier
  let yPos = 65;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(139, 69, 19);
  doc.text('📊 Résumé Financier', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const financialData = [
    ['Total Ressources', `${stats.totalRessources?.toLocaleString() || 0} FCFA`],
    ['Total Dépenses', `${stats.totalDepenses?.toLocaleString() || 0} FCFA`],
    ['Solde Net', `${stats.balance?.toLocaleString() || 0} FCFA`],
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Indicateur', 'Montant']],
    body: financialData,
    theme: 'grid',
    headStyles: { 
      fillColor: [139, 69, 19],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 220],
    },
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Section 2: Évolution Mensuelle
  if (monthlyData && monthlyData.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('📈 Évolution Mensuelle', 14, yPos);
    
    yPos += 10;
    
    const monthlyTableData = monthlyData.map(month => [
      month.mois || '-',
      `${month.ressources?.toLocaleString() || 0} FCFA`,
      `${month.depenses?.toLocaleString() || 0} FCFA`,
      `${((month.ressources || 0) - (month.depenses || 0)).toLocaleString()} FCFA`,
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Mois', 'Ressources', 'Dépenses', 'Solde']],
      body: monthlyTableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [107, 142, 35], // Olive
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 220],
      },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      '© IRFAM - Comptabilité',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Sauvegarder le PDF
  doc.save(`IRFAM_Rapport_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporter la liste des dépenses en PDF
 */
export const exportDepensesPDF = (depenses) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFillColor(139, 69, 19);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('IRFAM - Liste des Dépenses', 105, 20, { align: 'center' });
  
  // Tableau des dépenses
  const tableData = depenses.map(dep => [
    dep.date || '-',
    dep.categorie_detail?.nom || 'Sans catégorie',
    dep.description || '-',
    `${parseFloat(dep.montant).toLocaleString()} FCFA`,
  ]);
  
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Catégorie', 'Description', 'Montant']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [160, 82, 45], // Sienna
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  doc.save(`IRFAM_Depenses_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporter la liste des ressources en PDF
 */
export const exportRessourcesPDF = (ressources) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFillColor(139, 69, 19);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('IRFAM - Liste des Ressources', 105, 20, { align: 'center' });
  
  // Tableau des ressources
  const tableData = ressources.map(res => [
    res.date || '-',
    res.source || '-',
    res.type_ressource || '-',
    res.description || '-',
    `${parseFloat(res.montant).toLocaleString()} FCFA`,
  ]);
  
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Source', 'Type', 'Description', 'Montant']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [107, 142, 35], // Olive
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });
  
  doc.save(`IRFAM_Ressources_${new Date().toISOString().split('T')[0]}.pdf`);
};
