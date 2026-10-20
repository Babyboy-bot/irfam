# 🏗️ Architecture de l'application IRFAM

## 📂 Structure du projet

```
irfam/
├── irfam_backend/              # Backend Django
│   ├── comptabilite/           # Application principale
│   │   ├── models.py          # Modèles : Revenu, Depense, CategorieDepense
│   │   ├── serializers.py     # Sérialiseurs DRF
│   │   ├── views.py           # Vues API (CRUD complet)
│   │   └── urls.py            # Routes API
│   ├── irfam_backend/          # Configuration Django
│   │   ├── settings.py        # Paramètres (CORS, apps, DB)
│   │   └── urls.py            # Routes principales
│   ├── db.sqlite3             # Base de données SQLite
│   ├── manage.py              # Utilitaire Django
│   └── requirements.txt       # Dépendances Python
│
├── irfam_frontend/             # Frontend React
│   ├── public/
│   │   └── index.html         # Point d'entrée HTML
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   └── Layout.js      # Menu latéral + AppBar
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── DashboardPage.js     # Tableau de bord
│   │   │   ├── RevenusPage.js       # Gestion revenus
│   │   │   ├── DepensesPage.js      # Gestion dépenses
│   │   │   ├── CategoriesPage.js    # Gestion catégories
│   │   │   └── RapportsPage.js      # Statistiques
│   │   ├── App.js             # Composant principal
│   │   └── index.js           # Point d'entrée React
│   ├── package.json           # Dépendances npm + proxy
│   └── node_modules/          # Modules installés
│
├── start_backend.bat           # Script de démarrage backend
├── start_frontend.bat          # Script de démarrage frontend
├── README.md                   # Documentation complète
├── GUIDE_DEMARRAGE.md         # Guide de démarrage rapide
└── ARCHITECTURE.md            # Ce fichier
```

---

## 🔄 Flux de données

### 1. Authentification
```
Frontend                    Backend
   │                           │
   │  POST /login/             │
   │  {username, password} ──► │
   │                           │ authenticate()
   │                           │ Token.objects.get_or_create()
   │ ◄── {token, username}     │
   │                           │
   │  Stocke le token          │
   └─────────────────────────  │
```

### 2. Récupération des données
```
Frontend                    Backend
   │                           │
   │  GET /revenus/            │
   │  Header: Token xxx    ──► │
   │                           │ permissions.IsAuthenticated
   │                           │ Revenu.objects.all()
   │ ◄── [{id, source, ...}]   │
   │                           │
   │  Affiche dans le tableau  │
```

### 3. Création d'une entrée
```
Frontend                    Backend
   │                           │
   │  POST /revenus/           │
   │  {source, montant, ...}──►│
   │  Header: Token xxx        │
   │                           │ serializer.is_valid()
   │                           │ serializer.save()
   │ ◄── {id, source, ...}     │
   │                           │
   │  Recharge les données     │
```

---

## 🗄️ Modèle de données (Backend)

### CategorieDepense
```python
{
    id: Integer (PK),
    nom: String,
    description: String (nullable)
}
```

### Depense
```python
{
    id: Integer (PK),
    categorie: ForeignKey(CategorieDepense),
    montant: Decimal,
    description: String (nullable),
    date: Date
}
```

### Revenu
```python
{
    id: Integer (PK),
    source: String,
    montant: Decimal,
    description: String (nullable),
    date: Date
}
```

### User (Django)
```python
{
    id: Integer (PK),
    username: String,
    password: String (hashé),
    email: String (nullable)
}
```

### Token (DRF)
```python
{
    key: String (PK),
    user: ForeignKey(User),
    created: DateTime
}
```

---

## 🌐 API Endpoints

### Authentification
- `POST /login/` - Connexion et obtention du token

### Catégories
- `GET /categories/` - Liste toutes les catégories
- `POST /categories/` - Crée une nouvelle catégorie
- `GET /categories/{id}/` - Détails d'une catégorie
- `PUT /categories/{id}/` - Modifie une catégorie
- `DELETE /categories/{id}/` - Supprime une catégorie

