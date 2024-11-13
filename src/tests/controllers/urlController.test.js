const createUrlController = require('../../controllers/urlController');

describe('URL Controller', () => {
  let urlController;
  let mockUrlService;
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

    urlController = createUrlController(mockUrlService);

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
        message: expect.stringContaining('URL is required')
      }));
    });
  });

  describe('redirectToOriginalUrl', () => {
    it('should redirect to the original URL', async () => {
      mockUrlService.getOriginalUrl.mockResolvedValue('https://example.com');
      mockReq.params.shortCode = 'abc123';

      await urlController.redirectToOriginalUrl(mockReq, mockRes);

      expect(mockUrlService.getOriginalUrl).toHaveBeenCalledWith('abc123');
      expect(mockRes.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should return 404 if URL is not found', async () => {
      mockUrlService.getOriginalUrl.mockResolvedValue(null);
      mockReq.params.shortCode = 'nonexistent';

      await urlController.redirectToOriginalUrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'URL not found'
      }));
    });
  });
});