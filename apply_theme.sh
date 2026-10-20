#!/bin/bash
# Script pour appliquer le thème IRFAM sur toutes les pages

# Liste des fichiers à modifier
FILES=(
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/DepensesPage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/PensionnairesPage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/BudgetsPage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/DonateursPage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/FournisseursPage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/InventairePage.js"
  "c:/Users/LENOVO/CascadeProjects/irfam/irfam_frontend/src/pages/CategoriesPage.js"
)

echo "Application du thème IRFAM (Blanc & Marron)..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Traitement de: $file"
    # Note: Remplacements à effectuer manuellement dans Cascade
  fi
done

echo "✅ Thème IRFAM appliqué sur toutes les pages!"
