# 🚀 GUIDE DE DÉPLOIEMENT EN PRODUCTION - IRFAM

## 📋 **PRÉ-REQUIS**

Avant de déployer, assurez-vous d'avoir :
- ✅ Un serveur Linux (Ubuntu 20.04+ recommandé)
- ✅ Docker et Docker Compose installés
- ✅ Un nom de domaine configuré
- ✅ Certificat SSL (Let's Encrypt)
- ✅ Accès SSH au serveur

---

## 🔧 **ÉTAPE 1 : PRÉPARER LE SERVEUR**

### 1.1 Connexion SSH
```bash
ssh root@votre-serveur.com
```

### 1.2 Installer Docker
```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt install docker-compose -y

# Vérifier l'installation
docker --version
docker-compose --version
```

### 1.3 Créer un utilisateur dédié
```bash
adduser irfam
usermod -aG docker irfam
su - irfam
```

---

## 📦 **ÉTAPE 2 : DÉPLOYER L'APPLICATION**

### 2.1 Cloner le code
```bash
cd /home/irfam
git clone votre-repo-git.git irfam
cd irfam
```

### 2.2 Configurer les variables d'environnement
```bash
cd irfam_backend
cp .env.example .env
nano .env
```

**Remplir les valeurs** :
```env
SECRET_KEY=votre-cle-secrete-generee-ici
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com
DB_PASSWORD=mot-de-passe-postgresql-securise
```

### 2.3 Générer une clé secrète Django
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copier le résultat dans SECRET_KEY du fichier .env

### 2.4 Lancer les containers
```bash
cd /home/irfam/irfam
docker-compose up -d
```

### 2.5 Créer la base de données
```bash
# Attendre que les containers démarrent (30 secondes)
sleep 30

# Appliquer les migrations
docker-compose exec web python manage.py migrate

# Créer le superutilisateur
docker-compose exec web python manage.py createsuperuser

# Collecter les fichiers statiques
docker-compose exec web python manage.py collectstatic --noinput
```

---

## 🌐 **ÉTAPE 3 : CONFIGURER NGINX**

### 3.1 Créer le fichier nginx.conf
```bash
nano nginx.conf
```

Contenu :
```nginx
events {
    worker_connections 1024;
}

http {
    upstream django {
        server web:8000;
    }

    server {
        listen 80;
        server_name votre-domaine.com www.votre-domaine.com;

        client_max_body_size 100M;

        location / {
            proxy_pass http://django;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /static/ {
            alias /var/www/static/;
        }

        location /media/ {
            alias /var/www/media/;
        }
    }
}
```

### 3.2 Redémarrer Nginx
```bash
docker-compose restart nginx
```

---

## 🔒 **ÉTAPE 4 : CONFIGURER SSL (HTTPS)**

### 4.1 Installer Certbot
```bash
# Sur le serveur (hors container)
apt install certbot python3-certbot-nginx -y
```

### 4.2 Obtenir le certificat
```bash
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 4.3 Renouvellement automatique
```bash
# Tester le renouvellement
certbot renew --dry-run

# Cron automatique (déjà configuré par Certbot)
```

---

## 💾 **ÉTAPE 5 : CONFIGURER LES BACKUPS**

### 5.1 Créer le script de backup
```bash
nano /home/irfam/backup.sh
```

Contenu du script (voir backup.sh)

### 5.2 Rendre exécutable
```bash
chmod +x /home/irfam/backup.sh
```

### 5.3 Configurer la crontab (backup quotidien à 2h du matin)
```bash
crontab -e
```

Ajouter :
```
0 2 * * * /home/irfam/backup.sh >> /home/irfam/logs/backup.log 2>&1
```

---

## 📊 **ÉTAPE 6 : MONITORING (OPTIONNEL)**

### 6.1 Configurer Sentry
1. Créer un compte sur sentry.io
2. Créer un projet Django
3. Copier le DSN
4. Ajouter dans .env :
```env
SENTRY_DSN=votre-dsn-sentry
```

### 6.2 Redémarrer l'application
```bash
docker-compose restart web
```

---

## ✅ **ÉTAPE 7 : VÉRIFICATIONS**

### 7.1 Vérifier que tout fonctionne
```bash
# Vérifier les containers
docker-compose ps

# Vérifier les logs
docker-compose logs -f web

# Tester l'accès
curl http://localhost:8000
```

### 7.2 Tester depuis le navigateur
```
https://votre-domaine.com
```

Vous devriez voir la page de connexion IRFAM ! 🎉

---

## 🔄 **MISES À JOUR FUTURES**

### Pour mettre à jour l'application :
```bash
cd /home/irfam/irfam

# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose down
docker-compose build
docker-compose up -d

# Appliquer les migrations si nécessaire
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py collectstatic --noinput
```

---

## 🆘 **DÉPANNAGE**

### Voir les logs
```bash
# Logs de l'application
docker-compose logs -f web

# Logs de la base de données
docker-compose logs -f db

# Logs de Nginx
docker-compose logs -f nginx
```

### Redémarrer un service
```bash
docker-compose restart web
docker-compose restart db
docker-compose restart nginx
```

### Accéder au container
```bash
docker-compose exec web bash
docker-compose exec db psql -U irfam_user -d irfam_db
```

---

## 📞 **SUPPORT**

En cas de problème :
1. Vérifier les logs : `docker-compose logs -f`
2. Vérifier les variables d'environnement dans `.env`
3. Vérifier que les ports sont ouverts (80, 443, 8000)
4. Vérifier les permissions des fichiers

---

**Déploiement réalisé avec succès ! 🚀**

Date de déploiement : ___________
Version : 1.0.0
Déployé par : ___________
