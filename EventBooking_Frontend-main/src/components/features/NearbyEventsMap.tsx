import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { geocodingService } from '../../services/geocodingService';
import { Event } from '../../services';

interface NearbyEventsMapProps {
    className?: string;
    events: Event[];
    onRadiusChange: (radius: number) => void;
    currentRadius: number;
    onEventSelect: (event: Event) => void;
    onLocationUpdate?: (coords: { lat: number; lng: number }) => void;
    onUnitChange?: (unit: 'km' | 'Mi') => void;
}

export const NearbyEventsMap: React.FC<NearbyEventsMapProps> = ({
    className = "h-96 w-full",
    events,
    onRadiusChange,
    currentRadius,
    onEventSelect,
    onLocationUpdate,
    onUnitChange
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());
    const radiusCircleRef = useRef<L.Circle | null>(null);
    const searchLocationMarkerRef = useRef<L.Marker | null>(null); 
    const [searchQuery, setSearchQuery] = useState('');
    const [currentCoords, setCurrentCoords] = useState({ lat: 28.6139, lng: 77.2088 });
    const [unit, setUnit] = useState<'km' | 'Mi'>('km');

    const createEventMarker = useCallback((event: Event) => {
        if (!mapInstanceRef.current) return;

        if (typeof event.latitude !== 'number' || typeof event.longitude !== 'number') {
            console.error('Invalid coordinates for event:', event);
            return;
        }

        const eventIcon = L.divIcon({
            className: 'custom-event-marker',
            html: `
                <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                    ${event.title.charAt(0).toUpperCase()}
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });

        try {
            const marker = L.marker([event.latitude, event.longitude], {
                icon: eventIcon
            
            }).addTo(mapInstanceRef.current);

            const popupContent = `
                <div class="p-2">
                    <h3 class="font-bold text-lg mb-2">${event.title}</h3>
                    <p class="text-sm text-gray-600 mb-2">${event.description.substring(0, 100)}...</p>
                    <p class="text-sm text-gray-500 mb-2">
                        <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}
                    </p>
                    <p class="text-sm text-gray-500 mb-2">
                        <strong>Address:</strong> ${event.address}, ${event.city}
                    </p>
                    <p class="text-sm text-gray-500 mb-2">
                        <strong>Distance:</strong> ${event.distance ? `${event.distance.toFixed(1)} km` : 'N/A'}
                    </p>
                </div>
            `;

            marker.bindPopup(popupContent);

            markersRef.current.set(event.id, marker);

            marker.on('click', () => {
                onEventSelect(event);
            });


            return marker;
        } catch (error) {
            console.error('Error creating marker for event:', event, error);
            return null;
        }
    }, [onEventSelect]);

    
    useEffect(() => {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current).setView([currentCoords.lat, currentCoords.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        
        const radiusCircle = L.circle([currentCoords.lat, currentCoords.lng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.1,
            radius: currentRadius * (unit === 'Mi' ? 1609.34 : 1000) 
        }).addTo(map);

        
        radiusCircleRef.current = radiusCircle;

        
        const searchMarker = L.marker([currentCoords.lat, currentCoords.lng], {
            icon: L.divIcon({
                className: 'search-location-marker',
                html: `
                    <div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 18a8 8 0 110-16 8 8 0 010 16z"/>
                            <path d="M10 6a4 4 0 100 8 4 4 0 000-8zM10 14a4 4 0 110-8 4 4 0 010 8z"/>
                        </svg>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }),
            draggable: true 
        }).addTo(map);

        
        searchMarker.on('dragend', (e) => {
            const newLat = e.target.getLatLng().lat;
            const newLng = e.target.getLatLng().lng;
            const newCoords = { lat: newLat, lng: newLng };

            
            setCurrentCoords(newCoords);

            if (onLocationUpdate) {
                onLocationUpdate(newCoords);
            }

            console.log('Search marker dragged to:', newCoords);
        });

        searchLocationMarkerRef.current = searchMarker;

       
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            const newCoords = { lat, lng };

            
            setCurrentCoords(newCoords);

           
            if (onLocationUpdate) {
                onLocationUpdate(newCoords);
            }

            console.log('Map clicked at:', newCoords);
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            radiusCircleRef.current = null;
        };
    }, []);

    
    useEffect(() => {
        if (radiusCircleRef.current) {
            const radiusInMeters = currentRadius * (unit === 'Mi' ? 1609.34 : 1000);
            radiusCircleRef.current.setRadius(radiusInMeters);
        }
    }, [currentRadius, unit]);

    
    useEffect(() => {
        if (radiusCircleRef.current && mapInstanceRef.current) {
            radiusCircleRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        }
    }, [currentCoords]);

    
    useEffect(() => {
        if (searchLocationMarkerRef.current) {
            searchLocationMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        }
    }, [currentCoords]);

    
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        
        markersRef.current.forEach(marker => {
            marker.remove();
        });
        markersRef.current.clear();

        
        events.forEach(event => {
            createEventMarker(event);
        });
    }, [events, createEventMarker]);

    
    const handleSearch = async (query: string) => {
        if (query.length < 3) return;

        try {
            const result = await geocodingService.forwardGeocode(query);
            if (result && mapInstanceRef.current) {

                mapInstanceRef.current.setView([result.lat, result.lng], 15);

            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const newCoords = { lat, lng };

                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 15);
                        setCurrentCoords(newCoords);

       
                        if (onLocationUpdate) {
                            onLocationUpdate(newCoords);
                        }

                    }
                },
                () => {
                    console.error('Failed to get current location');
                }
            );
        }
    };

    
    const handleUnitChange = (newUnit: 'km' | 'Mi') => {
        setUnit(newUnit);
        
        if (onUnitChange) {
            onUnitChange(newUnit);
        }
    };

    return (
        <div className={className}>

            <div className="bg-white border border-gray-300 rounded-t-lg p-3 shadow-sm">
                <div className="flex mb-3">
                    <input
                        type="text"
                        placeholder="Search for a location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(searchQuery);
                            }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => handleSearch(searchQuery)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition-colors"
                        title="Search"
                    >
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <select
                            value={currentRadius}
                            onChange={(e) => onRadiusChange(Number(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5 {unit}</option>
                            <option value={10}>10 {unit}</option>
                            <option value={25}>25 {unit}</option>
                            <option value={50}>50 {unit}</option>
                        </select>

                        <select
                            value={unit}
                            onChange={(e) => handleUnitChange(e.target.value as 'km' | 'Mi')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="km">km</option>
                            <option value="Mi">miles</option>
                        </select>
                    </div>

                    <button
                        onClick={handleCurrentLocation}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                        <MapPin className="w-4 h-4 inline mr-1" />
                        My Location
                    </button>
                </div>
            </div>

            <div
                ref={mapRef}
                className='w-full rounded-b-lg overflow-hidden border-x border-b border-gray-300'
                style={{
                    cursor: 'crosshair',
                    height: 'calc(100% - 120px)'
                }}
            ></div>

            <style>{`
                .custom-event-marker {
                    cursor: pointer !important;
                }
                .search-location-marker {
                    cursor: crosshair !important;
                }
            `}</style>
        </div>
    );
};
