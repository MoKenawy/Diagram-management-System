#!/bin/sh
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/dms.key -out certs/dms.crt \
  -subj "/C=US/ST=State/L=City/O=Dev/CN=localhost"