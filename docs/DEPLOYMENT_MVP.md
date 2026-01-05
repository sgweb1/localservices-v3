# 🚀 Deployment MVP - Bez Płatnych Usług

## 📋 Przegląd

Ten guide pokazuje jak wdrożyć aplikację LocalServices **za darmo lub bardzo tanio** (do ~5€/miesiąc).

**Stack deployment:**
- ✅ Backend: Laravel 12 API (PHP 8.2-8.3)
- ✅ Frontend: React 18 SPA (Vite 5 build)
- ✅ Database: PostgreSQL 14+
- ✅ Email: SMTP (Resend free tier)
- ✅ Storage: Local filesystem
- ✅ SSL: Let's Encrypt (darmowy)
- ✅ CDN: Cloudflare (darmowy tier)

---

## 🎯 Opcje Hostingu

### Opcja 1: VPS (Najlepsza dla MVP) - ~3-5€/miesiąc

**Zalecany provider: Hetzner Cloud**
- 📍 Lokalizacja: Niemcy/Finlandia
- 💰 Koszt: CX11 (2GB RAM, 1 vCPU) = **3.29€/miesiąc**
- 🚀 Performance: Świetny dla małych/średnich projektów
- 📦 Zawiera: 20GB SSD, 20TB transfer

**Alternatywy:**
- Contabo: VPS S (4GB RAM) = 4.99€/miesiąc
- DigitalOcean: Basic Droplet ($6/miesiąc)
- Vultr: Cloud Compute ($5/miesiąc)

**Co dostajemy:**
```
✅ Pełna kontrola nad serwerem
✅ Może hostować backend + frontend + database
✅ Brak limitów requestów
✅ Własne backupy
✅ SSH access
```

### Opcja 2: Platform-as-a-Service (PaaS) - Darmowe tiery

**Railway.app** (polecany dla szybkiego startu)
```yaml
Free tier:
  - $5 credit miesięcznie (500h wykonania)
  - PostgreSQL database included
  - Automatic deploys z GitHub
  - Custom domains + SSL
  - Limit: ~500MB RAM per service

Idealne dla: Prototyp/testowanie przed VPS
```

**Render.com**
```yaml
Free tier:
  - Static sites (frontend): darmowy
  - Web services (backend): 750h/miesiąc gratis
  - PostgreSQL: 90 dni free trial
  - Sleep po 15min nieaktywności
  
Idealne dla: Długoterminowy free hosting frontendu
```

**Fly.io**
```yaml
Free tier:
  - 3 shared-cpu VMs
  - 3GB storage
  - 160GB transfer/miesiąc
  
Idealne dla: Backend API z małym ruchem
```

---

## 🗄️ Database

### Opcja 1: PostgreSQL na VPS (w ramach Hetzner)
```bash
# Instalacja na Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib

# Konfiguracja
sudo -u postgres psql
CREATE DATABASE localservices_prod;
CREATE USER lsuser WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE localservices_prod TO lsuser;
\q
```

**Backup strategy:**
```bash
# Cron job - daily backup
0 2 * * * pg_dump localservices_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Opcja 2: Darmowy managed PostgreSQL

**Supabase** (najlepszy darmowy tier)
```yaml
Free tier:
  - 500MB database
  - Unlimited API requests
  - 2GB bandwidth
  - Auto backups (7 dni retention)
  - Pauzuje się po 1 tygodniu nieaktywności
  
URL: https://supabase.com
```

**Neon.tech** (alternatywa)
```yaml
Free tier:
  - 3GB storage
  - Unlimited databases
  - Auto-scaling
  - 7 dni history
  
URL: https://neon.tech
```

---

## 📧 Email Service

### Opcja 1: Resend (polecany dla MVP) - **DARMOWY**

**Free tier:**
- 3,000 emails/miesiąc
- 100 emails/dzień
- Custom domains
- Wysoka deliverability

**Konfiguracja:**
```env
# .env.production - Port 587 (TLS) - zalecane
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxx_your_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@localservices.pl
MAIL_FROM_NAME="LocalServices"

