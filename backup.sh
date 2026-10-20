#!/bin/bash

# SCRIPT DE BACKUP AUTOMATIQUE POUR IRFAM
# Ce script sauvegarde la base de données PostgreSQL et les fichiers media

# Configuration
BACKUP_DIR="/home/irfam/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="irfam_db"
DB_NAME="irfam_db"
DB_USER="irfam_user"
RETENTION_DAYS=30

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Nom du fichier de backup
BACKUP_FILE="$BACKUP_DIR/irfam_backup_$DATE.sql.gz"
MEDIA_BACKUP="$BACKUP_DIR/irfam_media_$DATE.tar.gz"

echo "========================================="
echo "Démarrage du backup IRFAM - $DATE"
echo "========================================="

# 1. Backup de la base de données PostgreSQL
echo "1. Sauvegarde de la base de données..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Base de données sauvegardée : $BACKUP_FILE"
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   Taille : $SIZE"
else
    echo "❌ Erreur lors de la sauvegarde de la base de données"
    exit 1
fi

# 2. Backup des fichiers media
echo "2. Sauvegarde des fichiers media..."
if [ -d "/home/irfam/irfam/irfam_backend/media" ]; then
    tar -czf "$MEDIA_BACKUP" -C /home/irfam/irfam/irfam_backend media/
    if [ $? -eq 0 ]; then
        echo "✅ Fichiers media sauvegardés : $MEDIA_BACKUP"
        SIZE=$(du -h "$MEDIA_BACKUP" | cut -f1)
        echo "   Taille : $SIZE"
    else
        echo "⚠️  Avertissement : Erreur lors de la sauvegarde des media"
    fi
else
    echo "⚠️  Dossier media non trouvé, ignoré"
fi

# 3. Nettoyage des anciens backups (garder seulement les N derniers jours)
echo "3. Nettoyage des anciens backups (> $RETENTION_DAYS jours)..."
find "$BACKUP_DIR" -name "irfam_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "irfam_media_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Nettoyage effectué"

# 4. Afficher l'espace disque
echo "4. Espace disque utilisé par les backups :"
du -sh "$BACKUP_DIR"

# 5. Liste des derniers backups
echo "5. Derniers backups disponibles :"
ls -lht "$BACKUP_DIR" | head -n 6

echo "========================================="
echo "✅ Backup terminé avec succès - $DATE"
echo "========================================="

# Optionnel : Envoyer une notification (à configurer)
# curl -X POST https://votre-webhook-slack.com -d "Backup IRFAM réussi : $DATE"