### Dépenses
- `GET /depenses/` - Liste toutes les dépenses
- `POST /depenses/` - Crée une nouvelle dépense
- `GET /depenses/{id}/` - Détails d'une dépense
- `PUT /depenses/{id}/` - Modifie une dépense
- `DELETE /depenses/{id}/` - Supprime une dépense

### Revenus
- `GET /revenus/` - Liste tous les revenus
- `POST /revenus/` - Crée un nouveau revenu
- `GET /revenus/{id}/` - Détails d'un revenu
- `PUT /revenus/{id}/` - Modifie un revenu
- `DELETE /revenus/{id}/` - Supprime un revenu

**Toutes les routes (sauf `/login/`) nécessitent l'authentification via token.**

---

## 🎨 Structure Frontend (React)

### Composants

#### Layout.js
- Menu latéral (Drawer) avec navigation
- Barre supérieure (AppBar) avec profil
- Gestion de la navigation entre pages
- Responsive (mobile + desktop)

#### Pages

**DashboardPage.js**
- Cartes de statistiques (revenus, dépenses, solde)
- Graphiques : barres (évolution), secteurs (catégories)
- Listes des dernières transactions

**RevenusPage.js**
- Tableau avec tous les revenus
- Bouton "Nouveau revenu"
- Dialog modale pour ajout/modification
- Actions : modifier, supprimer

**DepensesPage.js**
- Tableau avec toutes les dépenses
- Sélection de catégorie
- Dialog modale pour ajout/modification
- Actions : modifier, supprimer

**CategoriesPage.js**
- Affichage en grille de cartes
- Bouton "Nouvelle catégorie"
- Dialog modale pour ajout/modification
- Actions : modifier, supprimer

**RapportsPage.js**
- Graphiques d'évolution (aire)
- Tableau de statistiques par catégorie
- Totaux et pourcentages

### État global
```javascript
App.js :
- token (String | null)
- currentUser (String)
- currentPage (String : 'dashboard' | 'revenus' | 'depenses' | 'categories' | 'rapports')
```

### Thème
```javascript
{
  palette: {
    primary: '#3b82f6' (bleu),
    secondary: '#10b981' (vert)
  },
  typography: {
    fontFamily: 'Inter, Roboto'
  }
}
```

---

## 🔐 Sécurité

### Backend
- **CSRF désactivé sur `/login/`** pour permettre l'auth API
- **Token-based authentication** pour toutes les autres routes
- **Permissions Django** : `IsAuthenticated` sur toutes les vues CRUD

### Frontend
- **Token stocké en mémoire** (pas de localStorage pour plus de sécurité)
- **Headers Authorization** : `Token <key>` sur chaque requête API
- **Déconnexion** : efface le token de la mémoire

---

## 📦 Dépendances

### Backend (requirements.txt)
```
Django==5.0.1
djangorestframework==3.14.0
psycopg2-binary (pour PostgreSQL en prod)
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^6.0.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.x.x",
    "react-router-dom": "^6.x.x",
    "date-fns": "^2.x.x"
  },
  "devDependencies": {
    "react-scripts": "^4.0.3"
  }
}
```

---

## 🚀 Déploiement

### Backend
1. Configurer PostgreSQL en production
2. Mettre à jour `settings.py` : `DEBUG = False`, `ALLOWED_HOSTS`, `DATABASES`
3. Collecter les fichiers statiques : `python manage.py collectstatic`
4. Utiliser Gunicorn + Nginx
5. Héberger sur Heroku, PythonAnywhere, ou VPS

### Frontend
1. Build de production : `npm run build`
2. Déployer le dossier `build/` sur Netlify, Vercel, ou serveur web
3. Configurer les variables d'environnement pour l'URL de l'API

---

## 🎯 Points d'amélioration futurs

- [ ] Ajouter des tests unitaires (backend + frontend)
- [ ] Implémenter la pagination pour les longues listes
- [ ] Ajouter des filtres et recherche dans les tableaux
- [ ] Export PDF/Excel des rapports
- [ ] Gestion multi-utilisateurs avec rôles
- [ ] Notifications push pour les actions importantes
- [ ] Mode sombre
- [ ] Internationalisation (i18n)
- [ ] PWA (Progressive Web App)

---

**Cette architecture est conçue pour être scalable, maintenable et professionnelle.** 🚀
