# ===================================
# LocalServices - Pre-Deployment Checklist
# ===================================

## 📋 Backend Checklist

### Database & Migrations
- [ ] Wszystkie migracje committed i przetestowane
- [ ] Seedy dla podstawowych danych (kategorie usług, przykładowe dane)
- [ ] Database backup strategy zdefiniowana
- [ ] Database credentials są silne (nie default!)

### Configuration
- [ ] `.env.production.example` zaktualizowany z wszystkimi required vars
- [ ] `APP_DEBUG=false` w production
- [ ] `APP_KEY` wygenerowany (php artisan key:generate)
- [ ] `APP_URL` ustawiony na production domain
- [ ] Database connection przetestowane

### Security
- [ ] CORS skonfigurowany (tylko dozwolone domeny)
- [ ] Rate limiting ustawiony na API routes
- [ ] CSRF protection enabled
- [ ] Session secure cookies (SESSION_SECURE_COOKIE=true)
- [ ] API keys w .env (NIE w kodzie!)
- [ ] Secrets rotation strategy (APP_KEY, DB passwords)

### Performance
- [ ] Query optimization (N+1 queries resolved)
- [ ] Cache strategy (Redis configured)
- [ ] Queue workers configured (Supervisor)
- [ ] Laravel Scheduler setup (cron job)
- [ ] Eager loading gdzie potrzebne

### Monitoring & Logging
- [ ] Laravel logs configured (daily rotation)
- [ ] Error tracking setup (Laravel logs)
- [ ] Health check endpoint (/api/health)
- [ ] Queue failed jobs monitoring
- [ ] Database slow query logging

---

## 🎨 Frontend Checklist

### Build & Configuration
- [ ] Production build działa (`npm run build`)
- [ ] Environment variables ustawione (VITE_API_URL)
- [ ] Base URL dla API poprawny
- [ ] Source maps disabled w production
- [ ] Console.log statements removed

### Error Handling
- [ ] Error boundaries dodane
- [ ] Loading states dla wszystkich fetch operations
- [ ] Empty states dla brak danych
- [ ] 404 page exists
- [ ] 500 error page exists
- [ ] Network error handling (offline mode)

### Performance
- [ ] Code splitting enabled (lazy loading routes)
- [ ] Images optimized (WebP, compression)
- [ ] Bundle size analyzed (< 500KB initial)
- [ ] React Query cache configured
- [ ] Proper memo/useMemo/useCallback usage

### SEO & Meta
- [ ] Meta tags (title, description) dla każdej page
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Canonical URLs set

### Analytics (Optional for MVP)
- [ ] Google Analytics / Plausible setup
- [ ] Event tracking dla key actions
- [ ] Error tracking (Sentry optional)

---

## 🔒 Security Checklist

### Server Security
- [ ] Firewall enabled (UFW)
  - [ ] Port 22 (SSH) open
  - [ ] Port 80 (HTTP) open
  - [ ] Port 443 (HTTPS) open
  - [ ] All other ports closed
- [ ] Fail2ban installed i configured
- [ ] SSH hardened:
  - [ ] Root login disabled
  - [ ] Password auth disabled (SSH keys only)
  - [ ] SSH port changed from 22 (optional)
- [ ] System updates automated (unattended-upgrades)

### SSL/TLS
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] HTTPS redirect configured (HTTP → HTTPS)
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites
- [ ] HSTS header enabled
- [ ] SSL Labs test passed (A+ rating)

### Application Security
- [ ] Security headers configured:
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy
  - [ ] Content-Security-Policy (optional)
- [ ] File upload validation (size, type, malware scan)
- [ ] SQL injection prevention (Laravel ORM used)
- [ ] XSS prevention (Blade escaping)
- [ ] CSRF protection enabled

### Data Security
- [ ] Database backups automated (daily)
- [ ] Backup retention policy (7-30 days)
- [ ] Backup restoration tested
- [ ] Sensitive data encrypted (passwords hashed)
- [ ] PII handling compliant (GDPR if EU users)

---

## 🚀 Infrastructure Checklist

### Server Setup (VPS)
- [ ] Server provisioned (Hetzner, DigitalOcean, etc.)
- [ ] Operating system updated (Ubuntu 22.04 LTS recommended)
- [ ] Required software installed:
  - [ ] Nginx
  - [ ] PHP 8.2+ with extensions
  - [ ] PostgreSQL / MySQL
  - [ ] Redis
  - [ ] Node.js (for build)
  - [ ] Supervisor
  - [ ] Certbot (Let's Encrypt)
- [ ] Deploy user created (non-root)
- [ ] SSH keys configured

### Nginx Configuration
- [ ] Virtual host configured
- [ ] PHP-FPM configured
- [ ] Gzip compression enabled
- [ ] Static assets caching configured
- [ ] Security headers added
- [ ] Rate limiting configured (optional)
- [ ] Access/error logs configured

### Database Setup
- [ ] Database created
- [ ] Database user created with strong password
- [ ] Database privileges granted
- [ ] Remote access disabled (localhost only)
- [ ] Backup user configured

### Redis Setup
- [ ] Redis installed
- [ ] Redis password configured (optional)
- [ ] Redis persistence enabled (AOF or RDB)
- [ ] Max memory policy set

### Queue Workers
- [ ] Supervisor configured
- [ ] Worker processes defined (numprocs)
- [ ] Auto-restart enabled
- [ ] Log rotation configured

### Scheduler (Cron)
- [ ] Cron job dla Laravel scheduler
- [ ] Cron job dla database backups
- [ ] Cron job dla storage backups
- [ ] Cron job dla old backups cleanup

---

## 📊 Monitoring & Alerting

### Uptime Monitoring
- [ ] UptimeRobot / Pingdom configured
- [ ] Health check endpoint monitored
- [ ] Alert contacts configured (email, SMS)
- [ ] Response time monitoring

### Application Monitoring
- [ ] Laravel logs review process
- [ ] Failed jobs monitoring
- [ ] Slow query logging
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring

### Backup Verification
- [ ] Backup success verification (daily check)
- [ ] Backup restoration tested (monthly)
- [ ] Off-site backup storage (optional)

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] All key features tested in production-like environment
- [ ] User registration/login works
- [ ] Email sending works (verify inbox)
- [ ] File uploads work (avatars, service images)
- [ ] Payment flow works (if applicable)
- [ ] API endpoints respond correctly

