const createUrlService = require('../../services/urlService');
const Url = require('../..models/url');

jest.mock('../../models/url');

describe('URL Service', () => {
  let urlService;

  beforeEach(() => {
    urlService = createUrlService();
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    it('should create a short URL', async () => {
      const mockUrl = { id: 1, longUrl: 'https://example.com', shortCode: 'abc123', clicks: 0 };
      Url.create.mockResolvedValue(mockUrl);

      const result = await urlService.shortenUrl('https://example.com');

      expect(Url.create).toHaveBeenCalledWith(expect.objectContaining({
        longUrl: 'https://example.com',
        shortCode: expect.any(String)
      }));
      expect(result).toEqual(mockUrl);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL and increment clicks', async () => {
      const mockUrl = { longUrl: 'https://example.com', clicks: 0, save: jest.fn() };
      Url.findOne.mockResolvedValue(mockUrl);

      const result = await urlService.getOriginalUrl('abc123');

      expect(Url.findOne).toHaveBeenCalledWith({ where: { shortCode: 'abc123' } });
      expect(mockUrl.clicks).toBe(1);
      expect(mockUrl.save).toHaveBeenCalled();
      expect(result).toBe('https://example.com');
    });

    it('should return null if URL not found', async () => {
      Url.findOne.mockResolvedValue(null);

      const result = await urlService.getOriginalUrl('nonexistent');

      expect(result).toBeNull();
    });
  });
});