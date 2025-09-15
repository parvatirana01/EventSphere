import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    User,
    Clock,
    ArrowLeft,
    Mail,
    ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import useBookingStore from '../store/bookingStore';
import { message } from 'antd';




const BookingDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const bookingId = Number(id)
    const navigate = useNavigate();
    const { isLoading, fetchBookingById, error, clearError, cancelBooking, currentBooking, isMutating } = useBookingStore()

    useEffect(() => {
        clearError()
    }, [clearError])

    useEffect(() => {
        if (error) {
            message.error(error);
            clearError()
        }
    }, [error]);

    useEffect(() => {
        (async () => {
            try {
                await fetchBookingById(bookingId)

            } catch (error) {

            }
        })()
    }, [bookingId, fetchBookingById])

    const handleCancel = async () => {
        try {
            if (currentBooking?.id) {
                await cancelBooking(currentBooking?.id)

            }
            else {
                message.error("Booking not found!")

            }
            navigate('/dashboard')

        } catch (error) {

        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    if (isLoading) {
        return (
            <Container>
                <div className="py-8 text-center">
                    <div className="text-lg text-neutral-600">Loading booking details...</div>
                </div>
            </Container>
        );
    }

    if (!currentBooking) {
        return (
            <Container>
                <div className="py-8 text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking Not Found</h1>
                    <p className="text-neutral-600 mb-4">The booking you're looking for doesn't exist.</p>
                    <Button onClick={handleBack}>Back to Dashboard</Button>
                </div>
            </Container>
        );
    }
    if (!currentBooking.event) return (<></>)
    const isUpcoming = new Date(currentBooking.event?.date) > new Date();
    const eventDate = new Date(currentBooking.event?.date);
    const registrationDate = new Date(currentBooking.createdAt);

    return (
        <Container>
            <div className="py-8">
                {}
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>


                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking Details</h1>
                                <p className="text-neutral-600">Registration ID: #{currentBooking.id}</p>
                            </div>
                            <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${isUpcoming ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-700'
                                    }`}>
                                    {isUpcoming ? 'Confirmed' : 'Completed'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Event Information</h2>

                            <div className="h-48 bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                                {currentBooking.event.images && !Array.isArray(currentBooking.event.images) ? (
                                    <img
                                        src={currentBooking.event.images}
                                        alt={currentBooking.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Calendar className="w-12 h-12 text-primary-600" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-neutral-900 text-lg">{currentBooking.event.title}</h3>
                                    <p className="text-neutral-600 text-sm mt-1">{currentBooking.event.description}</p>
                                </div>

                                <div className="flex items-center text-neutral-600">
                                    <Calendar className="w-4 h-4 mr-3" />
                                    <div>
                                        <div className="font-medium">
                                            {eventDate.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-sm">
                                            {eventDate.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start text-neutral-600">
                                    <MapPin className="w-4 h-4 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium">{currentBooking.event.address}</div>
                                        <div className="text-sm">
                                            {currentBooking.event.city}, {currentBooking.event.state} {currentBooking.event.postalCode}
                                        </div>
                                        <div className="text-sm">{currentBooking.event.country}</div>
                                    </div>
                                </div>

                                <div className="flex items-center text-neutral-600">
                                    <User className="w-4 h-4 mr-3" />
                                    <div>
                                        <div className="font-medium">Organized by {currentBooking.event?.user?.name}</div>
                                        <div className="text-sm">{currentBooking.event?.user?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Registration Information</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center text-neutral-600">
                                        <Clock className="w-4 h-4 mr-3" />
                                        <div>
                                            <div className="font-medium">Registered on</div>
                                            <div className="text-sm">
                                                {registrationDate.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })} at {registrationDate.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start text-neutral-600">
                                        <User className="w-4 h-4 mr-3 mt-0.5" />
                                        <div>
                                            <div className="font-medium">Registered User</div>
                                            <div className="text-sm">{currentBooking.user?.name}</div>
                                            <div className="text-sm">{currentBooking.user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Actions</h2>

                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/events/${currentBooking.event?.id}`,{state: {from : location.pathname}})}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Event Details
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => alert('Contact organizer (mock action)')}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact Organizer
                                    </Button>

                                    {isUpcoming && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-error-600 border-error-200 hover:bg-error-50"
                                            onClick={handleCancel}
                                            loading={isMutating}
                                            disabled={isMutating}
                                        >
                                            Cancel Registration
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default BookingDetailsPage;