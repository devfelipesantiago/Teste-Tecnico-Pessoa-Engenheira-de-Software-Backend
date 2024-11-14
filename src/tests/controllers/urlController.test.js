const createUrlController = require('../../controllers/urlController');

describe('URL Controller', () => {
  let urlController;
  let mockUrlService;
  let mockLogger;
  let mockUrlRedirectCounter;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockUrlService = {
      shortenUrl: jest.fn(),
      getOriginalUrl: jest.fn(),
      getUserUrls: jest.fn(),
      updateUrl: jest.fn(),
      deleteUrl: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockUrlRedirectCounter = {
      inc: jest.fn()
    };

    urlController = createUrlController(mockUrlService, mockLogger, mockUrlRedirectCounter);

    mockReq = {
      body: {},
      params: {},
      user: { id: 1 }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
  });

  describe('shortenUrl', () => {
    it('should create a short URL and return it', async () => {
      const shortUrl = { shortCode: 'abc123' };
      mockUrlService.shortenUrl.mockResolvedValue(shortUrl);
      mockReq.body = { url: 'https://example.com' };

      await urlController.shortenUrl(mockReq, mockRes);

      expect(mockUrlService.shortenUrl).toHaveBeenCalledWith('https://example.com', 1);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        shortUrl: expect.stringContaining('abc123')
      }));
    });

    it('should return 400 if URL is missing', async () => {
      await urlController.shortenUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL is required'
      }));
    });
  });

  describe('redirectToOriginalUrl', () => {
    it('should redirect to the original URL and increment counter', async () => {
      mockUrlService.getOriginalUrl.mockResolvedValue('https://example.com');
      mockReq.params.shortCode = 'abc123';

      await urlController.redirectToOriginalUrl(mockReq, mockRes);

      expect(mockUrlService.getOriginalUrl).toHaveBeenCalledWith('abc123');
      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockUrlRedirectCounter.inc).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should return 404 if URL is not found', async () => {
      mockUrlService.getOriginalUrl.mockResolvedValue(null);
      mockReq.params.shortCode = 'nonexistent';

      await urlController.redirectToOriginalUrl(mockReq, mockRes);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL not found'
      }));
    });

    it('should return 500 if an error occurs', async () => {
      mockUrlService.getOriginalUrl.mockRejectedValue(new Error('Database error'));
      mockReq.params.shortCode = 'abc123';

      await urlController.redirectToOriginalUrl(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error redirecting to URL'
      }));
    });
  });

  describe('getUserUrls', () => {
    it('should return user URLs', async () => {
      const mockUrls = [{ id: 1, longUrl: 'https://example.com', shortCode: 'abc123' }];
      mockUrlService.getUserUrls.mockResolvedValue(mockUrls);

      await urlController.getUserUrls(mockReq, mockRes);

      expect(mockUrlService.getUserUrls).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockUrls);
    });
  });

  describe('updateUrl', () => {
    it('should update URL and return success message', async () => {
      mockReq.params.shortCode = 'abc123';
      mockReq.body.newUrl = 'https://newexample.com';
      mockUrlService.updateUrl.mockResolvedValue(true);

      await urlController.updateUrl(mockReq, mockRes);

      expect(mockUrlService.updateUrl).toHaveBeenCalledWith('abc123', 'https://newexample.com', 1);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL updated successfully'
      }));
    });

    it('should return 404 if URL is not found or user does not have permission', async () => {
      mockReq.params.shortCode = 'abc123';
      mockReq.body.newUrl = 'https://newexample.com';
      mockUrlService.updateUrl.mockResolvedValue(false);

      await urlController.updateUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL not found or you do not have permission to update it'
      }));
    });

    it('should return 400 if new URL is missing', async () => {
      mockReq.params.shortCode = 'abc123';

      await urlController.updateUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: '\"newUrl\" is required'
      }));
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL and return success message', async () => {
      mockReq.params.shortCode = 'abc123';
      mockUrlService.deleteUrl.mockResolvedValue(true);

      await urlController.deleteUrl(mockReq, mockRes);

      expect(mockUrlService.deleteUrl).toHaveBeenCalledWith('abc123', 1);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL deleted successfully'
      }));
    });

    it('should return 404 if URL is not found or user does not have permission', async () => {
      mockReq.params.shortCode = 'abc123';
      mockUrlService.deleteUrl.mockResolvedValue(false);

      await urlController.deleteUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL not found or you do not have permission to delete it'
      }));
    });
  });
});