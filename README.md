# IRFAM — Système de gestion comptable & opérationnel

Application web complète développée pour l'**Institut IRFAM** (Centre de Réhabilitation et de Formation pour Aveugles — Côte d'Ivoire). Elle couvre la comptabilité en **partie double (plan SYSCOHADA)**, la trésorerie, les budgets, les projets à fonds affectés et l'ensemble des référentiels métier de l'institut.

## Stack technique

| Couche | Techno |
|---|---|
| Backend | Django 5 + Django REST Framework, servi par Gunicorn |
| Frontend | React 18 (CRA) + Material UI v5 + Recharts |
| Base de données | PostgreSQL 15 |
| Exports | Excel / CSV (xlsx), PDF (jsPDF + autotable) |
| Tests | Tests unitaires Django (moteur comptable) + Playwright E2E |
| Conteneurs | Docker + Docker Compose (front via Nginx, API, db) |

## Fonctionnalités

### Pilotage
- **Tableau de bord** : 7 KPIs temps réel (ressources, dépenses, solde, pensionnaires actifs, coût/pensionnaire, alertes stock, budgets dépassés), graphiques interactifs d'évolution financière.
- **Rapports** exportables (PDF / Excel).

### Finances & trésorerie
- **Comptes de trésorerie** multiples (caisse, banques, mobile money) — solde calculé : solde initial + ressources − dépenses + virements reçus − virements émis.
- **Ressources** : subventions de l'État, dons de particuliers, partenariats, autres financements — y compris **dons en nature valorisés**.
- **Dépenses** par catégorie, avec **pièce justificative** jointe (PDF/JPG/PNG, 5 Mo, servie en accès protégé).
- **Virements** internes entre comptes, refusés si solde insuffisant.
- **Budgets prévisionnels** (mensuel / trimestriel / annuel) avec alertes visuelles à 80 % et 100 %.
- **Projets / fonds affectés** : imputation contrôlée (projet clôturé ou hors période refusé) + **rapport d'emploi des fonds** exportable en PDF — essentiel pour la redevabilité envers les bailleurs.

### Comptabilité — partie double
- **Plan comptable SYSCOHADA** simplifié : chaque opération (dépense, ressource, virement) génère automatiquement une **écriture équilibrée**.
- **Opérations diverses** (écritures manuelles) : ≥ 2 lignes, débit/crédit exclusif, équilibre vérifié.
- Aucune suppression : modification = **contre-passation + repassage**, annulation = contre-passation.
- **Journal, grand livre, balance** et **états financiers** (bilan + compte de résultat, arrêté à date) — tous exportables.
- Numérotation des pièces **`EC-NNNNNN` sans trou**, allouée en transaction.
- `python manage.py verifier_compta` : contrôle Σ débit = Σ crédit et cohérence trésorerie ↔ comptes de classe 5.

### Intégrité & gouvernance
- **Aucune opération ne se supprime** : annulation motivée réservée aux admins (DELETE → 405).
- **Clôtures mensuelles** : un mois clôturé refuse toute écriture datée dedans ; réouverture réservée aux admins.
- **Journal d'audit** complet : connexions, créations, modifications, annulations, clôtures.
- **Immutabilité en base** : trigger PostgreSQL interdisant UPDATE/DELETE sur le grand livre et l'audit.
- **Rôles** : administrateur / comptable — permissions appliquées côté serveur, boutons sensibles masqués côté UI.

### Référentiels métier
- **Pensionnaires** (bénéficiaires) : dossier complet, âge et durée de séjour calculés, coût/pensionnaire.
- **Personnel**, **donateurs** (suivi des contributions), **fournisseurs** (notation), **inventaire** avec seuils d'alerte, **catégories** adaptées à l'institut.

## Structure du projet

```
irfam/
├── irfam_backend/      # Django + DRF — app « comptabilite »
│   ├── comptabilite/   # Modèles, vues, moteur comptable, permissions
│   └── irfam_backend/  # Settings, URLs
├── irfam_frontend/     # React (CRA) + MUI, servi par Nginx
│   └── src/pages/      # 16 modules (dashboard, trésorerie, comptabilité…)
├── e2e/                # Tests end-to-end Playwright
├── backups/            # Sauvegardes PostgreSQL (ignoré par git)
├── docker-compose.yml
└── docs/               # ARCHITECTURE, GUIDE_PRATIQUE, DEPLOIEMENT… (*.md à la racine)
```

## Démarrage rapide

```bash
docker compose up -d --build
```

- Frontend : http://localhost/ (Nginx → proxifie `/api/` vers le backend)
- API : http://localhost:8000
- Admin Django : http://localhost:8000/admin

## Tests

```bash
# Tests unitaires backend (moteur comptable)
docker exec irfam_backend python manage.py test comptabilite

# Contrôle d'intégrité comptable
docker exec irfam_backend python manage.py verifier_compta

# Tests E2E Playwright (l'app doit tourner sur http://localhost)
cd e2e && npx playwright test
```

## Documentation complémentaire

- `ARCHITECTURE.md` — architecture technique détaillée
- `GUIDE_PRATIQUE.md` — guide d'utilisation métier
- `DEPLOIEMENT_PRODUCTION.md` / `PREPARATION_PRODUCTION.md` — mise en production
- `CHECKLIST_VALIDATION_CLIENT.md` — recette client
- `AGENTS.md` — règles métier et commandes utiles
