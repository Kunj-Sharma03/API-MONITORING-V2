const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile and account management
 */

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Hello user 123
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', auth, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}` });
});

module.exports = router;