# Alternatywnie: Port 465 (SSL) - starsze
# MAIL_PORT=465
# MAIL_ENCRYPTION=ssl
```

**⚠️ Uwaga o portach:**
- **Port 587 + TLS** - nowoczesny, zalecany (STARTTLS)
- **Port 465 + SSL** - starszy standard (implicit SSL)
- **NIE łącz** 465 z TLS lub 587 z SSL - nie zadziała!

**Setup:**
1. Rejestracja: https://resend.com
2. Dodaj domenę i zweryfikuj DNS records
3. Wygeneruj API key
4. Użyj w Laravel config

### Opcja 2: Mailgun (free tier)

```yaml
Free tier (Foundation):
  - 5,000 emails/miesiąc (pierwsze 3 miesiące)
  - Potem: 1,000 emails/miesiąc
  
URL: https://mailgun.com
```

### Opcja 3: Gmail SMTP (tylko dla testów!)

```env
# ⚠️ Nie dla produkcji! Limit 500/dzień
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=app_specific_password
MAIL_ENCRYPTION=tls
```

---

## 💾 Storage (Pliki)

### Opcja 1: Local Filesystem (VPS)

**Struktura:**
```
/var/www/localservices/
├── storage/
│   ├── app/
│   │   ├── public/
│   │   │   ├── avatars/
│   │   │   ├── services/
│   │   │   └── documents/
```

**Konfiguracja Laravel:**
```php
// config/filesystems.php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
]
```

**Backup strategy:**
```bash
# Rsync do backup storage
0 3 * * * rsync -az /var/www/localservices/storage /backups/storage_$(date +\%Y\%m\%d)/
```

### Opcja 2: Cloudflare R2 (S3-compatible) - **10GB DARMOWY**

**Free tier:**
- 10GB storage
- 1 million Class A operations/miesiąc
- 10 million Class B operations/miesiąc

**Konfiguracja Laravel:**
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

```php
// config/filesystems.php
'r2' => [
    'driver' => 's3',
    'key' => env('R2_ACCESS_KEY_ID'),
    'secret' => env('R2_SECRET_ACCESS_KEY'),
    'region' => 'auto',
    'bucket' => env('R2_BUCKET'),
    'endpoint' => env('R2_ENDPOINT'),
    'use_path_style_endpoint' => false,
    'throw' => false,
],
```

```env
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=localservices-media
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
```

---

## 🌐 SSL + CDN

### Cloudflare (darmowy tier)

**Zalety:**
- ✅ SSL automatyczny
- ✅ CDN globalny
- ✅ DDoS protection
- ✅ Caching rules
- ✅ Analytics

**Setup:**
1. Dodaj domenę do Cloudflare
2. Zmień nameservery u rejestratora
3. Włącz "Full (strict)" SSL mode
4. Skonfiguruj caching rules:
   ```
   Cache Level: Standard
   Browser Cache TTL: 4 hours
   Always Online: Yes
   ```

---

## 🔐 Development HTTPS Setup

Projekt wymaga HTTPS w środowisku development dla poprawnego działania Sanctum cookies i WebSocket (HMR).

### Generowanie Self-Signed Certyfikatów

```bash
# Stwórz katalog na certyfikaty
mkdir -p certs

# Generuj self-signed certificate dla ls.test
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/ls.test.key \
  -out certs/ls.test.crt \
  -subj "/CN=ls.test"

# Dodaj ls.test do /etc/hosts
echo "127.0.0.1 ls.test" | sudo tee -a /etc/hosts

