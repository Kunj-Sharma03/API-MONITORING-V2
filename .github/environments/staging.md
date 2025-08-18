# 🧪 Staging Environment Configuration

## Environment Protection Rules
- ✅ No required reviewers (auto-deploy)
- ✅ No wait timer
- ✅ Available for develop branch

## Environment Variables
```bash
NODE_ENV=staging
DATABASE_URL=${STAGING_DATABASE_URL}
JWT_SECRET=${STAGING_JWT_SECRET}
EMAIL_FROM=${STAGING_EMAIL_FROM}
BREVO_SMTP_USER=${STAGING_BREVO_SMTP_USER}
BREVO_SMTP_PASS=${STAGING_BREVO_SMTP_PASS}
FRONTEND_URL=https://staging-api-monitoring.vercel.app
CORS_ORIGIN=https://staging-api-monitoring.vercel.app
```

## Purpose
- Testing new features before production
- Integration testing with real services
- Performance and load testing
- QA validation environment
