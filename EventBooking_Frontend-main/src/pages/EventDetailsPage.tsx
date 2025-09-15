import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Bookmark, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate } from '../lib/utils';
import useEventStore from '../store/eventStore';
import { useAuthStore } from '../store/authStore';
import { message } from 'antd';
import { isDevelopment } from '../config/environment';
import { useLocation } from 'react-router-dom';
export const EventDetailsPage: React.FC = () => {
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const eventId = Number(id);
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { currentEvent, clearError, fetchEventById, error, isMutating, isLoading, bookEvent } = useEventStore();
    const { isAuthenticated, user } = useAuthStore()

    
    useEffect(() => {
        clearError()
    }, [clearError]);
    useEffect(()=>{
        if(error){
            message.error(error)
            clearError()
        }
    },[error])

    useEffect(() => {
        (async () => { await fetchEventById(eventId) })()
    }, [fetchEventById, eventId])

    const handleBookEvent = async () => {
        if (!(isAuthenticated && user)) {
            message.warning("You need to login before booking an event!")
            navigate('/login')
        }
        try {
            await bookEvent(eventId)
            message.success("Event Booked successfully")
        } catch (error) {
            if (isDevelopment()) console.log(error);

        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: currentEvent?.title,
                text: currentEvent?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <Container>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-neutral-600">Loading event details...</p>
                    </div>
                </div>
            </Container>
        )
    }
    else if (error) {
        return <></>
    }

    else if (!currentEvent) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Event Not Found</h2>
                    <p className="text-neutral-600 mb-6">The event you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/events')}>Back to Events</Button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                
                <button
                    onClick={() => navigate(location.state.from)}
                    className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Events
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {}
                    <div className="lg:col-span-2 space-y-8">
                        {}
                        <div className="space-y-4">
                            <div className="relative h-96 rounded-xl overflow-hidden">
                                {(currentEvent.images && currentEvent.images.length > 0) ?
                                    (<img
                                        src={currentEvent.images?.[currentImageIndex] || '/placeholder-event.jpg'}
                                        alt={currentEvent.title}
                                        className="w-full h-full object-cover"
                                    />) :
                                    (<Calendar className="w-full h-full object-cover text-primary-600" />)
                                }
                            </div>

                            {}
                            {currentEvent.images && currentEvent.images.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto">
                                    {Array.isArray(currentEvent.images) && currentEvent.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
                                                ? 'border-primary-500'
                                                : 'border-neutral-200'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${currentEvent.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                                    {currentEvent.title}
                                </h1>
                                <p className="text-neutral-600 leading-relaxed">
                                    {currentEvent.description}
                                </p>
                            </div>

                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-primary-600" />
                                        <div>
                                            <p className="font-medium text-neutral-900">Date & Time</p>
                                            <p className="text-neutral-600">{formatDate(currentEvent.date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                        <div>
                                            <p className="font-medium text-neutral-900">Location</p>
                                            <p className="text-neutral-600">
                                                {currentEvent.address}<br />
                                                {currentEvent.city}, {currentEvent.state} {currentEvent.postalCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Users className="w-5 h-5 text-primary-600" />
                                        <div>
                                            <p className="font-medium text-neutral-900">Attendees</p>
                                            <p className="text-neutral-600">
                                                {currentEvent.registrations || 0} registered
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {currentEvent.user?.profileImage ?
                                            (
                                                <img src={currentEvent.user?.profileImage} alt={currentEvent.user?.name} className='w-5 h-5' />
                                            ) : (
                                                <Clock className="w-5 h-5 text-primary-600" />
                                            )}

                                        <div>
                                            <p className="font-medium text-neutral-900">Organizer</p>
                                            <p className="text-neutral-600">{currentEvent.user?.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6 sticky top-8">
                            {}
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full mb-4"
                                onClick={handleBookEvent}
                                loading={isMutating}
                                disabled={isMutating}
                            >
                                {isMutating ? 'Booking...' : 'Book This Event'}
                            </Button>

                            {}
                            <div className="flex space-x-2 mb-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Bookmark className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>

                            {}
                            <div className="pt-6 border-t border-neutral-200">
                                <div className="space-y-3">

                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Created</span>
                                        <span className="font-medium">{formatDate(currentEvent.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Last Updated</span>
                                        <span className="font-medium">{formatDate(currentEvent.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </Container >
    );
};

export default EventDetailsPage