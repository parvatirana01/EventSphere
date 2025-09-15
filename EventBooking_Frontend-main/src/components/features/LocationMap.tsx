import L  from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Search } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { geocodingService, AddressData } from '../../services/geocodingService';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationMapProps {
    className?: string;
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
    coords: { lat: number; lng: number };
    initialCoords: { lat: number; lng: number };
    onAddressSelect?: (address: AddressData) => void; 
}

export const LocationMap: React.FC<LocationMapProps> = ({ className = "h-96 w-full", onLocationSelect, coords, initialCoords, onAddressSelect }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleReverseGeocoding = useCallback(async (lat: number, lng: number) => {
        const addressData = await geocodingService.reverseGeocode(lat, lng);

        if (addressData) {
            onAddressSelect?.(addressData);
        }
    }, [onAddressSelect]);

    const resetMapView = useCallback(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;
        const map = mapInstanceRef.current;
        const marker = markerRef.current;

        map.setView([initialCoords.lat, initialCoords.lng], 13);
        marker.setLatLng([initialCoords.lat, initialCoords.lng]);
        onLocationSelect(initialCoords);
        setSearchQuery("");

        
        handleReverseGeocoding(initialCoords.lat, initialCoords.lng);
    }, [initialCoords, onLocationSelect, handleReverseGeocoding]);

    const handleAddressSearch = useCallback(async (query: string) => {
        if (query.length < 3) return;

        const result = await geocodingService.forwardGeocode(query);

        if (result) {
            
            mapInstanceRef.current?.setView([result.lat, result.lng], 15);
        }
    }, []);

   

    const updateCoordinates = useCallback((lat: number, lng: number) => {
        onLocationSelect({ lat, lng });
        handleReverseGeocoding(lat, lng);
    }, [onLocationSelect, handleReverseGeocoding]);


    useEffect(() => {
        if (!mapRef.current) return;
         
        // L.Icon.Default.mergeOptions({
        //     iconRetinaUrl : markerIcon2x,
        //     iconUrl : markerIcon,
        //     shadowUrl : markerShadow
        // })

        const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        mapInstanceRef.current = map;




        const marker = L.marker([coords.lat, coords.lng], {
            draggable: true
        }).addTo(map);
        markerRef.current = marker;


        marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            updateCoordinates(lat, lng);
        });
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            updateCoordinates(lat, lng);
        })


        return () => {
            map.remove();
            mapInstanceRef.current = null;
        }
    }, [coords.lat, coords.lng, updateCoordinates]);



    return (
        <div className={className}>
            {}
            <div className="bg-white border border-gray-300 rounded-t-lg p-3 shadow-sm">
                {}
                <div className="flex mb-3">
                    <input
                        type="text"
                        placeholder="Search for an address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddressSearch(searchQuery);
                            }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            handleAddressSearch(searchQuery)
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition-colors"
                        title="Search"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {}
                <div className="flex justify-between items-center">
                    {}
                    <div className="text-sm text-gray-700">
                        <span className="font-medium">Coordinates: </span>
                        <span>Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}</span>
                    </div>

                    {}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            resetMapView();
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                        Reset View
                    </button>
                </div>
            </div>

            {}
            <div
                ref={mapRef}
                className='w-full rounded-b-lg overflow-hidden border-x border-b border-gray-300'
                style={{
                    cursor: 'crosshair',
                    height: 'calc(100% - 120px)' 
                }}
            ></div>
        </div>
    )
}