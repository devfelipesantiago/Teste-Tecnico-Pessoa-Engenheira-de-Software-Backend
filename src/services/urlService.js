const Url = require('../models/url');
const crypto = require('crypto');
const logger = require('../config/logger');

const createUrlService = (sequelize) => {
  
  const generateShortCode = () => {
    return crypto.randomBytes(3).toString('base64').replace(/[+/=]/g, '');
  };

  const shortenUrl = async (longUrl, userId = null) => {
    try {
      let shortCode;
      do {
        shortCode = generateShortCode();
      } while (await Url.findOne({ where: { shortCode } }));

      const newUrl = await Url.create({ longUrl, shortCode, userId: userId || null });
      logger.info('URL created in database', { shortCode, userId: userId || 'anonymous' });
      return newUrl;
    } catch (error) {
      logger.error('Error in shortenUrl service', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  const getOriginalUrl = async (shortCode) => {
    try {
      const url = await Url.findOne({ where: { shortCode } });
      if (url) {
        await Url.increment('clicks', { where: { shortCode } });
        return url.longUrl;
      }
      return null;
    } catch (error) {
      logger.error('Error in getOriginalUrl service', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  const getUserUrls = async (userId) => {
    try {
      return await Url.findAll({ where: { userId } });
    } catch (error) {
      logger.error('Error in getUserUrls service', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  const updateUrl = async (shortCode, longUrl, userId) => {
    try {
      const [updatedRowsCount] = await Url.update(
        { longUrl },
        { where: { shortCode, userId } }
      );
      return updatedRowsCount > 0;
    } catch (error) {
      logger.error('Error in updateUrl service', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  const deleteUrl = async (shortCode, userId) => {
    try {
      const deletedRowsCount = await Url.destroy({ where: { shortCode, userId } });
      return deletedRowsCount > 0;
    } catch (error) {
      logger.error('Error in deleteUrl service', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  return {
    shortenUrl,
    getOriginalUrl,
    getUserUrls,
    updateUrl,
    deleteUrl
  };
};

module.exports = createUrlService;