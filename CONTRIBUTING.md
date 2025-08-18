# 🤝 Contributing to AP-EYE

Thank you for your interest in contributing to AP-EYE! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git knowledge

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/your-username/api-monitoring-v2.git
cd api-monitoring-v2

# Install backend dependencies
cd backend
npm install
cp .env.example .env  # Configure your environment variables

# Install frontend dependencies  
cd ../frontend
npm install

# Start development servers
cd ../backend && npm run dev    # Backend on :5000
cd ../frontend && npm run dev   # Frontend on :3000
```

## 📋 Development Workflow

### 1. 🌿 Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Emergency production fixes

### 2. 🔄 Pull Request Process
1. **Fork** the repository
2. **Create** a feature branch from `develop`
3. **Make** your changes with clear, descriptive commits
4. **Test** your changes thoroughly
5. **Run** linting and fix any issues
6. **Submit** a pull request with our template

### 3. 📝 Commit Message Convention
```bash
# Format: type(scope): description
feat(auth): add OAuth2 Google authentication
fix(monitor): resolve response time calculation bug
docs(api): update authentication endpoint documentation
refactor(database): optimize monitor queries
test(auth): add unit tests for login validation
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or modifying tests
- `chore` - Maintenance tasks

## 🧪 Testing Guidelines

### Backend Testing
```bash
cd backend
npm run lint          # Check code style
npm run test          # Run tests (when implemented)
npm run test:coverage # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm run lint          # Check code style
npm run build         # Verify build works
npm run test          # Run tests (when implemented)
```

### Integration Testing
- Test API endpoints with different payloads
- Verify database operations
- Check authentication flows
- Validate error handling

## 🎨 Code Style Guidelines

### JavaScript/Node.js
- Use **ESLint** configuration provided
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **CamelCase** for variables and functions
- **PascalCase** for classes and components

### React/Next.js
- Use **functional components** with hooks
- Follow **Next.js best practices**
- Use **TypeScript** when possible
- Implement **proper error boundaries**

### Database
- Use **parameterized queries** always
- Follow **PostgreSQL naming conventions**
- Document **schema changes** in migrations
- Optimize **queries for performance**

## 🔒 Security Guidelines

### Never Commit:
- API keys or secrets
- Database passwords
- Personal access tokens
- Production configuration files

### Always:
- Validate user inputs
- Use parameterized SQL queries
- Implement proper authentication
- Follow OWASP security practices
- Update dependencies regularly

## 📚 Documentation Standards

### Code Documentation
- **Comment complex logic** and algorithms
- **Document API endpoints** with JSDoc
- **Update README** for setup changes
- **Include examples** in documentation

### API Documentation
- Use **Swagger/OpenAPI** specifications
- **Test examples** work correctly
- **Include error responses**
- **Document authentication** requirements

## 🐛 Bug Reports

When reporting bugs, include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual** behavior
- **Environment details** (OS, browser, versions)
- **Screenshots or logs** if applicable

## ✨ Feature Requests

For new features, provide:
- **Problem description** the feature solves
- **Proposed solution** or approach
- **Use cases** and examples
- **Technical considerations**
- **Priority level** and justification

## 🎯 Getting Help

### Resources
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community support
- **Project Documentation** - Setup and API guides
- **Code Comments** - Inline documentation

### Contact
- Create an issue for bugs or features
- Start a discussion for questions
- Email for security vulnerabilities

## 🏆 Recognition

Contributors will be:
- **Added to contributors list** in README
- **Mentioned in release notes** for significant contributions
- **Credited in commit messages** and pull requests

## 📜 Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with newcomers
- **Be open** to different approaches

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or inflammatory comments
- Publishing private information
- Commercial spam or promotion

## 📋 Development Checklist

Before submitting a PR:
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No sensitive information included
- [ ] Feature works as expected
- [ ] Breaking changes are documented

## 🚀 Deployment

Only maintainers can deploy to production. The process involves:
1. **Code review** and approval
2. **Automated testing** passes
3. **Security checks** complete
4. **Staging deployment** and validation
5. **Production deployment** with monitoring

Thank you for contributing to AP-EYE! 🎉
