#!/bin/bash

# Generowanie certyfikatu SSL dla ls.test

DOMAIN="ls.test"
CERT_DIR="./certs"

mkdir -p $CERT_DIR

# Generuj klucz prywatny
openssl genrsa -out $CERT_DIR/$DOMAIN.key 2048

# Generuj CSR (Certificate Signing Request)
openssl req -new -key $CERT_DIR/$DOMAIN.key -out $CERT_DIR/$DOMAIN.csr \
  -subj "/C=PL/ST=Poland/L=Warsaw/O=LocalServices/CN=$DOMAIN"

# Generuj certyfikat (self-signed na 365 dni)
openssl x509 -req -days 365 -in $CERT_DIR/$DOMAIN.csr \
  -signkey $CERT_DIR/$DOMAIN.key -out $CERT_DIR/$DOMAIN.crt \
  -extfile <(printf "subjectAltName=DNS:$DOMAIN,DNS:*.$DOMAIN")

echo "✅ Certyfikat wygenerowany:"
echo "   Cert: $CERT_DIR/$DOMAIN.crt"
echo "   Key:  $CERT_DIR/$DOMAIN.key"
echo ""
echo "Dodaj do Vite config (vite.config.mjs):"
echo "  server: {"
echo "    https: {"
echo "      key: fs.readFileSync('$CERT_DIR/$DOMAIN.key'),"
echo "      cert: fs.readFileSync('$CERT_DIR/$DOMAIN.crt'),"
echo "    }"
echo "  }"
