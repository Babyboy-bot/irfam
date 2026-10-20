from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import (
    CategorieDepense, Depense, Ressource, Pensionnaire, Personnel,
    Donateur, Budget, ArticleInventaire, ArticleDonNature
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CategorieDepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorieDepense
        fields = ['id', 'nom', 'description']

class DepenseSerializer(serializers.ModelSerializer):
    categorie_detail = CategorieDepenseSerializer(source='categorie', read_only=True)
    cree_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = Depense
        fields = ['id', 'categorie', 'categorie_detail', 'montant', 'description', 'date', 'cree_par', 'cree_par_nom', 'justification']
    
    def get_cree_par_nom(self, obj):
        if obj.cree_par:
            return obj.cree_par.username
        return None

class ArticleDonNatureSerializer(serializers.ModelSerializer):
    valeur_totale = serializers.ReadOnlyField()
    
    class Meta:
        model = ArticleDonNature
        fields = [
            'id', 'ressource', 'nom_article', 'categorie', 'quantite', 'unite',
            'valeur_unitaire_estimee', 'valeur_totale', 'etat', 
            'ajoute_au_stock', 'article_inventaire'
        ]

class DonateurSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour affichage dans les ressources"""
    class Meta:
        model = Donateur
        fields = ['id', 'nom', 'type_donateur', 'email', 'telephone']

class RessourceSerializer(serializers.ModelSerializer):
    articles_nature = ArticleDonNatureSerializer(many=True, read_only=True)
    valeur_totale = serializers.SerializerMethodField()
    donateur_detail = DonateurSimpleSerializer(source='donateur', read_only=True)
    
    # Champs pour créer un nouveau donateur au vol
    nouveau_donateur = serializers.JSONField(write_only=True, required=False)
    
    # Champs pour gérer l'ajout automatique à l'inventaire
    ajouter_inventaire = serializers.BooleanField(write_only=True, required=False, default=False)
    articles_inventaire = serializers.ListField(write_only=True, required=False, allow_empty=True)
    
    class Meta:
        model = Ressource
        fields = [
            'id', 'type_ressource', 'donateur', 'donateur_detail', 'source', 
            'montant', 'description', 'date', 'est_don_nature', 'articles_dons', 
            'valeur_estimee', 'articles_nature', 'valeur_totale', 'nouveau_donateur',
            'ajouter_inventaire', 'articles_inventaire'
        ]
    
    def get_valeur_totale(self, obj):
        """Retourne le montant pour dons en espèces ou la valeur estimée pour dons en nature"""
        if obj.est_don_nature:
            # Calculer la valeur totale des articles ou utiliser la valeur estimée
            articles_total = sum(article.valeur_totale for article in obj.articles_nature.all())
            return articles_total if articles_total > 0 else (float(obj.valeur_estimee) if obj.valeur_estimee else 0)
        return float(obj.montant)
    
    def create(self, validated_data):
        # Extraire les données du nouveau donateur si présentes
        nouveau_donateur_data = validated_data.pop('nouveau_donateur', None)
        
        # Extraire les champs d'inventaire (gérés par la vue)
        validated_data.pop('ajouter_inventaire', None)
        validated_data.pop('articles_inventaire', None)
        
        # Si on doit créer un nouveau donateur
        if nouveau_donateur_data and not validated_data.get('donateur'):
            donateur = Donateur.objects.create(
                nom=nouveau_donateur_data.get('nom'),
                type_donateur=nouveau_donateur_data.get('type_donateur', 'particulier'),
                email=nouveau_donateur_data.get('email', ''),
                telephone=nouveau_donateur_data.get('telephone', ''),
                adresse=nouveau_donateur_data.get('adresse', ''),
                observations=nouveau_donateur_data.get('observations', '')
            )
            validated_data['donateur'] = donateur
        
        # Créer la ressource
        ressource = Ressource.objects.create(**validated_data)
        return ressource
    
    def update(self, instance, validated_data):
        # Extraire et ignorer nouveau_donateur pour les mises à jour
        validated_data.pop('nouveau_donateur', None)
        
        # Extraire les champs d'inventaire (gérés par la vue)
        validated_data.pop('ajouter_inventaire', None)
        validated_data.pop('articles_inventaire', None)
        
        # Mettre à jour la ressource
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class PensionnaireSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    duree_sejour = serializers.SerializerMethodField()
    
    class Meta:
        model = Pensionnaire
        fields = [
            'id', 'nom', 'prenom', 'sexe', 'date_naissance', 'age',
            'date_entree', 'date_sortie', 'duree_sejour', 'statut', 'photo',
            'niveau_etude', 'pathologie', 'contact_urgence', 'observations'
        ]
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_naissance.year - ((today.month, today.day) < (obj.date_naissance.month, obj.date_naissance.day))
    
    def get_duree_sejour(self, obj):
        from datetime import date
        end_date = obj.date_sortie if obj.date_sortie else date.today()
        delta = end_date - obj.date_entree
        return delta.days

class DonateurSerializer(serializers.ModelSerializer):
    articles_dons = serializers.SerializerMethodField()
    
    class Meta:
        model = Donateur
        fields = [
            'id', 'nom', 'type_donateur', 'email', 'telephone', 'adresse',
            'date_premier_don', 'total_dons', 'nombre_dons', 'observations', 'articles_dons'
        ]
    
    def get_articles_dons(self, obj):
        """Récupère tous les articles donnés en nature par ce donateur"""
        try:
            ressources = obj.ressources.filter(est_don_nature=True, articles_dons__isnull=False).exclude(articles_dons='')
            if ressources.exists():
                articles = [r.articles_dons for r in ressources if r.articles_dons]
                return ' | '.join(articles) if articles else None
            return None
        except Exception as e:
            # En cas d'erreur, retourner None plutôt que planter
            return None

# FournisseurSerializer supprimé - Module non nécessaire

class BudgetSerializer(serializers.ModelSerializer):
    categorie_detail = CategorieDepenseSerializer(source='categorie', read_only=True)
    montant_depense = serializers.SerializerMethodField()
    pourcentage_utilise = serializers.SerializerMethodField()
    responsable_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'categorie', 'categorie_detail', 'montant_prevu', 
            'montant_depense', 'pourcentage_utilise', 'periode', 
            'annee', 'mois', 'responsable', 'responsable_nom', 'description'
        ]
    
    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None
    
    def get_montant_depense(self, obj):
        from datetime import date
        from .models import Depense
        
        # Calculer le montant dépensé pour cette catégorie et période
        if obj.periode == 'mensuel' and obj.mois:
            start = date(obj.annee, obj.mois, 1)
            if obj.mois == 12:
                end = date(obj.annee + 1, 1, 1)
            else:
                end = date(obj.annee, obj.mois + 1, 1)
        elif obj.periode == 'trimestriel' and obj.mois:
            # obj.mois contient le numéro du trimestre (1, 2, 3 ou 4)
            trimestre = obj.mois
            start_month = (trimestre - 1) * 3 + 1  # T1=1, T2=4, T3=7, T4=10
            
            start = date(obj.annee, start_month, 1)
            end_month = start_month + 3
            if end_month > 12:
                end = date(obj.annee + 1, end_month - 12, 1)
            else:
                end = date(obj.annee, end_month, 1)
                
            print(f"DEBUG Budget Trimestriel {trimestre} - Période: {start} à {end}, Catégorie: {obj.categorie_id}")
            
        elif obj.periode == 'annuel':
            start = date(obj.annee, 1, 1)
            end = date(obj.annee + 1, 1, 1)
        else:
            return 0
        
        depenses = Depense.objects.filter(
            categorie=obj.categorie,
            date__gte=start,
            date__lt=end
        )
        
        print(f"DEBUG - Dépenses trouvées: {depenses.count()}, Catégorie: {obj.categorie_id}, Période: {start} à {end}")
        
        total = depenses.aggregate(total=models.Sum('montant'))['total'] or 0
        
        return float(total)
    
    def get_pourcentage_utilise(self, obj):
        montant_depense = self.get_montant_depense(obj)
        if obj.montant_prevu > 0:
            return round((montant_depense / float(obj.montant_prevu)) * 100, 2)
        return 0

class ArticleInventaireSerializer(serializers.ModelSerializer):
    alerte_stock = serializers.ReadOnlyField()
    valeur_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = ArticleInventaire
        fields = [
            'id', 'nom', 'categorie', 'unite', 'quantite_stock', 'quantite_min',
            'prix_unitaire', 'valeur_stock', 'date_derniere_commande', 'alerte_stock'
        ]
    
    def get_valeur_stock(self, obj):
        if obj.prix_unitaire is None:
            return 0
        return obj.quantite_stock * obj.prix_unitaire

class PersonnelSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    anciennete = serializers.SerializerMethodField()
    
    class Meta:
        model = Personnel
        fields = [
            'id', 'nom', 'prenom', 'photo', 'date_naissance', 'age',
            'email', 'telephone', 'adresse',
            'fonction', 'type_contrat', 'date_embauche', 'date_fin_contrat',
            'anciennete', 'salaire', 'statut', 'notes'
        ]
    
    def get_age(self, obj):
        if not obj.date_naissance:
            return None
        from datetime import date
        today = date.today()
        return today.year - obj.date_naissance.year - ((today.month, today.day) < (obj.date_naissance.month, obj.date_naissance.day))
    
    def get_anciennete(self, obj):
        from datetime import date
        today = date.today()
        delta = today - obj.date_embauche
        return delta.days
