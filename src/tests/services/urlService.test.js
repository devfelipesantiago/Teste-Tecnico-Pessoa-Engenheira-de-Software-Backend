const createUrlService = require('../../services/urlService');
const Url = require('../../models/url');

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
      Url.findOne.mockResolvedValue(null);

      const result = await urlService.shortenUrl('https://example.com');

      expect(Url.create).toHaveBeenCalledWith(expect.objectContaining({
        longUrl: 'https://example.com',
        shortCode: expect.any(String)
      }));
      expect(result).toEqual(mockUrl);
    });

    it('should retry if generated shortCode already exists', async () => {
      const existingUrl = { id: 1, longUrl: 'https://existing.com', shortCode: 'abc123', clicks: 0 };
      const newUrl = { id: 2, longUrl: 'https://example.com', shortCode: 'def456', clicks: 0 };
      Url.findOne.mockResolvedValueOnce(existingUrl).mockResolvedValueOnce(null);
      Url.create.mockResolvedValue(newUrl);

      const result = await urlService.shortenUrl('https://example.com');

      expect(Url.findOne).toHaveBeenCalledTimes(2);
      expect(Url.create).toHaveBeenCalledWith(expect.objectContaining({
        longUrl: 'https://example.com',
        shortCode: expect.any(String)
      }));
      expect(result).toEqual(newUrl);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL and increment clicks in the database', async () => {
      const mockUrl = { longUrl: 'https://example.com' };
      Url.findOne.mockResolvedValue(mockUrl);
      Url.increment.mockResolvedValue([1]); // Simula o incremento bem-sucedido

      const result = await urlService.getOriginalUrl('abc123');

      expect(Url.findOne).toHaveBeenCalledWith({ where: { shortCode: 'abc123' } });
      expect(Url.increment).toHaveBeenCalledWith('clicks', { where: { shortCode: 'abc123' } });
      expect(result).toBe('https://example.com');
    });

    it('should return null if URL not found', async () => {
      Url.findOne.mockResolvedValue(null);

      const result = await urlService.getOriginalUrl('nonexistent');

      expect(result).toBeNull();
      expect(Url.increment).not.toHaveBeenCalled();
    });
  });

  describe('getUserUrls', () => {
    it('should return all URLs for a user', async () => {
      const mockUrls = [
        { id: 1, longUrl: 'https://example1.com', shortCode: 'abc123', clicks: 5 },
        { id: 2, longUrl: 'https://example2.com', shortCode: 'def456', clicks: 10 }
      ];
      Url.findAll.mockResolvedValue(mockUrls);

      const result = await urlService.getUserUrls(1);

      expect(Url.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual(mockUrls);
    });
  });

  describe('updateUrl', () => {
    it('should update the URL if it exists and belongs to the user', async () => {
      Url.update.mockResolvedValue([1]);

      const result = await urlService.updateUrl('abc123', 'https://newexample.com', 1);

      expect(Url.update).toHaveBeenCalledWith(
        { longUrl: 'https://newexample.com' },
        { where: { shortCode: 'abc123', userId: 1 } }
      );
      expect(result).toBe(true);
    });

    it('should return false if the URL does not exist or does not belong to the user', async () => {
      Url.update.mockResolvedValue([0]);

      const result = await urlService.updateUrl('nonexistent', 'https://newexample.com', 1);

      expect(result).toBe(false);
    });
  });

  describe('deleteUrl', () => {
    it('should delete the URL if it exists and belongs to the user', async () => {
      Url.destroy.mockResolvedValue(1);

      const result = await urlService.deleteUrl('abc123', 1);

      expect(Url.destroy).toHaveBeenCalledWith({ where: { shortCode: 'abc123', userId: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if the URL does not exist or does not belong to the user', async () => {
      Url.destroy.mockResolvedValue(0);

      const result = await urlService.deleteUrl('nonexistent', 1);

      expect(result).toBe(false);
    });
  });
});