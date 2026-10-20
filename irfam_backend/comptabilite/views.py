from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics, permissions
from django.utils.translation import gettext as _
from django.db.models import Sum, Count, Avg
from datetime import date, datetime, timedelta
from .models import (
    CategorieDepense, Depense, Ressource, Pensionnaire, Personnel,
    Donateur, Budget, ArticleInventaire, ArticleDonNature
)
from .serializers import (
    CategorieDepenseSerializer, DepenseSerializer, RessourceSerializer,
    PensionnaireSerializer, PersonnelSerializer, DonateurSerializer,
    BudgetSerializer, ArticleInventaireSerializer, ArticleDonNatureSerializer
)

from django.views.decorators.csrf import csrf_exempt

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username})
        return Response({'error': _('Identifiants incorrects')}, status=status.HTTP_401_UNAUTHORIZED)

class CategorieDepenseListCreateView(generics.ListCreateAPIView):
    queryset = CategorieDepense.objects.all()
    serializer_class = CategorieDepenseSerializer
    permission_classes = [permissions.IsAuthenticated]

class DepenseListCreateView(generics.ListCreateAPIView):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Enregistrer automatiquement l'utilisateur qui crée la dépense
        serializer.save(cree_par=self.request.user)

class RessourceListCreateView(generics.ListCreateAPIView):
    queryset = Ressource.objects.all()
    serializer_class = RessourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Création d'une ressource avec gestion automatique de l'inventaire"""
        # Extraire les articles d'inventaire si présents (sans modifier request.data)
        articles_inventaire = request.data.get('articles_inventaire', [])
        ajouter_inventaire = request.data.get('ajouter_inventaire', False)
        
        # Créer la ressource normalement
        response = super().create(request, *args, **kwargs)
        
        # Si c'est un don en nature et qu'on doit ajouter à l'inventaire
        if response.status_code == 201 and ajouter_inventaire and articles_inventaire:
            ressource_id = response.data.get('id')
            articles_crees = []
            articles_mis_a_jour = []
            
            for article_data in articles_inventaire:
                nom = article_data.get('nom', '').strip()
                if not nom:
                    continue
                
                # Gestion sécurisée des conversions float
                try:
                    quantite_str = article_data.get('quantite', '0')
                    quantite = float(quantite_str) if quantite_str and quantite_str != '' else 0
                except (ValueError, TypeError):
                    quantite = 0
                
                try:
                    prix_str = article_data.get('prix_unitaire', '0')
                    prix_unitaire = float(prix_str) if prix_str and prix_str != '' else 0
                except (ValueError, TypeError):
                    prix_unitaire = 0
                    
                unite = article_data.get('unite', 'unité')
                categorie = article_data.get('categorie', 'Dons')
                
                # Vérifier si l'article existe déjà
                article_existant = ArticleInventaire.objects.filter(
                    nom__iexact=nom,
                    unite=unite
                ).first()
                
                if article_existant:
                    # Incrémenter la quantité
                    ancienne_quantite = article_existant.quantite_stock
                    article_existant.quantite_stock += quantite
                    article_existant.save()
                    articles_mis_a_jour.append({
                        'nom': nom,
                        'quantite_ajoutee': quantite,
                        'nouveau_total': article_existant.quantite_stock
                    })
                else:
                    # Créer un nouvel article
                    nouvel_article = ArticleInventaire.objects.create(
                        nom=nom,
                        categorie=categorie,
                        unite=unite,
                        quantite_stock=quantite,
                        quantite_min=0,
                        prix_unitaire=prix_unitaire
                    )
                    articles_crees.append({
                        'nom': nom,
                        'quantite': quantite,
                        'unite': unite
                    })
            
            # Ajouter les infos d'inventaire à la réponse
            response.data['inventaire_info'] = {
                'articles_crees': articles_crees,
                'articles_mis_a_jour': articles_mis_a_jour,
                'total': len(articles_crees) + len(articles_mis_a_jour)
            }
        
        return response

class CategorieDepenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategorieDepense.objects.all()
    serializer_class = CategorieDepenseSerializer
    permission_classes = [permissions.IsAuthenticated]

class DepenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [permissions.IsAuthenticated]

class RessourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ressource.objects.all()
    serializer_class = RessourceSerializer
    permission_classes = [permissions.IsAuthenticated]

# Pensionnaires
class PensionnaireListCreateView(generics.ListCreateAPIView):
    queryset = Pensionnaire.objects.all()
    serializer_class = PensionnaireSerializer
    permission_classes = [permissions.IsAuthenticated]

class PensionnaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pensionnaire.objects.all()
    serializer_class = PensionnaireSerializer
    permission_classes = [permissions.IsAuthenticated]

# Personnel
class PersonnelListCreateView(generics.ListCreateAPIView):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [permissions.IsAuthenticated]

class PersonnelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [permissions.IsAuthenticated]

# Donateurs
class DonateurListCreateView(generics.ListCreateAPIView):
    queryset = Donateur.objects.all()
    serializer_class = DonateurSerializer
    permission_classes = [permissions.IsAuthenticated]

class DonateurDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donateur.objects.all()
    serializer_class = DonateurSerializer
    permission_classes = [permissions.IsAuthenticated]

# Fournisseurs - Module supprimé (non nécessaire)

# Budgets
class BudgetListCreateView(generics.ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

# Inventaire
class ArticleInventaireListCreateView(generics.ListCreateAPIView):
    queryset = ArticleInventaire.objects.all()
    serializer_class = ArticleInventaireSerializer
    permission_classes = [permissions.IsAuthenticated]

class ArticleInventaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ArticleInventaire.objects.all()
    serializer_class = ArticleInventaireSerializer
    permission_classes = [permissions.IsAuthenticated]

# Articles de dons en nature
class ArticleDonNatureListCreateView(generics.ListCreateAPIView):
    queryset = ArticleDonNature.objects.all()
    serializer_class = ArticleDonNatureSerializer
    permission_classes = [permissions.IsAuthenticated]

class ArticleDonNatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ArticleDonNature.objects.all()
    serializer_class = ArticleDonNatureSerializer
    permission_classes = [permissions.IsAuthenticated]

# Ajouter article don au stock
class AjouterDonAuStockView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            article_don = ArticleDonNature.objects.get(pk=pk)
            success, message = article_don.ajouter_au_stock()
            
            if success:
                return Response({
                    'success': True,
                    'message': message,
                    'article_inventaire_id': article_don.article_inventaire.id if article_don.article_inventaire else None
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': message
                }, status=status.HTTP_400_BAD_REQUEST)
        except ArticleDonNature.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Article de don non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Statistiques avancées
class StatistiquesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Pensionnaires
        pensionnaires_actifs = Pensionnaire.objects.filter(statut='actif').count()
        total_pensionnaires = Pensionnaire.objects.count()
        
        # Finances - Inclure dons en nature
        total_ressources_especes = Ressource.objects.filter(est_don_nature=False).aggregate(total=Sum('montant'))['total'] or 0
        total_dons_nature_valeur = Ressource.objects.filter(est_don_nature=True).aggregate(total=Sum('valeur_estimee'))['total'] or 0
        total_ressources = total_ressources_especes + total_dons_nature_valeur
        
        total_depenses = Depense.objects.aggregate(total=Sum('montant'))['total'] or 0
        balance = total_ressources - total_depenses
        
        # Coût par pensionnaire (si pensionnaires actifs)
        cout_par_pensionnaire = total_depenses / pensionnaires_actifs if pensionnaires_actifs > 0 else 0
        
        # Alertes stock
        from django.db.models import F
        alertes_stock = ArticleInventaire.objects.filter(quantite_stock__lte=F('quantite_min')).count()
        
        # Budgets dépassés
        budgets_depasses = 0
        for budget in Budget.objects.all():
            serializer = BudgetSerializer(budget)
            if serializer.data.get('pourcentage_utilise', 0) > 100:
                budgets_depasses += 1
        
        # Statistiques dons en nature
        nb_dons_nature = Ressource.objects.filter(est_don_nature=True).count()
        nb_dons_especes = Ressource.objects.filter(est_don_nature=False).count()
        
        return Response({
            'pensionnaires': {
                'actifs': pensionnaires_actifs,
                'total': total_pensionnaires,
            },
            'finances': {
                'total_ressources': float(total_ressources),
                'total_ressources_especes': float(total_ressources_especes),
                'total_dons_nature_valeur': float(total_dons_nature_valeur),
                'total_depenses': float(total_depenses),
                'balance': float(balance),
                'cout_par_pensionnaire': float(cout_par_pensionnaire),
            },
            'dons': {
                'nb_dons_nature': nb_dons_nature,
                'nb_dons_especes': nb_dons_especes,
                'total_dons': nb_dons_nature + nb_dons_especes,
            },
            'alertes': {
                'stock': alertes_stock,
                'budgets_depasses': budgets_depasses,
            }
        })
