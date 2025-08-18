# 🌍 Production Environment Configuration

## Environment Protection Rules
- ✅ Required reviewers: 1
- ✅ Wait timer: 5 minutes
- ✅ Restrict to protected branches only

## Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=${PRODUCTION_DATABASE_URL}
JWT_SECRET=${PRODUCTION_JWT_SECRET}
EMAIL_FROM=${PRODUCTION_EMAIL_FROM}
BREVO_SMTP_USER=${PRODUCTION_BREVO_SMTP_USER}
BREVO_SMTP_PASS=${PRODUCTION_BREVO_SMTP_PASS}
FRONTEND_URL=https://api-monitoring-app-5fob.vercel.app
CORS_ORIGIN=https://api-monitoring-app-5fob.vercel.app
```

## Deployment Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Health checks passing
- [ ] Monitoring alerts configured
