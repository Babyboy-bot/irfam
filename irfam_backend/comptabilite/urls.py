from django.urls import path
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='api_token_auth'),
    path('categories/', views.CategorieDepenseListCreateView.as_view(), name='categories-list-create'),
    path('categories/<int:pk>/', views.CategorieDepenseDetailView.as_view(), name='categories-detail'),
    path('depenses/', views.DepenseListCreateView.as_view(), name='depenses-list-create'),
    path('depenses/<int:pk>/', views.DepenseDetailView.as_view(), name='depenses-detail'),
    path('ressources/', views.RessourceListCreateView.as_view(), name='ressources-list-create'),
    path('ressources/<int:pk>/', views.RessourceDetailView.as_view(), name='ressources-detail'),
    
    # Pensionnaires
    path('pensionnaires/', views.PensionnaireListCreateView.as_view(), name='pensionnaires-list-create'),
    path('pensionnaires/<int:pk>/', views.PensionnaireDetailView.as_view(), name='pensionnaires-detail'),
    
    # Personnel
    path('personnel/', views.PersonnelListCreateView.as_view(), name='personnel-list-create'),
    path('personnel/<int:pk>/', views.PersonnelDetailView.as_view(), name='personnel-detail'),
    
    # Donateurs
    path('donateurs/', views.DonateurListCreateView.as_view(), name='donateurs-list-create'),
    path('donateurs/<int:pk>/', views.DonateurDetailView.as_view(), name='donateurs-detail'),
    
    # Fournisseurs - Module supprimé (non nécessaire)
    
    # Budgets
    path('budgets/', views.BudgetListCreateView.as_view(), name='budgets-list-create'),
    path('budgets/<int:pk>/', views.BudgetDetailView.as_view(), name='budgets-detail'),
    
    # Inventaire
    path('inventaire/', views.ArticleInventaireListCreateView.as_view(), name='inventaire-list-create'),
    path('inventaire/<int:pk>/', views.ArticleInventaireDetailView.as_view(), name='inventaire-detail'),
    
    # Articles de dons en nature
    path('articles-dons-nature/', views.ArticleDonNatureListCreateView.as_view(), name='articles-dons-nature-list-create'),
    path('articles-dons-nature/<int:pk>/', views.ArticleDonNatureDetailView.as_view(), name='articles-dons-nature-detail'),
    path('articles-dons-nature/<int:pk>/ajouter-au-stock/', views.AjouterDonAuStockView.as_view(), name='ajouter-don-au-stock'),
    
    # Statistiques
    path('statistiques/', views.StatistiquesView.as_view(), name='statistiques'),
]
