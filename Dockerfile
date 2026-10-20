# DOCKERFILE POUR DÉPLOIEMENT IRFAM
# Multi-stage build pour optimiser la taille

# Stage 1: Build du frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copier les fichiers package
COPY irfam_frontend/package*.json ./
RUN npm install

# Copier le code source et builder
COPY irfam_frontend/ ./
RUN npm run build

# Stage 2: Backend Python
FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Créer un utilisateur non-root
RUN useradd -m -u 1000 irfam && \
    mkdir -p /app /var/log/irfam && \
    chown -R irfam:irfam /app /var/log/irfam

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements et installer les dépendances Python
COPY irfam_backend/requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copier le code backend
COPY --chown=irfam:irfam irfam_backend/ ./backend/

# Copier le frontend buildé
COPY --from=frontend-build --chown=irfam:irfam /app/frontend/build ./frontend/build/

# Passer à l'utilisateur non-root
USER irfam

# Exposer le port
EXPOSE 8000

# Script de démarrage
WORKDIR /app/backend
CMD ["gunicorn", "irfam_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
