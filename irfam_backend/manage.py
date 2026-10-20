# Fichier principal pour initialiser le projet Django IRFAM
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "irfam_backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Vérifiez que Django est installé et disponible dans votre environnement."
        ) from exc
    execute_from_command_line(sys.argv)
