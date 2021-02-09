import os
from unipath import Path

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'v4%!pmh6=a%5_ok6!24fllmd-g^7xjy+-6!95ll-r$t63npcxs'
DEBUG = False

PROJECT_DIR = Path(__file__).parent
MEDIA_URL = '/media/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')
STATIC_URL = '/static/'

ALLOWED_HOSTS = ['*']
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',
    'http://127.0.0.1'
]
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = False         # Not accessible by client (not important)A
CSRF_COOKIE_AGE = 8 * 3600           # Expires after 8 hr
CSRF_COOKIE_SECURE = False           # Only HTTPS

SESSION_COOKIE_HTTPONLY = True      # Not accessible by client 
SESSION_COOKIE_AGE = 8 * 3600        # Expires after 8 hr
SESSION_COOKIE_SECURE = False        # Only HTTPS

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'app',
    'users',

    'rest_framework',
    'rest_framework.authtoken',
    'rest_auth',
    'corsheaders',
    'django_filters',
]
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'amplodb',
        'USER': 'postgres',
        'PASSWORD': 'rYs@!r7yAne(@^85',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '50/hour',
        'user': '25/s',
    },    
   'DEFAULT_AUTHENTICATION_CLASSES': (
       'rest_framework.authentication.SessionAuthentication',
       'rest_framework.authentication.TokenAuthentication',
   ),
}
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'core.urls'
WDGI_APPLICATION = 'core.wsgi.application'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = False
