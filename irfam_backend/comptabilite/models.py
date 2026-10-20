from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class Profil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default='comptable')

    def __str__(self):
        return self.user.username

class CategorieDepense(models.Model):
    nom = models.CharField(max_length=100, verbose_name=_('Nom de la catégorie'))
    description = models.TextField(blank=True, verbose_name=_('Description'))

    def __str__(self):
        return self.nom

class Depense(models.Model):
    categorie = models.ForeignKey(CategorieDepense, on_delete=models.PROTECT, verbose_name=_('Catégorie'))  # PROTECT au lieu de CASCADE
    montant = models.IntegerField(verbose_name=_('Montant'))
    description = models.CharField(max_length=255, blank=True, verbose_name=_('Description'))
    date = models.DateField(verbose_name=_('Date'))
    cree_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='depenses_creees', verbose_name=_('Créé par'))
    justification = models.TextField(blank=True, verbose_name=_('Justification'))

    def __str__(self):
        return f"{self.categorie} - {self.montant} FCFA"

class Ressource(models.Model):
    TYPE_CHOICES = [
        ('subvention', 'Subvention de l\'État'),
        ('don_especes', 'Don en espèces'),
        ('don_nature', 'Don en nature'),
        ('partenariat', 'Partenariat'),
        ('autre', 'Autre financement'),
    ]
    type_ressource = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name=_('Type de ressource'))
    
    # Liaison avec le donateur (si c'est un don)
    donateur = models.ForeignKey('Donateur', on_delete=models.SET_NULL, null=True, blank=True, related_name='ressources', verbose_name=_('Donateur'))
    
    # Source reste pour compatibilité et cas où pas de donateur (subventions, etc.)
    source = models.CharField(max_length=100, blank=True, verbose_name=_('Source / Donateur'))
    
    montant = models.IntegerField(default=0, verbose_name=_('Montant (FCFA)'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    date = models.DateField(verbose_name=_('Date'))
    
    # Pour les dons en nature
    est_don_nature = models.BooleanField(default=False, verbose_name=_('Don en nature'))
    articles_dons = models.TextField(blank=True, verbose_name=_('Articles donnés (détails)'))
    valeur_estimee = models.IntegerField(null=True, blank=True, verbose_name=_('Valeur estimée'))

    def __str__(self):
        nom_source = self.donateur.nom if self.donateur else self.source
        if self.est_don_nature:
            return f"{self.get_type_ressource_display()} - {nom_source} - Valeur: {self.valeur_estimee or 'N/A'} FCFA"
        return f"{self.get_type_ressource_display()} - {nom_source} - {self.montant} FCFA"
    
    def save(self, *args, **kwargs):
        # Cohérence : don nature → montant = 0, don espèces → valeur_estimee = None
        if self.est_don_nature or self.type_ressource == 'don_nature':
            self.est_don_nature = True
            self.montant = 0  # Évite le double comptage
        else:
            self.valeur_estimee = None  # Évite le double comptage
            self.est_don_nature = False
        
        # Si un donateur est lié, utiliser son nom comme source
        if self.donateur and not self.source:
            self.source = self.donateur.nom
        
        super().save(*args, **kwargs)
        
        # Mettre à jour les statistiques du donateur
        if self.donateur:
            self.update_donateur_stats()
    
    def update_donateur_stats(self):
        """Met à jour automatiquement les stats du donateur"""
        if not self.donateur:
            return
        
        from django.db.models import Sum, Count
        stats = Ressource.objects.filter(donateur=self.donateur).aggregate(
            total=Sum('montant'),
            total_nature=Sum('valeur_estimee'),
            count=Count('id')
        )
        
        total_especes = stats['total'] or 0
        total_nature = stats['total_nature'] or 0
        
        self.donateur.total_dons = total_especes + total_nature
        self.donateur.nombre_dons = stats['count'] or 0
        self.donateur.save()
    
    class Meta:
        verbose_name = 'Ressource'
        verbose_name_plural = 'Ressources'

class Pensionnaire(models.Model):
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('sorti', 'Sorti'),
        ('en_attente', 'En attente'),
    ]
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    nom = models.CharField(max_length=100, verbose_name=_('Nom'))
    prenom = models.CharField(max_length=100, verbose_name=_('Prénom'))
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name=_('Sexe'))
    date_naissance = models.DateField(verbose_name=_('Date de naissance'))
    date_entree = models.DateField(verbose_name=_('Date d\'entrée'))
    date_sortie = models.DateField(null=True, blank=True, verbose_name=_('Date de sortie'))
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='actif', verbose_name=_('Statut'))
    photo = models.ImageField(upload_to='pensionnaires/', null=True, blank=True, verbose_name=_('Photo'))
    niveau_etude = models.CharField(max_length=100, blank=True, verbose_name=_('Niveau d\'étude'))
    pathologie = models.TextField(blank=True, verbose_name=_('Pathologie / Notes médicales'))
    contact_urgence = models.CharField(max_length=200, blank=True, verbose_name=_('Contact d\'urgence'))
    observations = models.TextField(blank=True, verbose_name=_('Observations'))
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
    class Meta:
        verbose_name = 'Pensionnaire'
        verbose_name_plural = 'Pensionnaires'
        ordering = ['-date_entree']

