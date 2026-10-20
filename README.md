# IRFAM - Système de Gestion Comptable Complet

Application web moderne et complète de gestion comptable et opérationnelle pour l'Institut IRFAM (Centre de Réhabilitation et de Formation pour Aveugles - Côte d'Ivoire).

## ✨ Version 2.0 - Système Complet

### 🎯 10 Modules de Gestion

## 🚀 Fonctionnalités Principales

### 1️⃣ **Tableau de Bord Enrichi**
- 📊 **7 KPIs en temps réel** :
  - Total Ressources (Subventions, Dons)
  - Total Dépenses
  - Solde (Balance)
  - Pensionnaires actifs (sur total)
  - Coût par pensionnaire
  - Alertes stock (articles à commander)
  - Budgets dépassés
- 📈 **Graphiques interactifs** : Évolution financière, répartition par catégorie
- 🔔 **Alertes visuelles** : Codes couleurs automatiques

### 2️⃣ **Gestion des Pensionnaires** 👥
- Suivi complet de chaque bénéficiaire
- Informations personnelles (nom, prénom, sexe, date de naissance)
- Calcul automatique de l'âge et durée de séjour
- Statuts : Actif, Sorti, En attente
- Informations médicales (pathologie, notes)
- Contact d'urgence
- Niveau d'étude
- **Statistiques** : Nombre actifs, total, coût/pensionnaire

### 3️⃣ **Gestion des Ressources** 💰
- Terminologie adaptée (Ressources au lieu de Revenus)
- **4 types de ressources** :
  - Subvention de l'État
  - Don de particulier
  - Partenariat
  - Autre financement
- Source/Donateur, montant, description, date
- Total des ressources en temps réel

### 4️⃣ **Gestion des Dépenses** 💸
- Enregistrement par catégorie
- Montant, description, date
- Total des dépenses
- Association automatique aux budgets

### 5️⃣ **Budgets Prévisionnels** 📈
- Création de budgets par catégorie
- **3 périodes** : Mensuel, Trimestriel, Annuel
- Calcul automatique du % utilisé
- **Alertes visuelles** :
  - 🟢 <80% : Normal
  - 🟠 80-100% : Attention
  - 🔴 >100% : Dépassement !
- Barre de progression pour chaque budget
- Comparaison budget prévu vs dépensé

### 6️⃣ **Gestion des Donateurs** 🎁
- Base de données complète des donateurs
- **4 types** : Particulier, Entreprise, Association, Institution
- Coordonnées complètes (email, téléphone, adresse)
- **Suivi automatique** :
  - Total des dons
  - Nombre de contributions
  - Date du premier don
- Observations et notes

### 7️⃣ **Gestion des Fournisseurs** 🏪
- Catalogue complet des fournisseurs
- Catégorisation (Alimentation, Électricité, etc.)
- Coordonnées professionnelles
- **Évaluation** : Système de notation 1-5 étoiles
- Conditions de paiement
- Observations

