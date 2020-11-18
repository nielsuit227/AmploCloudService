#!/bin/sh
while ! nc -z db 5432; do
    sleep 0.1
    done

python manage.py collectstatic --noinput
python manage.py migrate --noinput

echo "from django.contrib.auth.models import User; User.objects.create_superuser('nuitterdijk', 'niels.uitterdijk@amplo.ch', 'z7DyLOp0sCfsrCuc')" | python manage.py shell


gunicorn core.wsgi --bind 0.0.0.0:8000 --workers 4 --threads 4

#####################################################################################
# Options to DEBUG Django server
# Optional commands to replace abouve gunicorn command

# Option 1:
# run gunicorn with debug log level
# gunicorn server.wsgi --bind 0.0.0.0:8000 --workers 1 --threads 1 --log-level debug

# Option 2:
# run development server
# DEBUG=True ./manage.py runserver 0.0.0.0:8000