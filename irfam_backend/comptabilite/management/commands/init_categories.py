from django.core.management.base import BaseCommand
from comptabilite.models import CategorieDepense

class Command(BaseCommand):
    help = 'Initialise les catégories de dépenses pour l\'IRFAM'

    def handle(self, *args, **kwargs):
        categories = [
            {
                'nom': 'Loyer',
                'description': 'Loyer de l\'institut et des locaux'
            },
            {
                'nom': 'Nourriture',
                'description': 'Alimentation des pensionnaires'
            },
            {
                'nom': 'Électricité',
                'description': 'Factures d\'électricité'
            },
            {
                'nom': 'Eau',
                'description': 'Factures d\'eau'
            },
            {
                'nom': 'Soins médicaux',
                'description': 'Frais médicaux et médicaments'
            },
            {
                'nom': 'Entretien - Hygiène',
                'description': 'Savon, brosses à dents, produits d\'hygiène'
            },
            {
                'nom': 'Salaires',
                'description': 'Salaires du personnel'
            },
            {
                'nom': 'Matériel pédagogique',
                'description': 'Matériel pour la formation des pensionnaires'
            },
            {
                'nom': 'Entretien du bâtiment',
                'description': 'Réparations et maintenance'
            },
            {
                'nom': 'Transport',
                'description': 'Frais de transport'
            },
            {
                'nom': 'Autres charges',
                'description': 'Autres dépenses diverses'
            },
        ]

        created_count = 0
        for cat_data in categories:
            cat, created = CategorieDepense.objects.get_or_create(
                nom=cat_data['nom'],
                defaults={'description': cat_data['description']}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Catégorie créée : {cat.nom}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Catégorie existe déjà : {cat.nom}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n{created_count} catégorie(s) créée(s) avec succès!')
        )