# Dla Windows (PowerShell as Admin):
# Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1 ls.test"
```

### Konfiguracja Vite

Plik `vite.config.mjs` jest już skonfigurowany:

```javascript
server: {
  host: '0.0.0.0',
  port: 5173,
  https: {
    key: fs.readFileSync(path.resolve(__dirname, 'certs/ls.test.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'certs/ls.test.crt')),
  },
  hmr: {
    host: 'ls.test',  // lub APP_URL z .env
    protocol: 'wss',
    port: 5173,
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // lub 8001 dla dev simulator
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### Porty API Development

**⚠️ Uwaga:** Projekt używa różnych portów w zależności od kontekstu:

**Porty:**
- **Frontend (Vite):** 5173 (HTTPS)
- **Backend (Laravel):** 8000 (domyślny `php artisan serve`) **LUB** 8001 (dev simulator)
- **PostgreSQL:** 5432

**Konfiguracja proxy:**
W `vite.config.mjs` musisz dostosować `proxy.target` do portu używanego przez backend:

```javascript
// Dla standardowego php artisan serve
target: 'http://localhost:8000'

// Dla dev simulator (test-dev-simulator.sh)
target: 'http://localhost:8001'
```

**Tip:** Możesz użyć zmiennej środowiskowej:
```javascript
const API_PORT = process.env.VITE_API_PORT || '8000';
proxy: {
  '/api': { target: `http://localhost:${API_PORT}` }
}
```

Następnie w `.env`:
```env
VITE_API_PORT=8001  # dla dev simulator
```

### Trust Self-Signed Certificate

**Chrome/Edge:**
1. Odwiedź https://ls.test:5173
2. Kliknij "Advanced" → "Proceed to ls.test (unsafe)"
3. Lub zaimportuj certyfikat do Trusted Root CA

**Firefox:**
1. Odwiedź https://ls.test:5173
2. "Advanced" → "Accept the Risk and Continue"

**⚠️ Uwaga:** Self-signed certificates są **TYLKO dla development**. W production używaj Let's Encrypt.

---

## 📦 Deployment Strategy - VPS (Hetzner)

### 1. Przygotowanie Serwera

```bash
# SSH do serwera
ssh root@your-server-ip

# Update systemu
apt update && apt upgrade -y

# Instalacja wymaganych pakietów
apt install -y nginx postgresql redis-server supervisor git curl unzip

# Instalacja PHP 8.2
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php
apt update
apt install -y php8.2-fpm php8.2-cli php8.2-common php8.2-pgsql \
  php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-gd php8.2-redis

# Instalacja Node.js 20.x LTS (wymagane: Node 18+ dla Vite 5)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Weryfikacja wersji
node -v  # powinno zwrócić v20.x.x
npm -v   # powinno zwrócić 10.x.x

# Instalacja Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

### 2. Konfiguracja Użytkownika

```bash
# Stwórz dedykowanego usera (nie root!)
adduser --disabled-password --gecos "" deploy
usermod -aG www-data deploy

# Ustaw uprawnienia
mkdir -p /var/www
chown -R deploy:www-data /var/www
```

### 3. Sklonuj Repo

```bash
# Przełącz na użytkownika deploy
su - deploy

# Sklonuj repo
cd /var/www
git clone https://github.com/your-username/localservices.git
cd localservices

# Instalacja zależności
composer install --no-dev --optimize-autoloader
npm ci --production
```

### 4. Konfiguracja .env

```bash
# Skopiuj template
cp .env.example .env.production

# Edytuj .env.production
nano .env.production
```

```env
APP_NAME=LocalServices
APP_ENV=production
APP_KEY=base64:xxx # php artisan key:generate
APP_DEBUG=false
APP_URL=https://localservices.pl

LOG_CHANNEL=daily
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=localservices_prod
DB_USERNAME=lsuser
DB_PASSWORD=strong_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@localservices.pl

# API Keys (wygeneruj nowe!)
GOOGLE_MAPS_API_KEY=xxx

# Frontend (Vite)
VITE_APP_URL=${APP_URL}
VITE_SUBDOMAIN_BASE_DOMAIN=localservices.pl

# Sanctum/CORS (SPA + API na tej samej domenie)
SESSION_DOMAIN=.localservices.pl
SANCTUM_STATEFUL_DOMAINS=localservices.pl,www.localservices.pl,ls.test
```

### 5. Setup Laravel

```bash
# Generuj app key
php artisan key:generate --env=production

# Migracje
php artisan migrate --force --env=production

# Storage symlink
php artisan storage:link --env=production

# Cache config/routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Uprawnienia
chmod -R 755 /var/www/localservices
chmod -R 775 /var/www/localservices/storage
chmod -R 775 /var/www/localservices/bootstrap/cache
chown -R deploy:www-data /var/www/localservices
```

### 6. Build Frontendu

```bash
# Build production (z TypeScript type checking)
npm run build

# Komenda wykonuje (package.json):
# 1. tsc --noEmit || true    - TypeScript type checking (nie kompiluje)
# 2. vite build              - Tworzy production bundle

# Frontend trafi do public/build/ (Vite manifest mode)
# - public/build/manifest.json  - asset mapping
# - public/build/assets/        - chunked JS/CSS z content hashes
# Nginx będzie serwował to statycznie z długim cache (1 year)
```

**Opcjonalnie: Build preview**
```bash
# Podgląd production buildu lokalnie
npm run preview
# Dostępne na http://localhost:4173
```

### 7. Konfiguracja Nginx

```bash
# Stwórz config
sudo nano /etc/nginx/sites-available/localservices
```

```nginx
server {
    listen 80;
    server_name localservices.pl www.localservices.pl;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name localservices.pl www.localservices.pl;
    
    root /var/www/localservices/public;
    index index.php index.html;

    # SSL (Let's Encrypt - certbot setup poniżej)
    ssl_certificate /etc/letsencrypt/live/localservices.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/localservices.pl/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Laravel routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Storage files
    location /storage {
        alias /var/www/localservices/storage/app/public;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend assets (Vite build)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

```bash
# Aktywuj config
sudo ln -s /etc/nginx/sites-available/localservices /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL z Let's Encrypt

```bash
# Instalacja certbot
sudo apt install -y certbot python3-certbot-nginx

# Wygeneruj certyfikat
sudo certbot --nginx -d localservices.pl -d www.localservices.pl

# Auto-renewal (cron już ustawiony przez certbot)
# Test renewal:
sudo certbot renew --dry-run
```

### 9. Queue Worker (Supervisor)

```bash
# Config dla queue worker
sudo nano /etc/supervisor/conf.d/localservices-worker.conf
```

```ini
[program:localservices-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/localservices/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=60
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deploy
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/localservices/storage/logs/worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=3
stopwaitsecs=3600
startsecs=10
```

```bash
# Załaduj config
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start localservices-worker:*
```

### 10. Scheduler (Cron)

```bash
# Dodaj do crontab usera deploy
crontab -e
```

```cron
# Laravel Scheduler
* * * * * cd /var/www/localservices && php artisan schedule:run >> /dev/null 2>&1

# Backup database (codziennie o 2:00)
0 2 * * * pg_dump -U lsuser localservices_prod | gzip > /var/www/backups/db_$(date +\%Y\%m\%d).sql.gz

# Backup storage (codziennie o 3:00)
0 3 * * * rsync -az /var/www/localservices/storage /var/www/backups/storage_$(date +\%Y\%m\%d)/

# Cleanup old backups (starsze niż 7 dni)
0 4 * * * find /var/www/backups -type f -mtime +7 -delete
```

---

## 🔄 Deployment Script (Auto-deploy)

Stwórz skrypt dla łatwego update:

```bash
# deploy.sh
#!/bin/bash

cd /var/www/localservices

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --production

# Build frontend
npm run build

# Migrate database
php artisan migrate --force --env=production

# Clear & cache (optimize for production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart workers
sudo supervisorctl restart localservices-worker:*

# Reload PHP-FPM
sudo systemctl reload php8.2-fpm

echo "✅ Deployment complete!"
```

```bash
chmod +x deploy.sh
```

**Użycie:**
```bash
./deploy.sh
```

---

## 📊 Monitoring (darmowe narzędzia)

### 1. UptimeRobot (darmowy monitoring)
- URL: https://uptimerobot.com
- Free tier: 50 monitors, 5min intervals
- Email/SMS alerts

**Setup:**
1. Dodaj monitor dla `https://localservices.pl`
2. Ustaw alert contacts
3. Monitor API endpoint: `https://localservices.pl/api/health`

### 2. Laravel Telescope (development)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**⚠️ Uwaga:** Wyłącz w produkcji lub zabezpiecz middleware!

### 3. Logi

```bash
# Real-time log monitoring
tail -f /var/www/localservices/storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

---

## 🔒 Security Checklist

```yaml
✅ Firewall (UFW):
  - sudo ufw allow 22/tcp (SSH)
  - sudo ufw allow 80/tcp (HTTP)
  - sudo ufw allow 443/tcp (HTTPS)
  - sudo ufw enable

✅ Fail2ban (brute force protection):
  - sudo apt install fail2ban
  - sudo systemctl enable fail2ban

✅ SSH Hardening:
  - Disable root login
  - Use SSH keys (disable password auth)
  - Change default port 22 → 2222

✅ Database:
  - Strong passwords
  - Firewall rules (tylko localhost)
  - Regular backups

✅ Laravel:
  - APP_DEBUG=false
  - Generate new APP_KEY
  - CSRF protection enabled
  - Rate limiting na API

✅ Nginx:
  - Security headers (dodane w config powyżej)
  - Hide version: server_tokens off;
  - Limit request size: client_max_body_size 20M;
```

---

## 💰 Szacunkowe Koszty

### Setup A: VPS (Full control)
```
Hetzner CX11:        3.29€/miesiąc
Domena (.pl):        ~10€/rok (0.83€/m)
Email (Resend):      DARMOWY
Storage (local):     Included in VPS
Backups (local):     Included in VPS
SSL (Let's Encrypt): DARMOWY
CDN (Cloudflare):    DARMOWY
─────────────────────────────────
RAZEM:               ~4.12€/miesiąc (~18 PLN)
```

### Setup B: PaaS (Managed)
```
Railway.app:         $5/miesiąc credit (może wystarczyć!)
PostgreSQL:          Included w Railway
Email (Resend):      DARMOWY
Storage (R2):        10GB DARMOWY
SSL:                 Included
CDN (Cloudflare):    DARMOWY
─────────────────────────────────
RAZEM:               Potencjalnie $0-5/miesiąc!
```

### Setup C: Hybrid (najlepszy stosunek ceny/kontroli)
```
VPS (Hetzner):       3.29€/miesiąc
Database (Supabase): DARMOWY (500MB)
Email (Resend):      DARMOWY
Storage (R2):        10GB DARMOWY
SSL (Let's Encrypt): DARMOWY
CDN (Cloudflare):    DARMOWY
─────────────────────────────────
RAZEM:               3.29€/miesiąc (~14 PLN)
```

---

## 🚀 Quick Start - Railway.app (Najszybszy)

### 1. Przygotuj repo

```bash
# Dodaj Procfile (Railway potrzebuje)
echo "web: php artisan serve --host=0.0.0.0 --port=\$PORT" > Procfile

# Dodaj railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "composer install --no-dev --optimize-autoloader && npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "healthcheck": {
    "command": "curl -f http://localhost:$PORT/up || exit 1",
    "interval": 30,
    "timeout": 10,
    "retries": 3
  }
}
EOF

git add Procfile railway.json
git commit -m "Dodaj Railway deployment config"
git push
```

### 2. Deploy na Railway

1. Wejdź na https://railway.app
2. Login przez GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Wybierz `localservices` repo
5. Railway auto-wykryje Laravel i zrobi deploy!

### 3. Dodaj PostgreSQL

1. W Railway project: "New" → "Database" → "PostgreSQL"
2. Railway automatycznie ustawi `DATABASE_URL`

### 4. Ustaw zmienne środowiskowe

```env
APP_KEY=base64:xxx  # Wygeneruj: php artisan key:generate --show
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.up.railway.app

MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxx

# Railway automatycznie ustawi:
# DATABASE_URL (PostgreSQL)
# PORT
```

### 5. Custom domena (opcjonalnie)

1. Railway Settings → "Domains"
2. Dodaj `localservices.pl`
3. Zaktualizuj DNS u rejestratora:
   ```
   CNAME @ your-app.up.railway.app
   ```

**✅ Gotowe! App działa w ~5 minut.**

---

## 📝 Pre-deployment Checklist

```yaml
Backend:
  ✅ Wszystkie migrations committed
  ✅ Seedy dla podstawowych danych (kategorie, przykładowe usługi)
  ✅ .env.example zaktualizowane
  ✅ APP_DEBUG=false w production
  ✅ Rate limiting ustawiony
  ✅ CORS skonfigurowany
  ✅ Queue workers działają
  ✅ Scheduler ustawiony

Frontend:
  ✅ Build produkcyjny działa (npm run build)
  ✅ API URL ustawiony prawidłowo
  ✅ Environment variables (VITE_API_URL)
  ✅ Error boundaries dodane
  ✅ Loading states dla wszystkich fetch
  ✅ 404/500 error pages
  ✅ Meta tags (SEO)

Security:
  ✅ SSL certyfikat
  ✅ Security headers (CORS, CSP, X-Frame)
  ✅ Firewall rules
  ✅ Database credentials strong
  ✅ API keys w .env (nie w kodzie!)
  ✅ Session secure cookies

Monitoring:
  ✅ Uptime monitoring (UptimeRobot)
  ✅ Error tracking (Laravel logs)
  ✅ Backup strategy (automatyczne backupy DB + storage)
  ✅ Health check endpoint (/api/health)

Documentation:
  ✅ README.md z instrukcjami
  ✅ API documentation
  ✅ Deployment guide (ten dokument!)
  ✅ Troubleshooting notes
```

---

## 🔄 CORS Configuration

### Dlaczego CORS jest krytyczny?

Single Page Application (SPA) komunikuje się z API przez XMLHttpRequest/Fetch. Laravel musi zezwolić na requesty z frontend domeny.

### config/cors.php

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('APP_URL'),
        env('FRONTEND_URL', env('APP_URL')),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### .env Production

```env
APP_URL=https://localservices.pl
FRONTEND_URL=https://localservices.pl

# Sanctum (SPA authentication)
SANCTUM_STATEFUL_DOMAINS=localservices.pl,www.localservices.pl
SESSION_DOMAIN=.localservices.pl
SESSION_SECURE_COOKIE=true
```

### .env Development

```env
APP_URL=https://ls.test
FRONTEND_URL=https://ls.test:5173

# Sanctum (dla development HTTPS)
SANCTUM_STATEFUL_DOMAINS=ls.test,localhost,127.0.0.1
SESSION_DOMAIN=.ls.test
SESSION_SECURE_COOKIE=true
```

### Najczęstsze Błędy CORS

**Problem:** `Access-Control-Allow-Origin` error

**Rozwiązanie:**
1. Sprawdź czy `APP_URL` w .env jest dokładnie taki sam jak URL frontendu
2. Sprawdź czy `supports_credentials: true` w `config/cors.php`
3. Sprawdź czy frontend wysyła `credentials: 'include'` w fetch
4. Dla Sanctum: Sprawdź `SANCTUM_STATEFUL_DOMAINS`

**⚠️ Uwaga:** NIE używaj `'*'` w `allowed_origins` jeśli `supports_credentials: true` - to nie zadziała!

---

## 🐛 Troubleshooting

### Problem: 500 Internal Server Error

```bash
# Sprawdź logi Laravel
tail -f storage/logs/laravel.log

# Sprawdź logi Nginx
tail -f /var/log/nginx/error.log

# Sprawdź uprawnienia
ls -la storage/
ls -la bootstrap/cache/

# Fix permissions
chmod -R 775 storage bootstrap/cache
chown -R deploy:www-data storage bootstrap/cache
```

### Problem: Database connection failed

```bash
# Test połączenia
sudo -u postgres psql -U lsuser -d localservices_prod -h 127.0.0.1

# Sprawdź pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Powinno być:
# local   all   all   md5
# host    all   all   127.0.0.1/32   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Problem: Queue jobs not processing

```bash
# Sprawdź worker status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart localservices-worker:*

# Check worker logs
tail -f storage/logs/worker.log

# Manual queue run (debug)
php artisan queue:work --once
```

### Problem: SSL certificate expired

```bash
# Renew manually
sudo certbot renew

# Check auto-renewal cron
sudo systemctl status certbot.timer
```

### Problem: 419 (Page Expired) na PATCH/POST z frontendu

**Przyczyna:** Brak `X-CSRF-TOKEN` headera w request lub nieprawidłowa konfiguracja cookies.

**Fix na frontendzie (React/Axios):**

```javascript
// axios-config.js lub w interceptor
import axios from 'axios';

// 1. Odczytaj XSRF-TOKEN z cookies
const getCSRFToken = () => {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

// 2. Setup axios interceptor
axios.interceptors.request.use(config => {
  const token = getCSRFToken();
  if (token) {
    config.headers['X-CSRF-TOKEN'] = decodeURIComponent(token);
  }
  config.withCredentials = true; // Wyślij cookies
  return config;
});

// 3. Lub dla fetch API
const patchService = async (id, data) => {
  const token = getCSRFToken();
  const response = await fetch(`/api/v1/provider/services/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': decodeURIComponent(token),
    },
    credentials: 'include', // Ważne!
    body: JSON.stringify(data),
  });
  return response.json();
};
```

**Fix na backendzie (.env):**

- Upewnij się, że domeny są zgodne: `APP_URL=https://ls.test` (bez www), `SESSION_DOMAIN=.ls.test` (z punktem!)
- CORS: w `config/cors.php` sprawdź:
  ```php
  'allowed_origins' => ['https://ls.test', 'http://localhost:5173'],
  'supports_credentials' => true,
  ```
