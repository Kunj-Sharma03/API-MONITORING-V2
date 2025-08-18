module.exports = {
  // Use recommended ESLint rules for Node.js
  env: {
    node: true,        // Enable Node.js global variables
    es2021: true,      // Enable ES2021 syntax
    commonjs: true     // Enable CommonJS (require/module.exports)
  },
  
  // Extend recommended rule sets
  extends: [
    'eslint:recommended'  // Use ESLint's recommended rules
  ],
  
  // ECMAScript version settings
  parserOptions: {
    ecmaVersion: 'latest',  // Use latest ECMAScript features
    sourceType: 'module'    // Allow import/export syntax
  },
  
  // Custom rules for our project
  rules: {
    // Enforce consistent indentation (2 spaces)
    'indent': ['error', 2],
    
    // Enforce consistent line endings
    'linebreak-style': ['error', 'unix'],
    
    // Enforce consistent quotes (single quotes)
    'quotes': ['error', 'single'],
    
    // Require semicolons
    'semi': ['error', 'always'],
    
    // Disallow unused variables (with exceptions)
    'no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',  // Allow unused args starting with _
      'varsIgnorePattern': '^_'   // Allow unused vars starting with _
    }],
    
    // Disallow console.log in production
    'no-console': 'warn',
    
    // Require consistent spacing
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    
    // Enforce consistent object formatting
    'object-curly-spacing': ['error', 'always'],
    
    // Disallow trailing spaces
    'no-trailing-spaces': 'error'
  },
  
  // Ignore certain files/directories
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js'
  ]
};
