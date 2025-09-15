export interface AddressData {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
}

class GeocodingService {
    private baseUrl = 'https://nominatim.openstreetmap.org';
    private userAgent = 'EventBookingApp/1.0';
    private cache = new Map<string, any>();
    private lastRequestTime = 0;
    private readonly MIN_REQUEST_INTERVAL = 1000; 

    private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => 
                setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();
        return requestFn();
    }

    
    async forwardGeocode(query: string): Promise<GeocodingResult | null> {
        const cacheKey = `forward_${query}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const result = await this.throttleRequest(async () => {
                const response = await fetch(
                    `${this.baseUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`,
                    {
                        headers: {
                            'User-Agent': this.userAgent,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Forward geocoding failed');
                }

                const data = await response.json();
                
                if (data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        displayName: data[0].display_name
                    };
                }
                
                return null;
            });

            if (result) {
                this.cache.set(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error('Forward geocoding error:', error);
            return null;
        }
    }

    
    async reverseGeocode(lat: number, lng: number): Promise<AddressData | null> {
        const cacheKey = `reverse_${lat.toFixed(6)}_${lng.toFixed(6)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const result = await this.throttleRequest(async () => {
                const response = await fetch(
                    `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
                    {
                        headers: {
                            'User-Agent': this.userAgent,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Reverse geocoding failed');
                }

                const data = await response.json();
                
                if (data.address) {
                    return {
                        address: [
                            data.address.house_number,
                            data.address.road,
                            data.address.suburb
                        ].filter(Boolean).join(', '),
                        city: data.address.city || data.address.town || data.address.suburb || '',
                        state: data.address.state || data.address.province || '',
                        country: data.address.country || '',
                        postalCode: data.address.postcode || ''
                    };
                }
                
                return null;
            });

            if (result) {
                this.cache.set(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }

    
    clearCache(): void {
        this.cache.clear();
    }
}

export const geocodingService = new GeocodingService();