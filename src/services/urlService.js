const Url = require('../models/url');
const crypto = require('crypto');

const createUrlService = () => {
  
  const generateShortCode = () => {
    return crypto.randomBytes(3).toString('base64').replace(/[+/=]/g, '');
  };

  const shortenUrl = async (longUrl, userId = null) => {
    let shortCode;
    do {
      shortCode = generateShortCode();
    } while (await Url.findOne({ where: { shortCode } }));

    return Url.create({ longUrl, shortCode, userId });
  };

  const getOriginalUrl = async (shortCode) => {
    const url = await Url.findOne({ where: { shortCode } });
    if (url) {
      await Url.increment('clicks', { where: { shortCode } });
      return url.longUrl;
    }
    return null;
  };

  const getUserUrls = async (userId) => {
    return Url.findAll({ where: { userId } });
  };

  const updateUrl = async (shortCode, longUrl, userId) => {
    const [updatedRowsCount] = await Url.update(
      { longUrl },
      { where: { shortCode, userId } }
    );
    return updatedRowsCount > 0;
  };

  const deleteUrl = async (shortCode, userId) => {
    const deletedRowsCount = await Url.destroy({ where: { shortCode, userId } });
    return deletedRowsCount > 0;
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