import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, ArrowLeft } from 'lucide-react';
import EventCard from '../components/features/EventCard';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Container from '../components/layout/Container';
import { NearbyEventsMap } from '../components/features/NearbyEventsMap';
import useEventStore from '../store/eventStore';
import { NearbyEventsQuery } from '../services';
import { useAuthStore } from '../store/authStore';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const NearbyEventsPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const [radiusFilter, setRadiusFilter] = useState<5 | 10 | 25 | 50>(10);
    const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.2088 });
    const [unit, setUnit] = useState<'km' | 'Mi'>('km');

    const {
        nearbyEvents,
        pagination,
        isLoading,
        error,
        fetchNearbyEvents,
        clearError,
        bookEvent
    } = useEventStore();

    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const createQuery = useCallback((): NearbyEventsQuery => ({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        radius: radiusFilter,
        unit,
        page: currentPage,
        limit: itemsPerPage
    }), [currentLocation, radiusFilter, unit, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchNearbyEvents(createQuery());
    }, [fetchNearbyEvents, createQuery]);

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleLocationUpdate = useCallback((coords: { lat: number; lng: number }) => {
        setCurrentLocation(coords);
        setCurrentPage(1);
    }, []);

    const handleRadiusChange = useCallback((radius: number) => {
        if ([5, 10, 25, 50].includes(radius)) {
            setRadiusFilter(radius as 5 | 10 | 25 | 50);
            setCurrentPage(1);
        }
    }, []);

    const handleUnitChange = useCallback((newUnit: 'km' | 'Mi') => {
        setUnit(newUnit);
        setCurrentPage(1);
    }, []);

    const handleBookEvent = useCallback(async (eventId: number) => {
        if (!isAuthenticated) {
            message.warning('Please login to book events');
            navigate('/login');
            return;
        }
        try {
            await bookEvent(eventId);
            message.success('Event booked successfully');
        } catch (error) {

        }
    }, [isAuthenticated, bookEvent, navigate]);

    useEffect(() => {
        if (error) {
            message.error(error);
            clearError();
        }
    }, [error, clearError]);

    const upcomingEventsCount = useCallback(() => {
        return nearbyEvents.filter(e => e && e.date && new Date(e.date) > new Date()).length;
    }, [nearbyEvents]);

    const totalPages = pagination.nearbyEvents.totalPages || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;

    
    const handleBack = useCallback(() => {
        navigate(location.state?.from || '/events');
    }, [navigate, location.state]);

    return (
        <Container>
            <div className="py-8">

                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </div>

                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Nearby Events</h1>
                    <p className="text-neutral-600">Discover events happening in your area</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-8">
                    <NearbyEventsMap
                        className="h-96 w-full"
                        events={nearbyEvents}
                        onRadiusChange={handleRadiusChange}
                        currentRadius={radiusFilter}
                        onEventSelect={() => { }}
                        onLocationUpdate={handleLocationUpdate}
                        onUnitChange={handleUnitChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary-600">{nearbyEvents.length}</p>
                            <p className="text-sm text-neutral-600">Events Found</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-success-600">
                                {upcomingEventsCount()}
                            </p>
                            <p className="text-sm text-neutral-600">Upcoming</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-neutral-900">{radiusFilter} {unit}</p>
                            <p className="text-sm text-neutral-600">Search Radius</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-neutral-600">Loading nearby events...</p>
                    </div>
                ) : nearbyEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No nearby events found</h3>
                        <p className="text-neutral-600 mb-4">There are no events in your selected area</p>
                        <Button onClick={() => navigate('/events')}>Browse All Events</Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {nearbyEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onBook={handleBookEvent}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-neutral-500">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, nearbyEvents.length)} of {nearbyEvents.length} events
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </Container>
    );
};

export default NearbyEventsPage;