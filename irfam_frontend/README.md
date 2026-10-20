# Structure de projet pour IRFAM (React frontend)

irfam_frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js
│   ├── index.js
│   ├── components/           # Composants réutilisables
│   ├── pages/                # Pages principales (Tableau de bord, Dépenses, Revenus, Pensionnaires...)
│   ├── services/             # Appels API backend
│   ├── i18n/                 # Fichiers de traduction (français par défaut)
│   └── theme/                # Personnalisation Material UI
├── package.json
└── README.md

# Librairies principales
- react
- @mui/material (Material UI)
- axios (requêtes HTTP)
- react-i18next (traduction)
