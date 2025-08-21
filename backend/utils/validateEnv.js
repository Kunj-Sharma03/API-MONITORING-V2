function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  let hasError = false;
  required.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      hasError = true;
    }
  });

  if (hasError) process.exit(1);

  // PORT is provided by Railway. Fallback to 5000 for local dev.
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn('⚠️ PORT is invalid, defaulting to 5000');
    process.env.PORT = '5000';
  }

  if ((process.env.JWT_SECRET || '').length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  // Email settings are optional for boot. Warn if missing.
  const emailFrom = process.env.EMAIL_FROM;
  const smtpUser = process.env.BREVO_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS;
  if (!emailFrom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFrom)) {
    console.warn('⚠️ EMAIL_FROM missing/invalid. Email features will be disabled.');
  }
  if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP credentials missing. Email features will be disabled.');
  }

  // Log cleanup days default
  const cleanupDays = parseInt(process.env.LOG_CLEANUP_DAYS || '7', 10);
  if (isNaN(cleanupDays) || cleanupDays < 1) {
    console.warn('⚠️ LOG_CLEANUP_DAYS invalid. Defaulting to 7.');
    process.env.LOG_CLEANUP_DAYS = '7';
  }

  console.log('✅ Environment variables validated');
}

module.exports = validateEnv;
