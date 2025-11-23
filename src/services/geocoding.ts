/**
 * Geocoding Service
 * Provides location search and reverse geocoding functionality
 */

export interface LocationResult {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    displayName: string;
    importance?: number;
    place_rank?: number;
    addresstype?: string;
}

export interface GeocodingService {
    searchLocations(query: string): Promise<LocationResult[]>;
    reverseGeocode(latitude: number, longitude: number): Promise<LocationResult>;
}

/**
 * Nominatim-based geocoding service (OpenStreetMap)
 * Free service with good coverage worldwide
 */
class NominatimGeocodingService implements GeocodingService {
    private readonly baseUrl = 'https://nominatim.openstreetmap.org';
    private readonly userAgent = 'LuckyDayApp/1.0';

    async searchLocations(query: string): Promise<LocationResult[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?` +
                new URLSearchParams({
                    q: query,
                    format: 'json',
                    limit: '15',
                    addressdetails: '1',
                    extratags: '1',
                    'accept-language': 'en',
                    'bounded': '0',
                    'dedupe': '1',
                }),
                {
                    headers: {
                        'User-Agent': this.userAgent,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Geocoding request failed: ${response.status}`);
            }

            const data = await response.json();
            return this.parseSearchResults(data);
        } catch (error) {
            console.error('Geocoding search error:', error);
            // Return fallback results for common cities
            return this.getFallbackResults(query);
        }
    }

    async reverseGeocode(latitude: number, longitude: number): Promise<LocationResult> {
        try {
            const response = await fetch(
                `${this.baseUrl}/reverse?` +
                new URLSearchParams({
                    lat: latitude.toString(),
                    lon: longitude.toString(),
                    format: 'json',
                    addressdetails: '1',
                    'accept-language': 'en',
                }),
                {
                    headers: {
                        'User-Agent': this.userAgent,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Reverse geocoding request failed: ${response.status}`);
            }

            const data = await response.json();
            return this.parseReverseResult(data, latitude, longitude);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Return fallback result
            return {
                name: 'Unknown Location',
                country: 'Unknown',
                latitude,
                longitude,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                displayName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            };
        }
    }

    private parseSearchResults(data: any[]): LocationResult[] {
        const results = data
            .filter(item => {
                // Exclude countries explicitly
                if (item.type === 'country') {
                    return false;
                }

                // Simple and effective rule: type must be 'administrative' and addresstype must not be 'county'
                if (item.type === 'administrative' && item.addresstype !== 'county') {
                    return true;
                }

                // Also accept direct place types
                if (item.class === 'place' && ['city', 'town', 'village'].includes(item.type)) {
                    return true;
                }

                return false;
            })
            .map(item => {
                const address = item.address || {};
                const city = this.extractCityName(address, item);
                const country = address.country || 'Unknown';

                return {
                    name: city,
                    country,
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    timezone: this.getTimezoneFromCoordinates(parseFloat(item.lat), parseFloat(item.lon)),
                    displayName: `${city}, ${country}`,
                    importance: item.importance || 0,
                    place_rank: item.place_rank,
                    addresstype: item.addresstype,
                };
            });

        // Deduplicate results by city name and country
        return this.deduplicateResults(results).slice(0, 8);
    }

    private extractCityName(address: any, item: any): string {
        // Prefer main city name over administrative subdivisions
        return address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            item.name ||
            address.county ||
            item.display_name.split(',')[0];
    }

    private deduplicateResults(results: any[]): LocationResult[] {
        const seen = new Map<string, LocationResult>();

        for (const result of results) {
            const key = `${result.name.toLowerCase()}-${result.country.toLowerCase()}`;

            // Keep the result with higher importance if duplicate
            if (!seen.has(key) || ((seen.get(key)?.importance || 0) < (result.importance || 0))) {
                seen.set(key, result);
            }
        }

        return Array.from(seen.values()).sort((a, b) => (b.importance || 0) - (a.importance || 0));
    }

    private parseReverseResult(data: any, latitude: number, longitude: number): LocationResult {
        const address = data.address || {};
        const city = this.extractCityName(address, data);
        const country = address.country || 'Unknown';

        return {
            name: city,
            country,
            latitude,
            longitude,
            timezone: this.getTimezoneFromCoordinates(latitude, longitude),
            displayName: `${city}, ${country}`,
        };
    }

    private getTimezoneFromCoordinates(lat: number, lng: number): string {
        // Simple timezone estimation based on longitude
        // In a production app, you'd use a proper timezone service
        const timezoneOffset = Math.round(lng / 15);

        // Common timezone mappings
        const timezoneMap: { [key: string]: string } = {
            '-8': 'America/Los_Angeles',
            '-7': 'America/Denver',
            '-6': 'America/Chicago',
            '-5': 'America/New_York',
            '0': 'Europe/London',
            '1': 'Europe/Paris',
            '2': 'Europe/Berlin',
            '8': 'Asia/Shanghai',
            '9': 'Asia/Tokyo',
            '10': 'Australia/Sydney',
        };

        return timezoneMap[timezoneOffset.toString()] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    private getFallbackResults(query: string): LocationResult[] {
        // Fallback data for common searches when API is unavailable
        const fallbackCities: LocationResult[] = [
            { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', displayName: 'New York, United States' },
            { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', displayName: 'London, United Kingdom' },
            { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', displayName: 'Paris, France' },
            { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', displayName: 'Tokyo, Japan' },
            { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', displayName: 'Sydney, Australia' },
            { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles', displayName: 'Los Angeles, United States' },
            { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin', displayName: 'Berlin, Germany' },
            { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome', displayName: 'Rome, Italy' },
        ];

        return fallbackCities.filter(city =>
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.country.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Export singleton instance
export const geocodingService = new NominatimGeocodingService();