class Personnel(models.Model):
    TYPE_CONTRAT_CHOICES = [
        ('CDI', 'CDI - Contrat à Durée Indéterminée'),
        ('CDD', 'CDD - Contrat à Durée Déterminée'),
        ('stage', 'Stage'),
        ('benevole', 'Bénévole'),
    ]
    
    FONCTION_CHOICES = [
        ('direction', 'Direction'),
        ('administration', 'Administration'),
        ('comptabilite', 'Comptabilité'),
        ('education', 'Éducation/Formation'),
        ('sante', 'Santé'),
        ('maintenance', 'Maintenance'),
        ('cuisine', 'Cuisine'),
        ('securite', 'Sécurité'),
        ('autre', 'Autre'),
    ]
    
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('conge', 'En congé'),
        ('suspendu', 'Suspendu'),
        ('depart', 'Parti'),
    ]
    
    # Informations personnelles
    nom = models.CharField(max_length=100, verbose_name=_('Nom'))
    prenom = models.CharField(max_length=100, verbose_name=_('Prénom'))
    photo = models.ImageField(upload_to='personnel/', null=True, blank=True, verbose_name=_('Photo'))
    date_naissance = models.DateField(null=True, blank=True, verbose_name=_('Date de naissance'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    telephone = models.CharField(max_length=50, blank=True, verbose_name=_('Téléphone'))
    adresse = models.TextField(blank=True, verbose_name=_('Adresse'))
    
    # Informations professionnelles
    fonction = models.CharField(max_length=50, choices=FONCTION_CHOICES, verbose_name=_('Fonction'))
    type_contrat = models.CharField(max_length=20, choices=TYPE_CONTRAT_CHOICES, verbose_name=_('Type de contrat'))
    date_embauche = models.DateField(verbose_name=_('Date d\'embauche'))
    date_fin_contrat = models.DateField(null=True, blank=True, verbose_name=_('Date de fin de contrat'))
    salaire = models.IntegerField(null=True, blank=True, verbose_name=_('Salaire mensuel (FCFA)'))
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='actif', verbose_name=_('Statut'))
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.get_fonction_display()}"
    
    class Meta:
        verbose_name = 'Personnel'
        verbose_name_plural = 'Personnel'
        ordering = ['fonction', 'nom']

