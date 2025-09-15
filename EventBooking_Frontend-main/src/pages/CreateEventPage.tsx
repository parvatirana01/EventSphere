import React from 'react';
import Container from '../components/layout/Container';
import { CreateEventForm } from '../components/features/CreateEventForm';
import { CreateEventData } from '../services';
import useEventStore from '../store/eventStore';
import { message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { createEvent } = useEventStore()

   

    const handleSubmit = async (data: CreateEventData) => {
   
        try {
            await createEvent(data);
        message.success("Event creation successful!");
        navigate(location.state?.from || '/events')
        } catch (error) {
            
        }
    };

    const handleCancel = () => {
        navigate(location.state?.from || '/events')
    };

    return (
        <Container>
            <div className="py-8">
                <CreateEventForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </Container>
    );
}; 