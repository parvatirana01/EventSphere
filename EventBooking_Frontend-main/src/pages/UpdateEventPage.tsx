import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import Container from '../components/layout/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { UpdateEventForm } from '../components/features/UpdateEventForm';
import useEventStore from '../store/eventStore';
import { UpdateEventData } from '../services';

export const UpdateEventPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchEventById, updateEvent, currentEvent, isLoading, error, clearError} = useEventStore();

    useEffect(() => {
        if (id) {
            fetchEventById(parseInt(id));
        }
    }, [id, fetchEventById]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleUpdate = async (data: UpdateEventData) => {
        if (!id) return;

        try {
            await updateEvent(parseInt(id), data);
            message.success('Event updated successfully!');

            
            const from = location.state?.from || '/organizer/dashboard';
            navigate(from);
        } catch (error) {
           
        }
    };

    const handleCancel = () => {
        const from = location.state?.from || '/organizer/dashboard';
        navigate(from);
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
        );
    }

    if (error) {
        return (
            <Container>
                <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Event</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/organizer/dashboard')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </Container>
        );
    }

    if (!currentEvent) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-2">Event Not Found</h2>
                    <p className="text-neutral-600 mb-4">The event you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/organizer/dashboard')}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-8">
                <UpdateEventForm
                    event={currentEvent}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                />
            </div>
        </Container>
    );
};