class Donateur(models.Model):
    TYPE_CHOICES = [
        ('particulier', 'Particulier'),
        ('entreprise', 'Entreprise'),
        ('association', 'Association'),
        ('institution', 'Institution'),
    ]
    
    nom = models.CharField(max_length=200, verbose_name=_('Nom'))
    type_donateur = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name=_('Type'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    telephone = models.CharField(max_length=50, blank=True, verbose_name=_('Téléphone'))
    adresse = models.TextField(blank=True, verbose_name=_('Adresse'))
    date_premier_don = models.DateField(null=True, blank=True, verbose_name=_('Premier don'))  # Plus flexible
    total_dons = models.IntegerField(default=0, verbose_name=_('Total des dons'))
    nombre_dons = models.IntegerField(default=0, verbose_name=_('Nombre de dons'))
    observations = models.TextField(blank=True, verbose_name=_('Observations'))
    
    def __str__(self):
        return f"{self.nom} ({self.get_type_donateur_display()})"
    
    class Meta:
        verbose_name = 'Donateur'
        verbose_name_plural = 'Donateurs'
        ordering = ['-total_dons']

# Modèle Fournisseur supprimé - Non nécessaire pour l'IRFAM

class Budget(models.Model):
    PERIODE_CHOICES = [
        ('mensuel', 'Mensuel'),
        ('trimestriel', 'Trimestriel'),
        ('annuel', 'Annuel'),
    ]
    
    categorie = models.ForeignKey(CategorieDepense, on_delete=models.PROTECT, verbose_name=_('Catégorie'))  # PROTECT au lieu de CASCADE
    montant_prevu = models.IntegerField(verbose_name=_('Montant prévu'))
    periode = models.CharField(max_length=20, choices=PERIODE_CHOICES, verbose_name=_('Période'))
    annee = models.IntegerField(verbose_name=_('Année'))
    mois = models.IntegerField(null=True, blank=True, verbose_name=_('Mois (1-12)'))
    responsable = models.ForeignKey(Personnel, on_delete=models.SET_NULL, null=True, blank=True, related_name='budgets_geres', verbose_name=_('Responsable'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    def __str__(self):
        return f"{self.categorie} - {self.periode} {self.annee}"
    
    class Meta:
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        ordering = ['-annee', '-mois']

# Catégories communes pour articles (inventaire et dons)
CATEGORIE_ARTICLES_CHOICES = [
    ('alimentaire', 'Produits alimentaires'),
    ('hygiene', 'Produits d\'hygiène'),
    ('vetements', 'Vêtements'),
    ('materiel_pedagogique', 'Matériel pédagogique'),
    ('materiel_medical', 'Matériel médical'),
    ('mobilier', 'Mobilier'),
    ('equipement', 'Équipement'),
    ('autre', 'Autre'),
]

class ArticleInventaire(models.Model):
    nom = models.CharField(max_length=200, verbose_name=_('Nom'))
    categorie = models.CharField(max_length=50, choices=CATEGORIE_ARTICLES_CHOICES, verbose_name=_('Catégorie'))
    unite = models.CharField(max_length=50, verbose_name=_('Unité de mesure'))
    quantite_stock = models.IntegerField(verbose_name=_('Quantité en stock'))
    quantite_min = models.IntegerField(verbose_name=_('Quantité minimum'))
    prix_unitaire = models.IntegerField(null=True, blank=True, verbose_name=_('Prix unitaire'))
    # Fournisseur retiré - Non nécessaire
    date_derniere_commande = models.DateField(null=True, blank=True, verbose_name=_('Dernière commande'))
    
    def __str__(self):
        return f"{self.nom} ({self.quantite_stock} {self.unite})"
    
    @property
    def alerte_stock(self):
        return self.quantite_stock <= self.quantite_min
    
    class Meta:
        verbose_name = 'Article d\'inventaire'
        verbose_name_plural = 'Articles d\'inventaire'
        ordering = ['categorie', 'nom']

class ArticleDonNature(models.Model):
    """Détail des articles pour un don en nature"""
    
    ressource = models.ForeignKey(Ressource, on_delete=models.CASCADE, related_name='articles_nature', verbose_name=_('Don associé'))
    nom_article = models.CharField(max_length=200, verbose_name=_('Nom de l\'article'))
    categorie = models.CharField(max_length=50, choices=CATEGORIE_ARTICLES_CHOICES, verbose_name=_('Catégorie'))
    quantite = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Quantité'))
    unite = models.CharField(max_length=50, verbose_name=_('Unité de mesure'))
    valeur_unitaire_estimee = models.IntegerField(null=True, blank=True, verbose_name=_('Valeur unitaire estimée'))
    etat = models.CharField(max_length=50, default='Neuf', verbose_name=_('État (Neuf, Bon, Usagé...)'))
    ajoute_au_stock = models.BooleanField(default=False, verbose_name=_('Ajouté au stock'))
    article_inventaire = models.ForeignKey(ArticleInventaire, on_delete=models.SET_NULL, null=True, blank=True, related_name='dons_recus', verbose_name=_('Article inventaire lié'))
    
    def __str__(self):
        return f"{self.nom_article} - {self.quantite} {self.unite}"
    
    @property
    def valeur_totale(self):
        if self.valeur_unitaire_estimee:
            return float(self.quantite) * float(self.valeur_unitaire_estimee)
        return 0
    
    def ajouter_au_stock(self):
        """Ajoute cet article de don au stock inventaire"""
        if self.ajoute_au_stock:
            return False, "Article déjà ajouté au stock"
        
        # Trouver ou créer l'article inventaire correspondant
        article, created = ArticleInventaire.objects.get_or_create(
            nom=self.nom_article,
            defaults={
                'categorie': self.categorie,
                'unite': self.unite,
                'quantite_stock': 0,
                'quantite_min': 0,
                'prix_unitaire': self.valeur_unitaire_estimee or 0,
                'date_derniere_commande': self.ressource.date
            }
        )
        
        # Augmenter le stock
        article.quantite_stock += self.quantite
        article.save()
        
        # Lier l'article et marquer comme ajouté
        self.article_inventaire = article
        self.ajoute_au_stock = True
        self.save()
        
        return True, f"Ajouté {self.quantite} {self.unite} au stock"
    
    class Meta:
        verbose_name = 'Article de don en nature'
        verbose_name_plural = 'Articles de dons en nature'
        ordering = ['-ressource__date']
