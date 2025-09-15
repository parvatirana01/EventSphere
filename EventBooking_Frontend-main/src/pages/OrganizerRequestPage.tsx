import React from 'react';
import Container from '../components/layout/Container';
import { OrganizerRequestForm } from '../components/features/OrganizerRequestForm';
import { message } from 'antd';
import useOrganizerRequestStore from '../store/organizerRequestStore';
import { CreateOrganizerRequestData } from '../services';
import { useLocation, useNavigate } from 'react-router-dom';
export const OrganizerRequestPage: React.FC = () => {
    const location = useLocation()
    const{createRequest} =useOrganizerRequestStore();
    const navigate = useNavigate()
    const handleSubmit = async (data: CreateOrganizerRequestData) => {
        
        console.log('Organizer request data:', data);

        try {
            await createRequest(data)
            message.success("Organizer Request Submitted Successfully")
            navigate(location.state?.from || '/')
        } catch (error) {
            
        }
     
        
        
    };

    const handleCancel = () => {
        navigate(location.state?.from || '/')
    };

    return (
        <Container>
            <div className="py-8">
                <OrganizerRequestForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </Container>
    );
};