### 8️⃣ **Inventaire de Stock** 📦
- Gestion complète du stock
- **Informations par article** :
  - Nom, catégorie
  - Quantité en stock
  - Quantité minimum (seuil d'alerte)
  - Prix unitaire
  - Unité de mesure
  - Fournisseur associé
- **Calculs automatiques** :
  - Valeur totale du stock
  - Alertes stock faible
- Statut visuel (OK / Stock faible)
- Date dernière commande

### 9️⃣ **Gestion des Catégories** 🏷️
- **11 catégories pré-définies** adaptées à l'IRFAM :
  - Loyer
  - Nourriture
  - Électricité
  - Eau
  - Soins médicaux
  - Entretien - Hygiène
  - Salaires
  - Matériel pédagogique
  - Entretien du bâtiment
  - Transport
  - Autres charges
- Interface en cartes visuelles
- Description pour chaque catégorie

### 🔟 **Rapports et Statistiques** 📄
- Graphiques avancés (aire, barres, secteurs)
- Statistiques par catégorie
- Évolution temporelle
- Analyse du solde
- Comparaisons visuelles

### 🔐 **Authentification Sécurisée**
- Token-based authentication
- Gestion de session
- Interface de connexion moderne
- Déconnexion sécurisée

## 🛠️ Technologies utilisées

### Frontend
- **React** 18.2 - Framework JavaScript
- **Material-UI** 5.15 - Bibliothèque de composants
- **Recharts** - Bibliothèque de graphiques
- **Axios** - Client HTTP
- **React Router DOM** - Navigation
- **date-fns** - Manipulation de dates

### Backend
- **Django** 5.0.1 - Framework Python
- **Django REST Framework** - API REST
- **SQLite** - Base de données (développement)
- **Token Authentication** - Authentification sécurisée

## 📦 Installation

### Prérequis
- Node.js 18.x ou 16.x
- Python 3.8+
- pip et npm

### Backend (Django)

1. Accéder au dossier backend :
```bash
cd irfam_backend
```

2. Installer les dépendances :
```bash
pip install django djangorestframework
```

3. Appliquer les migrations :
```bash
py manage.py makemigrations
py manage.py migrate
```

4. Initialiser les catégories de dépenses :
```bash
py manage.py init_categories
```

5. Créer un utilisateur de test :
```bash
py manage.py shell
```
Puis dans le shell :
```python
from django.contrib.auth.models import User
User.objects.create_user('testuser', password='test1234')
exit()
```

6. Lancer le serveur :
```bash
py manage.py runserver
```

Le backend sera accessible sur http://127.0.0.1:8000/

**Connexion** : `testuser` / `test1234`

### Frontend (React)

1. Accéder au dossier frontend :
```bash
cd irfam_frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer l'application (avec la variable d'environnement pour Node 18+) :
```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

L'application sera accessible sur http://localhost:3000/

## 🎯 Utilisation

### Démarrage Rapide
1. **Double-cliquer** sur `start_backend.bat` (backend)
2. **Double-cliquer** sur `start_frontend.bat` (frontend)
3. **Se connecter** : `testuser` / `test1234`

### Workflow Recommandé
1. **Pensionnaires** : Ajouter tous les pensionnaires actifs
2. **Catégories** : Vérifier les 11 catégories pré-créées
3. **Budgets** : Créer les budgets annuels/mensuels
4. **Donateurs** : Enregistrer la base de donateurs
5. **Fournisseurs** : Ajouter les fournisseurs réguliers
6. **Inventaire** : Renseigner le stock initial
7. **Ressources** : Enregistrer les financements reçus
8. **Dépenses** : Saisir les dépenses quotidiennes
9. **Dashboard** : Consulter les KPIs et alertes
10. **Rapports** : Générer les analyses

### Navigation
Le menu latéral contient **10 sections** :
- 📊 Tableau de bord
- 👥 Pensionnaires
- 💰 Ressources
- 💸 Dépenses
- 📈 Budgets
- 🎁 Donateurs
- 🏪 Fournisseurs
- 📦 Inventaire
- 🏷️ Catégories
- 📄 Rapports

## 🎨 Captures d'écran

### Écran de connexion
Interface moderne avec dégradé et formulaire centré.

### Tableau de bord
Vue d'ensemble avec statistiques, graphiques et transactions récentes.

### Gestion des revenus/dépenses
Tableaux interactifs avec actions rapides.

### Rapports
Graphiques détaillés et statistiques par catégorie.

## 🔧 Configuration

### Proxy Frontend
Le frontend est configuré pour proxy les requêtes API vers `http://127.0.0.1:8000` (voir `package.json`).

### CORS Backend
Le backend autorise les requêtes depuis le frontend en développement.

## 🚀 Déploiement

### Backend
1. Configurer une base de données PostgreSQL/MySQL
2. Mettre à jour `settings.py` avec les paramètres de production
3. Définir `DEBUG = False`
4. Collecter les fichiers statiques : `python manage.py collectstatic`
5. Déployer sur Heroku, PythonAnywhere, ou un VPS

### Frontend
1. Créer une build de production :
```bash
npm run build
```
2. Déployer le dossier `build/` sur Netlify, Vercel, ou un serveur web

## 📝 Licence

Projet développé pour l'Institut IRFAM - Côte d'Ivoire.

## 👨‍💻 Auteur

Application développée avec Cascade AI pour simplifier la gestion comptable de l'IRFAM.

---

**Note** : Cette application est conçue pour être professionnelle, intuitive et performante. Tous les composants sont optimisés pour une expérience utilisateur fluide et agréable.
