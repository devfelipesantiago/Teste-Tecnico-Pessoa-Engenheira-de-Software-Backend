const { urlSchema, updateUrlSchema } = require('../validations/urlValidations');
const logger = require('../config/logger');
const {
  urlShortenedCounter,
  urlRedirectCounter,
  urlUpdateCounter,
  urlDeleteCounter
} = require('../config/metrics');

const createUrlController = (urlService) => {

  const shortenUrl = async (req, res) => {
    const { error } = urlSchema.validate(req.body);
    
    if (error) {
      logger.error('Invalid URL provided', { error: error.details[0].message });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { url } = req.body;
    const userId = req.user ? req.user.id : null;

    try {
      const shortUrl = await urlService.shortenUrl(url, userId);
      logger.info('URL shortened successfully', { 
        shortCode: shortUrl.shortCode 
      });

      urlShortenedCounter.inc({
        user_type: userId 
        ? 'authenticated' 
        : 'anonymous'
      });

      res.status(201)
        .json({ shortUrl: `${process.env.BASE_URL}/${shortUrl.shortCode}`});
    } catch (error) {
      logger.error('Error shortening URL', { error: error.message });
      res.status(500).json({ message: 'Error shortening URL' });
    }
  };

  const redirectToOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;
    try {
      const originalUrl = await urlService.getOriginalUrl(shortCode);
      if (originalUrl) {
        logger.info('Redirecting to original URL', { shortCode, originalUrl });
        urlRedirectCounter.inc();
        res.redirect(originalUrl);
      } else {
        logger.warn('URL not found', { shortCode });
        res.status(404).json({ message: 'URL not found' });
      }
    } catch (error) {
      logger.error('Error redirecting to URL', { error: error.message, shortCode });
      res.status(500).json({ message: 'Error redirecting to URL' });
    }
  };

  const getUserUrls = async (req, res) => {
    const userId = req.user.id;
    try {
      const urls = await urlService.getUserUrls(userId);
      logger.info('Retrieved user URLs', { userId, count: urls.length });
      res.json(urls);
    } catch (error) {
      logger.error('Error fetching user URLs', { error: error.message, userId });
      res.status(500).json({ message: 'Error fetching user URLs' });
    }
  };

  const updateUrl = async (req, res) => {
    const { error } = updateUrlSchema.validate(req.body);
    if (error) {
      logger.error('Invalid new URL provided', { error: error.details[0].message });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { shortCode } = req.params;
    const { newUrl } = req.body;
    const userId = req.user.id;

    try {
      const success = await urlService.updateUrl(shortCode, newUrl, userId);
      if (success) {
        logger.info('URL updated successfully', { shortCode, userId });
        urlUpdateCounter.inc();
        res.json({ message: 'URL updated successfully' });
      } else {
        logger.warn('URL not found or user does not have permission', { shortCode, userId });
        res.status(404).json({ message: 'URL not found or you do not have permission to update it' });
      }
    } catch (error) {
      logger.error('Error updating URL', { error: error.message, shortCode, userId });
      res.status(500).json({ message: 'Error updating URL' });
    }
  };

  const deleteUrl = async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    try {
      const success = await urlService.deleteUrl(shortCode, userId);
      if (success) {
        logger.info('URL deleted successfully', { shortCode, userId });
        urlDeleteCounter.inc();
        res.json({ message: 'URL deleted successfully' });
      } else {
        logger.warn('URL not found or user does not have permission', { shortCode, userId });
        res.status(404).json({ message: 'URL not found or you do not have permission to delete it' });
      }
    } catch (error) {
      logger.error('Error deleting URL', { error: error.message, shortCode, userId });
      res.status(500).json({ message: 'Error deleting URL' });
    }
  };

  return {
    shortenUrl,
    redirectToOriginalUrl,
    getUserUrls,
    updateUrl,
    deleteUrl
  };
};

module.exports = createUrlController;