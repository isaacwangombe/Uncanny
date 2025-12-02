"""
Django settings for uncannyvalleycomics project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api

# =========================================================
# BASE DIR + LOAD .env CORRECTLY (FIXED)
# =========================================================
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the .env file from BASE_DIR explicitly (production fix)
load_dotenv(BASE_DIR / ".env")

# =========================================================
# BASIC SETTINGS
# =========================================================
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")

DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_HOSTS = ["*"]

# =========================================================
# INSTALLED APPS
# =========================================================
INSTALLED_APPS = [
    # Third-party
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",
    "django.contrib.sites",
    "django_extensions",

    # Local apps
    "users",
    "products",
    "orders",
    "accounts",
    "analytics",
    "contact",
    "events",

    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# =========================================================
# MIDDLEWARE
# =========================================================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "analytics.middleware.VisitorTrackingMiddleware",
    "users.middleware.AssignGuestIdMiddleware",
]

# =========================================================
# AUTH / JWT
# =========================================================
AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
}

REST_USE_JWT = True
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_COOKIE": None,
}

# =========================================================
# DATABASE
# =========================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "db"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# =========================================================
# CLOUDINARY
# =========================================================
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# =========================================================
# STATIC & MEDIA
# =========================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =========================================================
# TEMPLATES
# =========================================================
ROOT_URLCONF = "uncannyvalleycomics.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "uncannyvalleycomics.wsgi.application"

# =========================================================
# EMAIL
# =========================================================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.zoho.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 465))
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "True") == "True"
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "False") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# =========================================================
# SITE + OAUTH SETTINGS
# =========================================================
SITE_ID = 1

SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["email", "profile"],
        "AUTH_PARAMS": {"access_type": "offline"},
        "APP": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "key": "",
        },
    }
}

ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_UNIQUE_EMAIL = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGIN_METHODS = {"email", "username"}

LOGIN_REDIRECT_URL = "/accounts/profile/"
LOGOUT_REDIRECT_URL = FRONTEND_URL
ACCOUNT_LOGOUT_REDIRECT_URL = FRONTEND_URL
ACCOUNT_SIGNUP_REDIRECT_URL = "/accounts/profile/"
SOCIALACCOUNT_LOGIN_ON_GET = True

# =========================================================
# CORS / CSRF
# =========================================================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = ["content-type", "authorization"]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://134.209.18.2",
    "http://staging.uncannyvalleycomics.com",
    "https://staging.uncannyvalleycomics.com",
]

CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_DOMAIN = None

# =========================================================
# LOGGING
# =========================================================
logging.getLogger("django").setLevel(logging.INFO)

# =========================================================
# SITE URL
# =========================================================
SITE_URL = "http://127.0.0.1:8000"
if not DEBUG:
    SITE_URL = "https://staging.uncannyvalleycomics.com"

# =========================================================
# PESA PAL — FULLY FIXED
# =========================================================
PESAPAL_CONSUMER_KEY = os.getenv("PESAPAL_CONSUMER_KEY")
PESAPAL_CONSUMER_SECRET = os.getenv("PESAPAL_CONSUMER_SECRET")

# ✔ Sandbox URL (live keys only work on live)
PESAPAL_API_URL = "https://cybqa.pesapal.com/pesapalv3"

PESAPAL_CALLBACK_URL = f"{SITE_URL}/api/payments/pesapal/ipn/"

