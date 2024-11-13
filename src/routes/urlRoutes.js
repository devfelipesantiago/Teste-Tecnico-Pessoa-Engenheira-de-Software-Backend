const express = require('express');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { urlSchema, updateUrlSchema } = require('../validations/urlValidations');

const createUrlRoutes = (urlController) => {
  const router = express.Router();

  /**
   * @swagger
   * /api/urls/shorten:
   *   post:
   *     summary: Shorten a URL
   *     tags: [URLs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - url
   *             properties:
   *               url:
   *                 type: string
   *     responses:
   *       201:
   *         description: URL shortened successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 shortUrl:
   *                   type: string
   */
  router.post('/shorten', validate(urlSchema), urlController.shortenUrl);

  /**
   * @swagger
   * /api/urls/{shortCode}:
   *   get:
   *     summary: Redirect to original URL
   *     tags: [URLs]
   *     parameters:
   *       - in: path
   *         name: shortCode
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirect to original URL
   *       404:
   *         description: URL not found
   */
  router.get('/:shortCode', urlController.redirectToOriginalUrl);

  router.use(authMiddleware);

  /**
   * @swagger
   * /api/urls/user/urls:
   *   get:
   *     summary: Get user's URLs
   *     tags: [URLs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user's URLs
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                   longUrl:
   *                     type: string
   *                   shortCode:
   *                     type: string
   *                   clicks:
   *                     type: integer
   */
  router.get('/user/urls', urlController.getUserUrls);

  /**
   * @swagger
   * /api/urls/user/urls/{shortCode}:
   *   put:
   *     summary: Update a URL
   *     tags: [URLs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shortCode
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newUrl
   *             properties:
   *               newUrl:
   *                 type: string
   *     responses:
   *       200:
   *         description: URL updated successfully
   *       404:
   *         description: URL not found or user does not have permission
   */
  router.put('/user/urls/:shortCode', validate(updateUrlSchema), urlController.updateUrl);

  /**
   * @swagger
   * /api/urls/user/urls/{shortCode}:
   *   delete:
   *     summary: Delete a URL
   *     tags: [URLs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shortCode
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: URL deleted successfully
   *       404:
   *         description: URL not found or user does not have permission
   */
  router.delete('/user/urls/:shortCode', urlController.deleteUrl);

  return router;
};

module.exports = createUrlRoutes;

console.log('URL routes created with Swagger documentation');