### Performance Testing
- [ ] Page load times < 3s
- [ ] API response times < 500ms
- [ ] Database queries optimized (no N+1)
- [ ] Concurrent users tested (load testing optional)

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Mobile Responsiveness
- [ ] All pages responsive
- [ ] Touch interactions work
- [ ] Forms usable on mobile
- [ ] Navigation menu works on mobile

---

## 📧 Email Configuration

### SMTP Provider
- [ ] Email provider chosen (Resend, Mailgun, etc.)
- [ ] Domain verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Test email sent successfully
- [ ] Deliverability tested (inbox, not spam)

### Email Templates
- [ ] Welcome email template
- [ ] Password reset email template
- [ ] Booking confirmation email template
- [ ] Email footer (unsubscribe link)

---

## 🌐 DNS & Domain

### Domain Configuration
- [ ] Domain registered
- [ ] Nameservers pointed to Cloudflare (optional)
- [ ] A record pointing to server IP
- [ ] AAAA record for IPv6 (optional)
- [ ] WWW subdomain configured
- [ ] MX records for email (if custom email)

### Cloudflare Setup (Optional)
- [ ] Domain added to Cloudflare
- [ ] SSL mode: Full (Strict)
- [ ] Always Use HTTPS: On
- [ ] Auto Minify: JS, CSS, HTML
- [ ] Brotli compression: On
- [ ] Caching rules configured

---

## 📝 Documentation

### Technical Documentation
- [ ] README.md updated
- [ ] API documentation (endpoints, responses)
- [ ] Deployment guide (this file!)
- [ ] Environment variables documented
- [ ] Architecture diagram (optional)

### User Documentation
- [ ] User guide / FAQ
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Contact information

### Runbooks
- [ ] Deployment procedure
- [ ] Rollback procedure
- [ ] Database restore procedure
- [ ] Common troubleshooting issues

---

## 🔄 Deployment Process

### Pre-Deployment
- [ ] All tests passing (npm test, phpunit)
- [ ] Code reviewed
- [ ] Changelog updated
- [ ] Database migrations reviewed
- [ ] Breaking changes documented

### Deployment Steps
- [ ] Backup database before deploy
- [ ] Enable maintenance mode
- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Run migrations
- [ ] Build frontend assets
- [ ] Clear caches
- [ ] Restart queue workers
- [ ] Disable maintenance mode
- [ ] Verify deployment (smoke tests)

### Post-Deployment
- [ ] Monitor error logs (30 minutes)
- [ ] Check uptime monitoring
- [ ] Test critical user flows
- [ ] Verify email sending
- [ ] Check performance metrics

### Rollback Plan
- [ ] Previous version tagged in Git
- [ ] Database backup available
- [ ] Rollback script prepared
- [ ] Team notified of rollback procedure

---

## 💰 Cost Optimization

### Infrastructure
- [ ] Right-sized server (not over-provisioned)
- [ ] Free tiers utilized (Resend, Cloudflare, Supabase)
- [ ] Unnecessary services disabled
- [ ] Auto-scaling configured (if needed)

### Monitoring Costs
- [ ] Free tier monitoring tools (UptimeRobot)
- [ ] Log retention policy (avoid excessive logs)
- [ ] Database size monitored

---

## 🎯 Go-Live Checklist

**Final verification before launch:**

- [ ] ✅ All above checklists completed
- [ ] ✅ Stakeholders notified of launch date
- [ ] ✅ Support plan in place (who handles issues?)
- [ ] ✅ Rollback plan communicated to team
- [ ] ✅ Monitoring dashboard setup
- [ ] ✅ Incident response plan documented
- [ ] ✅ Backup/restore tested successfully
- [ ] ✅ Performance baseline recorded
- [ ] ✅ Legal requirements met (privacy policy, terms)
- [ ] ✅ Marketing materials ready (if applicable)

---

## 📞 Emergency Contacts

```
Technical Lead: [Name] - [Email] - [Phone]
DevOps: [Name] - [Email] - [Phone]
Hosting Provider Support: [Link/Phone]
Domain Registrar Support: [Link/Phone]
```

---

## ✅ Sign-Off

```
Reviewed by: ___________________  Date: __________
Approved by: ___________________  Date: __________
Deployed by: ___________________  Date: __________
```

---

**🚀 Ready to deploy? Double-check this list and GO LIVE!**