- Nginx: Sprawdź, że `/sanctum/csrf-cookie` **nie jest cache'owany**:
  ```nginx
  location /sanctum {
      try_files $uri $uri/ /index.php?$query_string;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
  ```

**Debug checklist:**
1. Otwórz DevTools → Application → Cookies → sprawdź czy `XSRF-TOKEN` istnieje
2. Sprawdź Network tab → PATCH request → Headers → czy `X-CSRF-TOKEN` jest wysłany
3. Jeśli nie, dodaj axios interceptor z powyższego kodu
4. Test: `curl -X PATCH https://ls.test/api/v1/provider/services/1 -H "X-CSRF-TOKEN: $(curl -s https://ls.test/sanctum/csrf-cookie | grep -oP 'XSRF-TOKEN=\K[^;]+')"`

---

## 📞 Support Resources

**Dokumentacja:**
- Laravel: https://laravel.com/docs
- React Query: https://tanstack.com/query/latest
- Nginx: https://nginx.org/en/docs/

**Community:**
- Laravel Discord: https://discord.gg/laravel
- Stack Overflow: https://stackoverflow.com

**Monitoring:**
- UptimeRobot: https://uptimerobot.com
- Cloudflare Analytics: https://dash.cloudflare.com

---

## 🎉 Kolejne Kroki Po Deployment

1. **Test wszystkich features** w production
2. **Setup monitoring** (UptimeRobot + health checks)
3. **Backup strategy** (automatyczne backupy DB + storage)
4. **SEO optimization** (meta tags, sitemap.xml, robots.txt)
5. **Analytics** (Google Analytics / Plausible)
6. **Performance monitoring** (Laravel Pulse?)
7. **User feedback** system (bug reports, feature requests)

---

**Pytania? Sprawdź troubleshooting section lub ask in Discord!** 🚀
