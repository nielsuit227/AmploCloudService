# docker/backend/Dockerfile

FROM python:3.7.9-slim-stretch as builder

WORKDIR /usr/src/app/backend/
COPY ./backend/requirements.txt .

RUN pip install --upgrade pip
RUN pip install gunicorn
RUN pip install -r requirements.txt


COPY ./backend/django .

COPY ./docker/backend/wsgi-entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh
RUN apt-get update && apt-get install -y --no-install-recommends netcat && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["usr/src/app/backend/entrypoint.sh"]