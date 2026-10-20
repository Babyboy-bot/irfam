# Structure de projet pour IRFAM (Django backend)

irfam_backend/
├── manage.py
├── requirements.txt
├── irfam_backend/           # Config principale Django
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── comptabilite/           # App principale (dépenses, revenus, pensionnaires...)
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
└── locale/
    └── fr/LC_MESSAGES/     # Pour la traduction française
        └── django.po

# requirements.txt
Django>=4.2
psycopg2-binary
