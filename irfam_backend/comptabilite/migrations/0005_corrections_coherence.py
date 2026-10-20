# Generated migration - Corrections de cohérence IRFAM
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('comptabilite', '0004_ressource_donateur_alter_ressource_source'),
    ]

    operations = [
        # 1. Supprimer le modèle Fournisseur
        migrations.DeleteModel(
            name='Fournisseur',
        ),
        
        # 2. Retirer fournisseur de ArticleInventaire
        migrations.RemoveField(
            model_name='articleinventaire',
            name='fournisseur',
        ),
        
        # 3. Modifier date_premier_don en nullable (plus flexible)
        migrations.AlterField(
            model_name='donateur',
            name='date_premier_don',
            field=models.DateField(blank=True, null=True, verbose_name='Premier don'),
        ),
        
        # 4. Changer CASCADE en PROTECT pour Depense.categorie
        migrations.AlterField(
            model_name='depense',
            name='categorie',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='comptabilite.categoriedepense', verbose_name='Catégorie'),
        ),
        
        # 5. Changer CASCADE en PROTECT pour Budget.categorie
        migrations.AlterField(
            model_name='budget',
            name='categorie',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='comptabilite.categoriedepense', verbose_name='Catégorie'),
        ),
        
        # 6. Uniformiser catégories ArticleInventaire (string → choices)
        migrations.AlterField(
            model_name='articleinventaire',
            name='categorie',
            field=models.CharField(
                choices=[
                    ('alimentaire', 'Produits alimentaires'),
                    ('hygiene', "Produits d'hygiène"),
                    ('vetements', 'Vêtements'),
                    ('materiel_pedagogique', 'Matériel pédagogique'),
                    ('materiel_medical', 'Matériel médical'),
                    ('mobilier', 'Mobilier'),
                    ('equipement', 'Équipement'),
                    ('autre', 'Autre'),
                ],
                max_length=50,
                verbose_name='Catégorie'
            ),
        ),
    ]
