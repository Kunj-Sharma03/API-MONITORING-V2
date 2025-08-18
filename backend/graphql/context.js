const jwt = require('jsonwebtoken');
const { pool, safeQuery } = require('../db');

/**
 * GraphQL context function for standalone Apollo Server
 * Extracts user from JWT token and adds to context
 */
const createContext = async ({ req }) => {
  let user = null;
  
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const userResult = await safeQuery(
        'SELECT id, email FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
      }
    }
  } catch (error) {
    console.log('GraphQL Auth Error:', error.message);
    // Don't throw error, just set user to null
    // This allows public queries if needed
  }
  
  return {
    user,
    req,
    // Add database access to context if needed
    db: { pool, safeQuery }
  };
};

module.exports = createContext;
