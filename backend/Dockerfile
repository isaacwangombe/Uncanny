FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ✅ Ensure Django settings load inside the container
ENV DJANGO_SETTINGS_MODULE=uncannyvalleycomics.settings

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

# # ✅ Collect static files at build time
RUN python manage.py collectstatic --noinput

# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "uncannyvalleycomics.wsgi:application"]
CMD ["gunicorn", "--worker-class", "gthread", "--threads", "4", "--timeout", "180", "--worker-connections", "1000", "--limit-request-line", "8190", "--limit-request-field_size", "8388608", "--bind", "0.0.0.0:8000", "uncannyvalleycomics.wsgi:application"]