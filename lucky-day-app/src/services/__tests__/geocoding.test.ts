/**
 * Tests for Geocoding Service
 */

import { geocodingService } from '../geocoding';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Geocoding Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchLocations', () => {
    it('should return location results for valid search', async () => {
      const mockResponse = [
        {
          lat: '40.7128',
          lon: '-74.0060',
          display_name: 'New York, NY, USA',
          type: 'city',
          address: {
            city: 'New York',
            country: 'United States',
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await geocodingService.searchLocations('New York');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        name: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should return fallback results when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const results = await geocodingService.searchLocations('London');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('London');
      expect(results[0].country).toBe('United Kingdom');
    });

    it('should filter results to cities only', async () => {
      const mockResponse = [
        {
          lat: '40.7128',
          lon: '-74.0060',
          display_name: 'New York, NY, USA',
          type: 'city',
          address: { city: 'New York', country: 'United States' },
        },
        {
          lat: '40.7589',
          lon: '-73.9851',
          display_name: 'Times Square, New York, NY, USA',
          type: 'attraction',
          address: { attraction: 'Times Square', country: 'United States' },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await geocodingService.searchLocations('New York');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('New York');
    });
  });

  describe('reverseGeocode', () => {
    it('should return location for valid coordinates', async () => {
      const mockResponse = {
        address: {
          city: 'New York',
          country: 'United States',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodingService.reverseGeocode(40.7128, -74.0060);

      expect(result).toMatchObject({
        name: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should return fallback result when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await geocodingService.reverseGeocode(40.7128, -74.0060);

      expect(result).toMatchObject({
        name: 'Unknown Location',
        country: 'Unknown',
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });
  });

  describe('API request handling', () => {
    it('should include proper headers in requests', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await geocodingService.searchLocations('test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.objectContaining({
          headers: {
            'User-Agent': 'LuckyDayApp/1.0',
          },
        })
      );
    });

    it('should handle API rate limiting gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const results = await geocodingService.searchLocations('test');

      // Should return fallback results
      expect(Array.isArray(results)).toBe(true);
    });
  });
});