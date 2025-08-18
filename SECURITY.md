# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to security@ap-eye.com or create a private security advisory on GitHub.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response Timeline:
- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Within 7 days for critical issues

## Security Measures

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting on auth endpoints
- ✅ Session management

### API Security
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Request size limiting

### Infrastructure Security
- ✅ HTTPS enforcement
- ✅ Security headers
- ✅ Environment variable protection
- ✅ Dependency vulnerability scanning

### Monitoring
- ✅ Failed login attempt tracking
- ✅ Suspicious activity monitoring
- ✅ Error logging and alerting

## Security Best Practices

### For Contributors:
1. Always use parameterized queries
2. Validate all user inputs
3. Never commit secrets or credentials
4. Use HTTPS for all external requests
5. Keep dependencies updated

### For Deployment:
1. Use strong JWT secrets
2. Enable HTTPS in production
3. Configure proper CORS origins
4. Set up security headers
5. Monitor for vulnerabilities
